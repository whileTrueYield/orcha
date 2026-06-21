# Orcha

A project manager that builds team schedules with Monte Carlo Tree Search.
This glossary pins the canonical terms for the domain and for the external
access layer (public API + agent integration) so the same words mean the
same thing across code, docs, and conversation.

## Domain

**Organization**:
A tenant. The top of the ownership tree — every piece of work-related data
belongs to exactly one Organization.
_Avoid_: Account, workspace, company.

**User**:
A person's login identity (email + password). A User exists independently of
any Organization and may belong to several.
_Avoid_: Account, member.

**Role**:
A User's **membership in a single Organization**. It carries that person's
timezone, work-week, and status, and it owns all of their tenant-scoped work
(tickets authored/owned, schedule items, estimates…). A User has at most one
Role per Organization (`@@unique([organizationId, userId])`). When code needs
to know "who and which tenant," the Role answers both.
_Avoid_: Using "Role" to mean a permission level — that is **RoleType**.

**RoleType**:
The permission tier of a Role (e.g. `MEMBER`). Governs what actions a Role may
perform.
_Avoid_: Saying "role" unqualified when you mean the permission tier.

**Ticket**:
A unit of work to be scheduled. Carries an estimate, priority, workflow state,
and dependencies (`ancestors`/`successors`).
_Avoid_: Task, issue (an **Issue** is a support submission, not a Ticket).

**Logged work**:
A `ScheduleItem` — one real, elapsed work session (a Role's `startedAt`→
`stoppedAt`) against a single stage of a Ticket. It is the historical *fact*
that time was spent, and it is immutable: re-planning a Ticket never deletes or
rewrites it. The presence of **any** logged work is the line between a Ticket
that is still *a plan* and one that has become *a history* — the gate that
governs how its workflow may change (see **Supersede**).
_Avoid_: "estimate" (that is a forward projection, not work that happened);
"progress" (a derived roll-up).

**Plan** (per-stage):
A `TicketWorkflowState` — one row per workflow stage on a Ticket, holding that
stage's three-point estimate and progress. It is scoped to the stages of the
Ticket's *current* workflow, so it is disposable: changing the workflow
supersedes these rows. Distinct from **Logged work**, which outlives any plan.
_Avoid_: conflating the plan (a projection that resets) with logged work (a fact
that persists).

**Supersede**:
Closing a Ticket as the immutable record of the work done under *its* workflow,
and continuing the effort on a **new** Ticket under a different workflow. This is
the honest move when a Ticket's workflow must change *after* work has been logged
— rewriting the live Ticket's workflow in place would make it misrepresent what
actually happened. Supersession is its own link ("this became that"); it is
**not** a dependency.
_Avoid_: `ancestors`/`successors` — those are the **dependency** DAG (*what must
happen before what*), read by the scheduler for ordering. Supersession lineage
must never reuse them, or it injects phantom dependencies into scheduling.

**Next tickets**:
The prioritized list of Tickets a Role should work on *now*, ordered the way
the MCTS scheduler ranked them. The canonical answer to "what should I work on
next?" — and the headline thing the public API and MCP expose.
_Avoid_: Backlog, queue (those imply manual ordering; this is scheduler-derived).

## External access

**Personal Access Token** (PAT):
A long-lived credential **bound to a single Role**, used by non-browser clients
to act as that membership. Because it resolves to one Role, it carries both
identity and tenant scope, so tenant isolation needs no extra logic. A PAT may
be **read-only**.
_Avoid_: API key, secret key, access key.

**Orcha REST API** (or "the public API"):
The token-authenticated `/v1` HTTP surface that external clients consume. It is
a thin, versioned contract — internally it executes the same operations the
first-party GraphQL API does.
_Avoid_: "the API" unqualified — that is ambiguous with the internal GraphQL
API the frontend uses.

**Orcha MCP Server**:
The Model Context Protocol facade (phase 2) that exposes a **curated subset** of
the public API as agent-shaped tools, so a coding agent (e.g. Claude Code) can
drive a developer's Orcha workspace. Not a 1:1 mirror of every operation.
_Avoid_: "the MCP" when you mean the protocol in general.

**OAuth access token**:
A short-lived, client-bound credential Orcha issues to a connected app through
the OAuth flow, the alternative to a PAT for reaching `/mcp`. Like a PAT it
resolves to one Role, and it is opaque and hashed at rest (prefix `orcha_oat_`);
unlike a PAT it expires fast and is paired with a rotating refresh token.
_Avoid_: JWT, bearer token (unqualified) — it is neither signed nor stateless.

**Authorization server** (AS):
Orcha itself. It runs the OAuth discovery, client-registration, consent, and
token endpoints **first-party** — there is no external identity provider in the
path.
_Avoid_: IdP, identity provider — Orcha does not delegate to one.

**Scope**:
The access an OAuth grant carries: `read` or `read write`. It maps onto the same
capability a **read-only** PAT has — a `read` grant can use every read tool but
is refused on every write.
_Avoid_: Permission; "role" — scope is per-grant, not the RoleType tier.

**Connected app** (grant):
A client a User has authorized over OAuth — one consent binds one Role and one
scope. Listed and cut off from **Connected Apps** in the app; revoking one kills
its access **and** refresh tokens at once.
_Avoid_: Integration, plugin; "OAuth client" when you mean the user-visible
connection rather than the registered software.

## Version control

**Ticket ref**:
The canonical human key for a Ticket, `PRODUCT-localId` (e.g. `BUGS-1`) — the
product's `code` and the Ticket's per-product `localId` joined by a hyphen
(`formatTicketRef`). Unique **within an Organization**: product codes are
case-insensitive-unique per org, and `localId` is unique per product, so the
code is the part that disambiguates which product a bare number belongs to.
This is the string a developer types to point a code change at a Ticket.
_Avoid_: "ticket id" (that is the opaque DB `id`); "ticket number" unqualified
(that is just the `localId`, meaningless without the product code).

**Repository link**:
The record binding one GitHub repository (`owner/name`) to exactly **one**
Organization, enabling read-only mirroring of that repo's pull requests onto
Tickets. It lives at the **Organization** level, not the Product level: the
product code inside each **Ticket ref** already routes a reference to the right
product, so one repo can feed many products. One repo binds to a single
Organization (a public repo's refs must not resolve in two tenants at once).
A link is **pending** until a valid signed webhook delivery proves the creator
controls the repo (only a repo admin can install the webhook); **only an active,
verified link reserves the repo** globally. This makes binding-squatting
impossible — you cannot reserve a repo you cannot webhook.
_Avoid_: Connected app, integration, plugin — a **Connected app** is a *User's*
OAuth grant to call Orcha; a Repository link is the reverse direction (Orcha
receiving a repo's webhooks). Do not store its webhook secret in the OAuth token
tables — those are Orcha-as-authorization-server (inbound), this is outbound.

**Linked pull request**:
A GitHub pull request captured under a Ticket because its **head branch name or
title** contains that Ticket's **Ticket ref**. Read-only: Orcha mirrors the PR's
state (open/merged/closed) and never writes back. Surfaced in the Ticket's
**Changes** tab. One PR may link to several Tickets (it can carry several refs);
one Ticket may have several linked PRs.
_Avoid_: "commit" (v1 captures PRs, not loose commits); "Issue" (that is a
support submission, never a GitHub issue or a PR).

## Example dialogue

> **Dev:** Can the agent's token see every org I'm in?
> **Maintainer:** No. A Personal Access Token is bound to one Role, and a Role
> is your membership in one Organization. One token, one tenant.
> **Dev:** What if I want it to look but not touch?
> **Maintainer:** Mint a read-only PAT. The REST layer refuses it on any
> mutation route, so it physically can't write.
> **Dev:** And the MCP exposes all of `/v1`?
> **Maintainer:** Only the curated agent loop — read your tickets, read the
> schedule, create/update/transition a ticket. The rest of `/v1` exists for
> general API clients, not the agent.
> **Dev:** Claude Desktop won't let me paste a token. How does it connect?
> **Maintainer:** Over OAuth. Orcha is its own authorization server, so you add
> it as a custom connector, sign in, and approve a Role and a scope — read or
> read + write — on the consent screen. No token to paste.
> **Dev:** And if I want to cut it off later?
> **Maintainer:** Revoke it from Connected Apps. That kills its access and refresh
> tokens at once, so it's locked out immediately and has to be re-approved.
