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
 * PROJECTS_OPERATION, PROJECT_OPERATION, SCHEDULE_OPERATION.
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
// estimate/ETA, its workflow states (with their three-point estimates), and
// its dependency edges (ancestors it waits on, successors waiting on it).
export const TICKET_OPERATION = /* GraphQL */ `
  query RestTicket($id: Int!) {
    ticket(id: $id) {
      id
      title
      description
      estimate
      eta
      status
      stage
      progress
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
