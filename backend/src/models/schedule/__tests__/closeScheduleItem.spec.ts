import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import "mocha";

const createScheduleItemMutation = `
mutation CreateScheduleItem($input:CreateScheduleItemInput!) {
  createScheduleItem(input: $input) {
    id
  }
}`;

const closeScheduleItemMutation = `
mutation CloseScheduleItem($scheduleItemId: Int!, $input:CloseScheduleItemInput!) {
  closeScheduleItem(scheduleItemId: $scheduleItemId, input: $input) {
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
    }
  }
}
`;

describe("create scheduleItem", () => {
  it("can close a scheduleItem", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role
    );

    const oneHourAgo = new Date(new Date().getTime() - 1 * 3600 * 1000);

    const response = await graphqlRequest({
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

    const closeResponse = await graphqlRequest({
      source: closeScheduleItemMutation,
      variableValues: {
        scheduleItemId: scheduleItemId,
        input: {
          done: true,
        },
      },
      session,
    });

    expect(closeResponse).toEqual({
      data: {
        closeScheduleItem: {
          id: expect.any(Number),
          done: true,
          startedAt: oneHourAgo.toISOString(),
          stoppedAt: expect.any(String),
          organization: {
            name: organization.name,
            id: organization.id,
          },
          role: {
            id: role.id,
            name: role.name,
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

    expect(scheduleItems.length).toBe(1);
  });
});
