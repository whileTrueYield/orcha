# MCP Product & Workflow Discovery — Design

**Date:** 2026-06-20
**Status:** Approved (brainstorming) — ready for implementation plan
**Scope:** `backend/src/mcp/`

## Problem

When an AI creates a ticket through the Orcha MCP server, it consistently omits
`productId` and `workflowId`. The cause is not that the AI chooses badly — it is
that those fields are **invisible** to it. `create_ticket` already accepts both
fields (both optional), but there is no read tool that lets the AI discover which
products and workflows exist in the organization, so it cannot fill fields it
cannot see. The result is tickets that land with no product and no workflow, and
therefore no lifecycle.

The fix is discovery: surface products and workflows so the AI can make an
informed call based on the ticket at hand. The descriptive signal the AI needs
(`Product.description`, `Workflow.description`, and a workflow's stage sequence)
**already exists** in the schema and is exposed in GraphQL — it has simply never
been surfaced to MCP. This is a surfacing job, not new modeling. No schema
change, no migration.

## Non-goals (explicitly out of scope)

- No `description` field on `WorkflowState`.
- No ticket-template / definition-of-done / acceptance-criteria model.
- No body skeleton seeded by `create_ticket`.
- No `get_workflow` / `get_product` single-fetch tools — the list tools return
  enough detail, and workflows/products are few per org.

These were considered (the "body shaping" and "full guidance" tiers) and
deliberately deferred. The workflow's stage names already give the AI most of
that signal for free.

## Design

Two new read tools, registered in `registerReadTools()`
(`backend/src/mcp/tools/index.ts`), following the existing `list_*` conventions
(`list_projects` is the reference shape: `search` + `limit`/`offset`
pagination, returning `{ <rows>, totalCount, hasMore, nextOffset }`).

### Tool 1: `list_products`

What product lines exist, so the AI can match the ticket to a product.

- **Input:** `{ search?: string, limit?: 1-100 (default matches list_projects), offset?: number }`
- **Output:** `{ products: [{ id, name, code, description, stage }], totalCount, hasMore, nextOffset }`
- **Filter:** excludes DELETED products (mirror whatever `list_projects`/product
  resolvers already do for tenant + lifecycle filtering).

### Tool 2: `list_workflows`

What workflows exist and what each is for, so the AI can pick a valid workflow
for the product it chose.

- **Input:** `{ product?: number, search?: string, limit?: 1-100, offset?: number }`
  - The `product` filter is the important one. `create_ticket` only accepts a
    workflow that belongs to the product's workflow set **or** is the org
    default. Passing `product` lets the AI see exactly the *valid* workflows for
    the product it just selected. When `product` is omitted, return the org's
    workflows (including defaults).
- **Output:** `{ workflows: [{ id, name, description, color, isDefaultWorkflow, stage, states: [{ name, position }] }], totalCount, hasMore, nextOffset }`
  - `states` (ordered by `position`) is the payload that makes a workflow
    legible: the AI sees e.g. `Design → Implement → Review → Document` and
    understands the lifecycle the ticket signs up for.

### Coaching via tool descriptions (the actual unlock)

Update the MCP tool descriptions of `create_ticket` and `update_ticket` to point
the AI at discovery:

> `productId` and `workflowId` are optional but strongly recommended. Call
> `list_products` to choose the product this work belongs to, then
> `list_workflows` (filtered by that product) to choose the workflow whose stages
> match the work. A ticket without a product and workflow has no lifecycle.

This is where MCP coaches behavior. The AI omitted these fields because nothing
pointed it at them; the descriptions are the cheapest, highest-leverage change.

## Components & boundaries

- New module `backend/src/mcp/tools/products.ts` — exports a
  `registerProductTools()` (or extends an existing module if a products module
  already exists) registering `list_products`.
- New module `backend/src/mcp/tools/workflows.ts` — exports
  `registerWorkflowTools()` registering `list_workflows`.
- Both wired into `registerReadTools()` in `tools/index.ts`, closed over
  `ResolvedRole` like the other read tools, reusing pagination/tenant helpers in
  `backend/src/mcp/tools/shared.ts`.
- Both delegate to existing product/workflow services or resolvers rather than
  hitting Prisma directly, matching how `list_projects` / `list_tickets` source
  their data (verify the exact seam during planning).

## Data flow

1. AI calls `list_products` → picks a product by `description`/`name`.
2. AI calls `list_workflows { product: <id> }` → sees valid workflows + their
   stage sequences → picks the workflow whose stages match the work.
3. AI calls `create_ticket { title, projectId, productId, workflowId }` →
   ticket lands fully routed with a lifecycle.

## Error handling

- Tenant scoping: results restricted to the caller's organization (same
  guarantee as every other read tool).
- Read-only tokens: both tools are reads, available regardless of `readOnly`.
- Invalid `product` filter id: return an empty `workflows` list (predictable
  empty result), not an error — consistent with how list searches behave on
  no-match.

## Testing

- Unit/integration tests alongside the existing MCP tool tests: assert each tool
  returns tenant-scoped rows, honors pagination, and that `list_workflows`
  filtered by `product` returns the product's workflows plus org defaults.
- Reuse fixtures in `backend/src/utils/testing.ts`; add new fixtures there if
  needed rather than hand-rolling.
- Use `make` test targets, not raw jest.
