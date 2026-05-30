# External API: thin REST over GraphQL, authed by Role-scoped tokens

To let coding agents (Claude Code, via a phase-2 MCP server) drive a developer's
Orcha workspace, we are adding a public, token-authenticated `/v1` REST API. The
API is a **thin translation layer**: each endpoint authenticates a Personal
Access Token, builds the same `AuthRoleContext` the session path builds, and
executes an existing GraphQL operation in-process against the Pothos schema.
Authentication is a **Role-scoped Personal Access Token** sent as a bearer
token. The MCP server is deferred to phase 2 and will expose a curated subset of
`/v1`, not a 1:1 mirror.

## Why

- **Business logic lives inside the GraphQL resolvers**, not in an extractable
  service layer. A REST API that reimplemented it, or that required extracting a
  service layer across all ~28 model directories first, would either duplicate
  logic (guaranteed drift) or balloon the scope. Executing GraphQL operations
  in-process reuses every resolver, permission check, and the `organizationId`
  tenant middleware unchanged.
- **A Role is already a (User + Organization) pair** (`@@unique([organizationId,
  userId])`) and owns all tenant-scoped data. Scoping a token to a Role resolves
  identity *and* tenant in one foreign key, so tenant isolation needs no new
  logic and there is no "active org" ambiguity.
- **Read-only is enforced at the REST routing layer**: a read-only token is
  refused on any mutation-backed route, with no per-resolver scope plumbing.

## Considered options

- **Token-authed GraphQL as the public surface (no REST).** Lowest entropy, but
  we want a conventional, versioned, documentable contract for third-party
  consumers, decoupled from internal schema churn.
- **Independent REST handlers talking to Prisma directly.** Reimplements
  orchestration per endpoint; drifts from GraphQL. Rejected.
- **Extract a service layer first, shared by GraphQL and REST.** Architecturally
  purest, but a large refactor before anything ships. Deferred — the in-process
  approach lets us extract incrementally later if needed.
- **Full OAuth 2.1 (MCP authorization spec).** Overkill for v1; Claude Code can
  attach a bearer token to a remote MCP server. Revisit if we outgrow PATs.
- **User-scoped tokens.** Reintroduces multi-org ambiguity and tempts token
  proliferation. Rejected in favor of Role-scoping.

## Consequences

- The public contract is stable and versioned (`/v1`), but internally coupled to
  the GraphQL schema; the per-endpoint operation mapping is the single place to
  absorb schema changes.
- The Personal Access Token becomes the seed of a general external-API auth
  story, reusable beyond the MCP.
- v1 surface is bounded to the agent core loop (~11 endpoints), headlined by
  `GET /v1/me/next-tickets` (the MCTS-prioritized work queue). Per-token rate
  limiting ships in v1.
