/**
 * The identity read tool: `whoami`.
 *
 * The first tool an agent calls — it answers "who am I, and in which tenant?"
 * before any reading or planning. It reuses the exact GraphQL document its
 * `/v1/me` twin uses (rest/operations.ts), so the MCP and REST faces can never
 * drift in what they return.
 *
 * Exports:
 *  - registerIdentityTools(server, resolved): bind `whoami` to an McpServer,
 *    closed over the connection's resolved role.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ME_OPERATION } from "../../rest/operations";
import { ResolvedRole } from "../resolveRole";
import { readAs, toolResult } from "./shared";

export function registerIdentityTools(
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
}
