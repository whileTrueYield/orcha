/**
 * GraphQL error normalisation.
 *
 * Public API:
 *  - formatGraphQLError(error): GraphQLError
 *      Maps Prisma "record not found" failures (P2025, raised by
 *      `findFirstOrThrow` / `findUniqueOrThrow`) to a clean, client-friendly
 *      "No {Model} found" message, preserving the original error for logging.
 *
 * Why this exists:
 *  Older Prisma versions threw a `NotFoundError` whose message was exactly
 *  "No {Model} found". Prisma 6 changed `*OrThrow` to throw a
 *  `PrismaClientKnownRequestError` (code P2025) with a verbose, multi-line
 *  message that leaks the query invocation and source path. Resolvers across
 *  the codebase rely on `*OrThrow` as their "not found" signal and never
 *  catch it, so the friendly message has to be restored at the boundary —
 *  the Apollo `formatError` hook in production, and `graphqlRequest` in tests.
 */

import { GraphQLError, GraphQLFormattedError } from "graphql";
import { Prisma } from "@prisma/client";

// Prisma's "An operation failed because it depends on one or more records
// that were required but not found." — raised by findFirstOrThrow /
// findUniqueOrThrow / update / delete when the target row is missing.
const RECORD_NOT_FOUND_CODE = "P2025";

/**
 * Pull the originating error out of a GraphQLError. Resolver errors are
 * wrapped by graphql-js, with the thrown error stored on `originalError`.
 */
function getOriginalError(error: GraphQLError): unknown {
  return error.originalError ?? error;
}

function isRecordNotFound(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === RECORD_NOT_FOUND_CODE
  );
}

/**
 * Build the friendly message from a P2025 error. Prisma stores the model name
 * on `meta.modelName` (e.g. "Role" → "No Role found").
 */
function notFoundMessage(
  error: Prisma.PrismaClientKnownRequestError,
): string {
  const modelName =
    (error.meta as { modelName?: string } | undefined)?.modelName ?? "record";
  return `No ${modelName} found`;
}

/**
 * Normalise a single GraphQLError. Returns a new GraphQLError with a clean
 * message when the cause is a Prisma "record not found", otherwise returns the
 * error untouched.
 */
export function formatGraphQLError(error: GraphQLError): GraphQLError {
  const original = getOriginalError(error);

  if (isRecordNotFound(original)) {
    return new GraphQLError(notFoundMessage(original), {
      nodes: error.nodes,
      source: error.source,
      positions: error.positions,
      path: error.path,
      extensions: { code: "NOT_FOUND" },
    });
  }

  return error;
}

/**
 * Apollo `formatError` adapter. Apollo passes both the already-formatted
 * payload and the original error; we re-run our mapping against the original
 * so the wire message stays clean.
 */
export function formatApolloError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  if (error instanceof GraphQLError && isRecordNotFound(getOriginalError(error))) {
    return {
      ...formattedError,
      message: notFoundMessage(
        getOriginalError(error) as Prisma.PrismaClientKnownRequestError,
      ),
      extensions: { ...formattedError.extensions, code: "NOT_FOUND" },
    };
  }

  return formattedError;
}
