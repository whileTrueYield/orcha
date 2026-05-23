import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, TicketStatus } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";

const updateTicketMutation = `
mutation UpdateTicket($ticketId: Int!, $input:UpdateTicketInput!) {
  updateTicket(
    ticketId: $ticketId
    input: $input
  ) {
    id
    title
    status
    status
    createdAt
    updatedAt
    milestone
    author {
      id
    }
    product {
      id
    }
    workflow {
      id
    }
    organization {
      id
    }
  }
}
`;

const updateTicketStatusMutation = `
mutation UpdateTicketStatus($ticketId: Int!, $status:TicketStatus!) {
  updateTicketStatus(
    ticketId: $ticketId
    status: $status
  ) {
    id
    title
    status
  }
}
`;

const estimateTicketWorkflowStateMutation = `
mutation EstimateTicketWorkflowState($ticketId: Int!, $input:EstimateTicketWorkflowStateInput!) {
  estimateTicketWorkflowState(
    ticketId: $ticketId
    input: $input
  ) {
    id
    estimateMinimum
    estimateMaximum
    estimateMostLikely
  }
}
`;

const updateTicketWorkflowStatesMutation = `
mutation UpdateTicketWorkflowStates($ticketId: Int!, $input: UpdateTicketWorkflowStateInput!) {
  updateTicketWorkflowStates(
    ticketId: $ticketId
    input: $input
  ){
    id
    title
    ticketWorkflowStates {
      id
      assigneeId
      isActive
    }
  }
}`;

describe("updateTicket", () => {
  it("changes the status of a ticket", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: updateTicketStatusMutation,
      variableValues: {
        ticketId: ticket.id,
        status: TicketStatus.DONE,
      },
      session,
    });
    expect(response).toEqual({
      data: {
        updateTicketStatus: {
          id: ticket.id,
          title: ticket.title,
          status: TicketStatus.DONE,
        },
      },
    });
  });

  it("changes the title of a ticket", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product, workflow } = await createRandomTicket(
      organization,
      role,
    );

    const newTitle = `Take care of the ${faker.commerce.product()}`;
    const response = await graphqlRequest({
      source: updateTicketMutation,
      variableValues: {
        ticketId: ticket.id,
        input: { title: newTitle },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateTicket: {
          status: ticket.status,
          title: newTitle,
          id: ticket.id,
          updatedAt: expect.any(String),
          createdAt: ticket.createdAt.toISOString(),
          milestone: false,
          workflow: {
            id: workflow.id,
          },
          organization: {
            id: organization.id,
          },
          author: {
            id: role.id,
          },
          product: {
            id: product.id,
          },
        },
      },
    });
  });

  it("accepts a partial update", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: updateTicketMutation,
      variableValues: {
        ticketId: ticket.id,
        input: {
          milestone: !ticket.milestone,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateTicket.milestone).toBe(!ticket.milestone);
    expect(response.data!.updateTicket.title).toBe(ticket.title);
  });

  it("cannot change the status of a ticket", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: updateTicketMutation,
      variableValues: {
        ticketId: ticket.id,
        input: { status: TicketStatus.SCHEDULED },
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      `Variable "$input" got invalid value { status: "SCHEDULED" }; Field "status" is not defined by type "UpdateTicketInput".`,
    );
  });

  it("cannot SCHEDULE a ticket using status change", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    const response = await graphqlRequest({
      source: updateTicketStatusMutation,
      variableValues: {
        ticketId: ticket.id,
        status: TicketStatus.SCHEDULED,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe(
      "Use scheduleTicket to schedule a ticket",
    );
  });

  it("can batch edit assignee and isActive of ticket workflow states", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, ticketWorkflowStates } = await createRandomTicket(
      organization,
      role,
    );

    const response = await graphqlRequest({
      source: updateTicketWorkflowStatesMutation,
      variableValues: {
        ticketId: ticket.id,
        input: {
          states: [
            {
              ticketWorkflowStateId: ticketWorkflowStates[0].id,
              assigneeId: role.id,
              isActive: true,
            },
            {
              ticketWorkflowStateId: ticketWorkflowStates[1].id,
              isActive: false,
            },
          ],
        },
      },
      session,
    });

    // ticketWorkflowStates[1] should not be found since we set the isActive to false
    const expectedStates = [
      {
        id: ticketWorkflowStates[0].id,
        isActive: ticketWorkflowStates[0].isActive,
        assigneeId: role.id,
      },
      {
        id: ticketWorkflowStates[2].id,
        isActive: ticketWorkflowStates[2].isActive,
        assigneeId: ticketWorkflowStates[2].assigneeId,
      },
    ];

    expect(
      response.data?.updateTicketWorkflowStates.ticketWorkflowStates.length,
    ).toBe(2);

    for (const state of response.data?.updateTicketWorkflowStates
      .ticketWorkflowStates) {
      expect(expectedStates).toContainEqual(state);
    }
  });

  it("can estimate a ticket workflow state", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket } = await createRandomTicket(organization, role);

    const ticketWorkflowStates = await prisma.ticketWorkflowState.findMany({
      where: { ticketId: ticket.id },
    });

    const response = await graphqlRequest({
      source: estimateTicketWorkflowStateMutation,
      variableValues: {
        ticketId: ticket.id,
        input: {
          ticketWorkflowStateId: ticketWorkflowStates[0].id,
          minimum: 1000,
          mostLikely: 2000,
          maximum: 4000,
        },
      },
      session,
    });

    // the first state is the one we've udpated
    expect(response.data?.estimateTicketWorkflowState.estimateMinimum).toBe(
      1000,
    );
    expect(response.data?.estimateTicketWorkflowState.estimateMostLikely).toBe(
      2000,
    );
    expect(response.data?.estimateTicketWorkflowState.estimateMaximum).toBe(
      4000,
    );
  });
});
