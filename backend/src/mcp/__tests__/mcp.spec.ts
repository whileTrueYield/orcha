/**
 * End-to-end tests for the `/mcp` endpoint — the MCP spine and its two read
 * tools, exercised through the real MCP client over a live HTTP listener.
 *
 * These drive the SDK's `Client` + Streamable-HTTP transport against a mounted
 * app (so the full stack runs: bearer auth → stateless transport → tool →
 * runOperation → GraphQL schema). The contract pinned here is what an
 * integrating agent actually sees: a valid PAT connects and the tools return
 * its tenant-scoped, LLM-shaped (flat) identity and work queue; a missing or
 * invalid token is refused at connection time.
 *
 * We talk to the SDK over a real port (app.listen(0)) rather than supertest so
 * the client's initialize handshake and JSON response handling run exactly as
 * they would for a remote agent — no hand-rolled JSON-RPC envelopes.
 */

import expect from "expect";
import { getTestApiToken, seedNextTicket } from "../../utils/testing";
import { listen, connect, parse } from "./mcpClient";

describe("MCP /mcp", () => {
  it("whoami returns the token's role, user, and organization", async () => {
    const { url, server } = listen();
    const token = await getTestApiToken();
    const { client, transport } = await connect(url, token.plaintext);

    try {
      const result = await client.callTool({ name: "whoami", arguments: {} });
      const who = parse(result);

      expect(who.role.id).toBe(token.role.id);
      expect(who.user.id).toBe(token.user.id);
      expect(who.user.email).toBe(token.user.email);
      expect(who.organization.id).toBe(token.organization.id);
      expect(who.readOnly).toBe(false);
    } finally {
      await transport.close();
      server.close();
    }
  });

  it("next_tickets returns the scheduler-ordered queue with nextState per ticket", async () => {
    const { url, server } = listen();
    const token = await getTestApiToken();
    const later = await seedNextTicket(token.organization, token.role, {
      start: 100,
    });
    const sooner = await seedNextTicket(token.organization, token.role, {
      start: 0,
    });
    const { client, transport } = await connect(url, token.plaintext);

    try {
      const result = await client.callTool({
        name: "next_tickets",
        arguments: {},
      });
      const tickets = parse(result);

      expect(tickets.map((t: any) => t.id)).toEqual([
        sooner.ticket.id,
        later.ticket.id,
      ]);
      // Flat shape: ticket fields hoisted, nextState carried alongside.
      expect(tickets[0]).toHaveProperty("title");
      expect(tickets[0].nextState).toHaveProperty("id");
      expect(tickets[0].nextState).toHaveProperty("name");
    } finally {
      await transport.close();
      server.close();
    }
  });

  it("is tenant-scoped: a token sees only its own organization's queue", async () => {
    const { url, server } = listen();
    const tokenA = await getTestApiToken();
    const tokenB = await getTestApiToken();
    const onlyA = await seedNextTicket(tokenA.organization, tokenA.role, {});
    const { client, transport } = await connect(url, tokenB.plaintext);

    try {
      const result = await client.callTool({
        name: "next_tickets",
        arguments: {},
      });
      const ids = parse(result).map((t: any) => t.id);
      expect(ids).not.toContain(onlyA.ticket.id);
    } finally {
      await transport.close();
      server.close();
    }
  });

  it("refuses a connection presenting an invalid token", async () => {
    const { url, server } = listen();
    try {
      await expect(connect(url, "orcha_pat_not_a_real_token")).rejects.toThrow();
    } finally {
      server.close();
    }
  });

  it("refuses a connection presenting no token", async () => {
    const { url, server } = listen();
    try {
      await expect(connect(url)).rejects.toThrow();
    } finally {
      server.close();
    }
  });
});
