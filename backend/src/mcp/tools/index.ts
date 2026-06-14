/**
 * The Orcha MCP read surface — the composition root that binds every read tool
 * to a per-request McpServer.
 *
 * An agent reads before it acts: it orients (`whoami`), finds and understands
 * work (the ticket and project tools), and checks what it is on the hook for
 * (`get_schedule`). Each domain registers its own tools (see ./identity,
 * ./tickets, ./projects, ./schedule); this module just composes them in the
 * order an agent meets them. Every tool reuses the GraphQL document its `/v1`
 * twin uses, run as the connection's resolved role, so MCP and REST never drift
 * and tenant scoping comes for free from the resolvers.
 *
 * Exports:
 *  - registerReadTools(server, resolved): bind all read tools to the server,
 *    closed over the connection's resolved role.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResolvedRole } from "../resolveRole";
import { registerIdentityTools } from "./identity";
import { registerTicketTools } from "./tickets";
import { registerProjectTools } from "./projects";
import { registerScheduleTools } from "./schedule";

export function registerReadTools(
  server: McpServer,
  resolved: ResolvedRole,
): void {
  registerIdentityTools(server, resolved);
  registerTicketTools(server, resolved);
  registerProjectTools(server, resolved);
  registerScheduleTools(server, resolved);
}
