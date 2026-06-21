# Changing a ticket's workflow: reset the plan, never the history — supersede once work is logged

A Ticket's workflow and product are currently **immutable after publish**: the
`updateTicket` resolver only applies `productId`/`workflowId` changes while
`stage === DRAFT`, and silently ignores them otherwise. We are unlocking the
ability to change a published Ticket's workflow (Phase 1) and product (Phase 2).
The hard part is what happens to the work already attached, and the decision is
driven by separating three things the codebase already models distinctly:

- **Logged work** (`ScheduleItem`) — a real, elapsed work session (`startedAt`→
  `stoppedAt`, by a Role). A historical *fact*. Never deleted or rewritten.
- **Plan** (`TicketWorkflowState`) — one row per workflow stage, holding that
  stage's three-point estimate and progress. A *projection* scoped to the
  current workflow's stages. Disposable.
- **Estimate** (`Estimate`) — the computed probability distribution the MCTS
  scheduler consumes, derived from the plan.

The governing line is **whether any `ScheduleItem` exists** — the moment a Ticket
stops being *a plan* and becomes *a history*. Estimates and `SCHEDULED` status do
**not** count; only actually-elapsed time does.

**No logged work → mutate in place.** Deactivate the old `TicketWorkflowState`
rows (`isActive=false`, snapshot `name` retained — the same move the schema
already makes via `onDelete: SetNull` when a `WorkflowState` is removed) and
create fresh active rows for the new workflow. The Ticket keeps its identity
(`id`, `localId`, comments, watchers, dependencies). Nothing is deleted.

**Work logged → supersede, don't rewrite.** Rewriting a Ticket's workflow in
place once real time exists would make a single Ticket misrepresent what happened
(its headline would read "new workflow, 0% done" while concealing logged hours
under deactivated stages). Instead: close the original as `CANCELLED`, keep all
its logged work as an immutable record, and create a **new** Ticket under the new
workflow, linked by a dedicated **`supersededBy`/`supersedes` self-relation**
(navigable both ways, queryable). The successor inherits the intent fields
(title, body, owner, priority, difficulty, tags, folder) **and the dependency
edges**; the original keeps its now-satisfied edges harmlessly.

Either way, the resulting live Ticket has fresh, unestimated stages, so it
**re-enters estimation** — `status=UNSCHEDULED`, `estimating=true`, assignees
notified — exactly the side effects publishing already runs.

Both paths are reached through **one user action** ("Change workflow"); the
system detects whether logged work exists and shows the matching confirmation —
a light "this resets the new stages" or an explicit "this closes #42 (work kept)
and creates #58." Authority follows the existing tier split: the in-place reset
is a member-level edit (`hasRole: true`, like `updateTicket`); the supersede is a
lifecycle change (`hasRole: [ADMIN, OWNER]`, like `updateTicketStage`).

Phasing: **Phase 1** is workflow-change within the same product (no identity
change). **Phase 2** is product-change, which additionally reassigns the
prefix (`product.code`) and per-product `localId`, and must handle stale
human-facing references — a strictly larger blast radius kept out of the first
slice.

## Why

- **The work did happen — deleting it is a lie.** The original instinct ("delete
  past work and estimates") conflated three records. Only the *plan* is workflow-
  scoped and disposable; *logged work* is a fact that outlives any workflow. The
  design preserves the fact and resets only the projection.
- **The cascade was a trap, not a choice.** `ScheduleItem.ticketWorkflowState` is
  `onDelete: Cascade`, so "delete the plan" would silently take the history with
  it. Deactivating (not deleting) the `TicketWorkflowState` rows keeps the work
  attached and truthful — and reuses the snapshot-and-survive pattern the schema
  already applies when a workflow stage is removed.
- **In-place rewrite would make the Ticket misrepresent reality.** Once real time
  is logged, the honest unit-of-work has changed shape. Modelling that as a new,
  linked Ticket keeps the original a true closed record and the successor a clean
  fresh plan — rather than one row whose live headline contradicts its own
  history.
- **Lineage belongs in its own relation.** Supersession is "this became that";
  `ancestors`/`successors` is the dependency DAG ("what comes before what"), read
  by the scheduler for ordering. Overloading the dependency edges for lineage
  would inject phantom dependencies into scheduling. A dedicated self-relation
  costs one nullable column and keeps the two concepts clean.
- **Honesty about schedulability.** Fresh stages have no estimates; the MCTS
  genuinely cannot schedule them. Re-entering estimation (vs. leaving the Ticket
  `SCHEDULED` on null estimates) keeps the scheduler fed only with real data.
- **Reuse the authority convention already in the code.** Editing is member-level;
  lifecycle transitions are ADMIN/OWNER. The two paths map onto that split with no
  new permission concept.

## Considered options

- **Hard-delete the plan and let the cascade take the work.** Rejected: it
  permanently destroys the record that a person spent real time — the exact
  unfaithfulness that motivated the design. Also corrupts any future scheduler
  calibration that learns from actuals.
- **Always mutate in place (deactivate-and-supersede), even after work is
  logged.** Considered, and chosen for the *no-work* case. Rejected once work
  exists, because it leaves a single Ticket whose live state (new workflow, 0%)
  contradicts the logged history hidden in its deactivated stages.
- **Always clone-and-replace, regardless of work.** Rejected as the default: for
  the common no-work case it needlessly churns identity (new `localId`, re-linked
  comments/watchers/dependencies) for what is really just a plan edit.
- **Drop the Ticket to DRAFT whenever the workflow resets.** Rejected as the
  default: it pulls a live Ticket off the schedule and forces a second
  re-publish step. DRAFT remains only as an explicit, opt-in escape hatch ("I'm
  not ready to re-plan yet").
- **Reuse `ancestors`/`successors` for supersession lineage.** Rejected: those
  are dependencies the scheduler reads; lineage there would distort ordering.
- **A `closingNote` string instead of a relation.** Rejected: not navigable, not
  queryable, and rots if `localId` reformats (Phase 2). The link is a real
  first-class relationship worth a column.
- **A new `SUPERSEDED` `TicketStatus`.** Considered for honest analytics.
  Rejected for now: `CANCELLED` already carries the terminal/scheduler-exclusion
  semantics for free, and the `supersededBy` FK disambiguates "reshaped" from
  "abandoned" when reports need it. Revisit only if analytics demand a first-class
  status.
- **Re-point dependency edges onto the successor.** Considered to avoid releasing
  a dependent too early. Found unnecessary: because the successor *inherits* the
  edges and a `CANCELLED` ticket reads as satisfied, a dependent ends up waiting
  on the successor automatically — no edge surgery required.

## Consequences

- New nullable self-relation on `Ticket` (`supersededById` + `supersededBy`/
  `supersedes`) — an additive migration, no backfill.
- `TicketWorkflowState` rows are now deactivated (not deleted) on an in-place
  workflow change; their `ScheduleItem`s ride along untouched. A regression test
  must pin this so a future refactor can't re-introduce the `onDelete: Cascade`
  data loss.
- The superseded original is `CANCELLED` with `supersededById` set; analytics that
  care about genuine cancellations must special-case the FK.
- A workflow change re-runs the publish side effects (`UNSCHEDULED`,
  `estimating=true`, assignee notifications) for the new stages.
- Phase 2 (product-change) inherits all of this and adds prefix/`localId`
  reassignment and stale-reference handling; the stable internal `Ticket.id`
  means REST `/v1`, MCP, and FK relations survive a product move untouched — only
  human-typed references go stale.
- Glossary updated (`CONTEXT.md`) with **Logged work**, **Plan**, and
  **Supersede** to keep the plan/history/dependency distinctions from blurring
  again.
