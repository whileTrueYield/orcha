/**
 * End-to-end tests for the MCP read surface (#71) — the seven tools an agent
 * uses to find and understand work, exercised through the real MCP client over
 * a live HTTP listener (bearer auth → stateless transport → tool →
 * runOperation → GraphQL schema).
 *
 * The contract pinned here is what an integrating agent actually sees: each
 * tool is tenant-scoped to the PAT's role (a foreign-tenant id is NOT FOUND),
 * lists filter and paginate with plain offset/limit, and detail tools return
 * the flat, version-bearing shapes an agent needs to act. The spine's own two
 * tools (whoami, next_tickets) live in mcp.spec.ts.
 */

import expect from "expect";
import prisma from "../../prisma";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomProject,
  createScheduleItem,
} from "../../utils/testing";
import { saveBody } from "../../markdown/bodyRepository";
import { listen, connect, parse } from "./mcpClient";

// Run `body` with a connected client for `token`, tearing both down after.
async function withClient(
  token: { plaintext: string },
  body: (call: (name: string, args?: Record<string, unknown>) => Promise<any>) => Promise<void>,
): Promise<void> {
  const { url, server } = listen();
  const { client, transport } = await connect(url, token.plaintext);
  try {
    await body((name, args = {}) =>
      client.callTool({ name, arguments: args }),
    );
  } finally {
    await transport.close();
    server.close();
  }
}

describe("MCP read surface — tickets", () => {
  it("list_tickets filters by project", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);
    await createRandomTicket(token.organization, token.role, undefined, {
      project: { connect: { id: project.id } },
    });
    await createRandomTicket(token.organization, token.role, undefined, {
      project: { connect: { id: project.id } },
    });
    // A ticket in another project of the same org — must be filtered out.
    await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("list_tickets", { project: project.id });
      const page = parse(result);

      expect(page.totalCount).toBe(2);
      expect(page.tickets).toHaveLength(2);
      expect(page.tickets.every((t: any) => t.projectId === project.id)).toBe(
        true,
      );
    });
  });

  it("list_tickets paginates with offset/limit and nextOffset", async () => {
    const token = await getTestApiToken();
    for (let i = 0; i < 3; i++) {
      await createRandomTicket(token.organization, token.role);
    }

    await withClient(token, async (call) => {
      const first = parse(await call("list_tickets", { limit: 2 }));
      expect(first.tickets).toHaveLength(2);
      expect(first.totalCount).toBe(3);
      expect(first.hasMore).toBe(true);
      expect(first.nextOffset).toBe(2);

      const second = parse(
        await call("list_tickets", { limit: 2, offset: first.nextOffset }),
      );
      expect(second.tickets).toHaveLength(1);
      expect(second.hasMore).toBe(false);
      expect(second.nextOffset).toBeNull();
    });
  });

  it("is tenant-scoped: list_tickets never returns another org's tickets", async () => {
    const tokenA = await getTestApiToken();
    const tokenB = await getTestApiToken();
    const { ticket: onlyA } = await createRandomTicket(
      tokenA.organization,
      tokenA.role,
    );

    await withClient(tokenB, async (call) => {
      const page = parse(await call("list_tickets"));
      expect(page.tickets.map((t: any) => t.id)).not.toContain(onlyA.id);
    });
  });

  it("get_ticket returns detail with workflow states, edges, and body+version", async () => {
    const token = await getTestApiToken();
    const { ticket: ancestor } = await createRandomTicket(
      token.organization,
      token.role,
    );
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { ancestors: { connect: { id: ancestor.id } } },
    });
    await saveBody("ticket", ticket.id, "# Detail body\n", 0);

    await withClient(token, async (call) => {
      const detail = parse(await call("get_ticket", { id: ticket.id }));

      expect(detail.id).toBe(ticket.id);
      expect(detail.title).toBe(ticket.title);
      expect(Array.isArray(detail.workflowStates)).toBe(true);
      expect(detail.workflowStates.length).toBeGreaterThan(0);
      // Three-point estimates ride along each workflow state.
      expect(detail.workflowStates[0]).toHaveProperty("estimateMostLikely");
      expect(detail.ancestors.map((a: any) => a.id)).toContain(ancestor.id);
      expect(Array.isArray(detail.successors)).toBe(true);
      expect(detail.body).toEqual({ markdown: "# Detail body\n", version: 1 });
    });
  });

  it("get_ticket_body returns { markdown, version }", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await saveBody("ticket", ticket.id, "# Body only\n", 0);

    await withClient(token, async (call) => {
      const body = parse(await call("get_ticket_body", { id: ticket.id }));
      expect(body).toEqual({ markdown: "# Body only\n", version: 1 });
    });
  });

  it("get_ticket is NOT FOUND for a ticket in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(
      other.organization,
      other.role,
    );

    await withClient(token, async (call) => {
      const result = await call("get_ticket", { id: ticket.id });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("NOT_FOUND");
    });
  });
});

describe("MCP read surface — projects", () => {
  it("list_projects filters by search", async () => {
    const token = await getTestApiToken();
    await createRandomProject(token.organization, { name: "ZZ-FINDABLE-PROJECT" });
    await createRandomProject(token.organization);

    await withClient(token, async (call) => {
      const page = parse(await call("list_projects", { search: "FINDABLE" }));
      expect(page.projects).toHaveLength(1);
      expect(page.projects[0].name).toBe("ZZ-FINDABLE-PROJECT");
    });
  });

  it("list_projects filters by parent and paginates", async () => {
    const token = await getTestApiToken();
    const parent = await createRandomProject(token.organization);
    await createRandomProject(token.organization, {
      parent: { connect: { id: parent.id } },
    });
    await createRandomProject(token.organization, {
      parent: { connect: { id: parent.id } },
    });

    await withClient(token, async (call) => {
      const first = parse(
        await call("list_projects", { parent: parent.id, limit: 1 }),
      );
      expect(first.projects).toHaveLength(1);
      expect(first.totalCount).toBe(2);
      expect(first.hasMore).toBe(true);
      expect(first.nextOffset).toBe(1);
    });
  });

  it("get_project returns detail with hierarchy edges", async () => {
    const token = await getTestApiToken();
    const parent = await createRandomProject(token.organization, {
      name: "Parent",
    });
    const child = await createRandomProject(token.organization, {
      name: "Child",
      parent: { connect: { id: parent.id } },
    });

    await withClient(token, async (call) => {
      const detail = parse(await call("get_project", { id: parent.id }));
      expect(detail.id).toBe(parent.id);
      expect(detail.name).toBe("Parent");
      expect(detail.children.map((c: any) => c.id)).toContain(child.id);
    });
  });

  it("get_project_body returns { markdown, version }", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);
    await saveBody("project", project.id, "# Project body\n", 0);

    await withClient(token, async (call) => {
      const body = parse(await call("get_project_body", { id: project.id }));
      expect(body).toEqual({ markdown: "# Project body\n", version: 1 });
    });
  });

  it("get_project is NOT FOUND for a project in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const project = await createRandomProject(other.organization);

    await withClient(token, async (call) => {
      const result = await call("get_project", { id: project.id });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("NOT_FOUND");
    });
  });
});

describe("MCP read surface — schedule", () => {
  it("get_schedule returns the role's unfinished items with ticket ETAs", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await createScheduleItem(token.role, ticket, {
      stoppedAt: new Date(),
      done: false,
    });

    await withClient(token, async (call) => {
      const items = parse(await call("get_schedule"));
      expect(items).toHaveLength(1);
      expect(items[0].ticket.id).toBe(ticket.id);
      expect(items[0].ticket).toHaveProperty("eta");
      expect(items[0]).toHaveProperty("workflowState");
    });
  });

  it("get_schedule returns an empty list when there is no unfinished work", async () => {
    const token = await getTestApiToken();
    await withClient(token, async (call) => {
      expect(parse(await call("get_schedule"))).toEqual([]);
    });
  });
});
