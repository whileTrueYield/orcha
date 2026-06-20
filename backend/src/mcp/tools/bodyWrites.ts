/**
 * The Markdown body write tools: `update_ticket_body` and `update_project_body`.
 *
 * Markdown is the source of truth (ADR-0007), and a body is edited optimistically:
 * an agent reads `{ markdown, version }` (get_ticket_body / get_project_body, #71),
 * edits the Markdown, and writes it back conditioned on the `version` it read. The
 * distinctive contract is what happens when the body moved underneath that read —
 * the write is NEVER a silent overwrite. Instead the agent gets the CURRENT
 * `{ markdown, version }` back as a recognizable *conflict*, so it can rebase its
 * edit onto the latest body and retry. Both tools reuse the exact GraphQL document
 * their `/v1` twin uses (SAVE_DOCUMENT_BODY_OPERATION), run through the shared
 * `writeAs` core — which refuses a read-only token before the mutation runs — so
 * the MCP and REST faces can never drift.
 *
 * Exports:
 *  - registerBodyWriteTools(server, resolved): bind both tools to an McpServer,
 *    closed over the connection's resolved role. Writes are tenant-scoped for
 *    free — every mutation runs as `resolved.role`, which the resolvers scope.
 *
 * Result shape — a `status`-discriminated success/conflict, NOT an error:
 *  - { status: "ok",       markdown, version, warnings } — the write landed; the
 *    new version is what the next write conditions on.
 *  - { status: "conflict", markdown, version, warnings } — the body moved since
 *    `baseVersion`; nothing was written. `markdown`/`version` are the CURRENT
 *    body to rebase onto. The agent branches on `status`, so a conflict reads as
 *    an actionable outcome rather than the `{ code, message }` of a real fault
 *    (not-found, forbidden), which still surfaces as an `isError` tool error.
 *  - `warnings` carries any unresolved `@`-mentions the save reported, so an
 *    agent learns a mention did not land without parsing the Markdown back.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { SAVE_DOCUMENT_BODY_OPERATION } from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { writeAs, toolResult } from "./shared";

// The saveDocumentBody result: exactly one of `body` (write landed) or `conflict`
// (body moved) is present, plus any mention warnings. Mirrors the selection in
// SAVE_DOCUMENT_BODY_OPERATION.
interface SaveBodyResult {
  body: { markdown: string; version: number } | null;
  conflict: { markdown: string; version: number } | null;
  warnings: unknown[];
}

// Run the shared saveDocumentBody mutation as the connection's role and shape its
// result into the agent-facing, `status`-discriminated outcome. A genuine fault
// (read-only refusal, not-found, …) short-circuits to a tool error via writeAs;
// only an actual save reaches the body/conflict branch.
async function saveBody(
  resolved: ResolvedRole,
  documentType: "TICKET" | "PROJECT",
  documentId: number,
  markdown: string,
  baseVersion: number,
): Promise<CallToolResult> {
  const { data, error } = await writeAs(resolved, SAVE_DOCUMENT_BODY_OPERATION, {
    documentType,
    documentId,
    markdown,
    baseVersion,
  });
  if (error) return error;
  const result = data!.saveDocumentBody as SaveBodyResult;
  // A conflict is an expected outcome, not a fault: hand back the current body
  // (the rebase target) under a distinct status so nothing is silently lost.
  if (result.conflict) {
    return toolResult({ status: "conflict", ...result.conflict, warnings: result.warnings });
  }
  return toolResult({ status: "ok", ...result.body!, warnings: result.warnings });
}

// The shared when-to-call contract, specialised per document type. Spelled out so
// the agent's mental model of read-edit-write-rebase is the tool description.
function describe(noun: string, readTool: string): string {
  return (
    `Call this to replace a ${noun}'s entire Markdown body (send the whole ` +
    `body, not a fragment), conditioned on the \`baseVersion\` you read from ` +
    `\`${readTool}\`. If the body moved since then nothing is overwritten and ` +
    'you get `{ status: "conflict", markdown, version }` with the current body ' +
    "to rebase onto and retry — so always branch on `status`."
  );
}

// The input schema both tools share: which document, the new Markdown, and the
// version it was read at. Identical across types, so built once.
const bodyWriteInputSchema = (noun: string) => ({
  id: z.number().int().describe(`Id of the ${noun} whose body to write.`),
  markdown: z
    .string()
    .describe(`The full new Markdown body for the ${noun}.`),
  baseVersion: z
    .number()
    .int()
    .describe(
      "The body version you read and edited against (from the read tool). The " +
        "write conflicts if the body has moved past it.",
    ),
});

export function registerBodyWriteTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "update_ticket_body",
    {
      title: "Update a ticket's Markdown body",
      description: describe("ticket", "get_ticket_body"),
      inputSchema: bodyWriteInputSchema("ticket"),
    },
    async (args) =>
      saveBody(resolved, "TICKET", args.id, args.markdown, args.baseVersion),
  );

  server.registerTool(
    "update_project_body",
    {
      title: "Update a project's Markdown body",
      description: describe("project", "get_project_body"),
      inputSchema: bodyWriteInputSchema("project"),
    },
    async (args) =>
      saveBody(resolved, "PROJECT", args.id, args.markdown, args.baseVersion),
  );
}
