/**
 * End-to-end tests for the MCP write surface (#72) — the first two write tools,
 * `create_ticket` and `update_ticket`, plus the read-only-refusal plumbing they
 * introduce, all exercised through the real MCP client over a live HTTP listener
 * (bearer auth → stateless transport → tool → runOperation → GraphQL schema).
 *
 * The contract pinned here is what an integrating agent actually sees: a create
 * round-trips into a readable ticket carrying the compact write shape; a partial
 * update touches only the fields it was given; an empty patch is refused with a
 * clear code rather than an opaque GraphQL error; and a read-only PAT is refused
 * on every write tool BEFORE any mutation runs. The read surface lives in
 * readTools.spec.ts; the spine's tools in mcp.spec.ts.
 */

import expect from "expect";
import prisma from "../../prisma";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomProject,
} from "../../utils/testing";
import { listen, connect, parse } from "./mcpClient";

// Run `body` with a connected client for `token`, tearing both down after.
async function withClient(
  token: { plaintext: string },
  body: (
    call: (name: string, args?: Record<string, unknown>) => Promise<any>,
  ) => Promise<void>,
): Promise<void> {
  const { url, server } = listen();
  const { client, transport } = await connect(url, token.plaintext);
  try {
    await body((name, args = {}) => client.callTool({ name, arguments: args }));
  } finally {
    await transport.close();
    server.close();
  }
}

// The compact write shape both tools return (TICKET_WRITE_SELECTION).
const WRITE_SHAPE_KEYS = [
  "id",
  "title",
  "status",
  "stage",
  "projectId",
  "estimate",
  "eta",
];

describe("MCP write surface — create_ticket", () => {
  it("creates a ticket and returns the compact write shape", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);

    await withClient(token, async (call) => {
      const created = parse(
        await call("create_ticket", {
          title: "Ship the thing",
          projectId: project.id,
        }),
      );

      for (const key of WRITE_SHAPE_KEYS) {
        expect(created).toHaveProperty(key);
      }
      expect(created.title).toBe("Ship the thing");
      expect(created.projectId).toBe(project.id);

      // Round-trip: the created id reads back as a real, tenant-scoped ticket.
      const detail = parse(await call("get_ticket", { id: created.id }));
      expect(detail.title).toBe("Ship the thing");
    });
  });

  it("seeds the body and owner in a single call", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);

    await withClient(token, async (call) => {
      const created = parse(
        await call("create_ticket", {
          title: "Fully formed",
          projectId: project.id,
          body: "## Spec\n\nThe whole thing in one round-trip.",
          ownerId: token.role.id,
        }),
      );

      // The body landed via the same write path update_ticket_body uses, so it
      // reads back through get_ticket_body without a follow-up write.
      const body = parse(await call("get_ticket_body", { id: created.id }));
      expect(body.markdown).toContain("The whole thing in one round-trip.");

      const persisted = await prisma.ticket.findUnique({
        where: { id: created.id },
      });
      expect(persisted!.ownerId).toBe(token.role.id);
    });
  });

  it("validates required fields at the tool boundary", async () => {
    const token = await getTestApiToken();

    await withClient(token, async (call) => {
      // A missing projectId is rejected by the tool's input schema, never
      // reaching the mutation as an opaque GraphQL variable error.
      const result = await call("create_ticket", { title: "No project" });
      expect(result.isError).toBe(true);
    });
  });

  it("is tenant-scoped: cannot create in another org's project", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const foreignProject = await createRandomProject(other.organization);

    await withClient(token, async (call) => {
      const result = await call("create_ticket", {
        title: "Trespassing",
        projectId: foreignProject.id,
      });
      expect(result.isError).toBe(true);
    });
  });
});

describe("MCP write surface — update_ticket", () => {
  it("applies only the provided fields, leaving omitted ones untouched", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const originalProjectId = ticket.projectId;

    await withClient(token, async (call) => {
      const updated = parse(
        await call("update_ticket", { id: ticket.id, title: "Renamed" }),
      );
      expect(updated.title).toBe("Renamed");
      // projectId was omitted from the patch — it must be left as it was.
      expect(updated.projectId).toBe(originalProjectId);
    });

    const persisted = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(persisted!.title).toBe("Renamed");
    expect(persisted!.projectId).toBe(originalProjectId);
  });

  it("rejects an empty patch with a clear error", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("update_ticket", { id: ticket.id });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("BAD_USER_INPUT");
    });
  });
});

describe("MCP write surface — read-only refusal", () => {
  it("refuses create_ticket for a read-only PAT before any mutation runs", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const project = await createRandomProject(token.organization);

    await withClient(token, async (call) => {
      const result = await call("create_ticket", {
        title: "Should not exist",
        projectId: project.id,
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("FORBIDDEN");
    });

    // The mutation never ran: no ticket was created in the project.
    const count = await prisma.ticket.count({
      where: { projectId: project.id },
    });
    expect(count).toBe(0);
  });

  it("refuses update_ticket for a read-only PAT, leaving the ticket untouched", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const originalTitle = ticket.title;

    await withClient(token, async (call) => {
      const result = await call("update_ticket", {
        id: ticket.id,
        title: "Hijacked",
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("FORBIDDEN");
    });

    const persisted = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(persisted!.title).toBe(originalTitle);
  });
});
