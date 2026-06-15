# OAuth Refresh-Token Rotation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Issue rotating, hashed-at-rest refresh tokens so a connected MCP client keeps working past its 1h access-token expiry without re-consent, with reuse of a spent token revoking the whole rotation family.

**Architecture:** A new per-concern store module `refreshTokens.ts` (beside `codes.ts` / `accessTokens.ts`) owns refresh-token generation, the hashed-at-rest store, atomic rotation, and family revocation. The `provider.ts` OAuth hooks orchestrate it: `exchangeAuthorizationCode` now mints an access+refresh pair tagged with a shared `familyId`; the previously-stubbed `exchangeRefreshToken` rotates. A new `familyId` column on `OAuthAccessToken` lets a family revoke reach live access tokens.

**Tech Stack:** TypeScript, Express, Prisma (PostgreSQL), `@modelcontextprotocol/sdk` auth router, Mocha + `expect` + supertest, run via `make` targets.

**Spec:** `docs/superpowers/specs/2026-06-14-oauth-refresh-token-rotation-design.md`

---

## File Structure

- **Create** `backend/src/mcp/oauth/refreshTokens.ts` — refresh-token store: generate, mint, rotate, revokeFamily.
- **Create** `backend/src/mcp/oauth/__tests__/refreshTokens.spec.ts` — unit tests for the store.
- **Create** `backend/src/mcp/oauth/__tests__/refresh.e2e.spec.ts` — end-to-end expire → refresh → call-tool.
- **Modify** `backend/prisma/schema.prisma` — new `OAuthRefreshToken` model, `familyId` on `OAuthAccessToken`, inverse relations on `OAuthClient` / `Role` / `Organization`.
- **Create** `backend/prisma/migrations/<ts>_oauth_refresh_token/migration.sql` — generated, then hand-edited for the access-token backfill.
- **Modify** `backend/src/mcp/oauth/accessTokens.ts` — `AccessTokenGrant` gains `familyId`; `mintAccessToken` persists it.
- **Modify** `backend/src/mcp/oauth/provider.ts` — issue refresh on code exchange; implement `exchangeRefreshToken`.
- **Modify** `backend/src/utils/testing.ts` — `getTestOAuthToken` sets `familyId`; add `getTestRefreshToken` helper + `TestRefreshToken` type.

### Conventions (read before starting)

- **Tests run only via make targets**, never raw jest/mocha (an ESM race produces fake failures). Single test: `make test-backend TEST="oauth refreshTokens"` (the value is a grep over `describe`/`it` names). Whole suite: `make test-backend`.
- **Hashed-at-rest pattern:** only `hashToken(plaintext)` (SHA-256 hex, from `backend/src/models/apiToken/token.ts`) is stored; plaintext is returned once and never persisted.
- **`fromNow(minutes)`** from `utils/testing.ts` builds relative dates for expiry seams (negative = past).
- Token plaintext prefixes: PAT `orcha_pat_`, access `orcha_oat_`, refresh **`orcha_ort_`** (this plan).

---

## Task 1: Schema + `familyId` plumbing (no refresh behavior yet)

This task adds the data model and threads `familyId` through the access-token path so the
tree compiles and existing tests stay green. No refresh token is minted yet.

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/mcp/oauth/accessTokens.ts`
- Modify: `backend/src/mcp/oauth/provider.ts:108-130` (`exchangeAuthorizationCode`)
- Modify: `backend/src/utils/testing.ts` (`getTestOAuthToken`, ~line 266)
- Migration: `backend/prisma/migrations/<ts>_oauth_refresh_token/migration.sql`

- [ ] **Step 1: Add the `OAuthRefreshToken` model and `familyId` column to the schema**

In `backend/prisma/schema.prisma`, add `familyId` to `OAuthAccessToken` (right after
`readOnly`, before `expiresAt`) and a matching index:

```prisma
  readOnly  Boolean  @default(false)
  // Groups one rotation chain; lets a reuse-triggered family revoke reach live
  // access tokens, not just refresh tokens. See OAuthRefreshToken. The DB-side
  // gen_random_uuid() default exists ONLY to backfill the pre-existing rows this
  // column is added to (so the migration is a single safe statement); application
  // code always sets familyId explicitly via mintAccessToken.
  familyId  String   @default(dbgenerated("gen_random_uuid()")) @db.VarChar
  expiresAt DateTime @db.Timestamptz(6)
```

Add to the `OAuthAccessToken` index block: `@@index([familyId])`.

Add the new model after `OAuthAccessToken` (after its closing `}` near line 968):

```prisma
// A long-lived, rotating refresh token. Exchanged at /token for a fresh access
// token AND a new refresh token; the old one is marked `rotatedAt` (spent).
// `tokenHash` is SHA-256(plaintext) with the `orcha_ort_` prefix; plaintext is
// shown once. `familyId` groups a rotation chain: reusing a spent token revokes
// the whole family (`revokedAt` across every live token sharing the id) — the
// OAuth 2.1 reuse-detection behavior. TTL is a sliding 30 days.
model OAuthRefreshToken {
  // required fields
  id        Int      @id @default(autoincrement())
  tokenHash String   @unique @db.VarChar
  familyId  String   @db.VarChar
  scope     String   @db.VarChar
  readOnly  Boolean  @default(false)
  expiresAt DateTime @db.Timestamptz(6)

  // optional fields
  rotatedAt DateTime? @db.Timestamptz(6)
  revokedAt DateTime? @db.Timestamptz(6)

  // timestamps
  createdAt DateTime @default(now()) @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @db.Timestamptz(6)

  // relations
  clientId       Int
  client         OAuthClient  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  roleId         Int
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Cascade)
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // indices, table map and constraints
  @@index([tokenHash])
  @@index([familyId])
  @@map("oauth_refresh_token")
}
```

Add the inverse relation arrays:
- `OAuthClient` (near line 897, after `accessTokens`): `  refreshTokens      OAuthRefreshToken[]`
- `Role` (near line 793, after `oauthAccessTokens`): `  oauthRefreshTokens      OAuthRefreshToken[]`
- `Organization` (near line 1492, after `oauthAccessTokens`): `  oauthRefreshTokens                            OAuthRefreshToken[]`

> **Migration is user-run (controller-gated).** The implementer does NOT run any
> migrate/prisma command and does NOT commit. After the code edits below (Steps 2–4),
> the controller pauses and the **user** runs the migration themselves, then the
> controller resumes for typecheck/tests/commit. Because `familyId` carries a
> `@default(dbgenerated("gen_random_uuid()"))`, the migration is a single safe
> statement — no `--create-only`, no hand-edited SQL:
>
> ```
> make migrate     # → prisma migrate dev; emits ADD COLUMN ... NOT NULL DEFAULT gen_random_uuid()
> ```
>
> `make migrate` regenerates the Prisma client. If it doesn't, run `make generate`.
> Existing `oauth_access_token` rows are backfilled by the DB default; new rows are
> set explicitly by `mintAccessToken`.

- [ ] **Step 2: Add `familyId` to `AccessTokenGrant` and persist it in `mintAccessToken`**

In `backend/src/mcp/oauth/accessTokens.ts`, extend the grant interface and the create call:

```typescript
export interface AccessTokenGrant {
  clientId: number; // OAuthClient.id (FK)
  roleId: number;
  organizationId: number;
  scope: string;
  readOnly: boolean;
  familyId: string; // groups the rotation chain (shared with the paired refresh token)
}
```

In `mintAccessToken`, add `familyId: grant.familyId,` to the `data` object (e.g. right
after `readOnly: grant.readOnly,`).

- [ ] **Step 3: Generate a `familyId` at code exchange in the provider**

In `backend/src/mcp/oauth/provider.ts`, `exchangeAuthorizationCode` currently mints only an
access token. Add a family id and pass it. Add `randomUUID` to the existing
`import { randomUUID } from "crypto";` (already imported). Update the body:

```typescript
  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<OAuthTokens> {
    const grant = await consumeCode(client.client_id, authorizationCode);
    // One family id ties this access token to its paired refresh token and every
    // future rotation of the pair, so a reuse can revoke the whole chain.
    const familyId = randomUUID();
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      // Single default scope this slice: full read+write.
      readOnly: false,
      familyId,
    });
    return {
      access_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },
```

(The refresh token is added to this method in Task 3.)

- [ ] **Step 4: Update `getTestOAuthToken` to set `familyId`**

In `backend/src/utils/testing.ts`, `getTestOAuthToken` builds an `oAuthAccessToken` row
directly. Add `familyId` to its options and the create data. Change the options type to
include `familyId: string` and the create call:

```typescript
export const getTestOAuthToken = async (
  tokenOptions: Partial<{
    readOnly: boolean;
    revokedAt: Date;
    expiresAt: Date;
    scope: string;
    familyId: string;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestOAuthToken> => {
```

Add `import { randomUUID } from "crypto";` at the top if not already present, and in the
`prisma.oAuthAccessToken.create` data add:

```typescript
      familyId: tokenOptions.familyId ?? randomUUID(),
```

- [ ] **Step 5: (after user-run migration) Verify typecheck and existing OAuth tests pass**

> The controller runs this step only after the user has applied `make migrate` and the
> Prisma client is regenerated (the new model/column must exist for typecheck to pass).

Run: `make typecheck`
Expected: no errors.

Run: `make test-backend TEST="oauth"`
Expected: all existing OAuth specs (accessTokens, codes, provider, connect e2e, asRouter,
clientStore, consent) PASS — `familyId` is now stored but no behavior changed.

- [ ] **Step 6: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations backend/src/mcp/oauth/accessTokens.ts backend/src/mcp/oauth/provider.ts backend/src/utils/testing.ts
git commit -m "feat(oauth): OAuthRefreshToken model + familyId on access tokens (#78)"
```

---

## Task 2: `refreshTokens.ts` store (generate, mint, rotate, revokeFamily)

TDD the store in isolation, before wiring it into the provider.

**Files:**
- Create: `backend/src/mcp/oauth/refreshTokens.ts`
- Create: `backend/src/mcp/oauth/__tests__/refreshTokens.spec.ts`
- Modify: `backend/src/utils/testing.ts` (add `getTestRefreshToken` + `TestRefreshToken`)

- [ ] **Step 1: Add the `getTestRefreshToken` test helper**

In `backend/src/utils/testing.ts`, add a type and helper mirroring `getTestOAuthToken`.
Place the type near `TestOAuthToken` and the helper after `getTestOAuthToken`:

```typescript
export interface TestRefreshToken {
  plaintext: string;
  token: OAuthRefreshToken;
  client: OAuthClient;
  user: User;
  organization: Organization;
  role: Role;
}

// Seeds an oauth_refresh_token row directly so tests can construct arbitrary
// states (spent via rotatedAt, revoked, expired) without driving a full flow.
export const getTestRefreshToken = async (
  tokenOptions: Partial<{
    readOnly: boolean;
    revokedAt: Date;
    rotatedAt: Date;
    expiresAt: Date;
    scope: string;
    familyId: string;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestRefreshToken> => {
  const { user, organization, role } = await createRandomOrgAndUser(roleType);
  const { generateRefreshToken } = await import("../mcp/oauth/refreshTokens");
  const { hashToken } = await import("../models/apiToken/token");
  const plaintext = generateRefreshToken();

  const client = await prisma.oAuthClient.create({
    data: { clientId: getRandomCode(12), redirectUris: ["http://localhost/cb"] },
  });

  const token = await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      familyId: tokenOptions.familyId ?? randomUUID(),
      scope: tokenOptions.scope ?? "mcp",
      readOnly: tokenOptions.readOnly ?? false,
      rotatedAt: tokenOptions.rotatedAt,
      revokedAt: tokenOptions.revokedAt,
      expiresAt: tokenOptions.expiresAt ?? fromNow(60),
      clientId: client.id,
      roleId: role.id,
      organizationId: organization.id,
    },
  });

  return { plaintext, token, client, user, organization, role };
};
```

Add `OAuthRefreshToken` to the existing `@prisma/client` import in `testing.ts`.

- [ ] **Step 2: Write the failing unit tests**

Create `backend/src/mcp/oauth/__tests__/refreshTokens.spec.ts`:

```typescript
/**
 * Behavior tests for the OAuth refresh-token store: minting produces an
 * orcha_ort_ token stored only as a hash; rotation issues a fresh binding and
 * marks the prior token spent; a reused (already-rotated) token is rejected and
 * its whole family — refresh AND access tokens — is revoked; an honestly expired
 * token is rejected without burning the family.
 */
import expect from "expect";
import {
  generateRefreshToken,
  mintRefreshToken,
  rotateRefreshToken,
  InvalidRefreshTokenError,
} from "../refreshTokens";
import {
  getTestRefreshToken,
  getTestOAuthToken,
  fromNow,
} from "../../../utils/testing";
import prisma from "../../../prisma";

describe("oauth refreshTokens", () => {
  it("generateRefreshToken returns an orcha_ort_ prefixed token", () => {
    expect(generateRefreshToken().startsWith("orcha_ort_")).toBe(true);
  });

  it("mintRefreshToken stores only the hash and binds the grant", async () => {
    const seed = await getTestRefreshToken();
    const plaintext = await mintRefreshToken({
      clientPk: seed.client.id,
      roleId: seed.role.id,
      organizationId: seed.organization.id,
      scope: "mcp",
      readOnly: false,
      familyId: "fam-mint",
    });
    expect(plaintext.startsWith("orcha_ort_")).toBe(true);
    const row = await prisma.oAuthRefreshToken.findFirst({
      where: { familyId: "fam-mint" },
    });
    expect(row).not.toBeNull();
    // Plaintext is never stored.
    expect(row!.tokenHash).not.toBe(plaintext);
  });

  it("rotate marks the prior token spent and returns its binding", async () => {
    const seed = await getTestRefreshToken({ familyId: "fam-rot" });
    const grant = await rotateRefreshToken(seed.client.clientId, seed.plaintext);
    expect(grant.familyId).toBe("fam-rot");
    expect(grant.roleId).toBe(seed.role.id);
    const after = await prisma.oAuthRefreshToken.findUnique({
      where: { id: seed.token.id },
    });
    expect(after!.rotatedAt).not.toBeNull();
  });

  it("rejects a reused (already-rotated) token and revokes the whole family", async () => {
    const familyId = "fam-reuse";
    const spent = await getTestRefreshToken({ familyId, rotatedAt: new Date() });
    // An access token in the same family that should also be revoked on reuse.
    const access = await getTestOAuthToken({ familyId });

    await expect(
      rotateRefreshToken(spent.client.clientId, spent.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    const rt = await prisma.oAuthRefreshToken.findUnique({
      where: { id: spent.token.id },
    });
    const at = await prisma.oAuthAccessToken.findUnique({
      where: { id: access.token.id },
    });
    expect(rt!.revokedAt).not.toBeNull();
    expect(at!.revokedAt).not.toBeNull();
  });

  it("rejects an expired token WITHOUT revoking the family", async () => {
    const familyId = "fam-exp";
    const expired = await getTestRefreshToken({ familyId, expiresAt: fromNow(-1) });
    const access = await getTestOAuthToken({ familyId });

    await expect(
      rotateRefreshToken(expired.client.clientId, expired.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    const at = await prisma.oAuthAccessToken.findUnique({
      where: { id: access.token.id },
    });
    // Honest expiry is not theft — the family stays alive.
    expect(at!.revokedAt).toBeNull();
  });

  it("rejects an unknown token", async () => {
    await expect(
      rotateRefreshToken("any-client", "orcha_ort_nope"),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("rejects a token presented under the wrong client", async () => {
    const seed = await getTestRefreshToken();
    await expect(
      rotateRefreshToken("not-the-right-client", seed.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `make test-backend TEST="oauth refreshTokens"`
Expected: FAIL — `../refreshTokens` cannot be found / `generateRefreshToken` undefined.

- [ ] **Step 4: Implement `refreshTokens.ts`**

Create `backend/src/mcp/oauth/refreshTokens.ts`:

```typescript
/**
 * OAuth refresh-token store — the long-lived, rotating credential a connected
 * client exchanges for fresh access tokens past the ~1h access-token expiry.
 *
 * It shares the access-token module's storage discipline (only the SHA-256 hash
 * of the `orcha_ort_…` plaintext is persisted) but owns the security-critical
 * part of rotation: every exchange marks the presented token spent (`rotatedAt`)
 * and issues a new one on the same `familyId`. Presenting an already-spent token
 * is treated as theft — the entire family (refresh AND access tokens) is revoked
 * (`revokedAt`), so a stolen-then-rotated token burns the whole chain and forces
 * re-consent. This is the OAuth 2.1 reuse-detection behavior.
 *
 * Exports:
 *  - generateRefreshToken(): a fresh `orcha_ort_…` plaintext.
 *  - mintRefreshToken(grant): persist a refresh token for a grant, return plaintext.
 *  - rotateRefreshToken(clientId, plaintext): atomically spend the token and return
 *    its binding for re-minting, or throw InvalidRefreshTokenError (revoking the
 *    family first when the rejection is a reuse).
 *  - revokeFamily(familyId): revoke all live refresh + access tokens in a family.
 */
import { randomBytes } from "crypto";
import prisma from "../../prisma";
import { hashToken } from "../../models/apiToken/token";

const TOKEN_PREFIX = "orcha_ort_";

// Sliding 30-day window — each rotation mints a fresh token with a new 30 days,
// so a client used at least monthly never re-prompts.
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export class InvalidRefreshTokenError extends Error {
  constructor(reason: string) {
    super(`Refresh token rejected: ${reason}`);
    this.name = "InvalidRefreshTokenError";
  }
}

export function generateRefreshToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export interface RefreshTokenGrant {
  clientPk: number; // OAuthClient.id (FK)
  roleId: number;
  organizationId: number;
  scope: string;
  readOnly: boolean;
  familyId: string;
}

// Returns the one-time plaintext; only the hash is stored.
export async function mintRefreshToken(
  grant: RefreshTokenGrant,
  expiresAt?: Date, // test seam; defaults to now + 30 days
): Promise<string> {
  const plaintext = generateRefreshToken();
  await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      familyId: grant.familyId,
      scope: grant.scope,
      readOnly: grant.readOnly,
      expiresAt: expiresAt ?? new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
    },
  });
  return plaintext;
}

// Revoke every live refresh and access token sharing a family. Called when a
// reuse is detected; idempotent (only flips rows whose revokedAt is still null).
export async function revokeFamily(familyId: string): Promise<void> {
  const now = new Date();
  await prisma.oAuthRefreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: now },
  });
  await prisma.oAuthAccessToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: now },
  });
}

// Atomically spend the presented token and return its binding for re-minting.
// Throws InvalidRefreshTokenError on every rejection; a reuse (already-spent or
// lost the rotate race) revokes the family first.
export async function rotateRefreshToken(
  clientId: string,
  plaintext: string,
): Promise<RefreshTokenGrant> {
  const row = await prisma.oAuthRefreshToken.findUnique({
    where: { tokenHash: hashToken(plaintext) },
    include: { client: true },
  });

  if (!row) throw new InvalidRefreshTokenError("UNKNOWN");
  if (row.client.clientId !== clientId) {
    throw new InvalidRefreshTokenError("CLIENT_MISMATCH");
  }
  if (row.revokedAt) throw new InvalidRefreshTokenError("REVOKED");
  if (row.rotatedAt) {
    // Reuse of a spent token: burn the whole chain, then refuse.
    await revokeFamily(row.familyId);
    throw new InvalidRefreshTokenError("REUSE");
  }
  if (row.expiresAt.getTime() < Date.now()) {
    // Honest expiry is not theft — refuse without touching the family.
    throw new InvalidRefreshTokenError("EXPIRED");
  }

  // Atomic single-use: only matches while rotatedAt is still null, so two
  // concurrent exchanges cannot both win. Losing the race is treated as reuse.
  const spent = await prisma.oAuthRefreshToken.updateMany({
    where: { id: row.id, rotatedAt: null },
    data: { rotatedAt: new Date() },
  });
  if (spent.count !== 1) {
    await revokeFamily(row.familyId);
    throw new InvalidRefreshTokenError("REUSE");
  }

  return {
    clientPk: row.clientId,
    roleId: row.roleId,
    organizationId: row.organizationId,
    scope: row.scope,
    readOnly: row.readOnly,
    familyId: row.familyId,
  };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `make test-backend TEST="oauth refreshTokens"`
Expected: all 7 specs PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/src/mcp/oauth/refreshTokens.ts backend/src/mcp/oauth/__tests__/refreshTokens.spec.ts backend/src/utils/testing.ts
git commit -m "feat(oauth): refresh-token store with rotation + family revoke (#78)"
```

---

## Task 3: Wire the provider — issue on exchange, implement refresh grant

**Files:**
- Modify: `backend/src/mcp/oauth/provider.ts`

- [ ] **Step 1: Import the refresh store and the SDK error**

In `backend/src/mcp/oauth/provider.ts`, add imports:

```typescript
import { mintRefreshToken, rotateRefreshToken } from "./refreshTokens";
import { InvalidGrantError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
```

- [ ] **Step 2: Issue a refresh token in `exchangeAuthorizationCode`**

Update the method body from Task 1 to also mint and return the refresh token (same
`familyId`):

```typescript
  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<OAuthTokens> {
    const grant = await consumeCode(client.client_id, authorizationCode);
    const familyId = randomUUID();
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly: false,
      familyId,
    });
    const refresh_token = await mintRefreshToken({
      clientPk: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly: false,
      familyId,
    });
    return {
      access_token,
      refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },
```

- [ ] **Step 3: Implement `exchangeRefreshToken` (replace the stub)**

Replace the throwing stub with:

```typescript
  // The SDK forwards a requested-scope subset as `scopes`; with the single `mcp`
  // scope this slice we reissue the granted scope unchanged.
  // TODO: honor scope narrowing once more than one scope exists.
  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
  ): Promise<OAuthTokens> {
    let grant;
    try {
      grant = await rotateRefreshToken(client.client_id, refreshToken);
    } catch {
      // Any rejection (unknown / reuse / expired / client mismatch) is an invalid
      // grant to the client — a 400, never a 500, and deliberately undifferentiated.
      throw new InvalidGrantError("invalid refresh token");
    }
    const access_token = await mintAccessToken(grant);
    const refresh_token = await mintRefreshToken(grant);
    return {
      access_token,
      refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },
```

> Note: `mintAccessToken(grant)` works because `RefreshTokenGrant` is a structural
> superset of `AccessTokenGrant` except for the `clientId` field name — verify the field
> shape in Step 4. `AccessTokenGrant.clientId` is the FK (`OAuthClient.id`), while
> `RefreshTokenGrant.clientPk` is the same FK under a different name. **Map it explicitly**
> to avoid a type error:

```typescript
    const mintGrant = {
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly: grant.readOnly,
      familyId: grant.familyId,
    };
    const access_token = await mintAccessToken(mintGrant);
    const refresh_token = await mintRefreshToken(grant);
```

Use this explicit `mintGrant` form in the method (it replaces the two `mint...` lines
shown above).

- [ ] **Step 4: Typecheck**

Run: `make typecheck`
Expected: no errors. (If it complains about `clientId` vs `clientPk`, the `mintGrant`
mapping in Step 3 is the fix.)

- [ ] **Step 5: Run the existing OAuth suite**

Run: `make test-backend TEST="oauth"`
Expected: all PASS — the connect e2e now also receives a `refresh_token` in the token
response (it asserts only on `access_token`, so it stays green).

- [ ] **Step 6: Commit**

```bash
git add backend/src/mcp/oauth/provider.ts
git commit -m "feat(oauth): issue refresh on exchange + implement refresh grant (#78)"
```

---

## Task 4: End-to-end — expire → refresh → call tool

The headline acceptance check: a real `/token` exchange yields a refresh token, the access
token is force-expired and stops working on `/mcp`, the refresh grant issues a fresh access
token, and that token calls a tool successfully. Plus: a reused refresh token returns 400.

**Files:**
- Create: `backend/src/mcp/oauth/__tests__/refresh.e2e.spec.ts`

- [ ] **Step 1: Write the failing e2e test**

Create `backend/src/mcp/oauth/__tests__/refresh.e2e.spec.ts` (modeled on
`connect.e2e.spec.ts`):

```typescript
/**
 * Refresh end to end: a DCR client exchanges a code for an access + refresh
 * token, the access token is force-expired (so it 401s on /mcp), the refresh
 * grant mints a fresh access token, and that token authenticates a whoami tool
 * call. A second exchange of the now-spent refresh token returns 400 invalid_grant.
 *
 * Mirrors connect.e2e.spec.ts: we build the app with session middleware ourselves
 * (mcpClient.listen omits it), mint the code directly to skip the browser consent,
 * and use the real SDK client for the /mcp call so the full handshake runs.
 */
import expect from "expect";
import request from "supertest";
import session from "express-session";
import { AddressInfo } from "net";
import { createExpressApp } from "../../../app";
import { connect, parse } from "../../__tests__/mcpClient";
import { mintCode } from "../codes";
import {
  createRandomOrgAndUser,
  pkceChallengeFor,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const VERIFIER = "test-verifier-0123456789-0123456789-0123456789";

describe("oauth refresh e2e", () => {
  it("expire → refresh → call-tool, and reuse is rejected", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);

    // 1. DCR + a consent-equivalent code, exactly as connect.e2e does.
    const reg = await request(app)
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    const clientId: string = reg.body.client_id;
    const { role, organization } = await createRandomOrgAndUser();
    const clientRow = await prisma.oAuthClient.findUnique({ where: { clientId } });
    const code = await mintCode({
      clientPk: clientRow!.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor(VERIFIER),
      redirectUri: "http://localhost:7777/cb",
    });

    // 2. Exchange the code — the response now carries a refresh_token.
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: VERIFIER,
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(200);
    const accessToken: string = tok.body.access_token;
    const refreshToken: string = tok.body.refresh_token;
    expect(accessToken.startsWith("orcha_oat_")).toBe(true);
    expect(refreshToken.startsWith("orcha_ort_")).toBe(true);

    // 3. Force-expire the issued access token (as the existing e2e edits rows).
    await prisma.oAuthAccessToken.updateMany({
      where: { organizationId: organization.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    const mcpUrl = new URL(`http://127.0.0.1:${port}/mcp`);
    try {
      // The expired access token must no longer authenticate on /mcp.
      await expect(connect(mcpUrl, accessToken)).rejects.toThrow();

      // 4. Refresh: a fresh access token + a rotated refresh token.
      const refreshed = await request(app).post("/token").type("form").send({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      });
      expect(refreshed.status).toBe(200);
      const newAccess: string = refreshed.body.access_token;
      const newRefresh: string = refreshed.body.refresh_token;
      expect(newAccess.startsWith("orcha_oat_")).toBe(true);
      expect(newRefresh).not.toBe(refreshToken);

      // 5. The fresh access token authenticates a real tool call.
      const { client } = await connect(mcpUrl, newAccess);
      const result = await client.callTool({ name: "whoami", arguments: {} });
      const who = parse(result);
      expect(who.organization.id).toBe(organization.id);

      // 6. Reusing the now-spent original refresh token is rejected (400).
      const reused = await request(app).post("/token").type("form").send({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
      });
      expect(reused.status).toBe(400);
      expect(reused.body.error).toBe("invalid_grant");
    } finally {
      server.close();
    }
  });
});
```

- [ ] **Step 2: Run it to verify it passes**

Run: `make test-backend TEST="oauth refresh e2e"`
Expected: PASS. (If `connect(mcpUrl, accessToken)` does not reject for the expired token,
check that `verifyAndResolveOAuth` throws on `expiresAt` in the past — it does in #77 — and
that the force-expire `updateMany` matched the row.)

- [ ] **Step 3: Run the full backend OAuth + MCP suites for regressions**

Run: `make test-backend TEST="oauth"` then `make test-backend TEST="mcp"`
Expected: all PASS.

- [ ] **Step 4: Final typecheck**

Run: `make typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/__tests__/refresh.e2e.spec.ts
git commit -m "test(oauth): e2e expire → refresh → call-tool + reuse rejection (#78)"
```

---

## Self-Review Notes

- **Spec coverage:** issue-pair on code exchange (Task 1 + 3), refresh grant rotation
  (Task 3 + `rotateRefreshToken`), reuse rejection + family revoke (Task 2), expire →
  refresh → call-tool e2e (Task 4), migration with backfill (Task 1), typecheck (every
  task). All ACs mapped.
- **Type consistency:** `AccessTokenGrant.clientId` (FK) vs `RefreshTokenGrant.clientPk`
  (same FK, different name) is the one trap — Task 3 Step 3 maps it explicitly via
  `mintGrant`. `familyId: string` is consistent across model, both grant interfaces, and
  both test helpers. `InvalidRefreshTokenError` (store-internal) is converted to the SDK's
  `InvalidGrantError` at the provider boundary so the HTTP layer returns 400.
- **Migration safety:** non-null `familyId` on the pre-existing `oauth_access_token` is
  added nullable → backfilled → set NOT NULL (Task 1 Step 3), so it never fails on existing
  rows.
```
