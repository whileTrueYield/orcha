/**
 * Integration tests for the ticket read endpoints.
 *
 * These ride the proven /v1 spine (bearer → role context → in-process GraphQL
 * → JSON), so they focus on what's new for #26: tenant scoping of a list,
 * the documented filters + text search, opaque-cursor pagination, and the
 * detail endpoint's shape and 404 behavior.
 */

import request from "supertest";
import expect from "expect";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomProject,
} from "../../utils/testing";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("GET /v1/tickets", () => {
  it("returns only the caller's organization's tickets", async () => {
    const token = await getTestApiToken();
    await createRandomTicket(token.organization, token.role);
    await createRandomTicket(token.organization, token.role);

    // A ticket in a different organization must not leak in.
    const other = await getTestApiToken();
    await createRandomTicket(other.organization, other.role);

    const res = await request(app())
      .get("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.pageInfo.totalCount).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it("filters by project", async () => {
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

    const res = await request(app())
      .get(`/v1/tickets?project=${project.id}`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.pageInfo.totalCount).toBe(2);
    expect(res.body.data.every((t: any) => t.projectId === project.id)).toBe(
      true,
    );
  });

  it("matches a ticket by text search", async () => {
    const token = await getTestApiToken();
    await createRandomTicket(token.organization, token.role, undefined, {
      title: "ZZ-UNIQUE-SEARCHABLE-TITLE",
    });
    await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .get("/v1/tickets?search=UNIQUE-SEARCHABLE")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("ZZ-UNIQUE-SEARCHABLE-TITLE");
  });

  it("walks pages via the opaque cursor", async () => {
    const token = await getTestApiToken();
    for (let i = 0; i < 3; i++) {
      await createRandomTicket(token.organization, token.role);
    }

    const first = await request(app())
      .get("/v1/tickets?first=2")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(first.body.data).toHaveLength(2);
    expect(first.body.pageInfo.totalCount).toBe(3);
    expect(first.body.pageInfo.hasNextPage).toBe(true);
    expect(first.body.pageInfo.nextCursor).toEqual(expect.any(String));

    const second = await request(app())
      .get(`/v1/tickets?first=2&after=${first.body.pageInfo.nextCursor}`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(second.body.data).toHaveLength(1);
    expect(second.body.pageInfo.hasNextPage).toBe(false);
    expect(second.body.pageInfo.nextCursor).toBeNull();
  });

  it("rejects a malformed cursor with 400", async () => {
    const token = await getTestApiToken();

    const res = await request(app())
      .get("/v1/tickets?after=garbage")
      .set("Authorization", auth(token.plaintext))
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });
});

describe("GET /v1/tickets/:id", () => {
  it("returns a ticket's detail with its workflow states and dependency edges", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(
      token.organization,
      token.role,
    );

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.id).toBe(ticket.id);
    expect(res.body.title).toBe(ticket.title);
    expect(res.body).toHaveProperty("estimate");
    expect(res.body).toHaveProperty("eta");
    expect(Array.isArray(res.body.ticketWorkflowStates)).toBe(true);
    expect(res.body.ticketWorkflowStates.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.ancestors)).toBe(true);
    expect(Array.isArray(res.body.successors)).toBe(true);
  });

  it("returns 404 for a ticket in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(
      other.organization,
      other.role,
    );

    const res = await request(app())
      .get(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("read-only tokens on the read surface", () => {
  it("lets a read-only token read tickets (reads are always allowed)", async () => {
    const token = await getTestApiToken({ readOnly: true });
    await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .get("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);

    expect(res.body.pageInfo.totalCount).toBe(1);
  });
});
