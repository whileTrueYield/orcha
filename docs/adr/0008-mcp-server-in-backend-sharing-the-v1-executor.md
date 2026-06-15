# MCP server: in the backend, sharing the /v1 executor, PAT-authed via the resolveRole seam

Phase 2 of the external-API plan (ADR 0006) is an MCP server that lets a coding
agent drive an Orcha workspace. It ships as a **`/mcp` route inside the existing
backend**, a peer of `/v1` — not a separate process, repo, or Digital Ocean
component, and not a local stdio server. A remote agent connects over **stateless
Streamable HTTP** with a Personal Access Token and calls a curated set of tools.

Both `/mcp` and `/v1` are thin shells over the **same factored executor**: each
authenticates a PAT into an `AuthRoleContext`, runs the agent's calls through the
shared `runOperation` core against the Pothos schema, and shapes the result.
Only the shaping differs — MCP returns LLM-friendly flat JSON, `/v1` returns the
REST envelope — and `operations.ts` is the single wire contract both execute, so
the two faces cannot drift in what they accept. PAT bearer auth flows through one
`resolveRole` seam; OAuth 2.1 (Orcha as its own authorization server) is deferred
to PRD B and swaps in **at that seam**, touching no tool and no resolver.

## Why

- **The tools _are_ the resolvers.** Every tool runs an existing GraphQL
  operation in-process — the same resolvers, permission checks, and
  `organizationId` tenant middleware the session and `/v1` paths use. Putting the
  MCP server anywhere other than the backend would mean reimplementing that logic
  or calling back into it over the network for no gain.
- **Share the executor, don't loop back to `/v1`.** `runOperation` was factored
  out of the REST layer precisely so a second face could reuse it. Both surfaces
  call it directly; output shaping is the only thing each owns.
- **Stateless suits a PAT-authed, request/response tool call.** The Streamable
  HTTP transport in stateless mode keeps no session — a fresh `McpServer` +
  transport per request (the SDK's documented stateless pattern) avoids JSON-RPC
  request-id collisions between concurrent clients, and a long-lived secret needs
  no session cookie.
- **One swap point for auth.** A Role already resolves identity _and_ tenant in a
  single foreign key (ADR 0006), and `resolveRole` is the one function that turns
  a bearer into the role the tools run as. OAuth 2.1 changes only how that bearer
  is validated, behind the seam.
- **Read-only refusal and rate limiting come from `/v1` unchanged.** The same
  per-token `tokenRateLimiter` fronts `/mcp`; read-only is enforced in the shared
  write path (`writeAs`) before any mutation runs.

## Considered options

- **A separate MCP process / repo / DO App Platform component.** Reimplements the
  resolvers or RPCs back to them, and adds a second deploy artifact, auth path,
  and per-component cost (ADR 0003) for zero capability gain. Rejected — the tools
  belong where the resolvers run.
- **stdio transport (a local MCP server).** Forces a local subprocess holding
  local credentials — wrong for a hosted, multi-tenant SaaS where the agent is
  remote and auth is a Role-scoped PAT. Streamable HTTP reaches the same hosted
  backend every other client already does. Rejected.
- **Loopback to `/v1` (MCP tools call the REST API over HTTP).** A network hop,
  a re-serialization, and a second authentication for an in-process capability —
  and it couples MCP's output to the REST envelope. Sharing `runOperation` gives
  both faces the same resolvers with independent shaping. Rejected.
- **Full OAuth 2.1, or a managed IdP, now.** Overkill for the agent core loop:
  PATs already carry identity + tenant, and Claude Code attaches a bearer to a
  remote MCP server today. Deferred to PRD B — where a **managed IdP** (Auth0 et
  al.) is itself rejected in favor of Orcha as its own authorization server
  (library-backed, reusing the existing login/session for consent) so identity
  stays first-party. `resolveRole` is the swap point either way.

## Consequences

- One backend exposes two public faces (`/v1` REST, `/mcp`) over one executor;
  `operations.ts` is the single wire contract both share, so a change to what a
  ticket write accepts lands in one place for both.
- The MCP surface is a **curated subset of the agent core loop**, not a 1:1
  GraphQL mirror: nine read tools (`whoami`, `next_tickets`, `list_tickets`,
  `get_ticket`, `get_ticket_body`, `list_projects`, `get_project`,
  `get_project_body`, `get_schedule`) and five write tools (`create_ticket`,
  `update_ticket`, `transition_ticket`, `update_ticket_body`,
  `update_project_body`).
- OAuth 2.1 is a contained future change: it lands behind `resolveRole` and adds
  an authorization-server surface, without touching a tool or a resolver. (Now
  realized — see ADR 0009 for the OAuth model that swapped in at this seam.)
- Per-token rate limiting and read-only-PAT refusal are inherited from the `/v1`
  plumbing, not rebuilt.
