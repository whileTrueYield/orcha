/**
 * Integration tests for the ticket WRITE endpoints (#28).
 *
 * These ride the same /v1 spine the read endpoints proved (bearer → role
 * context → in-process GraphQL → JSON envelope), so they focus on what's new
 * for the write slice: the `{ write: true }` read-only refusal, the create /
 * patch input contracts, and the action-dispatched transition endpoint that
 * fans one POST out to five distinct GraphQL mutations.
 *
 * Every assertion is black-box through HTTP (supertest + a real PAT): the test
 * presents a token and reads the JSON the way an integrator would, so a drift
 * between the REST contract and the engine that backs it shows up here.
 */

import request from "supertest";
import expect from "expect";
import { TicketStatus } from "@prisma/client";
import { createExpressApp } from "../../app";
import {
  getTestApiToken,
  createRandomTicket,
  createRandomProject,
} from "../../utils/testing";
import prisma from "../../prisma";

const app = () => createExpressApp();
const auth = (plaintext: string) => `Bearer ${plaintext}`;

describe("POST /v1/tickets", () => {
  it("creates a ticket scoped to the token's organization", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);

    const res = await request(app())
      .post("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .send({ title: "Created via REST", projectId: project.id })
      .expect(201);

    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.title).toBe("Created via REST");
    expect(res.body.projectId).toBe(project.id);

    // It really landed in the caller's org, not just echoed back.
    const persisted = await prisma.ticket.findUnique({
      where: { id: res.body.id },
    });
    expect(persisted?.organizationId).toBe(token.organization.id);
  });

  it("rejects a missing title with 400", async () => {
    const token = await getTestApiToken();
    const project = await createRandomProject(token.organization);

    const res = await request(app())
      .post("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .send({ projectId: project.id })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("rejects a missing projectId with 400", async () => {
    const token = await getTestApiToken();

    const res = await request(app())
      .post("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .send({ title: "No project" })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });
});

describe("PATCH /v1/tickets/:id", () => {
  it("updates only the fields present in the body", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .patch(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .send({ title: "Patched title" })
      .expect(200);

    expect(res.body.id).toBe(ticket.id);
    expect(res.body.title).toBe("Patched title");

    const persisted = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(persisted?.title).toBe("Patched title");
  });

  it("rejects an empty body with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .patch(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .send({})
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("returns 404 for a ticket in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(other.organization, other.role);

    const res = await request(app())
      .patch(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .send({ title: "trying to reach across the tenant boundary" })
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");

    // The foreign ticket is untouched.
    const persisted = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });
    expect(persisted?.title).toBe(ticket.title);
  });
});

describe("POST /v1/tickets/:id/transition", () => {
  it("schedule moves an UNSCHEDULED ticket to SCHEDULED", async () => {
    const token = await getTestApiToken();
    // createRandomTicket yields a SCHEDULED ticket with ordered, assigned,
    // estimated active stages — exactly the precondition scheduleTicket needs.
    // We only roll the status back to UNSCHEDULED so there is a transition to make.
    const { ticket } = await createRandomTicket(token.organization, token.role);
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.UNSCHEDULED },
    });

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "schedule" })
      .expect(200);

    expect(res.body.id).toBe(ticket.id);
    expect(res.body.status).toBe("SCHEDULED");
  });

  it("advance with no toStageId moves to the next stage and stays SCHEDULED", async () => {
    const token = await getTestApiToken();
    // Three ordered stages; advancing once leaves work to do, so the ticket
    // stays SCHEDULED.
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "advance" })
      .expect(200);

    expect(res.body.id).toBe(ticket.id);
    expect(res.body.status).toBe("SCHEDULED");
  });

  it("advance past the last stage marks the ticket DONE", async () => {
    const token = await getTestApiToken();
    // Drive every stage to its end; the final advance completes the ticket.
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      token.organization,
      token.role,
    );

    let lastStatus = "SCHEDULED";
    for (let i = 0; i < ticketWorkflowStates.length; i++) {
      const res = await request(app())
        .post(`/v1/tickets/${ticket.id}/transition`)
        .set("Authorization", auth(token.plaintext))
        .send({ action: "advance" })
        .expect(200);
      lastStatus = res.body.status;
    }

    expect(lastStatus).toBe("DONE");
  });

  it("close with a note marks the ticket DONE", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "close", note: "Shipped it." })
      .expect(200);

    expect(res.body.id).toBe(ticket.id);
    expect(res.body.status).toBe("DONE");
  });

  it("close WITHOUT a note is refused with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "close" })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("cancel WITHOUT a note is refused with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "cancel" })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("cancel with a note marks the ticket CANCELLED", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "cancel", note: "Dropped from scope." })
      .expect(200);

    expect(res.body.status).toBe("CANCELLED");
  });

  it("start without a stageId is refused with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "start" })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("start with a stageId creates a schedule item on that stage", async () => {
    const token = await getTestApiToken();
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      token.organization,
      token.role,
    );
    const stage = ticketWorkflowStates[0];

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "start", stageId: stage.id })
      .expect(200);

    expect(res.body.id).toEqual(expect.any(Number));
    expect(res.body.ticketId).toBe(ticket.id);
    expect(res.body.ticketWorkflowStateId).toBe(stage.id);

    const persisted = await prisma.scheduleItem.findUnique({
      where: { id: res.body.id },
    });
    expect(persisted?.ticketId).toBe(ticket.id);
  });

  it("rejects an unknown action with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "teleport" })
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("rejects a missing action with 400", async () => {
    const token = await getTestApiToken();
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({})
      .expect(400);

    expect(res.body.error.code).toBe("BAD_USER_INPUT");
  });

  it("returns 404 transitioning a ticket in another organization", async () => {
    const token = await getTestApiToken();
    const other = await getTestApiToken();
    const { ticket } = await createRandomTicket(other.organization, other.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "close", note: "trying to close a foreign ticket" })
      .expect(404);

    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("read-only tokens on the write surface", () => {
  it("refuses POST /v1/tickets with 403", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const project = await createRandomProject(token.organization);

    const res = await request(app())
      .post("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .send({ title: "nope", projectId: project.id })
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("refuses PATCH /v1/tickets/:id with 403", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .patch(`/v1/tickets/${ticket.id}`)
      .set("Authorization", auth(token.plaintext))
      .send({ title: "nope" })
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("refuses POST /v1/tickets/:id/transition with 403", async () => {
    const token = await getTestApiToken({ readOnly: true });
    const { ticket } = await createRandomTicket(token.organization, token.role);

    const res = await request(app())
      .post(`/v1/tickets/${ticket.id}/transition`)
      .set("Authorization", auth(token.plaintext))
      .send({ action: "schedule" })
      .expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("still lets the same read-only token READ tickets (200) — it's the write flag, not the token", async () => {
    const token = await getTestApiToken({ readOnly: true });
    await createRandomTicket(token.organization, token.role);

    await request(app())
      .get("/v1/tickets")
      .set("Authorization", auth(token.plaintext))
      .expect(200);
  });
});

describe("ticket write endpoints in the OpenAPI spec", () => {
  it("documents the create, patch, and transition routes", async () => {
    const res = await request(app()).get("/v1/openapi.json").expect(200);

    expect(res.body.paths["/v1/tickets"].post).toBeDefined();
    expect(res.body.paths["/v1/tickets/{id}"].patch).toBeDefined();
    expect(
      res.body.paths["/v1/tickets/{id}/transition"].post,
    ).toBeDefined();
  });
});
