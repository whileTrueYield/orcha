/**
 * REST endpoint GraphQL operations — the single, marked place where the REST
 * API's dependency on the GraphQL schema lives.
 *
 * Every `/v1` endpoint executes one of these documents through the in-process
 * executor (see executor.ts) rather than reaching into resolvers directly. The
 * point of gathering them here is failure localisation: a field rename in the
 * schema breaks the matching operation in THIS file — a single, obvious place
 * to update — instead of silently changing the JSON contract clients depend
 * on. Treat each operation as the wire contract for its endpoint.
 *
 * Exports: ME_OPERATION, NEXT_TICKETS_OPERATION, TICKETS_OPERATION,
 * TICKET_OPERATION, TICKET_BODY_OPERATION, SAVE_DOCUMENT_BODY_OPERATION,
 * PROJECTS_OPERATION, PROJECT_OPERATION, PROJECT_BODY_OPERATION,
 * SCHEDULE_OPERATION, CREATE_TICKET_OPERATION, UPDATE_TICKET_OPERATION,
 * SCHEDULE_TICKET_OPERATION, START_TICKET_STAGE_OPERATION,
 * ADVANCE_TICKET_STATE_OPERATION, UPDATE_TICKET_STATUS_OPERATION.
 */

// The write endpoints (#28) return a compact, shared ticket shape. Create,
// patch, and every status-changing transition answer with the SAME selection so
// a client writes one ticket parser regardless of which verb it called. It is
// deliberately lighter than TICKET_OPERATION (no body/edges) — a write confirms
// the mutated scalars; a client that wants the full detail re-reads GET
// /v1/tickets/:id.
const TICKET_WRITE_SELECTION = /* GraphQL */ `
  id
  title
  status
  stage
  projectId
  estimate
  eta
`;

// GET /v1/me — the token's Role, the User behind it, and the Organization it
// belongs to. Field selection here IS the response shape clients receive.
export const ME_OPERATION = /* GraphQL */ `
  query MeRestEndpoint {
    me {
      status
      role {
        id
        name
        type
      }
      user {
        id
        email
      }
      organization {
        id
        name
      }
    }
  }
`;

// GET /v1/me/next-tickets — the MCTS work queue. `myNextTickets` returns, in
// scheduler order, the Tickets the caller's Role should work on next, each
// paired with the workflow state that is up next. The query takes no arguments:
// the order and membership are scheduler-derived, not client-specified. The
// ticket field selection mirrors the list-node shape used by /v1/tickets.
export const NEXT_TICKETS_OPERATION = /* GraphQL */ `
  query RestNextTickets {
    myNextTickets {
      ticket {
        id
        title
        status
        stage
        estimate
        eta
        projectId
      }
      nextState {
        id
        name
        position
      }
    }
  }
`;

// GET /v1/tickets — a tenant-scoped, filterable, paginated ticket list. The
// `tickets` query scopes to the caller's organization; the REST layer maps its
// offset pagination to an opaque cursor (see pagination.ts). Filter variables
// are omitted when the client doesn't pass them, which the resolver reads as
// "no filter".
export const TICKETS_OPERATION = /* GraphQL */ `
  query RestTickets(
    $first: Int
    $offset: Int
    $sort: String
    $projectId: Int
    $search: String
    $statuses: [TicketStatus!]
    $assigneeIds: [Int!]
    $stages: [ModelStage!]
  ) {
    tickets(
      first: $first
      offset: $offset
      sort: $sort
      projectId: $projectId
      search: $search
      statuses: $statuses
      assigneeIds: $assigneeIds
      stages: $stages
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        title
        status
        stage
        estimate
        eta
        projectId
      }
    }
  }
`;

// GET /v1/tickets/:id — a single ticket with the detail an agent needs to act:
// the Markdown body (+ its version), estimate/ETA, its workflow states (with
// their three-point estimates), and its dependency edges (ancestors it waits
// on, successors waiting on it). The body is the Markdown source of truth (ADR
// 0007); the dedicated GET/PUT /v1/tickets/:id/body endpoints add the ETag /
// If-Match optimistic-concurrency contract for editing it.
export const TICKET_OPERATION = /* GraphQL */ `
  query RestTicket($id: Int!) {
    ticket(id: $id) {
      id
      title
      estimate
      eta
      status
      stage
      progress
      body {
        markdown
        version
      }
      project {
        id
        name
      }
      ticketWorkflowStates {
        id
        name
        position
        isActive
        estimateMinimum
        estimateMostLikely
        estimateMaximum
      }
      ancestors {
        id
        title
        status
      }
      successors {
        id
        title
        status
      }
    }
  }
`;

// GET /v1/tickets/:id/body — the ticket's Markdown body + version (ETag). The
// `ticket(id)` query scopes to the caller's organization (throws NOT_FOUND for a
// foreign ticket), so the body inherits tenant scoping for free.
export const TICKET_BODY_OPERATION = /* GraphQL */ `
  query RestTicketBody($id: Int!) {
    ticket(id: $id) {
      body {
        markdown
        version
      }
    }
  }
`;

// PUT /v1/{type}/:id/body — write a Markdown body with optimistic concurrency.
// Executes the shared saveDocumentBody mutation; the REST layer maps If-Match to
// baseVersion and the result to 200 + ETag or 409 (conflict).
export const SAVE_DOCUMENT_BODY_OPERATION = /* GraphQL */ `
  mutation RestSaveDocumentBody(
    $documentType: DocumentBodyType!
    $documentId: Int!
    $markdown: String!
    $baseVersion: Int!
  ) {
    saveDocumentBody(
      documentType: $documentType
      documentId: $documentId
      markdown: $markdown
      baseVersion: $baseVersion
    ) {
      body {
        markdown
        version
      }
      conflict {
        markdown
        version
      }
      warnings {
        kind
        reference
        matches
      }
    }
  }
`;

// GET /v1/projects/:id/body — the project's Markdown body + version (ETag),
// scoped to the caller's organization through the `project(id)` query.
export const PROJECT_BODY_OPERATION = /* GraphQL */ `
  query RestProjectBody($id: Int!) {
    project(id: $id) {
      body {
        markdown
        version
      }
    }
  }
`;

// GET /v1/projects — tenant-scoped, searchable, paginated project list.
export const PROJECTS_OPERATION = /* GraphQL */ `
  query RestProjects(
    $first: Int
    $offset: Int
    $sort: String
    $search: String
    $parentId: Int
  ) {
    projects(
      first: $first
      offset: $offset
      sort: $sort
      search: $search
      parentId: $parentId
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        name
        stage
        duration
        parentId
      }
    }
  }
`;

// GET /v1/projects/:id — a single project with its hierarchy edges.
export const PROJECT_OPERATION = /* GraphQL */ `
  query RestProject($id: Int!) {
    project(id: $id) {
      id
      name
      stage
      duration
      parentId
      parent {
        id
        name
      }
      children {
        id
        name
      }
    }
  }
`;

// GET /v1/schedule — the caller's own outstanding scheduled work and its ETAs.
// Maps to myUnfinishedScheduleItems (scoped to me.roleId), so it works for any
// role, including a read-only token. ETA lives on the parent ticket.
export const SCHEDULE_OPERATION = /* GraphQL */ `
  query RestSchedule {
    myUnfinishedScheduleItems {
      id
      done
      startedAt
      stoppedAt
      ticket {
        id
        title
        status
        eta
      }
      ticketWorkflowState {
        id
        name
        position
      }
    }
  }
`;

// POST /v1/tickets — create a ticket. The REST layer validates the required
// title/projectId before executing (a missing GraphQL variable surfaces as a
// query-validation error with no clean status, so we never let it reach here);
// the mutation owns the rest of the business rules (project must be published,
// etc.) and any violation maps through the standard envelope.
export const CREATE_TICKET_OPERATION = /* GraphQL */ `
  mutation RestCreateTicket($input: CreateTicketInput!) {
    createTicket(input: $input) {
      ${TICKET_WRITE_SELECTION}
    }
  }
`;

// PATCH /v1/tickets/:id — partial update. The REST layer builds the input from
// only the fields present in the JSON body and rejects an empty body itself
// (updateTicket's own empty-input guard throws without a mapped code), so this
// document is only ever executed with at least one field set.
export const UPDATE_TICKET_OPERATION = /* GraphQL */ `
  mutation RestUpdateTicket($ticketId: Int!, $input: UpdateTicketInput!) {
    updateTicket(ticketId: $ticketId, input: $input) {
      ${TICKET_WRITE_SELECTION}
    }
  }
`;

// POST /v1/tickets/:id/transition action="schedule" — UNSCHEDULED → SCHEDULED.
// This is the ONLY path to SCHEDULED: updateTicketStatus rejects status=SCHEDULED
// ("Use scheduleTicket"), so the transition dispatcher must route here.
export const SCHEDULE_TICKET_OPERATION = /* GraphQL */ `
  mutation RestScheduleTicket($ticketId: Int!) {
    scheduleTicket(ticketId: $ticketId) {
      ${TICKET_WRITE_SELECTION}
    }
  }
`;

// POST /v1/tickets/:id/transition action="start" — open a unit of work on a
// specific stage. Returns the created ScheduleItem (not the ticket), since the
// thing the caller just brought into being is the schedule item.
export const START_TICKET_STAGE_OPERATION = /* GraphQL */ `
  mutation RestStartTicketStage($input: CreateScheduleItemInput!) {
    createScheduleItem(input: $input) {
      id
      startedAt
      ticketId
      ticketWorkflowStateId
    }
  }
`;

// POST /v1/tickets/:id/transition action="advance" — move to the next stage (or
// an explicit one), closing the current work. Advancing past the last stage
// completes the ticket (status DONE), which the shared selection surfaces.
export const ADVANCE_TICKET_STATE_OPERATION = /* GraphQL */ `
  mutation RestAdvanceTicketState(
    $ticketId: Int!
    $toTicketWorkflowStateId: Int
    $note: String
  ) {
    advanceTicketWorkflowState(
      ticketId: $ticketId
      toTicketWorkflowStateId: $toTicketWorkflowStateId
      note: $note
    ) {
      ${TICKET_WRITE_SELECTION}
    }
  }
`;

// POST /v1/tickets/:id/transition action="close"|"cancel" — set DONE or
// CANCELLED. The GraphQL `note` arg is optional, but the REST contract REQUIRES
// it for both (a closing decision should be recorded), enforced in the router
// before this runs.
export const UPDATE_TICKET_STATUS_OPERATION = /* GraphQL */ `
  mutation RestUpdateTicketStatus(
    $ticketId: Int!
    $status: TicketStatus!
    $note: String
  ) {
    updateTicketStatus(ticketId: $ticketId, status: $status, note: $note) {
      ${TICKET_WRITE_SELECTION}
    }
  }
`;
