/**
 * The workflow discovery tool: `list_workflows`.
 *
 * A workflow is a named sequence of stages a ticket is pushed through; it is the
 * definition of what a ticket signs up for. An agent can only fill a ticket's
 * (optional) `workflowId` if it can first see the workflows and read their
 * intent — this tool is that eye. Each row carries the `name` + `description`
 * the agent matches the work against, and its ordered `states`, so the agent
 * sees the lifecycle (e.g. Design → Implement → Review) before committing.
 *
 * The `product` filter is the important one: a ticket's product constrains which
 * workflows it may attach, so passing the product an agent just chose returns
 * exactly the valid set `create_ticket` would accept — never a workflow the
 * create would reject. Reuses the shared `readAs` core, so tenant scoping comes
 * for free from the resolver.
 *
 * Exports:
 *  - registerWorkflowTools(server, resolved): bind `list_workflows` to an
 *    McpServer, closed over the connection's resolved role.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { WORKFLOWS_OPERATION } from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult, pageMeta } from "./shared";

export function registerWorkflowTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "list_workflows",
    {
      title: "Find workflows",
      description:
        "Call this to choose the workflow a ticket follows, matching the work " +
        "against each workflow's description and its stage sequence (`states`). " +
        "Pass `product` (from `list_products`) to get only the workflows that " +
        "product can attach, then pass the chosen id as `create_ticket`'s " +
        "`workflowId`.",
      inputSchema: {
        product: z
          .number()
          .int()
          .optional()
          .describe(
            "A product id (from list_products); narrows to the workflows that " +
              "product can attach.",
          ),
        search: z
          .string()
          .optional()
          .describe("Free-text search over the workflow name."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Page size (max 100). Omit for the server default."),
        offset: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe("How many to skip; pass `nextOffset` to read the next page."),
      },
    },
    async ({ product, search, limit, offset }) => {
      const skip = offset ?? 0;
      const { data, error } = await readAs(resolved, WORKFLOWS_OPERATION, {
        first: limit,
        offset: skip,
        search,
        productId: product,
      });
      if (error) return error;
      const page = data!.workflows;
      return toolResult({ workflows: page.nodes, ...pageMeta(page, skip) });
    },
  );
}
