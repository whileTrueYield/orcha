import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  createScheduleItem,
} from "../../../utils/testing";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";
import "mocha";

const createScheduleItemMutation = `
mutation CreateScheduleItem($input:CreateScheduleItemInput!) {
  createScheduleItem(input: $input) {
    id
    done
    startedAt
    stoppedAt
    ticket {
      id
      title
    }
    ticketWorkflowState {
      id
    }
    organization {
      id
      name
    }
    role {
      id
      name
      user {
        id
      }
    }
  }
}
`;

describe("create scheduleItem", () => {
  it("can create previous schedule items", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    await createScheduleItem(role, ticket, { startedAt: fiveMinutesAgo });

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: tenMinutesAgo.toISOString(),
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
  });

  it("cannot create scheduleItem overlaps", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    // create some work on a ticket
    const { ticket } = await createRandomTicket(organization, role);
    await createScheduleItem(role, ticket, { startedAt: oneHourAgo });

    // create another ticket and attempt to create some overlaping work
    const { ticket: otherTicket, ticketWorkflowStates } =
      await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: otherTicket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: tenMinutesAgo.toISOString(),
          stoppedAt: fiveMinutesAgo.toISOString(),
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("cannot start scheduleItem creating overlaps", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    await createScheduleItem(role, ticket, {
      startedAt: oneHourAgo,
      stoppedAt: fiveMinutesAgo,
    });

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: tenMinutesAgo.toISOString(),
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("can creates scheduleItem in the past", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );
    const tenMinuteAgo = new Date(new Date().getTime() - 10 * 60 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);
    const twoHoursAgo = new Date(new Date().getTime() - 2 * 3600 * 1000);
    const treeHoursAgo = new Date(new Date().getTime() - 3 * 3600 * 1000);

    await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: treeHoursAgo.toISOString(),
          stoppedAt: twoHoursAgo.toISOString(),
        },
      },
      session,
    });

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: tenMinuteAgo.toISOString(),
        },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createScheduleItem: {
          id: expect.any(Number),
          done: false,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: tenMinuteAgo.toISOString(),
          organization: {
            name: organization.name,
            id: organization.id,
          },
          role: {
            id: role.id,
            name: role.name,
            user: {
              id: user.id,
            },
          },
          ticket: {
            id: ticket.id,
            title: ticket.title,
          },
          ticketWorkflowState: {
            id: ticketWorkflowStates[0].id,
          },
        },
      },
    });

    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        ticketId: ticket.id,
      },
    });

    expect(scheduleItems.length).toBe(2);
  });

  it("cannot create a schedule item in the future", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );
    const inOneHour = new Date(new Date().getTime() + 1 * 3600 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    let response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: inOneHour.toISOString(),
        },
      },
      session,
    });
    expect(get(response, "errors.0.message")).toEqual(
      "The stop date cannot be in the future."
    );

    response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: inOneHour.toISOString(),
        },
      },
      session,
    });
    expect(get(response, "errors.0.message")).toEqual(
      "The start date cannot be in the future."
    );
  });

  it("should close active schedule item when creating a new one", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    const activeTask = await createScheduleItem(role, ticket, {
      startedAt: oneHourAgo,
      ticketWorkflowState: { connect: { id: ticketWorkflowStates[0].id } },
    });

    const { ticket: otherTicket, ticketWorkflowStates: otherStates } =
      await createRandomTicket(organization, role);

    // we first create an open ended schedule item (no end time)
    let response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: otherTicket.id,
          ticketWorkflowStateId: otherStates[0].id,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    const previouslyActiveTask = await prisma.scheduleItem.findUniqueOrThrow({
      where: { id: activeTask.id },
    });

    expect(previouslyActiveTask?.stoppedAt).toBeDefined();
  });

  it("should return existing open schedule item instead of creating one", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    // we first create an open ended schedule item (no end time)
    let response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          startedAt: oneHourAgo.toISOString(),
        },
      },
      session,
    });
    const scheduleItemId = response.data?.createScheduleItem.id;
    expect(scheduleItemId).toBeDefined();

    // we then attempt to create another one
    response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
        },
      },
      session,
    });

    expect(response.errors).toBeUndefined();
    expect(response.data?.createScheduleItem.id).toBe(scheduleItemId);
  });

  // We will no longer resume schedule items until we are sure we don't
  // risk having colliding items:
  // - start task A
  // - stop task A
  // - start task B for 2 minutes
  // - stop task B
  // - restart task A: now we have task A (resumed) overlapping task B
  xit("resumes scheduleItem no older than 5 minutes", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );
    const fourMinuteAgo = new Date(new Date().getTime() - 4 * 60 * 1000);
    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    const initialResponse = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          workflowStateId: ticketWorkflowStates[0].id,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: fourMinuteAgo.toISOString(),
        },
      },
      session,
    });

    const scheduleItem = initialResponse.data?.createScheduleItem;

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
        },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createScheduleItem: {
          id: scheduleItem.id,
          done: false,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: null,
          organization: {
            name: organization.name,
            id: organization.id,
          },
          role: {
            id: role.id,
            name: role.name,
            user: {
              id: user.id,
            },
          },
          ticket: {
            id: ticket.id,
            title: ticket.title,
          },
          ticketWorkflowState: {
            ticketWorkflowState: {
              id: ticketWorkflowStates[0].id,
            },
          },
        },
      },
    });

    const scheduleItems = await prisma.scheduleItem.findMany({
      where: {
        ticketId: ticket.id,
      },
    });

    expect(scheduleItems.length).toBe(1);
  });

  it("creates a new scheduleItem", async () => {
    const { session, role, organization, user } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const response = await graphqlRequest({
      source: createScheduleItemMutation,
      variableValues: {
        input: {
          ticketId: ticket.id,
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
        },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createScheduleItem: {
          id: expect.any(Number),
          done: false,
          startedAt: expect.any(String),
          stoppedAt: null,
          organization: {
            name: organization.name,
            id: organization.id,
          },
          role: {
            id: role.id,
            name: role.name,
            user: {
              id: user.id,
            },
          },
          ticket: {
            id: ticket.id,
            title: ticket.title,
          },
          ticketWorkflowState: {
            id: ticketWorkflowStates[0].id,
          },
        },
      },
    });
  });
});
