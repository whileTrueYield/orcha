# OAuth End-to-End Connect Implementation Plan (#77)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make a real OAuth 2.1 client complete a full connect to `/mcp` — discovery → dynamic client registration → PKCE authorize → token → tool call — authenticated by an Orcha-issued, short-lived, hashed-at-rest access token, with the PAT path untouched.

**Architecture:** The pinned `@modelcontextprotocol/sdk@1.29.0` ships the whole authorization-server surface (`mcpAuthRouter` + the `OAuthServerProvider` interface). Orcha supplies a thin provider bridge over Postgres: a DCR client store, a single-use PKCE-bound authorization-code store, an opaque access-token store, and a backend-rendered consent page. `/mcp` keeps its existing `mcpBearerAuth → resolveRole` stack; `resolveRole` learns to recognize an `orcha_oat_` token alongside `orcha_pat_`. The AS router mounts at the app root **behind** the session middleware because `/authorize` must read the httpOnly login cookie.

**Tech Stack:** TypeScript, Express 4, Prisma/Postgres, `@modelcontextprotocol/sdk@1.29.0`, mocha + nyc + `expect` + supertest (backend tests), Jest (frontend tests). Reference spec: `docs/superpowers/specs/2026-06-14-oauth-end-to-end-connect-design.md`.

---

## Conventions for every task

- **Run backend tests:** `make test-backend TEST="<grep>"` (mocha `-g` greps `describe`/`it` titles). Full suite: `make test-backend`.
- **After any Prisma schema change:** regenerate client and reset the test DB before running tests:
  ```bash
  make migrate                # creates the SQL migration from schema.prisma
  make db-reset-test          # resets + db push to the `tests` database
  yarn --cwd backend prisma generate
  ```
- **Do NOT run raw `mocha`/`jest`** — always go through the `make` targets (ESM init race otherwise produces fake failures).
- **Hashing is shared:** OAuth secrets reuse `hashToken` (SHA-256 hex) from `backend/src/models/apiToken/token.ts`. Never store plaintext.
- **File headers:** every new file gets the project's header block (purpose / exports / non-obvious assumptions).

---

## File Structure

New module `backend/src/mcp/oauth/`:
- `accessTokens.ts` — mint/resolve opaque `orcha_oat_` access tokens; the OAuth branch `resolveRole` calls.
- `codes.ts` — mint/lookup/consume single-use, PKCE-S256-bound authorization codes.
- `clientStore.ts` — `OAuthRegisteredClientsStore` over `OAuthClient` (DCR backing).
- `consent.ts` — render the minimal HTML consent page + handle the approve/deny decision POST.
- `provider.ts` — `OrchaOAuthProvider implements OAuthServerProvider`, wiring the above.
- `router.ts` — build `mcpAuthRouter(...)` from `config.apiUri`; the decision route.

Modified:
- `backend/prisma/schema.prisma` — three models + inverse relations on `Role`/`Organization`.
- `backend/src/mcp/resolveRole.ts` — dispatch by token prefix.
- `backend/src/mcp/bearerAuth.ts` — enrich the 401 `WWW-Authenticate` header.
- `backend/src/app.ts` — mount the AS router behind the middleware chain.
- `backend/src/utils/testing.ts` — `getTestOAuthToken`, `pkceChallengeFor` helpers.
- `frontend/src/pages/auth/Login/Login.tsx` + new `frontend/src/pages/auth/Login/resolveReturnTo.ts` — `returnTo` handoff with an open-redirect guard.

---

## Task 1: Prisma models for OAuth client, code, and token

**Files:**
- Modify: `backend/prisma/schema.prisma` (add three models near `PersonalAccessToken` at line ~847; add inverse relations on `Role` and `Organization`)

- [ ] **Step 1: Add the three models to `schema.prisma`**

Insert after the `PersonalAccessToken` model:

```prisma
model OAuthClient {
  id               Int      @id @default(autoincrement())
  clientId         String   @unique @db.VarChar
  name             String?  @db.VarChar
  redirectUris     String[]
  clientIdIssuedAt DateTime @default(now()) @db.Timestamptz(6)
  createdAt        DateTime @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime @updatedAt @db.Timestamptz(6)

  authorizationCodes OAuthAuthorizationCode[]
  accessTokens       OAuthAccessToken[]

  @@index([clientId])
  @@map("oauth_client")
}

model OAuthAuthorizationCode {
  id            Int       @id @default(autoincrement())
  codeHash      String    @unique @db.VarChar
  codeChallenge String    @db.VarChar
  redirectUri   String    @db.VarChar
  scope         String    @db.VarChar
  expiresAt     DateTime  @db.Timestamptz(6)
  consumedAt    DateTime? @db.Timestamptz(6)
  createdAt     DateTime  @default(now()) @db.Timestamptz(6)

  clientId       Int
  client         OAuthClient  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  roleId         Int
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Cascade)
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([codeHash])
  @@map("oauth_authorization_code")
}

model OAuthAccessToken {
  id         Int       @id @default(autoincrement())
  tokenHash  String    @unique @db.VarChar
  scope      String    @db.VarChar
  readOnly   Boolean   @default(false)
  expiresAt  DateTime  @db.Timestamptz(6)
  revokedAt  DateTime? @db.Timestamptz(6)
  lastUsedAt DateTime? @db.Timestamptz(6)
  createdAt  DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt  DateTime  @updatedAt @db.Timestamptz(6)

  clientId       Int
  client         OAuthClient  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  roleId         Int
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Cascade)
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([tokenHash])
  @@index([roleId])
  @@index([organizationId])
  @@map("oauth_access_token")
}
```

- [ ] **Step 2: Add inverse relations on `Role` and `Organization`**

In `model Role`, alongside the existing `personalAccessTokens`-style relation lists, add:

```prisma
  oauthAuthorizationCodes OAuthAuthorizationCode[]
  oauthAccessTokens       OAuthAccessToken[]
```

In `model Organization`, add:

```prisma
  oauthClients            OAuthClient[]
  oauthAuthorizationCodes OAuthAuthorizationCode[]
  oauthAccessTokens       OAuthAccessToken[]
```

> Note: `OAuthClient` has no `organizationId` in this slice (a client is global; the *grant* carries the org). Remove the `oauthClients` line on `Organization` if you did not add an `organizationId` to `OAuthClient`. Keep them consistent — the schema must compile.

- [ ] **Step 3: Validate, migrate, regenerate, reset test DB**

```bash
yarn --cwd backend prisma validate
make migrate
make db-reset-test
yarn --cwd backend prisma generate
```
Expected: `prisma validate` prints "The schema at prisma/schema.prisma is valid"; `make migrate` writes a new folder under `backend/prisma/migrations/`.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations
git commit -m "feat(oauth): add OAuthClient, OAuthAuthorizationCode, OAuthAccessToken models (#77)"
```

---

## Task 2: OAuth access-token module (mint + resolve)

**Files:**
- Create: `backend/src/mcp/oauth/accessTokens.ts`
- Create: `backend/src/mcp/oauth/__tests__/accessTokens.spec.ts`
- Modify: `backend/src/utils/testing.ts` (add `getTestOAuthToken`)

- [ ] **Step 1: Add the `getTestOAuthToken` helper to `testing.ts`**

Add near `getTestApiToken` (around line 222). It mirrors that helper but writes an `OAuthClient` + `OAuthAccessToken`:

```ts
interface TestOAuthToken {
  plaintext: string;
  token: import("@prisma/client").OAuthAccessToken;
  client: import("@prisma/client").OAuthClient;
  user: User;
  organization: Organization;
  role: Role;
}

/**
 * Mint an OAuth access token bound to a freshly-created org/user/role and a
 * registered client, the way the MCP bearer stack expects to find one. Mirrors
 * getTestApiToken for the OAuth lifecycle states the seam tests exercise
 * (read-only, revoked, expired).
 */
export const getTestOAuthToken = async (
  tokenOptions: Partial<{
    readOnly: boolean;
    revokedAt: Date;
    expiresAt: Date;
    scope: string;
  }> = {},
  roleType: RoleType = RoleType.MEMBER,
): Promise<TestOAuthToken> => {
  const { user, organization, role } = await createRandomOrgAndUser(roleType);
  const { generateAccessToken } = await import("../mcp/oauth/accessTokens");
  const { hashToken } = await import("../models/apiToken/token");
  const plaintext = generateAccessToken();

  const client = await prisma.oAuthClient.create({
    data: { clientId: getRandomCode(12), redirectUris: ["http://localhost/cb"] },
  });

  const token = await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      scope: tokenOptions.scope ?? "mcp",
      readOnly: tokenOptions.readOnly ?? false,
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

- [ ] **Step 2: Write the failing test `accessTokens.spec.ts`**

```ts
/**
 * Behavior tests for the OAuth access-token module: minting produces an
 * orcha_oat_ token stored only as a hash, and resolution returns the bound
 * Role + capability flags or refuses (the same opaque InvalidTokenError the PAT
 * path uses) for unknown / expired / revoked tokens.
 */
import expect from "expect";
import {
  generateAccessToken,
  verifyAndResolveOAuth,
} from "../accessTokens";
import { getTestOAuthToken } from "../../../utils/testing";
import { InvalidTokenError } from "../../../models/apiToken/token";
import { fromNow } from "../../../utils/testing";

describe("oauth accessTokens", () => {
  it("generateAccessToken returns an orcha_oat_ prefixed token", () => {
    expect(generateAccessToken().startsWith("orcha_oat_")).toBe(true);
  });

  it("resolves a valid OAuth token to its role, scope, client, and readOnly", async () => {
    const t = await getTestOAuthToken();
    const resolved = await verifyAndResolveOAuth(t.plaintext);
    expect(resolved.tokenId).toBe(t.token.id);
    expect(resolved.role.id).toBe(t.role.id);
    expect(resolved.readOnly).toBe(false);
    expect(resolved.clientId).toBe(t.client.clientId);
    expect(resolved.scopes).toEqual(["mcp"]);
  });

  it("refuses an unknown OAuth token", async () => {
    await expect(verifyAndResolveOAuth("orcha_oat_nope")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("refuses an expired OAuth token", async () => {
    const t = await getTestOAuthToken({ expiresAt: fromNow(-1) });
    await expect(verifyAndResolveOAuth(t.plaintext)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("refuses a revoked OAuth token", async () => {
    const t = await getTestOAuthToken({ revokedAt: new Date() });
    await expect(verifyAndResolveOAuth(t.plaintext)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
```

- [ ] **Step 2b: Run it to confirm it fails**

Run: `make test-backend TEST="oauth accessTokens"`
Expected: FAIL — `Cannot find module '../accessTokens'`.

- [ ] **Step 3: Implement `accessTokens.ts`**

```ts
/**
 * OAuth access-token module — the opaque, short-lived bearer Orcha issues at the
 * end of the OAuth flow, and the resolver the MCP seam calls for the OAuth branch.
 *
 * An OAuth access token is conceptually a short-lived, client-bound, browser-issued
 * Role token. It shares the PAT's storage discipline — only the SHA-256 hash is
 * persisted, the plaintext is unrecoverable after minting — but a distinct lifecycle
 * (client-bound, PKCE-derived, ~1h TTL, soon refreshable) earns its own model.
 *
 * Exports:
 *  - generateAccessToken(): a fresh `orcha_oat_…` plaintext.
 *  - mintAccessToken(grant): persist a token for a grant, return the plaintext.
 *  - verifyAndResolveOAuth(plaintext): resolve to { tokenId, role, readOnly, scopes,
 *    clientId, expiresAt } or throw InvalidTokenError — the same opaque refusal the
 *    PAT path uses, so a probe learns nothing from which branch rejected it.
 */
import { randomBytes } from "crypto";
import { Role } from "@prisma/client";
import prisma from "../../prisma";
import { hashToken, InvalidTokenError } from "../../models/apiToken/token";

const TOKEN_PREFIX = "orcha_oat_";

// Default access-token lifetime: short, so a leaked token expires quickly.
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h

export function generateAccessToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export function isOAuthAccessToken(plaintext: string): boolean {
  return plaintext.startsWith(TOKEN_PREFIX);
}

export interface AccessTokenGrant {
  clientId: number; // OAuthClient.id (FK)
  roleId: number;
  organizationId: number;
  scope: string;
  readOnly: boolean;
}

// Returns the one-time plaintext; only the hash is stored.
export async function mintAccessToken(grant: AccessTokenGrant): Promise<string> {
  const plaintext = generateAccessToken();
  await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      scope: grant.scope,
      readOnly: grant.readOnly,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
      clientId: grant.clientId,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
    },
  });
  return plaintext;
}

export interface ResolvedOAuthToken {
  tokenId: number;
  role: Role;
  readOnly: boolean;
  scopes: string[];
  clientId: string; // the public OAuthClient.clientId
  expiresAt: Date;
}

export async function verifyAndResolveOAuth(
  plaintext: string,
): Promise<ResolvedOAuthToken> {
  const token = await prisma.oAuthAccessToken.findUnique({
    where: { tokenHash: hashToken(plaintext) },
    include: { role: true, client: true },
  });

  if (!token) throw new InvalidTokenError("UNKNOWN");
  if (token.revokedAt) throw new InvalidTokenError("REVOKED");
  if (token.expiresAt.getTime() < Date.now()) {
    throw new InvalidTokenError("EXPIRED");
  }

  return {
    tokenId: token.id,
    role: token.role,
    readOnly: token.readOnly,
    scopes: token.scope.split(" ").filter(Boolean),
    clientId: token.client.clientId,
    expiresAt: token.expiresAt,
  };
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

Run: `make test-backend TEST="oauth accessTokens"`
Expected: PASS (5 passing).

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/accessTokens.ts backend/src/mcp/oauth/__tests__/accessTokens.spec.ts backend/src/utils/testing.ts
git commit -m "feat(oauth): opaque access-token mint + resolve (orcha_oat_) (#77)"
```

---

## Task 3: Teach `resolveRole` the OAuth branch

**Files:**
- Modify: `backend/src/mcp/resolveRole.ts`
- Modify: `backend/src/mcp/__tests__/resolveRole.spec.ts`

- [ ] **Step 1: Add failing tests to `resolveRole.spec.ts`**

Append inside the `describe("resolveRole", …)` block:

```ts
  it("resolves a valid OAuth access token to its role context and readOnly", async () => {
    const { getTestOAuthToken } = await import("../../utils/testing");
    const t = await getTestOAuthToken();

    const { role, readOnly, tokenId } = await resolveRole(t.plaintext);

    expect(role.status).toBe(AuthStatus.LINKED);
    expect(role.roleId).toBe(t.role.id);
    expect(role.organizationId).toBe(t.organization.id);
    expect(readOnly).toBe(false);
    expect(tokenId).toBe(t.token.id);
  });

  it("throws InvalidTokenError for an unknown OAuth access token", async () => {
    await expect(resolveRole("orcha_oat_not_real")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="resolveRole"`
Expected: FAIL — the OAuth token resolves through the PAT path and throws `UNKNOWN`, so the "resolves a valid OAuth access token" test fails on `role.roleId`.

- [ ] **Step 3: Implement the prefix branch in `resolveRole.ts`**

Replace the body of `resolveRole` so it dispatches by prefix; both branches return the same `{ tokenId, role, readOnly }` shape, so `buildRoleContext` stays a single call:

```ts
import { AuthRoleContext } from "../types";
import { buildRoleContext } from "../middlewares/isAuthenticated";
import { verifyAndResolve } from "../models/apiToken/token";
import {
  isOAuthAccessToken,
  verifyAndResolveOAuth,
} from "./oauth/accessTokens";

export interface ResolvedRole {
  role: AuthRoleContext;
  readOnly: boolean;
  tokenId: number;
}

export async function resolveRole(bearerToken: string): Promise<ResolvedRole> {
  // Dispatch by token family: an OAuth access token (orcha_oat_) and a PAT
  // (orcha_pat_) prove identity differently but both resolve to the same
  // { role, readOnly, tokenId } the MCP tools depend on. The PAT path is unchanged.
  const { tokenId, role, readOnly } = isOAuthAccessToken(bearerToken)
    ? await verifyAndResolveOAuth(bearerToken)
    : await verifyAndResolve(bearerToken);

  return {
    role: buildRoleContext({
      userId: role.userId,
      roleId: role.id,
      organizationId: role.organizationId,
      roleType: role.type,
    }),
    readOnly,
    tokenId,
  };
}
```

Update the file header to note it now resolves both PAT and OAuth tokens.

- [ ] **Step 4: Run the seam tests (PAT + OAuth both green)**

Run: `make test-backend TEST="resolveRole"`
Expected: PASS — original PAT cases and the two new OAuth cases.

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/resolveRole.ts backend/src/mcp/__tests__/resolveRole.spec.ts
git commit -m "feat(oauth): resolveRole recognises orcha_oat_ tokens alongside PAT (#77)"
```

---

## Task 4: Authorization-code store (single-use, PKCE-bound)

**Files:**
- Create: `backend/src/mcp/oauth/codes.ts`
- Create: `backend/src/mcp/oauth/__tests__/codes.spec.ts`
- Modify: `backend/src/utils/testing.ts` (add `pkceChallengeFor`)

- [ ] **Step 1: Add `pkceChallengeFor` to `testing.ts`**

```ts
import { createHash } from "crypto";

// The S256 challenge for a PKCE verifier: base64url(sha256(verifier)).
export const pkceChallengeFor = (verifier: string): string =>
  createHash("sha256").update(verifier).digest("base64url");
```

- [ ] **Step 2: Write failing `codes.spec.ts`**

```ts
/**
 * Behavior tests for the authorization-code store: a code is single-use,
 * short-lived, and bound to its client/role/scope/PKCE challenge. consumeCode
 * succeeds exactly once and refuses a reused, expired, or wrong-client code.
 */
import expect from "expect";
import { mintCode, lookupChallenge, consumeCode } from "../codes";
import {
  createRandomOrgAndUser,
  pkceChallengeFor,
  fromNow,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const seedClient = () =>
  prisma.oAuthClient.create({
    data: { clientId: `c_${Math.floor(performance.now())}`, redirectUris: ["http://localhost/cb"] },
  });

describe("oauth codes", () => {
  it("mints a code and exposes its stored challenge", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const challenge = pkceChallengeFor("verifier-abc");

    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: challenge,
      redirectUri: "http://localhost/cb",
    });

    expect(await lookupChallenge(client.clientId, code)).toBe(challenge);
  });

  it("consumes a code exactly once and returns the grant", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
    });

    const grant = await consumeCode(client.clientId, code);
    expect(grant.roleId).toBe(role.id);
    expect(grant.scope).toBe("mcp");

    await expect(consumeCode(client.clientId, code)).rejects.toThrow();
  });

  it("refuses an expired code", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const client = await seedClient();
    const code = await mintCode({
      clientPk: client.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
      expiresAt: fromNow(-1),
    });
    await expect(consumeCode(client.clientId, code)).rejects.toThrow();
  });
});
```

- [ ] **Step 2b: Run to confirm failure**

Run: `make test-backend TEST="oauth codes"`
Expected: FAIL — `Cannot find module '../codes'`.

- [ ] **Step 3: Implement `codes.ts`**

```ts
/**
 * Authorization-code store for the OAuth flow.
 *
 * An authorization code is a single-use, ~60s bearer of intent: it binds the
 * user/Role/client/scope/redirect and the PKCE-S256 challenge proven at /authorize,
 * so /token can verify the client holds the matching verifier before issuing an
 * access token. Only the SHA-256 hash of the code is stored. Consumption is atomic
 * (a conditional update) so a replayed code cannot mint a second token.
 *
 * Exports:
 *  - mintCode(grant): persist a code, return the one-time plaintext code.
 *  - lookupChallenge(clientId, code): the stored S256 challenge (for the SDK's
 *    PKCE check) or throw if the code is unknown/expired.
 *  - consumeCode(clientId, code): atomically mark consumed and return the grant,
 *    or throw if unknown / expired / already consumed / wrong client.
 */
import { randomBytes } from "crypto";
import prisma from "../../prisma";
import { hashToken } from "../../models/apiToken/token";

const CODE_TTL_MS = 1000 * 60; // 60s

export class InvalidAuthorizationCodeError extends Error {
  constructor(reason: string) {
    super(`Authorization code rejected: ${reason}`);
    this.name = "InvalidAuthorizationCodeError";
  }
}

export interface CodeGrantInput {
  clientPk: number; // OAuthClient.id
  roleId: number;
  organizationId: number;
  scope: string;
  codeChallenge: string;
  redirectUri: string;
  expiresAt?: Date; // test seam; defaults to now + 60s
}

export async function mintCode(input: CodeGrantInput): Promise<string> {
  const code = randomBytes(32).toString("hex");
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: hashToken(code),
      codeChallenge: input.codeChallenge,
      redirectUri: input.redirectUri,
      scope: input.scope,
      expiresAt: input.expiresAt ?? new Date(Date.now() + CODE_TTL_MS),
      clientId: input.clientPk,
      roleId: input.roleId,
      organizationId: input.organizationId,
    },
  });
  return code;
}

async function findLive(clientId: string, code: string) {
  const row = await prisma.oAuthAuthorizationCode.findUnique({
    where: { codeHash: hashToken(code) },
    include: { client: true },
  });
  if (!row) throw new InvalidAuthorizationCodeError("UNKNOWN");
  if (row.client.clientId !== clientId) {
    throw new InvalidAuthorizationCodeError("CLIENT_MISMATCH");
  }
  if (row.consumedAt) throw new InvalidAuthorizationCodeError("CONSUMED");
  if (row.expiresAt.getTime() < Date.now()) {
    throw new InvalidAuthorizationCodeError("EXPIRED");
  }
  return row;
}

export async function lookupChallenge(
  clientId: string,
  code: string,
): Promise<string> {
  const row = await findLive(clientId, code);
  return row.codeChallenge;
}

export interface ConsumedGrant {
  clientPk: number;
  roleId: number;
  organizationId: number;
  scope: string;
}

export async function consumeCode(
  clientId: string,
  code: string,
): Promise<ConsumedGrant> {
  const row = await findLive(clientId, code);
  // Atomic single-use: the update only matches while consumedAt is still null,
  // so two concurrent exchanges cannot both succeed.
  const consumed = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: row.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) {
    throw new InvalidAuthorizationCodeError("CONSUMED");
  }
  return {
    clientPk: row.clientId,
    roleId: row.roleId,
    organizationId: row.organizationId,
    scope: row.scope,
  };
}
```

- [ ] **Step 4: Run tests**

Run: `make test-backend TEST="oauth codes"`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/codes.ts backend/src/mcp/oauth/__tests__/codes.spec.ts backend/src/utils/testing.ts
git commit -m "feat(oauth): single-use PKCE-bound authorization-code store (#77)"
```

---

## Task 5: DCR client store

**Files:**
- Create: `backend/src/mcp/oauth/clientStore.ts`
- Create: `backend/src/mcp/oauth/__tests__/clientStore.spec.ts`

- [ ] **Step 1: Write failing `clientStore.spec.ts`**

```ts
/**
 * Behavior tests for the DCR client store: registerClient persists the
 * library-generated client_id and redirect_uris, and getClient round-trips it.
 */
import expect from "expect";
import { orchaClientsStore } from "../clientStore";

describe("oauth clientStore", () => {
  it("registers a client and reads it back by client_id", async () => {
    const registered = await orchaClientsStore.registerClient!({
      client_id: "test-client-id-1",
      client_id_issued_at: Math.floor(Date.now() / 1000),
      redirect_uris: ["http://localhost:9999/callback"],
      client_name: "Test Client",
      token_endpoint_auth_method: "none",
    } as any);

    expect(registered.client_id).toBe("test-client-id-1");

    const fetched = await orchaClientsStore.getClient("test-client-id-1");
    expect(fetched?.redirect_uris).toEqual(["http://localhost:9999/callback"]);
    expect(fetched?.client_name).toBe("Test Client");
  });

  it("returns undefined for an unknown client", async () => {
    expect(await orchaClientsStore.getClient("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="oauth clientStore"`
Expected: FAIL — `Cannot find module '../clientStore'`.

- [ ] **Step 3: Implement `clientStore.ts`**

```ts
/**
 * Dynamic-client-registration store — the OAuthRegisteredClientsStore the SDK's
 * /register and client-auth machinery read and write.
 *
 * Our clients are public PKCE clients (no client secret), so DCR records only
 * the library-generated client_id, the registered redirect_uris, and a display
 * name. The SDK generates client_id/client_id_issued_at before calling
 * registerClient, so this store only persists and reflects them back.
 *
 * Exports:
 *  - orchaClientsStore: the OAuthRegisteredClientsStore implementation.
 */
import { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import { OAuthClientInformationFull } from "@modelcontextprotocol/sdk/shared/auth.js";
import prisma from "../../prisma";

function toClientInformation(row: {
  clientId: string;
  redirectUris: string[];
  name: string | null;
  clientIdIssuedAt: Date;
}): OAuthClientInformationFull {
  return {
    client_id: row.clientId,
    client_id_issued_at: Math.floor(row.clientIdIssuedAt.getTime() / 1000),
    redirect_uris: row.redirectUris,
    client_name: row.name ?? undefined,
    token_endpoint_auth_method: "none",
  } as OAuthClientInformationFull;
}

export const orchaClientsStore: OAuthRegisteredClientsStore = {
  async getClient(clientId) {
    const row = await prisma.oAuthClient.findUnique({ where: { clientId } });
    return row ? toClientInformation(row) : undefined;
  },

  async registerClient(client) {
    // The SDK sets client_id + client_id_issued_at before calling us.
    const full = client as OAuthClientInformationFull;
    const row = await prisma.oAuthClient.create({
      data: {
        clientId: full.client_id,
        name: full.client_name ?? null,
        redirectUris: full.redirect_uris,
        clientIdIssuedAt: full.client_id_issued_at
          ? new Date(full.client_id_issued_at * 1000)
          : new Date(),
      },
    });
    return toClientInformation(row);
  },
};
```

- [ ] **Step 4: Run tests**

Run: `make test-backend TEST="oauth clientStore"`
Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/clientStore.ts backend/src/mcp/oauth/__tests__/clientStore.spec.ts
git commit -m "feat(oauth): DCR client store over OAuthClient (#77)"
```

---

## Task 6: Backend-rendered consent (render + decision)

**Files:**
- Create: `backend/src/mcp/oauth/consent.ts`
- Create: `backend/src/mcp/oauth/__tests__/consent.spec.ts`

The consent surface is two pure-ish pieces: `renderConsent(params)` → an HTML string, and a `decision` handler that, on approve, mints a code and redirects. We keep `renderConsent` a pure function so it is unit-testable without HTTP.

- [ ] **Step 1: Write failing `consent.spec.ts`**

```ts
/**
 * Behavior tests for the consent surface. renderConsent names the client, org,
 * and Role and carries the opaque request token in a hidden field; it never
 * inlines unescaped values (XSS guard).
 */
import expect from "expect";
import { renderConsent } from "../consent";

describe("oauth consent", () => {
  it("names the client, organization, and role and embeds the request token", () => {
    const html = renderConsent({
      clientName: "Claude",
      organizationName: "Acme",
      roleName: "Maker",
      requestToken: "req-123",
      decisionPath: "/oauth/consent/decision",
    });
    expect(html).toContain("Claude");
    expect(html).toContain("Acme");
    expect(html).toContain("Maker");
    expect(html).toContain('value="req-123"');
    expect(html).toContain('action="/oauth/consent/decision"');
  });

  it("escapes angle brackets in client-supplied names", () => {
    const html = renderConsent({
      clientName: "<script>x</script>",
      organizationName: "Acme",
      roleName: "Maker",
      requestToken: "t",
      decisionPath: "/d",
    });
    expect(html).not.toContain("<script>x</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="oauth consent"`
Expected: FAIL — `Cannot find module '../consent'`.

- [ ] **Step 3: Implement `consent.ts` (render only for now)**

```ts
/**
 * Backend-rendered consent surface for the OAuth /authorize step.
 *
 * Because Orcha's session cookie is httpOnly, the backend is the only party that
 * can read login state — so the minimal approve/deny consent is rendered here, not
 * in the SPA. The decision posts SAME-ORIGIN so the session cookie rides along even
 * under the dev `sameSite: "lax"` policy (a cross-site frontend POST would drop it).
 * The polished React consent UI is a later slice (#80); this is the tracer.
 *
 * Exports:
 *  - renderConsent(params): the minimal HTML page (pure; no I/O).
 *  - ConsentParams: its inputs.
 */

export interface ConsentParams {
  clientName: string;
  organizationName: string;
  roleName: string;
  requestToken: string; // opaque handle to the pending authorize request
  decisionPath: string; // same-origin POST target
}

// Minimal HTML-escape for the few interpolated, possibly client-supplied values.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderConsent(params: ConsentParams): string {
  const client = escapeHtml(params.clientName);
  const org = escapeHtml(params.organizationName);
  const role = escapeHtml(params.roleName);
  const token = escapeHtml(params.requestToken);
  const action = escapeHtml(params.decisionPath);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Authorize ${client}</title></head>
<body>
  <h1>${client} wants to access your Orcha workspace</h1>
  <p>Acting as <strong>${role}</strong> in <strong>${org}</strong> (read + write).</p>
  <form method="post" action="${action}">
    <input type="hidden" name="request" value="${token}">
    <button type="submit" name="decision" value="approve">Approve</button>
    <button type="submit" name="decision" value="deny">Deny</button>
  </form>
</body></html>`;
}
```

- [ ] **Step 4: Run tests**

Run: `make test-backend TEST="oauth consent"`
Expected: PASS (2 passing).

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/consent.ts backend/src/mcp/oauth/__tests__/consent.spec.ts
git commit -m "feat(oauth): backend-rendered minimal consent page (#77)"
```

---

## Task 7: The `OrchaOAuthProvider`

**Files:**
- Create: `backend/src/mcp/oauth/provider.ts`
- Create: `backend/src/mcp/oauth/__tests__/provider.spec.ts`

This wires the stores into the SDK's `OAuthServerProvider`. The `authorize` step is driven over HTTP in Task 9's e2e; here we unit-test the parts that don't need the full Express router: `verifyAccessToken`, `exchangeAuthorizationCode` (single-use + mint), and the unsupported-grant guards. PKCE itself is validated by the SDK (see spec §"Verification gate"), so `exchangeAuthorizationCode` receives no verifier.

> **Pending-request store:** `authorize` cannot issue the code until the user approves, so it stashes the validated request (client/redirect/scope/challenge/state) under an opaque `requestToken` and renders consent; the decision route (Task 9) approves it. Implement this as a small `pendingRequests` map persisted via the `OAuthAuthorizationCode` table is overkill for the tracer — use a short-TTL row in a dedicated lightweight store. For this slice, store pending requests in the `codes` table is NOT correct (no code yet). Use an in-process `Map` keyed by `requestToken` with a TTL, documented as single-instance-only (a later slice moves it to Redis). Note this limitation in the file header.

- [ ] **Step 1: Write failing `provider.spec.ts`**

```ts
/**
 * Behavior tests for OrchaOAuthProvider's token-side contract: verifyAccessToken
 * returns AuthInfo for a live token and rejects a dead one; exchangeAuthorizationCode
 * issues an orcha_oat_ token once and refuses replay; refresh/revoke are unsupported
 * in this slice and throw clearly.
 */
import expect from "expect";
import { orchaOAuthProvider } from "../provider";
import { mintCode } from "../codes";
import {
  getTestOAuthToken,
  createRandomOrgAndUser,
  pkceChallengeFor,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const client = (clientId: string, redirect = "http://localhost/cb") =>
  ({ client_id: clientId, redirect_uris: [redirect] } as any);

describe("OrchaOAuthProvider", () => {
  it("verifyAccessToken returns AuthInfo for a live token", async () => {
    const t = await getTestOAuthToken();
    const info = await orchaOAuthProvider.verifyAccessToken(t.plaintext);
    expect(info.token).toBe(t.plaintext);
    expect(info.clientId).toBe(t.client.clientId);
    expect(info.scopes).toEqual(["mcp"]);
  });

  it("verifyAccessToken rejects an unknown token", async () => {
    await expect(
      orchaOAuthProvider.verifyAccessToken("orcha_oat_nope"),
    ).rejects.toThrow();
  });

  it("exchangeAuthorizationCode issues a token once and refuses replay", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const row = await prisma.oAuthClient.create({
      data: { clientId: "exch-client", redirectUris: ["http://localhost/cb"] },
    });
    const code = await mintCode({
      clientPk: row.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "mcp",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
    });

    const tokens = await orchaOAuthProvider.exchangeAuthorizationCode(
      client("exch-client"),
      code,
    );
    expect(tokens.access_token.startsWith("orcha_oat_")).toBe(true);
    expect(tokens.token_type.toLowerCase()).toBe("bearer");

    await expect(
      orchaOAuthProvider.exchangeAuthorizationCode(client("exch-client"), code),
    ).rejects.toThrow();
  });

  it("refresh and revoke are unsupported in this slice", async () => {
    await expect(
      orchaOAuthProvider.exchangeRefreshToken(client("x"), "rt"),
    ).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="OrchaOAuthProvider"`
Expected: FAIL — `Cannot find module '../provider'`.

- [ ] **Step 3: Implement `provider.ts`**

```ts
/**
 * OrchaOAuthProvider — the thin bridge between the SDK's authorization-server
 * router and Orcha's stores. The SDK owns the protocol (metadata, DCR, PKCE
 * validation, route wiring); this provides the four hooks it cannot: who the
 * user is (authorize, via the session + consent), what challenge a code carries,
 * how a code becomes an access token, and how an access token is verified.
 *
 * Scope (slice #77): single default scope (read+write), opaque access tokens, no
 * refresh and no revocation (those throw clearly and land in #78/#81). PKCE-S256
 * is validated by the SDK before exchangeAuthorizationCode runs, so no verifier
 * arrives here.
 *
 * The pending-authorize store is an in-process Map (single-instance only); a later
 * slice moves it to Redis. See pendingRequests below.
 *
 * Exports:
 *  - orchaOAuthProvider: the OAuthServerProvider instance the router consumes.
 *  - pendingRequests: the consent route (router.ts) reads/clears it on decision.
 */
import { randomUUID } from "crypto";
import { Response } from "express";
import {
  OAuthServerProvider,
  AuthorizationParams,
} from "@modelcontextprotocol/sdk/server/auth/provider.js";
import {
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { orchaClientsStore } from "./clientStore";
import { lookupChallenge, consumeCode } from "./codes";
import { mintAccessToken, verifyAndResolveOAuth } from "./accessTokens";
import prisma from "../../prisma";

const DEFAULT_SCOPE = "mcp";

// A validated authorize request awaiting the user's approve/deny. Keyed by an
// opaque requestToken carried through the consent form. In-process only.
export interface PendingRequest {
  clientId: string; // public client_id
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  state?: string;
  expiresAt: number;
}
export const pendingRequests = new Map<string, PendingRequest>();
const PENDING_TTL_MS = 1000 * 60 * 5;

export const orchaOAuthProvider: OAuthServerProvider = {
  get clientsStore() {
    return orchaClientsStore;
  },

  // Stash the validated request and render consent. The actual redirect with a
  // code happens in the consent decision route (router.ts) once the user approves.
  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response,
  ): Promise<void> {
    const requestToken = randomUUID();
    pendingRequests.set(requestToken, {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      scope: params.scopes?.join(" ") || DEFAULT_SCOPE,
      state: params.state,
      expiresAt: Date.now() + PENDING_TTL_MS,
    });
    // The session gate + consent rendering live in router.ts (it has req.session
    // and renders the page); authorize only records intent and defers there.
    res.redirect(`/oauth/consent?request=${requestToken}`);
  },

  async challengeForAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<string> {
    return lookupChallenge(client.client_id, authorizationCode);
  },

  // PKCE already verified by the SDK; consume the code (single-use) and mint.
  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<OAuthTokens> {
    const grant = await consumeCode(client.client_id, authorizationCode);
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly: false, // single default scope this slice
    });
    return {
      access_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },

  async exchangeRefreshToken(): Promise<OAuthTokens> {
    throw new Error("refresh tokens are not supported yet (#78)");
  },

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const resolved = await verifyAndResolveOAuth(token);
    return {
      token,
      clientId: resolved.clientId,
      scopes: resolved.scopes,
      expiresAt: Math.floor(resolved.expiresAt.getTime() / 1000),
    };
  },
};

// Resolve a pending request's display data for the consent page (used by router.ts).
export async function describePending(requestToken: string): Promise<{
  pending: PendingRequest;
  clientName: string;
} | null> {
  const pending = pendingRequests.get(requestToken);
  if (!pending || pending.expiresAt < Date.now()) return null;
  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: pending.clientId },
  });
  return { pending, clientName: client?.name ?? pending.clientId };
}
```

- [ ] **Step 4: Run tests**

Run: `make test-backend TEST="OrchaOAuthProvider"`
Expected: PASS (4 passing).

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/oauth/provider.ts backend/src/mcp/oauth/__tests__/provider.spec.ts
git commit -m "feat(oauth): OrchaOAuthProvider bridge (verify/exchange/authorize) (#77)"
```

---

## Task 8: Enrich the `/mcp` 401 `WWW-Authenticate` header

**Files:**
- Modify: `backend/src/mcp/bearerAuth.ts`
- Create: `backend/src/mcp/__tests__/discovery.spec.ts`

- [ ] **Step 1: Write failing `discovery.spec.ts`**

```ts
/**
 * An unauthenticated /mcp request must answer 401 with a WWW-Authenticate that
 * points a consumer client at the protected-resource metadata (OAuth discovery).
 */
import expect from "expect";
import request from "supertest";
import { createExpressApp } from "../../app";

describe("mcp oauth discovery", () => {
  it("401s with a resource_metadata WWW-Authenticate", async () => {
    const res = await request(createExpressApp()).get("/mcp");
    expect(res.status).toBe(401);
    expect(res.headers["www-authenticate"]).toMatch(/resource_metadata=/);
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="mcp oauth discovery"`
Expected: FAIL — header is the bare `Bearer`, no `resource_metadata`.

- [ ] **Step 3: Enrich `unauthorized()` in `bearerAuth.ts`**

Replace the `unauthorized` helper:

```ts
import { getOAuthProtectedResourceMetadataUrl } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { config } from "../config";

// The protected-resource metadata URL a client follows from a 401 to discover
// the authorization server (RS → AS linkage).
const RESOURCE_METADATA_URL = getOAuthProtectedResourceMetadataUrl(
  new URL(`${config.apiUri}${config.apiPathPrefix}/mcp`),
);

function unauthorized(res: Response, message: string): void {
  // RFC 6750 + MCP auth: advertise the scheme AND where to discover the AS.
  res.set(
    "WWW-Authenticate",
    `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`,
  );
  res.status(401).json(errorEnvelope("UNAUTHENTICATED", message));
}
```

- [ ] **Step 4: Run tests (and the existing mcp suite for no regressions)**

Run: `make test-backend TEST="mcp oauth discovery"` then `make test-backend TEST="mcp"`
Expected: PASS; existing `/mcp` PAT tests still green.

- [ ] **Step 5: Commit**

```bash
git add backend/src/mcp/bearerAuth.ts backend/src/mcp/__tests__/discovery.spec.ts
git commit -m "feat(oauth): /mcp 401 advertises protected-resource metadata (#77)"
```

---

## Task 9: Mount the AS router + the consent decision route

**Files:**
- Create: `backend/src/mcp/oauth/router.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/src/mcp/oauth/__tests__/asRouter.spec.ts`

The SDK's `mcpAuthRouter` serves metadata/DCR/authorize/token/revoke at the app root. We also add the `/oauth/consent` GET (render) and `/oauth/consent/decision` POST (approve → mint code → redirect; deny → error redirect), which read the session.

> **Mount order:** `mcpAuthRouter` and the consent routes must sit **after** the session middleware in `createExpressApp`. The current `createExpressApp` applies `middlewares` (session/cors in prod) then mounts the catch-all `router`. Insert the AS router right after the `middlewares` loop, before the catch-all.

- [ ] **Step 1: Write failing `asRouter.spec.ts`**

```ts
/**
 * The authorization-server endpoints are mounted and discoverable: AS metadata
 * advertises S256 + the endpoints, and DCR returns a client_id. (The /authorize
 * browser dance is covered by the provider unit tests + the e2e in Task 11.)
 */
import expect from "expect";
import request from "supertest";
import session from "express-session";
import { createExpressApp } from "../../../app";

// The AS endpoints need the session middleware present (authorize reads it); a
// memory-store session is enough for these metadata/DCR checks.
const appWithSession = () =>
  createExpressApp([
    session({ secret: "test", resave: false, saveUninitialized: false }),
  ]);

describe("oauth as router", () => {
  it("serves AS metadata with S256 and endpoints", async () => {
    const res = await request(appWithSession()).get(
      "/.well-known/oauth-authorization-server",
    );
    expect(res.status).toBe(200);
    expect(res.body.code_challenge_methods_supported).toContain("S256");
    expect(res.body.token_endpoint).toBeDefined();
    expect(res.body.registration_endpoint).toBeDefined();
  });

  it("registers a client via DCR", async () => {
    const res = await request(appWithSession())
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    expect(res.status).toBe(201);
    expect(res.body.client_id).toBeDefined();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-backend TEST="oauth as router"`
Expected: FAIL — 404, the router is not mounted yet.

- [ ] **Step 3: Implement `oauth/router.ts`**

```ts
/**
 * The OAuth authorization-server surface for /mcp.
 *
 * Builds the SDK's mcpAuthRouter (metadata + DCR + authorize + token, PKCE-S256
 * enforced) from OrchaOAuthProvider and config.apiUri, and adds the backend
 * consent routes the provider defers to: GET /oauth/consent renders the page once
 * the user is logged in (else hands off to the SPA login with a returnTo), POST
 * /oauth/consent/decision mints a code on approve and redirects to the client.
 *
 * MUST be mounted at the app root, BEHIND the session middleware (authorize +
 * consent read req.session). Exports a single Router.
 */
import { Router, urlencoded } from "express";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { config } from "../../config";
import {
  orchaOAuthProvider,
  pendingRequests,
  describePending,
} from "./provider";
import { renderConsent } from "./consent";
import { mintCode } from "./codes";
import { getTestSession } from "../../utils/testing"; // type-only usage avoided; see note
import prisma from "../../prisma";

const ISSUER = new URL(config.apiUri);
const RESOURCE = new URL(`${config.apiUri}${config.apiPathPrefix}/mcp`);

export const oauthRouter = Router();

// SDK-owned endpoints: /.well-known/*, /authorize, /token, /register.
oauthRouter.use(
  mcpAuthRouter({
    provider: orchaOAuthProvider,
    issuerUrl: ISSUER,
    resourceServerUrl: RESOURCE,
    scopesSupported: ["mcp"],
  }),
);

// GET /oauth/consent — the provider redirected here after recording the request.
oauthRouter.get("/oauth/consent", async (req, res) => {
  const requestToken = String(req.query.request ?? "");
  const described = await describePending(requestToken);
  if (!described) {
    res.status(400).send("Authorization request expired or unknown.");
    return;
  }

  // Session gate: if not signed in, hand off to the SPA login and come back.
  const roleId = (req.session as any)?.roleId;
  const organizationId = (req.session as any)?.organizationId;
  if (!roleId || !organizationId) {
    const returnTo = encodeURIComponent(
      `${config.apiUri}/oauth/consent?request=${requestToken}`,
    );
    res.redirect(`${config.webAppUri}/login?returnTo=${returnTo}`);
    return;
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: { organization: true },
  });
  res.set("Content-Type", "text/html").send(
    renderConsent({
      clientName: described.clientName,
      organizationName: role?.organization?.name ?? "your organization",
      roleName: role?.name ?? "your role",
      requestToken,
      decisionPath: "/oauth/consent/decision",
    }),
  );
});

// POST /oauth/consent/decision — approve mints a code and redirects to the client.
oauthRouter.post(
  "/oauth/consent/decision",
  urlencoded({ extended: false }),
  async (req, res) => {
    const requestToken = String(req.body.request ?? "");
    const pending = pendingRequests.get(requestToken);
    const roleId = (req.session as any)?.roleId;
    const organizationId = (req.session as any)?.organizationId;
    if (!pending || !roleId || !organizationId) {
      res.status(400).send("Authorization request expired or unknown.");
      return;
    }
    pendingRequests.delete(requestToken);

    const redirect = new URL(pending.redirectUri);
    if (pending.state) redirect.searchParams.set("state", pending.state);

    if (req.body.decision !== "approve") {
      redirect.searchParams.set("error", "access_denied");
      res.redirect(redirect.toString());
      return;
    }

    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: pending.clientId },
    });
    if (!client) {
      res.status(400).send("Unknown client.");
      return;
    }

    const code = await mintCode({
      clientPk: client.id,
      roleId,
      organizationId,
      scope: pending.scope,
      codeChallenge: pending.codeChallenge,
      redirectUri: pending.redirectUri,
    });
    redirect.searchParams.set("code", code);
    res.redirect(redirect.toString());
  },
);
```

> Remove the `getTestSession` import line — it slipped in from a copy; `router.ts` must not import test utilities. Keep only the imports actually used.

- [ ] **Step 4: Mount it in `app.ts`**

In `createExpressApp`, after the `for (const middleware of middlewares) { app.use(middleware); }` loop and **before** the catch-all `app.use(config.apiPathPrefix || "/", router);`, add:

```ts
import { oauthRouter } from "./mcp/oauth/router";
// …
  // OAuth authorization server for /mcp. Mounted at root, behind the session
  // middleware above, because /authorize + consent must read the login cookie.
  app.use(oauthRouter);
```

- [ ] **Step 5: Run tests**

Run: `make test-backend TEST="oauth as router"`
Expected: PASS (2 passing).

- [ ] **Step 6: Commit**

```bash
git add backend/src/mcp/oauth/router.ts backend/src/app.ts backend/src/mcp/oauth/__tests__/asRouter.spec.ts
git commit -m "feat(oauth): mount AS router + backend consent routes behind sessions (#77)"
```

---

## Task 10: Frontend `returnTo` handoff with open-redirect guard

**Files:**
- Create: `frontend/src/pages/auth/Login/resolveReturnTo.ts`
- Create: `frontend/src/pages/auth/Login/resolveReturnTo.test.ts`
- Modify: `frontend/src/pages/auth/Login/Login.tsx`

The guard is a pure function so it is unit-testable without rendering. It returns a safe absolute URL to navigate to, or `null`.

- [ ] **Step 1: Write failing `resolveReturnTo.test.ts`**

```ts
import { resolveReturnTo } from "./resolveReturnTo";

const API = "https://api.orcha.test";

describe("resolveReturnTo", () => {
  it("accepts an /oauth/consent URL on the API origin", () => {
    const url = `${API}/oauth/consent?request=abc`;
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBe(url);
  });

  it("rejects a different origin (open-redirect guard)", () => {
    const url = "https://evil.test/oauth/consent";
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBeNull();
  });

  it("rejects a non-consent path on the API origin", () => {
    const url = `${API}/somewhere-else`;
    expect(resolveReturnTo(`?returnTo=${encodeURIComponent(url)}`, API)).toBeNull();
  });

  it("returns null when absent", () => {
    expect(resolveReturnTo("", API)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `make test-frontend TEST="resolveReturnTo"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `resolveReturnTo.ts`**

```ts
/**
 * Open-redirect guard for the OAuth login handoff.
 *
 * After login, the user may need to bounce back to the backend's /authorize
 * consent (a DIFFERENT origin from this SPA), so we must do a full-page navigation
 * to an absolute URL — which makes validating it essential. Only an absolute URL on
 * the configured API origin whose path is the consent endpoint is allowed; anything
 * else returns null and the normal in-app redirect is used.
 *
 * Exports: resolveReturnTo(search, apiOrigin) -> safe absolute URL | null.
 */
export function resolveReturnTo(
  search: string,
  apiOrigin: string,
): string | null {
  const raw = new URLSearchParams(search).get("returnTo");
  if (!raw) return null;
  let candidate: URL;
  let api: URL;
  try {
    candidate = new URL(raw);
    api = new URL(apiOrigin);
  } catch {
    return null;
  }
  if (candidate.origin !== api.origin) return null;
  if (candidate.pathname !== "/oauth/consent") return null;
  return candidate.toString();
}
```

- [ ] **Step 4: Run the guard test**

Run: `make test-frontend TEST="resolveReturnTo"`
Expected: PASS (4 passing).

- [ ] **Step 5: Wire it into `Login.tsx`**

At the top of the `Login` component, derive the safe target (use the app's existing API-origin constant — search for where the GraphQL endpoint base URL is defined, e.g. `process.env.REACT_APP_API_URI` / a config module; reuse it rather than hardcoding):

```tsx
import { resolveReturnTo } from "./resolveReturnTo";
// …
const apiOrigin = /* the app's configured API origin, e.g. */ process.env.REACT_APP_API_URI ?? "";
const oauthReturnTo = resolveReturnTo(document.location.search, apiOrigin);
```

In the `onCompleted` callback, before the existing `fromLocation` branch, add a full-page navigation when a valid `returnTo` is present:

```tsx
        callback: (data) => {
          const me = data.login;
          dispatch({ type: "LOGIN_SUCCESS", payload: me });
          if (oauthReturnTo) {
            // External (backend) origin → must be a real navigation, not a router push.
            window.location.assign(oauthReturnTo);
            return;
          }
          if (fromLocation) {
            history.replace(fromLocation);
          } else if (me.status === AuthStatus.User) {
            history.push(urlResolver.auth.chooseOrganization());
          } else if (me.status === AuthStatus.Linked) {
            if (me.organization?.id) {
              history.push(
                urlResolver.dashboard.home(me.organization.id.toString()),
              );
            } else {
              history.push(urlResolver.auth.chooseOrganization());
            }
          }
        },
```

- [ ] **Step 6: Typecheck the frontend**

Run: `make types` (or `yarn --cwd frontend tsc --noEmit`)
Expected: no type errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/auth/Login/resolveReturnTo.ts frontend/src/pages/auth/Login/resolveReturnTo.test.ts frontend/src/pages/auth/Login/Login.tsx
git commit -m "feat(oauth): login returnTo handoff with open-redirect guard (#77)"
```

---

## Task 11: End-to-end — issued token drives a tool over `/mcp`

**Files:**
- Create: `backend/src/mcp/oauth/__tests__/connect.e2e.spec.ts`

This is the demoable slice: discover → register → (mint a code as a successful consent would) → exchange at `/token` with the PKCE verifier → call `whoami` over `/mcp` with the issued access token. The browser consent step is exercised by Task 7/9; here we mint the code directly so the test is deterministic and needs no seeded browser session.

- [ ] **Step 1: Write the failing e2e spec**

```ts
/**
 * The first working connect, end to end: a client registers via DCR, an
 * authorization code (as a successful consent would produce) is exchanged at
 * /token with the matching PKCE verifier for an Orcha access token, and that
 * token authenticates a real whoami tool call over /mcp — proving the AS-issued
 * token grants the same tenant-scoped authority a PAT does.
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

describe("oauth connect e2e", () => {
  it("DCR → token → whoami over /mcp", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);

    // 1. Dynamic client registration.
    const reg = await request(app)
      .post("/register")
      .send({ redirect_uris: ["http://localhost:7777/cb"] });
    expect(reg.status).toBe(201);
    const clientId: string = reg.body.client_id;

    // 2. A code as a successful consent would mint (PKCE-bound to VERIFIER).
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

    // 3. Exchange the code at /token with the PKCE verifier.
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: VERIFIER,
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(200);
    const accessToken: string = tok.body.access_token;
    expect(accessToken.startsWith("orcha_oat_")).toBe(true);

    // 4. Call whoami over /mcp with the issued access token.
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;
    const mcpUrl = new URL(`http://127.0.0.1:${port}/mcp`);
    try {
      const { client } = await connect(mcpUrl, accessToken);
      const result = await client.callTool({ name: "whoami", arguments: {} });
      const who = parse(result);
      expect(who.organizationId).toBe(organization.id);
    } finally {
      server.close();
    }
  });

  it("rejects /token with a wrong PKCE verifier", async () => {
    const app = createExpressApp([
      session({ secret: "test", resave: false, saveUninitialized: false }),
    ]);
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
    const tok = await request(app).post("/token").type("form").send({
      grant_type: "authorization_code",
      code,
      code_verifier: "the-wrong-verifier",
      client_id: clientId,
      redirect_uri: "http://localhost:7777/cb",
    });
    expect(tok.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run it**

Run: `make test-backend TEST="oauth connect e2e"`
Expected: PASS (2 passing). If the `whoami` field name differs, open `backend/src/mcp/tools/identity.ts` and assert against the actual shape it returns (it builds from `req.mcpRole`).

- [ ] **Step 3: Full backend suite — no regressions**

Run: `make test-backend`
Expected: all green, including the pre-existing PAT `/mcp` and REST suites.

- [ ] **Step 4: Commit**

```bash
git add backend/src/mcp/oauth/__tests__/connect.e2e.spec.ts
git commit -m "test(oauth): e2e DCR → token → whoami over /mcp (#77)"
```

---

## Task 12: Wire-up sanity + config doc

**Files:**
- Modify: `backend/.env.test` / `.env.example` (ensure `ORCHA_API_URI` is set for tests)
- Modify: `docs/` MCP setup notes only if a quick pointer is warranted (full docs are #82)

- [ ] **Step 1: Confirm `ORCHA_API_URI` is present in the test env**

`config.apiUri` hard-fails if unset. Check `backend/.env.test` includes a value (e.g. `ORCHA_API_URI=http://127.0.0.1:4000`). If missing, add it.

Run: `make test-backend TEST="oauth"`
Expected: the whole `oauth*` set passes with the env present.

- [ ] **Step 2: Manual smoke (optional, with the dev stack running)**

With the app running, confirm discovery is reachable:
```bash
curl -s "$ORCHA_API_URI/.well-known/oauth-authorization-server" | head
curl -s -i "$ORCHA_API_URI/mcp" | grep -i www-authenticate
```
Expected: metadata JSON; a `WWW-Authenticate: Bearer resource_metadata="…"` header.

- [ ] **Step 3: Commit any env/doc changes**

```bash
git add backend/.env.test backend/.env.example
git commit -m "chore(oauth): ensure ORCHA_API_URI is set for the AS issuer (#77)"
```

---

## Final verification

- [ ] `make test-backend` — full suite green (PAT + OAuth + REST + GraphQL).
- [ ] `make test-frontend TEST="resolveReturnTo"` — guard green; `make types` clean.
- [ ] Re-read the spec §"Out of scope" and confirm nothing from #78–#82 leaked in (no refresh token, no scope picker, no React consent UI, no revocation UI).
- [ ] Open a PR against `main` referencing #77 and #76.

---

## Plan self-review notes (for the executor)

- **Spec coverage:** discovery (Task 8 + 9), DCR (Task 5 + 9), PKCE authorize (Task 4 + 7 + 9), token (Task 7 + 11), resolveRole bridge (Task 2 + 3), backend consent (Task 6 + 9), login handoff (Task 10), data model (Task 1). All spec sections map to a task.
- **Known seam to verify at runtime, not from memory:** the exact field name `whoami` returns (Task 11 Step 2) and the SDK's `/token` 400 error code on PKCE mismatch — assert against observed behavior, adjust the assertion if the shape differs. Do not change production code to fit a guessed shape.
- **In-process `pendingRequests`** (Task 7) is single-instance-only by design for this slice; a multi-instance deployment needs it in Redis — out of scope here, noted in the file header so #78+ picks it up.
- **`router.ts` import hygiene:** Task 9 Step 3 flags a stray `getTestSession` import to delete — production code must never import from `utils/testing`.
