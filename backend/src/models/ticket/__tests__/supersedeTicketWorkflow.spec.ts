/**
 * Tests for the supersedeTicketWorkflow mutation (issue #110, ADR 0010).
 *
 * Once a Ticket has logged work (any ScheduleItem) its workflow can no longer be
 * rewritten in place — that would make one Ticket misrepresent its own history.
 * Superseding instead closes the original as CANCELLED (keeping all its logged
 * work and deactivated plan as an immutable record) and continues the effort on
 * a new linked Ticket under the chosen workflow. The successor inherits the
 * intent fields and the dependency edges (so a dependent ends up waiting on the
 * successor) but re-enters estimation with fresh, unestimated stages.
 *
 * Authority is ADMIN/OWNER, matching updateTicketStage: superseding is a
 * lifecycle transition, not a member-level plan edit.
 */

import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  createRandomWorkflow,
  createScheduleItem,
} from "../../../utils/testing";
import { ModelStage, RoleType, TicketStatus } from "@prisma/client";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";

const supersedeTicketWorkflowMutation = `
mutation SupersedeTicketWorkflow($ticketId: Int!, $workflowId: Int!) {
  supersedeTicketWorkflow(ticketId: $ticketId, workflowId: $workflowId) {
    id
    status
    estimating
    title
    workflow {
      id
    }
    supersedes {
      id
    }
  }
}
`;

describe("supersedeTicketWorkflow", () => {
  it("cancels the worked original and creates a successor under the new workflow", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket, product } = await createRandomTicket(organization, role);

    // One real, elapsed work session — the line that turns a plan into a history
    // and routes a workflow change to the supersede path (ADR 0010).
    await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });

    expect(response.errors).not.toBeDefined();

    // The mutation returns the successor: fresh, re-entering estimation under the
    // target workflow, and linked back to the original via `supersedes`.
    const successor = response.data!.supersedeTicketWorkflow;
    expect(successor.id).not.toBe(ticket.id);
    expect(successor.status).toBe(TicketStatus.UNSCHEDULED);
    expect(successor.estimating).toBe(true);
    expect(successor.workflow).toEqual({ id: target.id });
    expect(successor.supersedes).toEqual([{ id: ticket.id }]);

    // The original is closed as the immutable record and points at the successor.
    const original = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
    });
    expect(original.status).toBe(TicketStatus.CANCELLED);
    expect(original.supersededById).toBe(successor.id);
    expect(original.closedAt).not.toBeNull();

    // The successor sits in the same product with fresh active stages for the
    // target workflow.
    const successorRow = await prisma.ticket.findUniqueOrThrow({
      where: { id: successor.id },
    });
    expect(successorRow.productId).toBe(product.id);

    const targetStates = await prisma.workflowState.findMany({
      where: { workflowId: target.id },
    });
    const freshStates = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: successor.id, isActive: true },
    });
    expect(freshStates.length).toBe(targetStates.length);
    expect(
      freshStates.every((s) =>
        targetStates.some((ts) => ts.id === s.workflowStateId),
      ),
    ).toBe(true);
    // The plan is fresh: no estimates carried over.
    expect(
      freshStates.every(
        (s) =>
          s.estimateMinimum === null &&
          s.estimateMostLikely === null &&
          s.estimateMaximum === null,
      ),
    ).toBe(true);
  });

  it("preserves every ScheduleItem on the cancelled original (cascade-safety regression)", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket, product, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    const scheduleItem = await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });
    expect(response.errors).not.toBeDefined();

    // The logged work survives — it is the immutable record of time spent. Its
    // open session is stopped (the honest close), but the row is never deleted.
    const survivingItem = await prisma.scheduleItem.findUnique({
      where: { id: scheduleItem.id },
    });
    expect(survivingItem).not.toBeNull();
    expect(survivingItem!.ticketId).toBe(ticket.id);
    expect(survivingItem!.stoppedAt).not.toBeNull();

    // The original plan rows ride along untouched on the original (deactivation
    // is not part of supersede — the whole ticket is closed instead).
    const survivingStates = await prisma.ticketWorkflowState.findMany({
      where: { id: { in: ticketWorkflowStates.map((s) => s.id) } },
    });
    expect(survivingStates.length).toBe(ticketWorkflowStates.length);
    expect(survivingStates.every((s) => s.ticketId === ticket.id)).toBe(true);
  });

  it("inherits the original's intent fields onto the successor", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const tag = await prisma.tag.create({
      data: {
        name: "carry-me",
        organization: { connect: { id: organization.id } },
        author: { connect: { id: role.id } },
      },
    });

    const { ticket, product } = await createRandomTicket(
      organization,
      role,
      undefined,
      {
        title: "Ship the thing",
        description: "the original intent",
        difficulty: 7,
        milestone: true,
        owner: { connect: { id: role.id } },
        tags: { connect: [{ id: tag.id }] },
      },
    );

    await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });
    expect(response.errors).not.toBeDefined();
    const successorId = response.data!.supersedeTicketWorkflow.id;

    const successor = await prisma.ticket.findUniqueOrThrow({
      where: { id: successorId },
      include: { tags: true },
    });
    expect(successor.title).toBe("Ship the thing");
    expect(successor.description).toBe("the original intent");
    expect(successor.difficulty).toBe(7);
    expect(successor.milestone).toBe(true);
    expect(successor.ownerId).toBe(role.id);
    expect(successor.tags.map((t) => t.id)).toEqual([tag.id]);

    // The successor does NOT inherit logged work — that stays with the original.
    const successorWork = await prisma.scheduleItem.count({
      where: { ticketId: successorId },
    });
    expect(successorWork).toBe(0);
  });

  it("carries the original's Markdown body onto the successor", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket, product } = await createRandomTicket(organization, role);

    // Seed a body on the original via the same store the write path uses.
    await prisma.ticketText.create({
      data: {
        ticket: { connect: { id: ticket.id } },
        markdown: "## Keep this body\n\nacross the supersede.",
        version: 1,
      },
    });

    await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });
    expect(response.errors).not.toBeDefined();
    const successorId = response.data!.supersedeTicketWorkflow.id;

    const successorText = await prisma.ticketText.findUnique({
      where: { ticketId: successorId },
    });
    expect(successorText?.markdown).toContain("Keep this body");
  });

  it("makes a dependent of the original wait on the successor (dependency inheritance)", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket: original, product } = await createRandomTicket(
      organization,
      role,
    );

    // An upstream the original depends on, and a downstream that depends on the
    // original — the two edges the successor must inherit.
    const { ticket: upstream } = await createRandomTicket(
      organization,
      role,
      product,
    );
    const { ticket: dependent } = await createRandomTicket(
      organization,
      role,
      product,
    );

    await prisma.ticket.update({
      where: { id: original.id },
      data: { ancestors: { connect: { id: upstream.id } } },
    });
    await prisma.ticket.update({
      where: { id: dependent.id },
      data: { ancestors: { connect: { id: original.id } } },
    });

    await createScheduleItem(role, original);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: original.id, workflowId: target.id },
      session,
    });
    expect(response.errors).not.toBeDefined();
    const successorId = response.data!.supersedeTicketWorkflow.id;

    // The successor waits on the same upstream...
    const successor = await prisma.ticket.findUniqueOrThrow({
      where: { id: successorId },
      include: { ancestors: true, successors: true },
    });
    expect(successor.ancestors.map((a) => a.id)).toEqual([upstream.id]);

    // ...and the dependent now waits on the successor (the inherited downstream
    // edge), so work doesn't get released early. The original's CANCELLED state
    // makes its own lingering edge read as satisfied.
    const dependentAfter = await prisma.ticket.findUniqueOrThrow({
      where: { id: dependent.id },
      include: { ancestors: true },
    });
    expect(dependentAfter.ancestors.map((a) => a.id)).toContain(successorId);
    expect(successor.successors.map((s) => s.id)).toContain(dependent.id);
  });

  it("rejects a member: only ADMIN/OWNER may supersede", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });

    expect(response.errors).toBeDefined();
    expect(get(response, "errors.0.message")).toContain(
      "needs to be admin or owner",
    );

    // Nothing happened: the original is untouched and no successor exists.
    const unchanged = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
    });
    expect(unchanged.status).not.toBe(TicketStatus.CANCELLED);
    expect(unchanged.supersededById).toBeNull();
  });

  it("rejects a ticket with no logged work (it should change in place instead)", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket, product } = await createRandomTicket(organization, role);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "This ticket has no logged work; change its workflow in place instead.",
    );

    const unchanged = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
    });
    expect(unchanged.status).not.toBe(TicketStatus.CANCELLED);
  });

  it("rejects a workflow that is not valid for the ticket's product", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket);

    const foreign = await createRandomWorkflow(organization, {
      isDefaultWorkflow: false,
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: foreign.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Workflow is not valid for this product",
    );
  });

  it("rejects superseding to the workflow the ticket already uses", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const { ticket, workflow } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket);

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: workflow.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Ticket already uses this workflow",
    );
  });
});
