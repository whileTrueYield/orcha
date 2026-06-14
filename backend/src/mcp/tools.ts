/**
 * The Orcha MCP read tools: `whoami` and `next_tickets`.
 *
 * These are the agent-core read surface — the first two tools an autonomous
 * coding agent calls to orient itself ("who am I?") and to pick up work ("what
 * next?"). Each reuses the exact GraphQL document its `/v1` twin uses (see
 * rest/operations.ts), run through the transport-agnostic `runOperation` core,
 * so the MCP and REST faces can never drift in what they return.
 *
 * Exports:
 *  - registerReadTools(server, resolved): bind both tools to an McpServer,
 *    closed over the connection's resolved role. The tools are tenant-scoped for
 *    free — every operation runs as `resolved.role`, which the resolvers scope.
 *
 * Two deliberate shaping choices for an LLM consumer:
 *  - Output is FLAT: ticket fields are hoisted to the top level, identity is a
 *    shallow object. A model reasons better over `{ id, title, nextState }` than
 *    over `{ ticket: { ... }, nextState: { ... } }`.
 *  - Output is a single `text` block of pretty JSON — the most broadly
 *    compatible MCP result shape across clients.
 *  // IDEA: once clients reliably consume `structuredContent` + `outputSchema`,
 *  // emit those too so a model gets a typed result instead of parsing text.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { runOperation, OperationError } from "../rest/runOperation";
import { ME_OPERATION, NEXT_TICKETS_OPERATION } from "../rest/operations";
import { ResolvedRole } from "./resolveRole";

// Wrap any JSON-serialisable payload as the single-text-block result the tools
// return. Pretty-printed so a human reading a transcript can follow along.
function toolResult(payload: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

// A failed operation surfaces to the agent as a tool error carrying the
// operation's message — the model sees *why* the call failed, not a dead stop.
function toolError(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

// Run an operation as the connection's role, mapping an OperationError to a tool
// error. Any other throw is a genuine fault and propagates to the transport.
async function readAs(
  resolved: ResolvedRole,
  document: string,
): Promise<{ data?: Record<string, any>; error?: CallToolResult }> {
  try {
    return { data: await runOperation(document, {}, resolved.role) };
  } catch (error) {
    if (error instanceof OperationError) {
      return { error: toolError(error.message) };
    }
    throw error;
  }
}

export function registerReadTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "whoami",
    {
      title: "Who am I?",
      description:
        "Call this FIRST, before reading or planning any work, to learn your " +
        "identity in Orcha: your role, the user and organization you act for, " +
        "and whether your access is read-only. Use it to confirm which tenant " +
        "you are operating in before anything else.",
    },
    async () => {
      const { data, error } = await readAs(resolved, ME_OPERATION);
      if (error) return error;
      const me = data!.me;
      // Flat identity: the nested `me` is already shallow; add the token's
      // capability so an agent knows up front whether it may write.
      return toolResult({
        status: me.status,
        role: me.role,
        user: me.user,
        organization: me.organization,
        readOnly: resolved.readOnly,
      });
    },
  );

  server.registerTool(
    "next_tickets",
    {
      title: "What should I work on next?",
      description:
        "Call this to decide what to work on next. Returns your work queue in " +
        "scheduler (MCTS) priority order: the tickets assigned to your role, " +
        "each with the next workflow state to advance it into (`nextState`). " +
        "The order is authoritative — start at the top. Takes no arguments.",
    },
    async () => {
      const { data, error } = await readAs(resolved, NEXT_TICKETS_OPERATION);
      if (error) return error;
      // Flatten each entry: hoist the ticket's fields and keep nextState beside
      // them, so the model gets a flat list of actionable items.
      const tickets = data!.myNextTickets.map(
        (entry: { ticket: Record<string, unknown>; nextState: unknown }) => ({
          ...entry.ticket,
          nextState: entry.nextState,
        }),
      );
      return toolResult(tickets);
    },
  );
}
