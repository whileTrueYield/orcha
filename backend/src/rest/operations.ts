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
 * Exports: ME_OPERATION, TICKETS_OPERATION, TICKET_OPERATION,
 * TICKET_BODY_OPERATION, SAVE_DOCUMENT_BODY_OPERATION, PROJECTS_OPERATION,
 * PROJECT_OPERATION, PROJECT_BODY_OPERATION, SCHEDULE_OPERATION.
 */

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
