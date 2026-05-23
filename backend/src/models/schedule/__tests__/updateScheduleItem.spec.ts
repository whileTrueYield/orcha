import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  fromNow,
  createRandomUserInOrg,
} from "../../../utils/testing";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { TicketStatus } from "@prisma/client";
import "mocha";

describe("update ScheduleItem", () => {
  it("can close an open schedule item", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const startedAt = fromNow(-15);

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt,
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: CLOSE_SCHEDULE_ITEM_MUTATION,
      variableValues: {
        scheduleItemId: scheduleItem.id,
        input: {},
      },
      session,
    });

    expect(response).toEqual({
      data: {
        closeScheduleItem: {
          id: scheduleItem.id,
          ticketId: ticket.id,
          ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
          roleId: role.id,
          stoppedAt: expect.any(String),
          startedAt: startedAt.toISOString(),
          done: false,
        },
      },
    });
  });

  it("cannot close a closed schedule item", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const startedAt = fromNow(-15);
    const stoppedAt = fromNow(-5);

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt,
        stoppedAt,
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: CLOSE_SCHEDULE_ITEM_MUTATION,
      variableValues: {
        scheduleItemId: scheduleItem.id,
        input: {},
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("can close last schedule item even if closed", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    // for noise purpose, this object is 10 minutes old
    await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-15),
        stoppedAt: fromNow(-10),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-10),
        stoppedAt: fromNow(-5),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    // for noise purpose, this object is 1h30 old
    await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-50),
        stoppedAt: fromNow(-90),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: CLOSE_LAST_SCHEDULE_ITEM_MUTATION,
      variableValues: {
        ticketId: ticket.id,
        input: {},
      },
      session,
    });

    expect(response).toEqual({
      data: {
        closeLastScheduleItem: {
          id: scheduleItem.id,
          ticketId: ticket.id,
          ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
          nextTicketWorkflowStateId: null,
          roleId: role.id,
          startedAt: scheduleItem.startedAt.toISOString(),
          stoppedAt: scheduleItem.stoppedAt!.toISOString(), // the stop date should not change
          done: false,
        },
      },
    });
  });

  it("can mark ticket as done even if scheduleItem is closed", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );
    const { role: otherRole } = await createRandomUserInOrg(organization);

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-10),
        stoppedAt: fromNow(-5),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const otherScheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-9),
        stoppedAt: fromNow(-6),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: otherRole.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: CLOSE_LAST_SCHEDULE_ITEM_MUTATION,
      variableValues: {
        ticketId: ticket.id,
        input: {
          done: true,
        },
      },
      session,
    });

    // should close the schedule item
    expect(response).toEqual({
      data: {
        closeLastScheduleItem: {
          id: scheduleItem.id,
          ticketId: ticket.id,
          ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
          nextTicketWorkflowStateId: null,
          roleId: role.id,
          startedAt: scheduleItem.startedAt.toISOString(),
          stoppedAt: scheduleItem.stoppedAt!.toISOString(), // the stop date should not change
          done: true,
        },
      },
    });

    // should not touch the schedule of the 2nd collaborator
    const updatedOtherScheduleItem = await prisma.scheduleItem.findUnique({
      where: { id: otherScheduleItem.id },
    });
    expect(updatedOtherScheduleItem).toMatchObject(otherScheduleItem);

    // should mark the ticket as DONE
    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: ticket.id },
    });

    expect(updatedTicket!.status).toBe(TicketStatus.DONE);
  });

  it("can suggest next step even if closed", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const scheduleItem = await prisma.scheduleItem.create({
      data: {
        startedAt: fromNow(-10),
        stoppedAt: fromNow(-5),
        ticketWorkflowStateId: ticketWorkflowStates[0].id,
        roleId: role.id,
        ticketId: ticket.id,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: CLOSE_LAST_SCHEDULE_ITEM_MUTATION,
      variableValues: {
        ticketId: ticket.id,
        input: {
          nextTicketWorkflowStateId: ticketWorkflowStates[1].id,
          note: "we are done here!",
        },
      },
      session,
    });

    // should close the schedule item
    expect(response).toEqual({
      data: {
        closeLastScheduleItem: {
          id: scheduleItem.id,
          ticketId: ticket.id,
          ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
          nextTicketWorkflowStateId: ticketWorkflowStates[1].id,
          roleId: role.id,
          startedAt: scheduleItem.startedAt.toISOString(),
          stoppedAt: scheduleItem.stoppedAt!.toISOString(), // the stop date should not change
          done: true,
        },
      },
    });
  });
});

const CLOSE_SCHEDULE_ITEM_MUTATION = `
  mutation closeScheduleItem($scheduleItemId: Int!, $input: CloseScheduleItemInput!) {
    closeScheduleItem(scheduleItemId: $scheduleItemId, input: $input) {
      id
      ticketId
      ticketWorkflowStateId
      roleId
      stoppedAt
      startedAt
      done
    }
  }
`;

const CLOSE_LAST_SCHEDULE_ITEM_MUTATION = `
  mutation closeLastScheduleItem($ticketId: Int!, $input: CloseScheduleItemInput!) {
    closeLastScheduleItem(ticketId: $ticketId, input: $input) {
      id
      ticketId
      ticketWorkflowStateId
      nextTicketWorkflowStateId
      roleId
      stoppedAt
      startedAt
      done
    }
  }
`;
