/**
 * Tests for the changeTicketWorkflow mutation (issue #109, ADR 0010).
 *
 * Changing a published Ticket's workflow when it has *no logged work* resets the
 * plan in place: the old TicketWorkflowState rows are deactivated (never
 * deleted — that would cascade-destroy logged work), fresh rows are created for
 * the new workflow's stages, and the Ticket re-enters estimation. The Ticket's
 * identity (id, localId, comments, watchers, dependency edges) is preserved.
 *
 * A Ticket that has logged work (any ScheduleItem) is rejected here — it routes
 * to the supersede path (issue #110), and crucially nothing is destroyed.
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

const changeTicketWorkflowMutation = `
mutation ChangeTicketWorkflow($ticketId: Int!, $workflowId: Int!) {
  changeTicketWorkflow(ticketId: $ticketId, workflowId: $workflowId) {
    id
    status
    estimating
    workflow {
      id
    }
  }
}
`;

describe("changeTicketWorkflow", () => {
  it("swaps a published ticket's workflow and re-enters estimation", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product, workflow } = await createRandomTicket(
      organization,
      role,
    );

    // A second workflow attached to the same product — a valid target.
    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.changeTicketWorkflow).toEqual({
      id: ticket.id,
      status: TicketStatus.UNSCHEDULED,
      estimating: true,
      workflow: { id: target.id },
    });

    // Old plan rows are deactivated, not deleted (cascade-safe move, ADR 0010).
    const oldStates = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: ticket.id, workflowState: { workflowId: workflow.id } },
    });
    expect(oldStates.length).toBeGreaterThan(0);
    expect(oldStates.every((s) => s.isActive === false)).toBe(true);

    // Fresh active rows exist for the target workflow's stages.
    const targetStates = await prisma.workflowState.findMany({
      where: { workflowId: target.id },
    });
    const freshStates = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: ticket.id, isActive: true },
    });
    expect(freshStates.length).toBe(targetStates.length);
    expect(
      freshStates.every((s) =>
        targetStates.some((ts) => ts.id === s.workflowStateId),
      ),
    ).toBe(true);
  });

  it("preserves the ticket's identity: id, localId, comments, watchers, dependency edges", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product } = await createRandomTicket(organization, role);

    // A dependency edge (ancestor), a watcher, and a comment — all of which must
    // survive a plan reset untouched.
    const { ticket: ancestor } = await createRandomTicket(
      organization,
      role,
      product,
    );
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        watchers: { connect: { id: role.id } },
        ancestors: { connect: { id: ancestor.id } },
      },
    });
    const comment = await prisma.comment.create({
      data: {
        body: "keep me",
        author: { connect: { id: role.id } },
        organization: { connect: { id: organization.id } },
        ticket: { connect: { id: ticket.id } },
      },
    });

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });
    expect(response.errors).not.toBeDefined();

    const after = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: { watchers: true, ancestors: true, comments: true },
    });
    expect(after.id).toBe(ticket.id);
    expect(after.localId).toBe(ticket.localId);
    expect(after.watchers.map((w) => w.id)).toEqual([role.id]);
    expect(after.ancestors.map((a) => a.id)).toEqual([ancestor.id]);
    expect(after.comments.map((c) => c.id)).toEqual([comment.id]);
  });

  it("rejects a ticket with logged work and destroys nothing (cascade-safety)", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // One real, elapsed work session — this is the line that turns a plan into
    // a history (ADR 0010).
    const scheduleItem = await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "This ticket has logged work; its workflow can no longer be changed in place. It must be superseded instead.",
    );

    // Nothing was deleted: the logged work and the original plan rows survive,
    // and the plan is still active (it was not deactivated by a failed change).
    const survivingItem = await prisma.scheduleItem.findUnique({
      where: { id: scheduleItem.id },
    });
    expect(survivingItem).not.toBeNull();

    const survivingStates = await prisma.ticketWorkflowState.findMany({
      where: { id: { in: ticketWorkflowStates.map((s) => s.id) } },
    });
    expect(survivingStates.length).toBe(ticketWorkflowStates.length);
    expect(survivingStates.every((s) => s.isActive)).toBe(true);

    // The workflow itself was not swapped.
    const unchanged = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
    });
    expect(unchanged.workflowId).not.toBe(target.id);
  });

  it("rejects a workflow that is not valid for the ticket's product", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    // A non-default workflow not attached to the ticket's product — outside the
    // product's valid set (getWorkflowQueryForProduct).
    const foreign = await createRandomWorkflow(organization, {
      isDefaultWorkflow: false,
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: foreign.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Workflow is not valid for this product",
    );
  });

  // Regression for the deactivate-don't-delete interaction (ADR 0010): after a
  // workflow change the ticket is UNSCHEDULED and carries the old workflow's
  // deactivated stages alongside the new ones. The `ticketWorkflowStates` field
  // (which shows every state on an UNSCHEDULED ticket so the assignee/skip form
  // can toggle them) must NOT surface those old-workflow tombstones — only the
  // current workflow's stages are part of the live plan. A current-workflow
  // stage that the user has skipped (isActive=false) must still appear.
  it("exposes only the current workflow's stages after a change, never the deactivated old ones", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product } = await createRandomTicket(organization, role);
    const target = await createRandomWorkflow(organization, {
      products: { connect: [{ id: product.id }] },
    });

    const change = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: target.id },
      session,
    });
    expect(change.errors).not.toBeDefined();

    // Skip one of the new workflow's stages (isActive=false) to prove a skipped
    // *current* stage is still exposed — only *old-workflow* rows must be hidden.
    const newStates = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: ticket.id, isActive: true },
    });
    await prisma.ticketWorkflowState.update({
      where: { id: newStates[0].id },
      data: { isActive: false },
    });

    const response = await graphqlRequest({
      source: `
        query Ticket($id: Int!) {
          ticket(id: $id) {
            id
            ticketWorkflowStates {
              id
              isActive
              workflowState { workflowId }
            }
          }
        }`,
      variableValues: { id: ticket.id },
      session,
    });
    expect(response.errors).not.toBeDefined();

    const exposed = response.data!.ticket.ticketWorkflowStates as Array<{
      workflowState: { workflowId: number } | null;
    }>;
    // Every exposed stage belongs to the new workflow; none from the old one.
    expect(exposed.length).toBe(newStates.length);
    expect(
      exposed.every((s) => s.workflowState?.workflowId === target.id),
    ).toBe(true);
  });

  it("rejects changing to the workflow the ticket already uses", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, workflow } = await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: { ticketId: ticket.id, workflowId: workflow.id },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Ticket already uses this workflow",
    );
  });
});
