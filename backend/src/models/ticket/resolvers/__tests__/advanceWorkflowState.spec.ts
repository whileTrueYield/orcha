/**
 * Black-box tests for the advanceTicketWorkflowState mutation.
 *
 * Asserts the agent-facing single-call workflow advance: handoff to the next
 * (or an explicit) stage, completion on the last stage, note recording on the
 * target stage, and tenant isolation. All assertions go through the mutation;
 * we only read the database to confirm the side effects the mutation is
 * responsible for.
 *
 * Run with: make test-backend TEST="advance"  (mocha -g advance)
 */

import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../../utils/testing";
import { RoleType, TicketStatus } from "@prisma/client";
import prisma from "../../../../prisma";
import expect from "expect";
import "mocha";

const advanceMutation = `
mutation Advance($ticketId: Int!, $toTicketWorkflowStateId: Int, $note: String) {
  advanceTicketWorkflowState(
    ticketId: $ticketId
    toTicketWorkflowStateId: $toTicketWorkflowStateId
    note: $note
  ) {
    id
    status
    closingNote
  }
}
`;

describe("advance ticket workflow state", () => {
  it("advances to the next stage by position when no target is given", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data?.advanceTicketWorkflowState.status).toBe(
      TicketStatus.SCHEDULED,
    );

    // A handoff schedule item must point to the second stage (next by position).
    const handoff = await prisma.scheduleItem.findFirst({
      where: {
        ticketId: ticket.id,
        nextTicketWorkflowStateId: ticketWorkflowStates[1].id,
      },
    });
    expect(handoff).not.toBeNull();
    expect(handoff?.ticketWorkflowStateId).toBe(ticketWorkflowStates[0].id);
    expect(handoff?.done).toBe(true);
  });

  it("marks the ticket DONE when advancing past the last stage", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // Move the caller's current stage to the last one via an explicit target,
    // then advance again with no target to finish.
    const lastState = ticketWorkflowStates[ticketWorkflowStates.length - 1];

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: {
        ticketId: ticket.id,
        toTicketWorkflowStateId: lastState.id,
      },
      session,
    });
    expect(response.errors).not.toBeDefined();

    const finish = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id, note: "all wrapped up" },
      session,
    });

    expect(finish.errors).not.toBeDefined();
    expect(finish.data?.advanceTicketWorkflowState.status).toBe(
      TicketStatus.DONE,
    );
    expect(finish.data?.advanceTicketWorkflowState.closingNote).toBe(
      "all wrapped up",
    );
  });

  it("skips a disabled stage and hands off to the next active one", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // Disable the middle stage (as a workflow with a turned-off stage would).
    // Advancing from the first stage must skip it and land on the third — the
    // next ENABLED stage by position — never the disabled middle.
    const [first, middle, third] = ticketWorkflowStates;
    await prisma.ticketWorkflowState.update({
      where: { id: middle.id },
      data: { isActive: false },
    });

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data?.advanceTicketWorkflowState.status).toBe(
      TicketStatus.SCHEDULED,
    );

    // Handoff points at the third (next active) stage...
    const handoff = await prisma.scheduleItem.findFirst({
      where: { ticketId: ticket.id, nextTicketWorkflowStateId: third.id },
    });
    expect(handoff).not.toBeNull();
    expect(handoff?.ticketWorkflowStateId).toBe(first.id);

    // ...and NOT at the disabled middle stage.
    const intoDisabled = await prisma.scheduleItem.findFirst({
      where: { ticketId: ticket.id, nextTicketWorkflowStateId: middle.id },
    });
    expect(intoDisabled).toBeNull();
  });

  it("completes the ticket when the only stage ahead is disabled", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // The #3/#5 scenario: the final stage (e.g. a disabled "Peer Review") is
    // turned off. Sitting on the second-to-last stage and advancing must
    // complete the ticket — there is no enabled stage ahead to hand off to —
    // rather than handing off into the disabled stage and stalling SCHEDULED.
    const secondToLast =
      ticketWorkflowStates[ticketWorkflowStates.length - 2];
    const last = ticketWorkflowStates[ticketWorkflowStates.length - 1];
    await prisma.ticketWorkflowState.update({
      where: { id: last.id },
      data: { isActive: false },
    });

    // Move the caller onto the second-to-last (still enabled) stage first.
    await graphqlRequest({
      source: advanceMutation,
      variableValues: {
        ticketId: ticket.id,
        toTicketWorkflowStateId: secondToLast.id,
      },
      session,
    });

    const finish = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id, note: "all wrapped up" },
      session,
    });

    expect(finish.errors).not.toBeDefined();
    expect(finish.data?.advanceTicketWorkflowState.status).toBe(
      TicketStatus.DONE,
    );
  });

  it("hands off to an explicit (non-adjacent) target stage", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // createRandomTicket builds 3 ordered states; jump straight to the third.
    const target = ticketWorkflowStates[2];

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: {
        ticketId: ticket.id,
        toTicketWorkflowStateId: target.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data?.advanceTicketWorkflowState.status).toBe(
      TicketStatus.SCHEDULED,
    );

    const handoff = await prisma.scheduleItem.findFirst({
      where: { ticketId: ticket.id, nextTicketWorkflowStateId: target.id },
    });
    expect(handoff).not.toBeNull();
  });

  it("records a note as a TicketWorkflowStateNote on the target stage", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id, note: "please review carefully" },
      session,
    });

    const note = await prisma.ticketWorkflowStateNote.findFirst({
      where: { ticketWorkflowStateId: ticketWorkflowStates[1].id },
    });
    expect(note).not.toBeNull();
    expect(note?.body).toBe("please review carefully");
    expect(note?.fromTicketWorkflowStateId).toBe(ticketWorkflowStates[0].id);
    expect(note?.authorId).toBe(role.id);
  });

  it("does not let another org advance a ticket it does not own", async () => {
    const { organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket } = await createRandomTicket(organization, role);

    // A completely separate org/session must not see this ticket.
    const { session: otherSession } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id },
      session: otherSession,
    });

    expect(response.errors).toBeDefined();
    expect(response.data?.advanceTicketWorkflowState).toBeFalsy();
  });

  it("refuses to advance a ticket that is not SCHEDULED", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket } = await createRandomTicket(organization, role, undefined, {
      status: TicketStatus.UNSCHEDULED,
    });

    const response = await graphqlRequest({
      source: advanceMutation,
      variableValues: { ticketId: ticket.id },
      session,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors?.[0].message).toMatch(/scheduled/i);
  });
});
