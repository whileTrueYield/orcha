/**
 * End-to-end tests for the MCP Markdown body write tools (#74) — `update_ticket_body`
 * and `update_project_body`, exercised through the real MCP client over a live HTTP
 * listener (bearer auth → stateless transport → tool → runOperation → GraphQL schema).
 *
 * The contract pinned here is the read-edit-write-rebase loop an agent actually runs:
 * a write conditioned on the version it read lands and bumps the version; a write
 * whose edits overlap a concurrent change comes back as a distinct `status: "conflict"`
 * carrying the CURRENT body (never a silent overwrite, never a generic error), so the
 * agent can rebase and retry; unresolved `@`-mentions surface as warnings; and a
 * read-only PAT is refused before any save runs. The body-READ tools live in
 * readTools.spec.ts; the other write tools in writeTools.spec.ts / transitionTool.spec.ts.
 */

import expect from "expect";
import prisma from "../../prisma";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomProject,
  createRandomUserInOrg,
} from "../../utils/testing";
import { getBody } from "../../markdown/bodyRepository";
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

describe("MCP update_ticket_body — conditional write", () => {
  it("writes conditionally on the version it read and returns the new version", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      // Read the body the agent will edit against (an unwritten body is v0).
      const read = parse(await call("get_ticket_body", { id: ticket.id }));
      expect(read.version).toBe(0);

      const ok = parse(
        await call("update_ticket_body", {
          id: ticket.id,
          markdown: "# First\n\nbody\n",
          baseVersion: read.version,
        }),
      );
      expect(ok.status).toBe("ok");
      expect(ok.version).toBe(1);
      expect(ok.markdown).toBe("# First\n\nbody\n");

      // Durable: the next read sees the write at the new version.
      const reread = parse(await call("get_ticket_body", { id: ticket.id }));
      expect(reread.version).toBe(1);
      expect(reread.markdown).toBe("# First\n\nbody\n");
    });
  });

  it("reports an overlapping concurrent edit as a conflict carrying the current body", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const write = (markdown: string, baseVersion: number) =>
        call("update_ticket_body", { id: ticket.id, markdown, baseVersion });

      // Seed three lines at v1; the agent reads this as its base.
      const seeded = parse(await write("L1\nL2\nL3\n", 0));
      expect(seeded.status).toBe("ok");
      expect(seeded.version).toBe(1);

      // A concurrent writer edits the middle line off v1 -> v2, moving the body
      // out from under our agent (still holding v1).
      const concurrent = parse(await write("L1\nX2\nL3\n", 1));
      expect(concurrent.status).toBe("ok");
      expect(concurrent.version).toBe(2);

      // Our agent, stale on v1, rewrites the SAME line — a genuine overlap. The
      // write must NOT overwrite: it comes back as a conflict with the current
      // body (v2) to rebase onto, never a generic { code, message } error.
      const conflict = await write("L1\nY2\nL3\n", 1);
      expect(conflict.isError).toBeFalsy();
      const payload = parse(conflict);
      expect(payload.status).toBe("conflict");
      expect(payload.version).toBe(2);
      // The current body carries both competing edits as git-style markers.
      expect(payload.markdown).toContain("<<<<<<<");
      expect(payload.markdown).toContain("X2");
      expect(payload.markdown).toContain("Y2");

      // The conflict wrote nothing: the stored body is still the concurrent v2.
      const stored = parse(await call("get_ticket_body", { id: ticket.id }));
      expect(stored.version).toBe(2);
      expect(stored.markdown).toBe("L1\nX2\nL3\n");
    });
  });

  it("surfaces an unresolved @-mention as a warning", async () => {
    const token = await getTestApiToken();
    const { role: alice } = await createRandomUserInOrg(token.organization);
    // The loose `@name` matcher is single-token; give Alice a one-word name.
    await prisma.role.update({ where: { id: alice.id }, data: { name: "alice" } });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = parse(
        await call("update_ticket_body", {
          id: ticket.id,
          markdown: "ping @alice and @nobody\n",
          baseVersion: 0,
        }),
      );
      expect(result.status).toBe("ok");
      // @alice resolved into the stored body; @nobody is surfaced, never guessed.
      expect(result.markdown).toContain(`:mention[alice]{#${alice.id}`);
      expect(result.warnings).toEqual([
        { kind: "unknown", reference: "@nobody", matches: null },
      ]);
    });
  });
});

describe("MCP update_project_body — conditional write", () => {
  it("writes a project body conditionally and conflicts on an overlapping stale write", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);

    await withClient(token, async (call) => {
      const write = (markdown: string, baseVersion: number) =>
        call("update_project_body", { id: project.id, markdown, baseVersion });

      const seeded = parse(await write("P1\nP2\nP3\n", 0));
      expect(seeded.status).toBe("ok");
      expect(seeded.version).toBe(1);

      // Concurrent edit moves it to v2; our stale-on-v1 overlapping write conflicts.
      const concurrent = parse(await write("P1\nQ2\nP3\n", 1));
      expect(concurrent.version).toBe(2);

      const conflict = parse(await write("P1\nR2\nP3\n", 1));
      expect(conflict.status).toBe("conflict");
      expect(conflict.version).toBe(2);
      expect(conflict.markdown).toContain("<<<<<<<");
    });
  });
});

describe("MCP body writes — read-only refusal", () => {
  it("refuses update_ticket_body for a read-only PAT, writing nothing", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await withClient(token, async (call) => {
      const result = await call("update_ticket_body", {
        id: ticket.id,
        markdown: "read-only should not persist\n",
        baseVersion: 0,
      });
      expect(result.isError).toBe(true);
      expect(parse(result).code).toBe("FORBIDDEN");
    });

    // The save never ran: the body is still empty at version 0.
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });
});
