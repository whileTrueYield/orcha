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
  },
} as const;
