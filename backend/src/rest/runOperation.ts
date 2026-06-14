/**
 * The transport-agnostic operation core shared by every public face of the API.
 *
 * `/v1` (REST) and `/mcp` (MCP) are both thin translations over the same
 * GraphQL schema. This module is the seam they share: run a GraphQL operation
 * under a role context and return its `data`, or throw a typed `OperationError`
 * carrying the GraphQL `extensions.code` and message. It deliberately knows
 * nothing about HTTP status codes or MCP tool envelopes — each transport maps
 * the thrown error into its own failure shape (see errorEnvelope.ts for `/v1`'s
 * code→status mapping, and the MCP tools for the tool-error mapping).
 *
 * Exports:
 *  - OperationError: a failed operation, `{ code, message }` lifted from the
 *    first GraphQL error.
 *  - runOperation(document, variables, role) → data | throw OperationError.
 *
 * Why the FIRST error decides the code: a GraphQL response may carry several
 * errors, but a caller needs one primary failure. The first error is the
 * operation's primary failure — the same choice errorEnvelope.toEnvelope makes.
 */

import { execute } from "./executor";
import { AuthRoleContext } from "../types";

// The fallback code when a GraphQL error carries no `extensions.code` — an
// unexpected server fault rather than a recognised client error.
const INTERNAL_ERROR_CODE = "INTERNAL";

export class OperationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "OperationError";
  }
}

export async function runOperation(
  document: string,
  variables: Record<string, unknown>,
  role: AuthRoleContext,
): Promise<Record<string, any>> {
  const { data, errors } = await execute({ document, variables, me: role });

  if (errors && errors.length > 0) {
    const [primary] = errors;
    const code =
      (primary?.extensions?.code as string | undefined) ?? INTERNAL_ERROR_CODE;
    throw new OperationError(code, primary?.message ?? "Internal server error");
  }

  return data ?? {};
}
