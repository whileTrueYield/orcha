/**
 * OpenAPI 3 description of the Orcha public REST API (`/v1`).
 *
 * This is the published contract for the thin-REST-over-GraphQL surface (see
 * docs/adr/0006). It is hand-authored rather than generated: the `/v1` surface
 * is deliberately small and curated, and a hand-written spec reads as the
 * promise we make to integrators rather than a mechanical dump of the schema.
 *
 * As each slice adds endpoints, document them here alongside their operation in
 * operations.ts — the two evolve together. (#26 reads; #40 body read/write;
 * #28 ticket writes: create / patch / transition; #29 the per-token rate-limit
 * 429, shared by every operation via components.responses.RateLimited.)
 *
 * Exports:
 *  - openApiSpec: the spec object, served verbatim at GET /v1/openapi.json.
 */

// Reused security requirement: every `/v1` endpoint is bearer-authenticated
// with a Personal Access Token.
const bearerAuthRequirement = [{ PersonalAccessToken: [] }];

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Orcha REST API",
    version: "1.0.0",
    description:
      "A thin, role-scoped REST surface over Orcha. Authenticate every " +
      "request with a Personal Access Token: `Authorization: Bearer orcha_pat_...`.",
  },
  servers: [{ url: "/", description: "This Orcha instance" }],
  components: {
    securitySchemes: {
      PersonalAccessToken: {
        type: "http",
        scheme: "bearer",
        description:
          "A Personal Access Token (PAT). Bound to a single Role; scopes the " +
          "request to that Role's Organization.",
      },
    },
    responses: {
      // Cross-cutting: every authenticated endpoint shares the per-token rate
      // limit, so its 429 is defined once here and referenced from each
      // operation rather than re-described per path.
      RateLimited: {
        description:
          "Per-token rate limit exceeded. Retry after the number of seconds " +
          "given in the `Retry-After` header.",
        headers: {
          "Retry-After": {
            description: "Seconds to wait before the rate-limit window resets.",
            schema: { type: "integer" },
          },
        },
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "UNAUTHENTICATED" },
              message: { type: "string" },
            },
          },
        },
      },
      Me: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["GUEST", "USER", "LINKED"] },
          role: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              type: { type: "string" },
            },
          },
          user: {
            type: "object",
            properties: {
              id: { type: "integer" },
              email: { type: "string", format: "email" },
            },
          },
          organization: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
        },
      },
      PageInfo: {
        type: "object",
        description:
          "Cursor pagination metadata. `nextCursor` is an opaque token; pass " +
          "it back as `?after=` to fetch the next page. It is null on the last " +
          "page.",
        properties: {
          totalCount: { type: "integer" },
          hasNextPage: { type: "boolean" },
          hasPreviousPage: { type: "boolean" },
          nextCursor: { type: "string", nullable: true },
        },
      },
      TicketSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          status: {
            type: "string",
            enum: ["UNSCHEDULED", "SCHEDULED", "DONE", "CANCELLED"],
          },
          stage: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          estimate: { type: "integer" },
          eta: { type: "string", format: "date-time", nullable: true },
          projectId: { type: "integer" },
        },
      },
      TicketWrite: {
        type: "object",
        description:
          "The compact ticket shape returned by the write endpoints (create, " +
          "patch, transition). Lighter than the read detail: it confirms the " +
          "mutated scalars; re-read GET /v1/tickets/{id} for body and edges.",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          status: {
            type: "string",
            enum: ["UNSCHEDULED", "SCHEDULED", "DONE", "CANCELLED"],
          },
          stage: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          projectId: { type: "integer" },
          estimate: { type: "integer" },
          eta: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateTicket: {
        type: "object",
        description: "The body for POST /v1/tickets.",
        required: ["title", "projectId"],
        properties: {
          title: { type: "string" },
          projectId: { type: "integer" },
          productId: { type: "integer" },
          workflowId: { type: "integer" },
          stage: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
        },
      },
      UpdateTicket: {
        type: "object",
        description:
          "The body for PATCH /v1/tickets/{id}. A partial update: send only " +
          "the fields to change. An empty body is rejected with 400.",
        properties: {
          title: { type: "string" },
          ownerId: { type: "integer" },
          projectId: { type: "integer" },
          difficulty: { type: "integer" },
          estimating: { type: "boolean" },
          milestone: { type: "boolean" },
          productId: { type: "integer" },
          workflowId: { type: "integer" },
        },
      },
      TicketTransition: {
        type: "object",
        description:
          "The body for POST /v1/tickets/{id}/transition. `action` selects the " +
          "lifecycle move; the other fields depend on the action:\n" +
          "- `schedule`: UNSCHEDULED → SCHEDULED. No other fields.\n" +
          "- `start`: open work on a stage. `stageId` REQUIRED.\n" +
          "- `advance`: move to the next (or `toStageId`) stage; `note` " +
          "optional. Advancing past the last stage completes the ticket (DONE).\n" +
          "- `close`: → DONE. `note` REQUIRED.\n" +
          "- `cancel`: → CANCELLED. `note` REQUIRED.",
        required: ["action"],
        properties: {
          action: {
            type: "string",
            enum: ["schedule", "start", "advance", "close", "cancel"],
          },
          stageId: {
            type: "integer",
            description: "The workflow state to start (action `start`).",
          },
          toStageId: {
            type: "integer",
            description:
              "An explicit target stage to advance to (action `advance`); " +
              "omit to advance to the next stage by position.",
          },
          note: {
            type: "string",
            description:
              "Required for `close` and `cancel` (the recorded reason); " +
              "optional for `advance`.",
          },
        },
      },
      NextTicket: {
        type: "object",
        description:
          "A ticket the scheduler ranks for the caller to work on next, paired " +
          "with the workflow state that is up next on it.",
        properties: {
          ticket: { $ref: "#/components/schemas/TicketSummary" },
          nextState: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              position: { type: "integer" },
            },
          },
        },
      },
      WorkflowState: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          position: { type: "integer" },
          isActive: { type: "boolean" },
          estimateMinimum: { type: "integer", nullable: true },
          estimateMostLikely: { type: "integer", nullable: true },
          estimateMaximum: { type: "integer", nullable: true },
        },
      },
      DocumentBody: {
        type: "object",
        description:
          "A document body as Markdown (ADR 0007). `version` is the optimistic-" +
          "concurrency token, returned as the ETag on the dedicated body " +
          "endpoints.",
        required: ["markdown", "version"],
        properties: {
          markdown: { type: "string" },
          version: { type: "integer" },
        },
      },
      BodyRead: {
        type: "object",
        description: "A body read; the version travels in the ETag header.",
        required: ["markdown"],
        properties: { markdown: { type: "string" } },
      },
      BodyWrite: {
        type: "object",
        description: "A body write payload.",
        required: ["markdown"],
        properties: { markdown: { type: "string" } },
      },
      BodyWriteResult: {
        type: "object",
        description:
          "The result of a body write. On success `markdown` is the stored " +
          "(canonical, mention-resolved) body and the new version is the ETag. " +
          "On a 409 the markdown is the same body rewritten with git conflict " +
          "markers and the ETag is the current version to rebase onto.",
        required: ["markdown", "warnings"],
        properties: {
          markdown: { type: "string" },
          warnings: {
            type: "array",
            description:
              "Loose @-mentions / #-references that could not be resolved, " +
              "surfaced rather than guessed.",
            items: { $ref: "#/components/schemas/MentionWarning" },
          },
        },
      },
      MentionWarning: {
        type: "object",
        required: ["kind", "reference"],
        properties: {
          kind: { type: "string", enum: ["unknown", "ambiguous"] },
          reference: { type: "string", example: "@nobody" },
          matches: {
            type: "integer",
            nullable: true,
            description: "Number of matches for an ambiguous reference.",
          },
        },
      },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          body: { $ref: "#/components/schemas/DocumentBody" },
          estimate: { type: "integer" },
          eta: { type: "string", format: "date-time", nullable: true },
          status: { type: "string" },
          stage: { type: "string" },
          progress: { type: "number" },
          project: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
            },
          },
          ticketWorkflowStates: {
            type: "array",
            items: { $ref: "#/components/schemas/WorkflowState" },
          },
          ancestors: {
            type: "array",
            description: "Tickets this ticket depends on.",
            items: { $ref: "#/components/schemas/TicketSummary" },
          },
          successors: {
            type: "array",
            description: "Tickets that depend on this ticket.",
            items: { $ref: "#/components/schemas/TicketSummary" },
          },
        },
      },
      ProjectSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          stage: { type: "string" },
          duration: { type: "integer" },
          parentId: { type: "integer", nullable: true },
        },
      },
      Project: {
        allOf: [
          { $ref: "#/components/schemas/ProjectSummary" },
          {
            type: "object",
            properties: {
              parent: {
                type: "object",
                nullable: true,
                properties: {
                  id: { type: "integer" },
                  name: { type: "string" },
                },
              },
              children: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    name: { type: "string" },
                  },
                },
              },
            },
          },
        ],
      },
      ScheduleItem: {
        type: "object",
        properties: {
          id: { type: "integer" },
          done: { type: "boolean" },
          startedAt: { type: "string", format: "date-time" },
          stoppedAt: { type: "string", format: "date-time", nullable: true },
          ticket: {
            type: "object",
            properties: {
              id: { type: "integer" },
              title: { type: "string" },
              status: { type: "string" },
              eta: { type: "string", format: "date-time", nullable: true },
            },
          },
          ticketWorkflowState: {
            type: "object",
            properties: {
              id: { type: "integer" },
              name: { type: "string" },
              position: { type: "integer" },
            },
          },
        },
      },
    },
    parameters: {
      first: {
        name: "first",
        in: "query",
        required: false,
        description: "Page size (default 20; each resource clamps its own max).",
        schema: { type: "integer" },
      },
      after: {
        name: "after",
        in: "query",
        required: false,
        description: "Opaque cursor from a previous page's `nextCursor`.",
        schema: { type: "string" },
      },
      ifMatch: {
        name: "If-Match",
        in: "header",
        required: true,
        description:
          "The body version you read (the ETag), e.g. `\"3\"`. The write " +
          "rebases onto it; omit it and the write is refused with 428.",
        schema: { type: "string", example: '"3"' },
      },
    },
  },
  security: bearerAuthRequirement,
  paths: {
    "/v1/me": {
      get: {
        summary: "The authenticated token's Role, User, and Organization",
        operationId: "getMe",
        security: bearerAuthRequirement,
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The identity behind the presented token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Me" },
              },
            },
          },
          "401": {
            description: "Missing, malformed, or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/me/next-tickets": {
      get: {
        summary: "The caller's MCTS-prioritized work queue",
        operationId: "getNextTickets",
        description:
          "The Tickets the scheduler ranks for the caller's Role to work on " +
          "next, in scheduler order, each paired with the workflow state up " +
          "next. No parameters: order and membership are scheduler-derived. A " +
          "read, so a read-only token works.",
        security: bearerAuthRequirement,
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The scheduler-ordered next tickets.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/NextTicket" },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Missing, malformed, or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/tickets": {
      get: {
        summary: "List tickets in the caller's organization",
        operationId: "listTickets",
        security: bearerAuthRequirement,
        parameters: [
          { $ref: "#/components/parameters/first" },
          { $ref: "#/components/parameters/after" },
          {
            name: "project",
            in: "query",
            required: false,
            description: "Filter to a single project id.",
            schema: { type: "integer" },
          },
          {
            name: "status",
            in: "query",
            required: false,
            description:
              "Filter by workflow status (repeatable): UNSCHEDULED, SCHEDULED, DONE, CANCELLED.",
            schema: {
              type: "array",
              items: {
                type: "string",
                enum: ["UNSCHEDULED", "SCHEDULED", "DONE", "CANCELLED"],
              },
            },
          },
          {
            name: "assignee",
            in: "query",
            required: false,
            description: "Filter by assigned role id (repeatable).",
            schema: { type: "array", items: { type: "integer" } },
          },
          {
            name: "stage",
            in: "query",
            required: false,
            description:
              "Filter by stage (repeatable): DRAFT, PUBLISHED, ARCHIVED.",
            schema: {
              type: "array",
              items: {
                type: "string",
                enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
              },
            },
          },
          {
            name: "search",
            in: "query",
            required: false,
            description: "Full-text search on title, description, and ticket id.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "A page of tickets.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/TicketSummary" },
                    },
                    pageInfo: { $ref: "#/components/schemas/PageInfo" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Malformed pagination cursor.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "401": {
            description: "Missing, malformed, or invalid bearer token.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a ticket",
        operationId: "createTicket",
        description:
          "Create a ticket in the caller's organization. `title` and " +
          "`projectId` are required. A read-only token is refused with 403.",
        security: bearerAuthRequirement,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTicket" },
            },
          },
        },
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "201": {
            description: "The created ticket.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketWrite" },
              },
            },
          },
          "400": {
            description:
              "Missing a required field, or the mutation rejected the input " +
              "(e.g. the project is not published).",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "403": {
            description: "The token is read-only and cannot write.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/tickets/{id}": {
      get: {
        summary: "Read a single ticket",
        operationId: "getTicket",
        security: bearerAuthRequirement,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The ticket.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Ticket" },
              },
            },
          },
          "404": {
            description: "No such ticket in the caller's organization.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Update a ticket (partial)",
        operationId: "updateTicket",
        description:
          "Update only the fields you send. An empty body is rejected with " +
          "400. A read-only token is refused with 403.",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTicket" },
            },
          },
        },
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The updated ticket.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketWrite" },
              },
            },
          },
          "400": {
            description:
              "Empty body (nothing to update), or the mutation rejected the " +
              "change.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "403": {
            description: "The token is read-only and cannot write.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "No such ticket in the caller's organization.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/tickets/{id}/transition": {
      post: {
        summary: "Drive a ticket through its lifecycle",
        operationId: "transitionTicket",
        description:
          "Dispatch on `action` to move a ticket: schedule, start, advance, " +
          "close, or cancel (see the TicketTransition schema for each action's " +
          "fields). `schedule` is the only path to SCHEDULED. `close` and " +
          "`cancel` require a `note`. A read-only token is refused with 403.",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TicketTransition" },
            },
          },
        },
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description:
              "The transition was applied. For schedule/advance/close/cancel " +
              "the body is the resulting ticket (TicketWrite); for `start` it " +
              "is the created ScheduleItem.",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/TicketWrite" },
                    { $ref: "#/components/schemas/ScheduleItem" },
                  ],
                },
              },
            },
          },
          "400": {
            description:
              "Unknown or missing `action`, a missing required field for the " +
              "action (e.g. `stageId` for start, `note` for close/cancel), or " +
              "the mutation rejected the move.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "403": {
            description: "The token is read-only and cannot write.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "404": {
            description: "No such ticket in the caller's organization.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/tickets/{id}/body": {
      get: {
        summary: "Read a ticket's Markdown body",
        operationId: "getTicketBody",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description:
              "The body Markdown. The current version is in the ETag header; " +
              "send it back as If-Match to write safely.",
            headers: {
              ETag: {
                description: "The body's current version.",
                schema: { type: "string", example: '"3"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyRead" },
              },
            },
          },
          "404": {
            description: "No such ticket in the caller's organization.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
      put: {
        summary: "Write a ticket's Markdown body (optimistic concurrency)",
        operationId: "putTicketBody",
        description:
          "Write the body, sending the version you read as If-Match. A matching " +
          "version fast-forwards; a stale version auto-merges concurrent edits; " +
          "a genuine overlap returns 409 with the conflict-markered Markdown.",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { $ref: "#/components/parameters/ifMatch" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BodyWrite" },
            },
          },
        },
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The body was written. The ETag is the new version.",
            headers: {
              ETag: {
                description: "The new body version.",
                schema: { type: "string", example: '"4"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyWriteResult" },
              },
            },
          },
          "400": {
            description: "Body is not JSON with a string `markdown` field.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "403": {
            description: "The document is archived (read-only).",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "404": {
            description: "No such ticket in the caller's organization.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description:
              "The edits genuinely overlap. The response is the body rewritten " +
              "with git conflict markers; the ETag is the current version to " +
              "re-read and rebase onto. Nothing was written.",
            headers: {
              ETag: {
                description: "The current version to rebase onto.",
                schema: { type: "string", example: '"4"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyWriteResult" },
              },
            },
          },
          "428": {
            description: "Missing If-Match header (required for a write).",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/v1/projects": {
      get: {
        summary: "List projects in the caller's organization",
        operationId: "listProjects",
        security: bearerAuthRequirement,
        parameters: [
          { $ref: "#/components/parameters/first" },
          { $ref: "#/components/parameters/after" },
          {
            name: "parent",
            in: "query",
            required: false,
            description: "Filter to children of this project id.",
            schema: { type: "integer" },
          },
          {
            name: "search",
            in: "query",
            required: false,
            description: "Case-insensitive substring match on project name.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "A page of projects.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ProjectSummary" },
                    },
                    pageInfo: { $ref: "#/components/schemas/PageInfo" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Malformed pagination cursor.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/projects/{id}": {
      get: {
        summary: "Read a single project",
        operationId: "getProject",
        security: bearerAuthRequirement,
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The project.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Project" },
              },
            },
          },
          "404": {
            description: "No such project in the caller's organization.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/v1/projects/{id}/body": {
      get: {
        summary: "Read a project's Markdown body",
        operationId: "getProjectBody",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description:
              "The body Markdown; the current version is in the ETag header.",
            headers: {
              ETag: {
                description: "The body's current version.",
                schema: { type: "string", example: '"3"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyRead" },
              },
            },
          },
          "404": {
            description: "No such project in the caller's organization.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
      put: {
        summary: "Write a project's Markdown body (optimistic concurrency)",
        operationId: "putProjectBody",
        description:
          "Identical semantics to PUT /v1/tickets/{id}/body: If-Match, " +
          "fast-forward / auto-merge / 409 conflict.",
        security: bearerAuthRequirement,
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" } },
          { $ref: "#/components/parameters/ifMatch" },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BodyWrite" },
            },
          },
        },
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The body was written. The ETag is the new version.",
            headers: {
              ETag: {
                description: "The new body version.",
                schema: { type: "string", example: '"4"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyWriteResult" },
              },
            },
          },
          "400": {
            description: "Body is not JSON with a string `markdown` field.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "403": {
            description: "The document is archived (read-only).",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "404": {
            description: "No such project in the caller's organization.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "409": {
            description:
              "The edits genuinely overlap; the response is the conflict-" +
              "markered body and the ETag is the current version. Nothing was " +
              "written.",
            headers: {
              ETag: {
                description: "The current version to rebase onto.",
                schema: { type: "string", example: '"4"' },
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BodyWriteResult" },
              },
            },
          },
          "428": {
            description: "Missing If-Match header (required for a write).",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/v1/schedule": {
      get: {
        summary: "The caller's outstanding scheduled work",
        operationId: "getSchedule",
        description:
          "The caller's own unfinished schedule items and each item's ticket " +
          "ETA. Scoped to the token's role, so a read-only token works.",
        security: bearerAuthRequirement,
        responses: {
          "429": { $ref: "#/components/responses/RateLimited" },
          "200": {
            description: "The caller's unfinished schedule items.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/ScheduleItem" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
