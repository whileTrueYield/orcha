/**
 * The project read tools: `list_projects`, `get_project`, and
 * `get_project_body`.
 *
 * Projects are the containers tickets live in; these let an agent find a
 * project, read its hierarchy, and read its Markdown body. Each reuses the
 * exact GraphQL document its `/v1` twin uses (rest/operations.ts), run through
 * the shared `readAs` core, so the MCP and REST faces can never drift.
 *
 * Exports:
 *  - registerProjectTools(server, resolved): bind all three tools to an
 *    McpServer, closed over the connection's resolved role. Tenant-scoped for
 *    free — every operation runs as `resolved.role`, which the resolvers scope.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  PROJECTS_OPERATION,
  PROJECT_OPERATION,
  PROJECT_BODY_OPERATION,
} from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult, pageMeta } from "./shared";

export function registerProjectTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  server.registerTool(
    "list_projects",
    {
      title: "Find projects",
      description:
        "Call this to find projects by name or position in the hierarchy. " +
        "Filter by a search string and/or a parent project id (its direct " +
        "children); any omitted filter is unconstrained. Results are " +
        "tenant-scoped and paginated: pass `limit` and `offset`, and walk " +
        "pages with the `nextOffset` from the response (null when no more).",
      inputSchema: {
        search: z
          .string()
          .optional()
          .describe("Free-text search over the project name and body."),
        parent: z
          .number()
          .int()
          .optional()
          .describe("Only the direct children of this project id."),
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
    async ({ search, parent, limit, offset }) => {
      const skip = offset ?? 0;
      const { data, error } = await readAs(resolved, PROJECTS_OPERATION, {
        first: limit,
        offset: skip,
        search,
        parentId: parent,
      });
      if (error) return error;
      const page = data!.projects;
      return toolResult({ projects: page.nodes, ...pageMeta(page, skip) });
    },
  );

  server.registerTool(
    "get_project",
    {
      title: "Get a project's detail",
      description:
        "Call this to understand a single project: its name, stage, duration, " +
        "and its hierarchy edges (`parent` and direct `children`). Use it to " +
        "navigate the project tree before listing or creating its tickets.",
      inputSchema: {
        id: z.number().int().describe("The project id."),
      },
    },
    async ({ id }) => {
      const { data, error } = await readAs(resolved, PROJECT_OPERATION, { id });
      if (error) return error;
      // The operation's selection is already flat (scalars + shallow parent /
      // children edges), so it IS the agent-facing shape.
      return toolResult(data!.project);
    },
  );

  server.registerTool(
    "get_project_body",
    {
      title: "Get a project's Markdown body",
      description:
        "Call this when you only need a project's Markdown body and its " +
        "version. Returns `{ markdown, version }`; the `version` is the value " +
        "a later body write must condition on, so read it immediately before " +
        "editing.",
      inputSchema: {
        id: z.number().int().describe("The project id."),
      },
    },
    async ({ id }) => {
      const { data, error } = await readAs(resolved, PROJECT_BODY_OPERATION, {
        id,
      });
      if (error) return error;
      return toolResult(data!.project.body);
    },
  );
}
