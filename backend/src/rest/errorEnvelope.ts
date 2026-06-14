/**
 * REST error envelope — the boundary translation between the GraphQL schema's
 * error vocabulary and the HTTP contract `/v1` clients consume.
 *
 * Every failure leaves the REST API as the same JSON shape, so clients write
 * one error-handling path:
 *
 *     { "error": { "code": "NOT_FOUND", "message": "No Role found" } }
 *
 * Exports:
 *  - errorEnvelope(code, message) → the JSON body for a single error.
 *  - toEnvelope(errors) → { status, body } for a GraphQL execution result.
 *
 * Design note — why the FIRST error decides the status: a GraphQL response may
 * carry several errors, but HTTP has exactly one status line. The first error
 * is the operation's primary failure; surfacing it (rather than inventing a
 * "multi-error" status) keeps the mapping predictable and the envelope uniform.
 */

import { GraphQLError } from "graphql";

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
  };
}

export interface EnvelopeResponse {
  status: number;
  body: ErrorEnvelope;
}

// GraphQL `extensions.code` → HTTP status. Codes are the ones resolvers and the
// auth layer already raise across the schema (see isAuthenticated.ts and the
// Prisma not-found normaliser). Anything unmapped is treated as a server fault.
const CODE_TO_STATUS: Record<string, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_USER_INPUT: 400,
};

const INTERNAL_ERROR_STATUS = 500;
const INTERNAL_ERROR_CODE = "INTERNAL";

export function errorEnvelope(code: string, message: string): ErrorEnvelope {
  return { error: { code, message } };
}

// Map a GraphQL/operation error code to its HTTP status. Exposed so the `/v1`
// boundary can translate a thrown OperationError (which carries only a code and
// message — it is transport-agnostic) without re-deriving this table.
export function statusForCode(code: string): number {
  return CODE_TO_STATUS[code] ?? INTERNAL_ERROR_STATUS;
}

export function toEnvelope(
  errors: readonly GraphQLError[],
): EnvelopeResponse {
  const [primary] = errors;
  const code =
    (primary?.extensions?.code as string | undefined) ?? INTERNAL_ERROR_CODE;
  const status = CODE_TO_STATUS[code] ?? INTERNAL_ERROR_STATUS;

  return {
    status,
    body: errorEnvelope(code, primary?.message ?? "Internal server error"),
  };
}
