/**
 * Shared shaping for the Orcha MCP read tools.
 *
 * Every tool answers in the same way, so the rules live here once: how a result
 * is wrapped, how a failed operation surfaces, how an operation is run as the
 * connection's role, and how an offset page is turned into an agent-friendly
 * slice. The per-domain tool modules (identity, tickets, projects, schedule)
 * import these and stay focused on *what* they read, not *how* it is packaged.
 *
 * Exports:
 *  - toolResult(payload): wrap any JSON-serialisable value as the single
 *    text-block result an MCP tool returns.
 *  - toolError(code, message): the failure shape — a `{ code, message }` block
 *    flagged `isError`, so an agent can branch on the machine code, not prose.
 *  - readAs(resolved, document, variables?): run a GraphQL operation as the
 *    connection's role, mapping an OperationError to a tool error.
 *  - writeAs(resolved, document, variables?): the mutating twin of readAs — it
 *    refuses a read-only token FIRST, before the operation runs, then executes.
 *  - pickPresent(args, allowed): build a GraphQL input from only the keys an
 *    agent actually supplied, so an omitted field stays untouched on a patch.
 *  - pageMeta(page, offset): the pagination fields an agent needs to walk a
 *    list — total, whether more remains, and the next `offset` to pass back.
 *
 * Two deliberate shaping choices for an LLM consumer:
 *  - Output is a single `text` block of pretty JSON — the most broadly
 *    compatible MCP result shape across clients.
 *  - Pagination is plain `offset`/`limit` integers, NOT the opaque REST cursor:
 *    a model can reason about and increment an offset; it cannot a cursor.
 *  // IDEA: once clients reliably consume `structuredContent` + `outputSchema`,
 *  // emit those too so a model gets a typed result instead of parsing text.
 */

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { runOperation, OperationError } from "../../rest/runOperation";
import { ResolvedRole } from "../resolveRole";

// Wrap any JSON-serialisable payload as the single-text-block result the tools
// return. Pretty-printed so a human reading a transcript can follow along.
export function toolResult(payload: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

// A failed operation surfaces to the agent as a tool error carrying the
// operation's code AND message — the model can branch on the stable `code`
// (e.g. NOT_FOUND) while a human reads the message.
export function toolError(code: string, message: string): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ code, message }) }],
    isError: true,
  };
}

// Run an operation as the connection's role, mapping an OperationError to a tool
// error. Any other throw is a genuine fault and propagates to the transport.
export async function readAs(
  resolved: ResolvedRole,
  document: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: Record<string, any>; error?: CallToolResult }> {
  try {
    return { data: await runOperation(document, variables, resolved.role) };
  } catch (error) {
    if (error instanceof OperationError) {
      return { error: toolError(error.code, error.message) };
    }
    throw error;
  }
}

// Run a mutating operation as the connection's role — the write twin of readAs.
// A write tool is "marked as a write" by going through here: a read-only token
// is refused with a FORBIDDEN tool error BEFORE the mutation runs, mirroring how
// rest/router.ts gates a `write: true` route. This is the single enforcement
// point the lifecycle and body-write slices reuse, so no write tool can forget
// the capability check. As in readAs, an OperationError maps to a tool error and
// any other throw is a genuine fault that propagates to the transport.
export async function writeAs(
  resolved: ResolvedRole,
  document: string,
  variables: Record<string, unknown> = {},
): Promise<{ data?: Record<string, any>; error?: CallToolResult }> {
  if (resolved.readOnly) {
    return {
      error: toolError(
        "FORBIDDEN",
        "This token is read-only and cannot perform writes.",
      ),
    };
  }
  try {
    return { data: await runOperation(document, variables, resolved.role) };
  } catch (error) {
    if (error instanceof OperationError) {
      return { error: toolError(error.code, error.message) };
    }
    throw error;
  }
}

// Build a GraphQL input object from ONLY the keys an agent actually supplied — a
// partial update that omits a field must leave it untouched, not send `undefined`
// the resolver could read as "clear it". `allowed` is the whitelist of input
// fields, so an unrecognised arg never leaks into the mutation. Mirrors the same
// helper in rest/router.ts; the caller decides what an empty result means.
export function pickPresent(
  args: Record<string, unknown>,
  allowed: readonly string[],
): Record<string, unknown> {
  const input: Record<string, unknown> = {};
  for (const key of allowed) {
    if (args[key] !== undefined) {
      input[key] = args[key];
    }
  }
  return input;
}

// The shape of a GraphQL offset page (see rest/operations.ts list operations).
interface GraphQLPage {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; pageSize: number };
  nodes: unknown[];
}

// Turn a GraphQL offset page into the pagination fields an agent walks a list
// with: the total, whether more remains, and the `offset` to pass back for the
// next page (null at the end). The caller spreads these beside its own named
// node list, e.g. `{ tickets: page.nodes, ...pageMeta(page, offset) }`.
export function pageMeta(
  page: GraphQLPage,
  offset: number,
): { totalCount: number; hasMore: boolean; nextOffset: number | null } {
  const { hasNextPage, pageSize } = page.pageInfo;
  return {
    totalCount: page.totalCount,
    hasMore: hasNextPage,
    nextOffset: hasNextPage ? offset + pageSize : null,
  };
}
