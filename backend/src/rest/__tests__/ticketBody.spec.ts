/**
 * Integration tests for the ticket body endpoints (#40).
 *
 * The body is Markdown (ADR 0007), read/written through the body repository and
 * exposed here with optimistic-concurrency semantics: a read returns the
 * Markdown plus an ETag (the version); a write supplies If-Match (the base
 * version) and either persists, auto-merges, or 409s. These ride the proven /v1
 * spine (bearer -> role context -> in-process GraphQL -> JSON).
 */

import request from "supertest";
import expect from "expect";
import { ModelStage, NotificationCategory } from "@prisma/client";
import prisma from "../../prisma";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomUserInOrg,
} from "../../utils/testing";
import { saveBody, getBody } from "../../markdown/bodyRepository";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("GET /v1/tickets/:id/body", () => {
  it("returns the ticket body Markdown with the version as its ETag", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const saved = await saveBody("ticket", ticket.id, "# Hello\n\nWorld", 0);
    expect(saved.ok).toBe(true);

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.markdown).toBe("# Hello\n\nWorld");
    expect(res.headers.etag).toBe('"1"');
  });

  it("reads an unwritten body as empty Markdown at version 0", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.markdown).toBe("");
    expect(res.headers.etag).toBe('"0"');
  });

  it("returns 404 for a ticket body in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(other.organization, other.role);
    await saveBody("ticket", ticket.id, "secret", 0);

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PUT /v1/tickets/:id/body", () => {
  it("persists a write whose If-Match matches the current version", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "# First\n\nbody" })
      .expect(200);

    // The body is stored as canonical Markdown (remark ensures a trailing
    // newline), so what comes back is the canonical form of what was sent.
    expect(res.body.markdown).toBe("# First\n\nbody\n");
    expect(res.headers.etag).toBe('"1"');

    // The write is durable: a follow-up read sees it at the new version.
    const read = await request(app())
      .get(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);
    expect(read.body.markdown).toBe("# First\n\nbody\n");
    expect(read.headers.etag).toBe('"1"');
  });

  it("auto-merges a stale write whose edits don't overlap", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const url = `/v1/tickets/${ticket.id}/body`;
    const send = (ifMatch: string, markdown: string) =>
      request(app())
        .put(url)
        .set("Authorization", auth(token.plaintext))
        .set("If-Match", ifMatch)
        .send({ markdown });

    // Seed three lines at v1.
    await send('"0"', "L1\nL2\nL3\n").expect(200);

    // Writer X edits the first line off v1 -> v2 (fast-forward).
    await send('"1"', "L1-x\nL2\nL3\n").expect(200);

    // Writer Y, still on the stale v1, edits the last line. Non-overlapping, so
    // it merges against X's change instead of conflicting.
    const merged = await send('"1"', "L1\nL2\nL3-y\n").expect(200);

    expect(merged.headers.etag).toBe('"3"');
    expect(merged.body.markdown).toBe("L1-x\nL2\nL3-y\n");
  });

  it("returns 409 with git-markered Markdown when edits overlap", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const url = `/v1/tickets/${ticket.id}/body`;
    const send = (ifMatch: string, markdown: string) =>
      request(app())
        .put(url)
        .set("Authorization", auth(token.plaintext))
        .set("If-Match", ifMatch)
        .send({ markdown });

    await send('"0"', "L1\nL2\nL3\n").expect(200);
    // Writer X rewrites the middle line off v1 -> v2.
    await send('"1"', "L1\nX2\nL3\n").expect(200);
    // Writer Y, stale on v1, rewrites the SAME line — a genuine overlap.
    const conflict = await send('"1"', "L1\nY2\nL3\n").expect(409);

    // The current version is the ETag the writer must rebase onto.
    expect(conflict.headers.etag).toBe('"2"');
    // Git-style conflict markers, with both competing edits present.
    expect(conflict.body.markdown).toContain("<<<<<<<");
    expect(conflict.body.markdown).toContain("=======");
    expect(conflict.body.markdown).toContain(">>>>>>>");
    expect(conflict.body.markdown).toContain("Y2");
    expect(conflict.body.markdown).toContain("X2");

    // A conflict writes nothing: the body is still X's v2.
    const read = await request(app())
      .get(url)
      .set("Authorization", auth(token.plaintext))
      .expect(200);
    expect(read.headers.etag).toBe('"2"');
    expect(read.body.markdown).toBe("L1\nX2\nL3\n");
  });

  it("returns 404 when writing a ticket body in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(other.organization, other.role);

    const res = await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "intruder" })
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
    // Nothing was written to the victim's body.
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });

  it("rejects a write with no If-Match (428) and a non-string body (400)", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);
    const url = `/v1/tickets/${ticket.id}/body`;

    await request(app())
      .put(url)
      .set("Authorization", auth(token.plaintext))
      .send({ markdown: "no precondition" })
      .expect(428);

    await request(app())
      .put(url)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ notMarkdown: true })
      .expect(400);
  });

  it("resolves a mention to a directive, notifies the Role, and warns on an unknown one", async () => {
    const token = await getTestApiToken();
    const { role: alice } = await createRandomUserInOrg(token.organization);
    // The loose `@name` matcher is single-token; give Alice a one-word name.
    await prisma.role.update({ where: { id: alice.id }, data: { name: "alice" } });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "ping @alice and @nobody\n" })
      .expect(200);

    // @alice resolved to an id-bearing directive in the stored body...
    expect(res.body.markdown).toContain(`:mention[alice]{#${alice.id}`);
    // ...while @nobody is surfaced as a warning, never guessed.
    expect(res.body.warnings).toEqual([
      { kind: "unknown", reference: "@nobody", matches: null },
    ]);

    // A MENTION notification fired for the resolved Role.
    const notifications = await prisma.notification.findMany({
      where: { roleId: alice.id, category: NotificationCategory.MENTION },
    });
    expect(notifications.length).toBe(1);
  });

  it("repopulates indexableContent from the saved Markdown", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "# Heading\n\nSearchable sentence here.\n" })
      .expect(200);

    const row = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      select: { indexableContent: true },
    });
    expect(row?.indexableContent).toContain("Searchable sentence here.");
    expect(row?.indexableContent).toContain("Heading");
  });

  it("rejects a write to an archived (read-only) ticket with 403", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(
      token.organization,
      token.role,
      undefined,
      { stage: ModelStage.ARCHIVED },
    );

    const res = await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "should not persist" })
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });
});

describe("read-only tokens on the body write surface", () => {
  it("rejects a body write from a read-only token with 403, writing nothing", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .put(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .set("If-Match", '"0"')
      .send({ markdown: "read-only should not persist" })
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });

  it("still lets a read-only token read a body", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await saveBody("ticket", ticket.id, "readable\n", 0);

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}/body`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.markdown).toBe("readable\n");
  });
});
