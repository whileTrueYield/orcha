/**
 * Shared MCP test client — drives the real SDK `Client` over a Streamable-HTTP
 * transport against a mounted app on an ephemeral port.
 *
 * Every `/mcp` end-to-end spec needs the same three moves: start the app on a
 * random port, connect a real client (with or without a bearer token), and
 * parse a tool's single-text-block result back to JSON. Gathering them here
 * keeps each spec about the tool under test, not the transport plumbing. We use
 * a real port + the SDK client (not supertest) so the initialize handshake and
 * JSON response handling run exactly as they would for a remote agent.
 *
 * NOT a `*.spec.ts` file, so the mocha glob never runs it as a suite.
 *
 * Exports:
 *  - listen(): start the app, returning the `/mcp` URL and the http server.
 *  - connect(url, bearer?): connect a client presenting `bearer` (omit for none).
 *  - parse(result): JSON-parse a tool result's first text content block.
 */

import { AddressInfo } from "net";
import { Server } from "http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createExpressApp } from "../../app";

// Start the app on an ephemeral port and return its `/mcp` URL plus the server
// (call `server.close()` to tear it down).
export function listen(): { url: URL; server: Server } {
  const server = createExpressApp().listen(0);
  const { port } = server.address() as AddressInfo;
  return { url: new URL(`http://127.0.0.1:${port}/mcp`), server };
}

// Connect a real MCP client presenting `bearer` (omit to send no Authorization).
export async function connect(
  url: URL,
  bearer?: string,
): Promise<{ client: Client; transport: StreamableHTTPClientTransport }> {
  const client = new Client({ name: "mcp-test-client", version: "0.0.0" });
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: bearer
      ? { headers: { Authorization: `Bearer ${bearer}` } }
      : undefined,
  });
  await client.connect(transport);
  return { client, transport };
}

// The tools return JSON as a single text content block; parse it back.
export function parse(result: any): any {
  return JSON.parse(result.content[0].text);
}
