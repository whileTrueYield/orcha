/**
 * Tests for moving a published Ticket to a different product (issue #116,
 * Phase 2 of ADR 0010).
 *
 * Phase 2 reuses the Phase 1 engine and threads a destination `productId`
 * through both mutations. The internal `Ticket.id` is stable, so only the
 * per-product `localId` (and the human-facing `CODE-localId` reference) moves:
 *
 *   - changeTicketWorkflow(productId) — the in-place path. When the current
 *     workflow stays valid for the destination product, the plan is workflow-
 *     scoped and therefore still truthful, so we keep it untouched (no
 *     re-estimation) and only reassign productId + localId. Logged work is
 *     irrelevant in that case. When the workflow must change, the existing
 *     no-work reset applies and a worked ticket is rejected (routes to
 *     supersede).
 *
 *   - supersedeTicketWorkflow(productId) — the worked path. The successor is
 *     created under the destination product, getting a fresh localId there.
 */

import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  createRandomWorkflow,
  createRandomProduct,
  createScheduleItem,
} from "../../../utils/testing";
import { ModelStage, RoleType, TicketStatus } from "@prisma/client";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";

const changeTicketWorkflowMutation = `
mutation ChangeTicketWorkflow($ticketId: Int!, $workflowId: Int!, $productId: Int) {
  changeTicketWorkflow(ticketId: $ticketId, workflowId: $workflowId, productId: $productId) {
    id
    localId
    status
    estimating
    workflow { id }
    product { id }
  }
}
`;

const supersedeTicketWorkflowMutation = `
mutation SupersedeTicketWorkflow($ticketId: Int!, $workflowId: Int!, $productId: Int) {
  supersedeTicketWorkflow(ticketId: $ticketId, workflowId: $workflowId, productId: $productId) {
    id
    localId
    status
    workflow { id }
    product { id }
  }
}
`;

describe("changeTicketProduct (in-place, changeTicketWorkflow + productId)", () => {
  it("moves a no-work ticket to another product keeping the same workflow: reassigns productId + localId, preserves the plan", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, workflow, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    // Destination product that also accepts the ticket's current workflow, so
    // the workflow stays valid and the plan need not reset.
    const destination = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });
    // Seed an existing ticket in the destination so the moved ticket must take
    // the next free localId (proving per-product reassignment, not a copy).
    await createRandomTicket(organization, role, destination);

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: workflow.id,
        productId: destination.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.changeTicketWorkflow).toEqual({
      id: ticket.id,
      localId: 2, // destination already had localId 1
      status: TicketStatus.SCHEDULED, // plan preserved → no re-estimation
      estimating: false,
      workflow: { id: workflow.id },
      product: { id: destination.id },
    });

    // The plan rows are the very same active rows — not deactivated, not
    // recreated.
    const states = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: ticket.id },
    });
    expect(states.map((s) => s.id).sort()).toEqual(
      ticketWorkflowStates.map((s) => s.id).sort(),
    );
    expect(states.every((s) => s.isActive)).toBe(true);
  });

  it("allows a same-workflow product move even with logged work (the plan stays truthful)", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, workflow } = await createRandomTicket(organization, role);
    const scheduleItem = await createScheduleItem(role, ticket);

    const destination = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: workflow.id,
        productId: destination.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(get(response, "data.changeTicketWorkflow.product.id")).toBe(
      destination.id,
    );

    // The logged work is untouched.
    const survivingItem = await prisma.scheduleItem.findUnique({
      where: { id: scheduleItem.id },
    });
    expect(survivingItem).not.toBeNull();
  });

  it("moves a no-work ticket and resets the plan when the workflow must change for the destination", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    // Destination accepts a *different* workflow only (and not via org
    // defaults, so the ticket's current workflow is genuinely invalid there).
    const target = await createRandomWorkflow(organization);
    const destination = await createRandomProduct(organization, {
      isUsingDefaultWorkflows: false,
      workflows: { connect: [{ id: target.id }] },
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: target.id,
        productId: destination.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.changeTicketWorkflow).toMatchObject({
      id: ticket.id,
      status: TicketStatus.UNSCHEDULED, // plan reset → re-enters estimation
      estimating: true,
      workflow: { id: target.id },
      product: { id: destination.id },
    });
  });

  it("rejects keeping a workflow that is not valid for the destination product", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, workflow } = await createRandomTicket(organization, role);

    // Destination does not accept the ticket's current workflow (no attached
    // workflows and not using org defaults).
    const destination = await createRandomProduct(organization, {
      isUsingDefaultWorkflows: false,
    });

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: workflow.id,
        productId: destination.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Workflow is not valid for this product",
    );
  });

  it("rejects a destination product outside the organization", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, workflow } = await createRandomTicket(organization, role);

    const { organization: otherOrg } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const foreignProduct = await createRandomProduct(otherOrg);

    const response = await graphqlRequest({
      source: changeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: workflow.id,
        productId: foreignProduct.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Product is not valid for this organization",
    );
  });
});

describe("changeTicketProduct (supersede, supersedeTicketWorkflow + productId)", () => {
  it("supersedes a worked ticket into the destination product with a fresh localId there", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.OWNER,
    );

    const { ticket } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket);

    const target = await createRandomWorkflow(organization);
    const destination = await createRandomProduct(organization, {
      workflows: { connect: [{ id: target.id }] },
    });
    // An existing ticket in the destination so the successor takes localId 2.
    await createRandomTicket(organization, role, destination);

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: target.id,
        productId: destination.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    const successor = response.data!.supersedeTicketWorkflow;
    expect(successor.product).toEqual({ id: destination.id });
    expect(successor.localId).toBe(2);
    expect(successor.workflow).toEqual({ id: target.id });
    expect(successor.id).not.toBe(ticket.id);

    // The original is closed and points at the successor.
    const original = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
    });
    expect(original.status).toBe(TicketStatus.CANCELLED);
    expect(original.supersededById).toBe(successor.id);
  });

  it("rejects a successor workflow that is not valid for the destination product", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.OWNER,
    );

    const { ticket } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket);

    // A workflow not attached to the destination product, which does not use
    // org defaults either — so the workflow is genuinely invalid there.
    const foreignWorkflow = await createRandomWorkflow(organization);
    const destination = await createRandomProduct(organization, {
      isUsingDefaultWorkflows: false,
    });

    const response = await graphqlRequest({
      source: supersedeTicketWorkflowMutation,
      variableValues: {
        ticketId: ticket.id,
        workflowId: foreignWorkflow.id,
        productId: destination.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Workflow is not valid for this product",
    );
  });
});
