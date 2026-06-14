/**
 * The `/mcp` endpoint — the Orcha MCP server's HTTP face.
 *
 * A coding agent connects here with a Personal Access Token and drives the
 * Orcha tools over the Model Context Protocol. Like `/v1`, this is a thin shell:
 * authenticate the PAT, run the agent's tool calls as that role through the
 * shared GraphQL core, and translate the result back. No business logic lives
 * here.
 *
 * Exports:
 *  - mcpRouter: mount under `${apiPathPrefix}/mcp` (see app.ts), ahead of the
 *    session middleware so an MCP request never acquires a session cookie.
 *
 * Why stateless, and why a fresh server+transport per request: the Streamable
 * HTTP transport in stateless mode keeps NO session — each request is fully
 * self-contained, which suits a PAT-authenticated, request/response tool call.
 * Building a new McpServer + transport per request is the SDK's documented
 * stateless pattern: it avoids JSON-RPC request-id collisions between
 * concurrent clients sharing one server, at the cost of registering two tools
 * per request (cheap). The pair is torn down when the response closes.
 *
 * No CORS, by design — same reasoning as `/v1` (rest/router.ts): a PAT is a
 * long-lived secret with no business in browser code.
 */

import { Router, json as jsonBodyParser, Request, Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpBearerAuth } from "./bearerAuth";
import { tokenRateLimiter } from "../rest/tokenRateLimiter";
import { registerReadTools } from "./tools";

export const mcpRouter = Router();

// Tool-call payloads are JSON-RPC; the transport reads the pre-parsed body.
mcpRouter.use(jsonBodyParser());

const SERVER_INFO = { name: "orcha", version: "0.1.0" };

// One handler for every method: the stateless transport answers POST (tool
// calls) and returns 405 for GET/DELETE (no streams or sessions to manage).
// Auth + the shared per-token rate limit run first, so an invalid token is
// refused before any MCP machinery spins up.
async function handle(req: Request, res: Response): Promise<void> {
  const server = new McpServer(SERVER_INFO);
  registerReadTools(server, req.mcpRole!);

  const transport = new StreamableHTTPServerTransport({
    // Stateless: no session id is issued and none is validated.
    sessionIdGenerator: undefined,
    // Plain JSON request/response — no SSE stream for a unary tool call.
    enableJsonResponse: true,
  });

  // Tear the per-request pair down once the response is done, so neither the
  // server nor the transport outlives the request that created it.
  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

mcpRouter.all("/", mcpBearerAuth, tokenRateLimiter, handle);
