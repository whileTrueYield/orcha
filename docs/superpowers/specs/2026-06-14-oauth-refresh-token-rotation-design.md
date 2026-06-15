# OAuth refresh-token rotation (#78)

**Status:** Approved, ready for implementation plan
**Parent:** #76 — Orcha MCP Server OAuth 2.1 authorization layer
**Builds on:** #77 — OAuth end-to-end connect

## Problem

After #77, a connected MCP client receives a short-lived (~1h) opaque access token
and nothing else. When that token expires the client is dead in the water — it must
re-run the full browser consent flow to keep working. Refresh tokens close that gap:
a long-lived, rotating credential the client exchanges for fresh access tokens without
re-prompting the user.

The SDK's authorization-server metadata has advertised
`grant_types_supported: ['authorization_code', 'refresh_token']` since #77, but the
`exchangeRefreshToken` provider hook throws `"not supported yet (#78)"`. This work makes
that advertisement honest.

## Goals

- The token endpoint issues a **refresh token** alongside every access token, hashed at
  rest, bound to the same Role + scope + client + readOnly.
- A `refresh_token` grant issues a fresh access token **and a rotated refresh token**,
  invalidating the prior refresh token.
- A reused (already-rotated) refresh token is **rejected and triggers family revocation**:
  every live refresh and access token sharing its rotation family is revoked. This is the
  OAuth 2.1 BCP reuse-detection behavior — a stolen, already-rotated token gets the whole
  chain burned, locking out attacker and legitimate client alike until re-consent.

## Non-goals

- Scope narrowing on refresh. With a single `mcp` scope this slice, the requested-scope
  subset the SDK forwards is ignored; the granted scope is reissued unchanged. Left as a
  documented seam for when scopes diversify.
- An absolute family lifetime cap. The refresh TTL is a sliding 30-day window with no
  hard ceiling — a client used at least monthly never re-prompts.
- Revocation endpoints / token introspection (those land in later slices, #81).
- Multi-instance state (the pending-authorize Map caveat from #77 is unrelated here;
  refresh state is fully DB-backed).

## Architecture

A new **`backend/src/mcp/oauth/refreshTokens.ts`** module sits beside `codes.ts` and
`accessTokens.ts`, following the same per-concern store pattern: it owns refresh-token
generation, the hashed-at-rest store, the atomic rotation, and family revocation. The
`provider.ts` hooks (`exchangeAuthorizationCode`, `exchangeRefreshToken`) orchestrate;
they hold no storage logic.

### Module surface (`refreshTokens.ts`)

- `generateRefreshToken(): string` — a fresh `orcha_ort_…` plaintext (32 random bytes).
- `isOAuthRefreshToken(plaintext): boolean` — prefix guard (parallel to the access-token
  module; used only if a dispatch seam ever needs it).
- `mintRefreshToken(grant): Promise<string>` — persist a refresh token for a grant (with
  its `familyId`), return the one-time plaintext. Accepts an optional `expiresAt` test
  seam, mirroring `codes.ts`.
- `rotateRefreshToken(clientId, plaintext): Promise<RefreshGrant>` — the security core
  (see below). Throws `InvalidGrantError` on any rejection.
- `revokeFamily(familyId): Promise<void>` — set `revokedAt = now` on all live refresh and
  access tokens in the family.

## Data model

### New `OAuthRefreshToken`

Mirrors `OAuthAccessToken`'s hashed-at-rest + soft-revoke discipline.

| field | notes |
|---|---|
| `id` | autoincrement PK |
| `tokenHash` | `@unique`, SHA-256 of the `orcha_ort_` plaintext |
| `familyId` | UUID grouping one rotation chain (string) |
| `scope` | reissued to the rotated access token |
| `readOnly` | preserved across rotation |
| `expiresAt` | sliding 30 days from mint |
| `rotatedAt?` | set when this token is exchanged — the reuse sentinel |
| `revokedAt?` | set by family revocation on reuse |
| `createdAt` / `updatedAt` | timestamps |
| `clientId` / `roleId` / `organizationId` | FKs, `onDelete: Cascade` |

Indexes: `@@index([tokenHash])`, `@@index([familyId])`. Table map `oauth_refresh_token`.
Inverse relations added on `OAuthClient`, `Role`, `Organization`.

### `OAuthAccessToken` gains `familyId`

Needed so family revocation can reach live access tokens, not just refresh tokens.
`String`, non-null, `@@index([familyId])`. The migration backfills existing #77-era rows
with `gen_random_uuid()` before applying `NOT NULL` (those orphan families are harmless —
each row gets a unique id and expires within the hour regardless).

## Flow

### `exchangeAuthorizationCode` (now issues the pair)

```
grant     = consumeCode(client_id, code)        // unchanged, single-use
familyId  = randomUUID()
access    = mintAccessToken({ ...grant, familyId, readOnly: false })
refresh   = mintRefreshToken({ ...grant, familyId, readOnly: false })
return { access_token: access, refresh_token: refresh, token_type: "bearer",
         expires_in: 3600, scope: grant.scope }
```

`mintAccessToken`'s `AccessTokenGrant` gains a `familyId` field.

### `exchangeRefreshToken` (was a stub)

```
grant    = rotateRefreshToken(client.client_id, refreshToken)   // throws on reject
access   = mintAccessToken({ ...grant })        // same familyId
refresh  = mintRefreshToken({ ...grant })       // same familyId, fresh 30d
return { access_token: access, refresh_token: refresh, token_type: "bearer",
         expires_in: 3600, scope: grant.scope }
```

The SDK-forwarded `scopes?` argument is intentionally ignored this slice (see non-goals).

### `rotateRefreshToken` — ordered checks

All rejections throw `InvalidGrantError` (from
`@modelcontextprotocol/sdk/server/auth/errors.js`), which the token handler maps to
`400 invalid_grant`.

1. Unknown `tokenHash` → reject.
2. `client.clientId !== clientId` → reject (client mismatch).
3. `revokedAt` set → reject (family already burned).
4. **`rotatedAt` set → reuse detected** → `revokeFamily(familyId)`, then reject.
5. `expiresAt` in the past → reject (honest expiry; **no** family burn).
6. **Atomic rotate:** `updateMany({ id, rotatedAt: null }, { rotatedAt: now })`. If
   `count !== 1`, a concurrent exchange already spent it → treat as reuse →
   `revokeFamily(familyId)`, reject.
7. Return `{ clientPk, roleId, organizationId, scope, readOnly, familyId }`.

### `revokeFamily(familyId)`

Two `updateMany`s, each setting `revokedAt = now` where it is still null:
- all `OAuthRefreshToken` rows with this `familyId`,
- all `OAuthAccessToken` rows with this `familyId`.

`verifyAndResolveOAuth` already rejects access tokens with `revokedAt` set, so revoked
access tokens stop authenticating on `/mcp` immediately.

## Error handling

Reuse / expiry / unknown / client-mismatch all surface as `InvalidGrantError` →
`400 invalid_grant`. This replaces the stub's plain `Error` (which the handler mapped to
`500`). `codes.ts` still throws plain Errors; harmonizing those is out of scope here.

## Testing

Mirrors the existing spec style (`accessTokens.spec.ts`, `connect.e2e.spec.ts`), run via
the project's make targets (never raw jest — ESM race).

1. **`refreshTokens.spec.ts`** (unit):
   - Rotation issues a fresh access+refresh pair and marks the prior token `rotatedAt`.
   - The prior refresh token, reused, is rejected **and** the whole family is revoked:
     assert `revokedAt` is set on the original RT, the rotated RT, and every access token
     in the family.
   - An expired refresh token is rejected (via the `expiresAt?` mint seam), and a plain
     expiry does **not** revoke the family.
2. **`refresh.e2e.spec.ts`** (end-to-end, the AC's headline check):
   - DCR → mint code → `/token` now returns a `refresh_token`.
   - Force-expire the issued access token (update its `expiresAt` to the past, as the
     existing e2e manipulates rows directly) and confirm it now `401`s on `/mcp`.
   - `refresh_token` grant at `/token` returns a new access token.
   - The new access token calls `whoami` over `/mcp` successfully.
3. **Reuse over `/token`:** a second `refresh_token` grant with the spent token returns
   `400 invalid_grant`.

## Migration

A single migration: create `oauth_refresh_token`, add `family_id` to `oauth_access_token`
(backfill `gen_random_uuid()` → `SET NOT NULL`), and the new indexes. Generated through
the project's normal Prisma path; the exact command (make target vs
`yarn prisma migrate dev`) is confirmed with the user before running it against the dev DB,
since that touches their environment.

## Acceptance criteria (from #78)

- [x] Token endpoint issues a refresh token with the access token, hashed at rest, bound
  to the same Role/scope/client — *covered by the issue-pair flow + new model.*
- [x] `exchangeRefreshToken` issues a new access token and a rotated refresh token; the old
  refresh token is invalidated — *`rotateRefreshToken` step 6.*
- [x] A reused/old refresh token is rejected — *step 4, plus family revocation.*
- [x] Expired access token → refresh → working new access token, verified on `/mcp` —
  *`refresh.e2e.spec.ts`.*
- [x] Tests: rotation freshness + prior invalidation, reuse rejected, e2e expire→refresh→
  call-tool — *test plan above.*
- [x] `yarn typecheck` passes; migration included.
