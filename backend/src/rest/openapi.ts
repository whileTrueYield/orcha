/**
 * OpenAPI 3 description of the Orcha public REST API (`/v1`).
 *
 * This is the published contract for the thin-REST-over-GraphQL surface (see
 * docs/adr/0006). It is hand-authored rather than generated: the `/v1` surface
 * is deliberately small and curated, and a hand-written spec reads as the
 * promise we make to integrators rather than a mechanical dump of the schema.
 *
 * As each slice (#26–#28) adds endpoints, document them here alongside their
 * operation in operations.ts — the two evolve together.
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
      Ticket: {
        type: "object",
        // The body is omitted until the Markdown read/write format is decided
        // (see operations.ts). Structured fields only for now.
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
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
    "/v1/schedule": {
      get: {
        summary: "The caller's outstanding scheduled work",
        operationId: "getSchedule",
        description:
          "The caller's own unfinished schedule items and each item's ticket " +
          "ETA. Scoped to the token's role, so a read-only token works.",
        security: bearerAuthRequirement,
        responses: {
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
