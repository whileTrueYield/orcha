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
