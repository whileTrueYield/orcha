/**
 * The schedule read tool: `get_schedule`.
 *
 * An agent's own outstanding scheduled work — the units it has been put on, and
 * when each is due. Reuses the exact GraphQL document its `/v1/schedule` twin
 * uses (rest/operations.ts), scoped to the caller's role, so it works for any
 * token including a read-only one.
 *
 * Exports:
 *  - registerScheduleTools(server, resolved): bind `get_schedule` to an
 *    McpServer, closed over the connection's resolved role.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SCHEDULE_OPERATION } from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult } from "./shared";

export function registerScheduleTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "get_schedule",
    {
      title: "What is on my schedule?",
      description:
        "Call this to see your own outstanding scheduled work and when each " +
        "item is due. Always scoped to you; takes no arguments.",
    },
    async () => {
      const { data, error } = await readAs(resolved, SCHEDULE_OPERATION);
      if (error) return error;
      // Rename the verbose `ticketWorkflowState` to `workflowState`; the rest of
      // each item is already a flat, agent-ready shape (the ETA lives on the
      // nested ticket).
      const items = data!.myUnfinishedScheduleItems.map(
        (item: { ticketWorkflowState: unknown; [key: string]: unknown }) => {
          const { ticketWorkflowState, ...rest } = item;
          return { ...rest, workflowState: ticketWorkflowState };
        },
      );
      return toolResult(items);
    },
  );
}
