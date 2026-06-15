# OAuth end-to-end connect — design (#77)

> Parent PRD: #76 — Orcha MCP Server: OAuth 2.1 authorization layer (Orcha as its own AS).
> This is the first, irreducible vertical slice: a real OAuth client completes a full
> connect to `/mcp` and calls a tool, authenticated by an Orcha-issued access token.

## Goal

Deliver the minimal end-to-end OAuth path so a client with **no pre-shared secret** can:
discover the flow → register itself → log the user in through Orcha → get a minimal
consent → receive a short-lived, audience-bound **opaque access token** → call an MCP
tool scoped to the granted Role. The PAT path established in #69/#70 stays byte-for-byte
unchanged.

Out of scope for this slice (later slices, do **not** build here):
- Refresh tokens / rotation → #78
- Read/write scope selection + enforcement → #79
- Polished React consent UI + Role/scope picker → #80
- Connected-clients listing + revocation UI → #81
- ADR + consumer-client docs → #82

A single default scope (read+write, `readOnly: false`) is acceptable here. Bare
approve/deny consent is acceptable here.

## Verification gate (resolved)

The pinned `@modelcontextprotocol/sdk@1.29.0` ships the **full authorization-server
surface**, so the `@node-oauth/oauth2-server` fallback named in the issue is **not**
needed:

- `mcpAuthRouter({ provider, issuerUrl, resourceServerUrl, scopesSupported })` mounts the
  whole protocol at the app root: `.well-known/oauth-authorization-server`,
  `.well-known/oauth-protected-resource`, `/authorize`, `/token`, `/register` (DCR),
  `/revoke` — with rate-limiting and PKCE-S256 enforcement built in.
- We implement **one interface**, `OAuthServerProvider`, plus its
  `OAuthRegisteredClientsStore`. That is the "thin provider bridge" the issue describes.

`mcpAuthRouter` MUST be installed at the application root (its own contract), and — unlike
`/mcp` — **behind** the session middleware, because `/authorize` needs the login cookie.

## Architecture — two routers, two trust postures

| Surface | Auth | Session cookie | Statefulness | Change |
| --- | --- | --- | --- | --- |
| `${apiPathPrefix}/mcp` | Bearer only | none (mounted ahead of `sessionParser`) | stateless | unchanged except 401 header (below) |
| AS endpoints (root) | browser session for `/authorize`; none for metadata/token/register | yes (mounted behind `sessionParser`) | stores codes/tokens in Postgres | new |

Why the split matters: `/mcp` deliberately never acquires a session cookie (a bearer is a
self-contained credential). `/authorize` is the opposite — a top-level browser navigation
that must read the httpOnly `sessionId` cookie to know who the user is. The cookie *is*
delivered to the backend on that navigation: `sameSite: "lax"` (dev) sends it on top-level
GETs; `sameSite: "none"` + `secure` (prod) sends it cross-site unconditionally. Because the
cookie is httpOnly, the **backend is the only party that can read login status** — which is
exactly why the consent surface is backend-rendered (see Decision C).

### Public URL config

`issuerUrl` / `resourceServerUrl` require the backend's absolute public URL.
**Reuse the existing `config.apiUri`** (`ORCHA_API_URI`, already guarded with a hard-fail
in `config.ts`). No new env var.

- `issuerUrl = new URL(config.apiUri)`
- `resourceServerUrl = new URL(\`${config.apiUri}${config.apiPathPrefix}/mcp\`)`

## Decision A — token validation routing: keep our seam

`resolveRole` (`backend/src/mcp/resolveRole.ts`) was built as the documented swap point:
"the one seam OAuth will later swap." We honor that rather than adopting the SDK's
`requireBearerAuth` middleware on `/mcp`.

- `/mcp` keeps `mcpBearerAuth` → `resolveRole`.
- `resolveRole` branches by **token prefix**:
  - `orcha_pat_*` → existing `verifyAndResolve` (untouched)
  - `orcha_oat_*` → new OAuth access-token resolver
  - Both return the identical `{ role, readOnly, tokenId }` shape; MCP tools are oblivious.
- The provider's required `verifyAccessToken()` is a **thin adapter over the same OAuth
  resolver** (returns the SDK's `AuthInfo`), so the AS router is satisfied without rewiring
  `/mcp`.
- One small change to `mcpBearerAuth`'s 401: enrich `WWW-Authenticate` from bare `Bearer`
  to `Bearer resource_metadata="<protected-resource-metadata-url>"` so a consumer client
  can discover the AS (issue step 2). Use the SDK's
  `getOAuthProtectedResourceMetadataUrl(resourceServerUrl)` to build the URL.

Rejected alternative: route `/mcp` through `requireBearerAuth(provider)`. That would force
the PAT path through the provider too, rewiring shipped+tested code for no benefit.

## Decision B — data model: three new Prisma models, PAT untouched

OAuth access tokens have a different lifecycle than a PAT (short-lived, client-bound,
PKCE-derived, soon refreshable), so they get dedicated models rather than overloading
`PersonalAccessToken`. All secrets are SHA-256 hashed at rest; plaintext is never stored.

```prisma
model OAuthClient {
  id               Int      @id @default(autoincrement())
  clientId         String   @unique @db.VarChar      // public, library-generated
  name             String?  @db.VarChar              // client_name from DCR, if any
  redirectUris     String[]                          // registered redirect_uris
  clientIdIssuedAt DateTime @default(now()) @db.Timestamptz(6)
  createdAt        DateTime @default(now()) @db.Timestamptz(6)
  updatedAt        DateTime @updatedAt @db.Timestamptz(6)
  // Public PKCE clients — no client secret stored.
  authorizationCodes OAuthAuthorizationCode[]
  accessTokens       OAuthAccessToken[]
  @@map("oauth_client")
}

model OAuthAuthorizationCode {
  id             Int      @id @default(autoincrement())
  codeHash       String   @unique @db.VarChar          // SHA-256 of the single-use code
  codeChallenge  String   @db.VarChar                  // PKCE S256 challenge
  redirectUri    String   @db.VarChar
  scope          String   @db.VarChar                  // single default scope this slice
  expiresAt      DateTime @db.Timestamptz(6)           // ~60s TTL
  consumedAt     DateTime? @db.Timestamptz(6)          // single-use marker
  createdAt      DateTime @default(now()) @db.Timestamptz(6)
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
  id             Int      @id @default(autoincrement())
  tokenHash      String   @unique @db.VarChar          // SHA-256, mirrors PAT
  scope          String   @db.VarChar
  readOnly       Boolean  @default(false)              // single default scope ⇒ false this slice
  expiresAt      DateTime @db.Timestamptz(6)           // short, ~1h
  revokedAt      DateTime? @db.Timestamptz(6)
  lastUsedAt     DateTime? @db.Timestamptz(6)
  createdAt      DateTime @default(now()) @db.Timestamptz(6)
  updatedAt      DateTime @updatedAt @db.Timestamptz(6)
  clientId       Int
  client         OAuthClient  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  roleId         Int
  role           Role         @relation(fields: [roleId], references: [id], onDelete: Cascade)
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@index([tokenHash])
  @@index([roleId])
  @@map("oauth_access_token")
}
```

`Role` and `Organization` gain the inverse relations. The OAuth-token resolver mirrors
`verifyAndResolve`: look up `OAuthAccessToken` by hash, reject on missing / expired /
revoked with the same opaque `InvalidTokenError`, return `{ tokenId, role, readOnly }`.

No refresh-token model in this slice (#78).

## Decision C — consent surface: backend-rendered (approved)

`/authorize` runs `provider.authorize(client, params, res)`:

1. Read `req.session`. If not an authenticated user with an active Role → `302` to the
   **frontend** login: `${config.webAppUri}/login?returnTo=<absolute /authorize URL>`.
2. If authenticated → render a **minimal server-rendered HTML** consent page naming the
   client, organization, and Role, with `Approve` / `Deny` buttons that POST **same-origin**
   to a backend decision endpoint. (Same-origin POST avoids the dev `sameSite: "lax"`
   cookie-drop a cross-site frontend POST would hit.)
3. On `Approve` → mint a single-use, ~60s authorization code bound to
   user/Role/client/scope/redirectUri/PKCE-S256 challenge; `302` to `redirectUri?code&state`.
4. On `Deny` → `302` to `redirectUri?error=access_denied&state`.

### Frontend change (the one non-backend touch)

`frontend/src/pages/auth/Login/Login.tsx` today redirects post-login *in-app* via
react-router (`history.replace(location.state.from)`). That cannot reach `/authorize`,
which lives on the **backend origin**. Change:

- Read a `returnTo` **query param** (the page already reads `email` from the query).
- **Validate** `returnTo` is an absolute URL whose origin === `config`/build-time API origin
  and whose path is the `/authorize` endpoint (open-redirect guard — reject anything else).
- On successful login, if a valid `returnTo` is present, do a real
  `window.location.assign(returnTo)` (full-page navigation) instead of the router push.

Scope: one file, ~20–30 lines, including the open-redirect guard.

## The connect flow (the tracer bullet)

```
Client → GET  /mcp (no token)        → 401 + WWW-Authenticate: Bearer resource_metadata="…"
Client → GET  /.well-known/*         → AS metadata + protected-resource metadata    [SDK]
Client → POST /register              → { client_id }                  [SDK → our clientsStore]
Client → GET  /authorize (browser)   → provider.authorize():
            session? ──no──→ 302 ${webAppUri}/login?returnTo=<authorize URL>
            session? ──yes─→ render minimal HTML consent (org · Role · "read+write")
         POST decision (same-origin)  → approve: mint PKCE-bound code → 302 redirectUri?code&state
                                        deny:    302 redirectUri?error=access_denied&state
Client → POST /token (code+verifier) → provider.exchangeAuthorizationCode():
            verify S256 vs stored challenge, consume code (single-use)
            → opaque orcha_oat_… (SHA-256 at rest, ~1h TTL, bound to Role+scope)
Client → POST /mcp (Bearer orcha_oat_…) → mcpBearerAuth → resolveRole → tool runs tenant-scoped
```

`exchangeRefreshToken()` and `revokeToken()` throw a clear "unsupported in this slice"
error (wired in #78 / #81).

## Components / file plan

Backend (`backend/src/mcp/oauth/` new module):
- `provider.ts` — `OrchaOAuthProvider implements OAuthServerProvider` (+ `clientsStore`).
- `clientStore.ts` — `OAuthRegisteredClientsStore` over `OAuthClient` (DCR).
- `codes.ts` — mint/verify/consume authorization codes (hash, TTL, single-use, PKCE-S256).
- `accessTokens.ts` — mint (`orcha_oat_` + 32 random bytes, hashed) / resolve OAuth access
  tokens; the resolver `resolveRole` calls for the OAuth branch.
- `consent.ts` — render the minimal HTML consent page + handle the decision POST.
- `router.ts` — build `mcpAuthRouter(...)` with `issuerUrl`/`resourceServerUrl` from
  `config.apiUri`; mounted at app root behind `sessionParser` (in `server.ts`).

Touched:
- `backend/src/mcp/resolveRole.ts` — prefix branch (`orcha_pat_` vs `orcha_oat_`).
- `backend/src/mcp/bearerAuth.ts` — enrich the 401 `WWW-Authenticate` header.
- `backend/src/server.ts` — mount `mcpAuthRouter` at root, behind sessions.
- `backend/prisma/schema.prisma` — three models + inverse relations; migration.
- `frontend/src/pages/auth/Login/Login.tsx` — `returnTo` query param + guarded full-page nav.

## Error handling

- Token/code failures collapse to one opaque `InvalidTokenError` → 401 (no UNKNOWN /
  EXPIRED / REVOKED distinction), matching the PAT path so a probe learns nothing.
- `/authorize` with no session is a redirect to login, not an error.
- `provider.authorize` always ends in a redirect to `redirectUri` (success `code` or
  `error`) per OAuth 2.1, except when the client/redirect_uri itself is invalid (the SDK's
  authorize handler rejects before calling us).
- Crash-early on genuinely unexpected state (e.g. a stored code whose client row vanished);
  do not silently recover.

## Testing (TDD, via `make` targets — never raw jest)

- **`resolveRole.spec.ts`** (extend): valid `orcha_oat_` resolves to the bound Role;
  expired / revoked / unknown → `InvalidTokenError`; existing PAT cases stay green.
- **Provider unit specs**: DCR issues a `client_id`; `authorize` stores a PKCE-bound,
  single-use code; `exchangeAuthorizationCode` rejects wrong verifier / already-consumed /
  expired code and issues a hashed token bound to Role+scope; `exchangeRefreshToken` and
  `revokeToken` throw "unsupported".
- **End-to-end** (reuse the `mcpClient` harness in `backend/src/mcp/__tests__`): drive the
  full discovery → DCR → authorize(approve, with a seeded session) → token → `whoami` over
  `/mcp` using the issued access token. This is the demoable slice.
- Reuse fixtures in `backend/src/utils/testing.ts`; add new helpers there, don't hand-roll.

## Assumptions / open verification at build time

- Confirm the SDK's `authorize` handler passes `codeChallenge` (S256) and `redirectUri`
  through `AuthorizationParams` as the `provider.d.ts` shape indicates, and that
  `mcpAuthRouter` serves both well-known documents at the **domain root** (not under
  `apiPathPrefix`). Verify against the installed types, not memory, when wiring.
- Confirm seeding a logged-in `express-session` inside the e2e test harness is feasible;
  if not, drive `/authorize`'s consent step via a directly-seeded session row in Redis.
