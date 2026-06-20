/**
 * The product discovery tool: `list_products`.
 *
 * A ticket optionally belongs to a product, but an agent can only fill that
 * `productId` if it can first see what products exist — this tool is that eye.
 * Each row carries the descriptive signal an agent matches a ticket against
 * (`name`, `code`, `description`) plus the workflow hints (`workflowIds`,
 * `isUsingDefaultWorkflows`) it needs to then pick a workflow. It reuses the
 * shared `readAs` core, so tenant scoping comes for free from the resolver.
 *
 * Exports:
 *  - registerProductTools(server, resolved): bind `list_products` to an
 *    McpServer, closed over the connection's resolved role.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PRODUCTS_OPERATION } from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult, pageMeta } from "./shared";

export function registerProductTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "list_products",
    {
      title: "Find products",
      description:
        "Call this to choose the product a new ticket belongs to, matching the " +
        "work against each product's name, code, and description. Pass the " +
        "chosen id as `create_ticket`'s `productId`, and to `list_workflows` " +
        "to see the workflows it can attach.",
      inputSchema: {
        search: z
          .string()
          .optional()
          .describe("Free-text search over the product name and code."),
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
    async ({ search, limit, offset }) => {
      const skip = offset ?? 0;
      const { data, error } = await readAs(resolved, PRODUCTS_OPERATION, {
        first: limit,
        offset: skip,
        search,
      });
      if (error) return error;
      const page = data!.products;
      return toolResult({ products: page.nodes, ...pageMeta(page, skip) });
    },
  );
}
