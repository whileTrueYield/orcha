import expect from "expect";
import "mocha";
import {
  createRandomProduct,
  createRandomTicket,
  createRandomWorkflow,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { RoleType, TicketStatus } from ".prisma/client";
import { get, map } from "lodash";

const getAllUnscheduledDependenciesQuery = `
  query GetAllCurrentTicketUnscheduledDependencies($ticketIds: [Int!]!) {
    getAllUnscheduledDependencies(ticketIds: $ticketIds) {
      id
      title
    }
  }
`;

describe("schedule ticket", () => {
  it("Return all unschedule dependencies", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER
    );
    const workflow = await createRandomWorkflow(organization);
    const product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });

    const { ticket } = await createRandomTicket(organization, role, product, {
      status: TicketStatus.UNSCHEDULED,
    });

    const { ticket: childTicket } = await createRandomTicket(
      organization,
      role,
      product,
      {
        successors: { connect: [{ id: ticket.id }] },
        status: TicketStatus.UNSCHEDULED,
      }
    );

    const { ticket: grandChildTicket } = await createRandomTicket(
      organization,
      role,
      product,
      {
        successors: { connect: [{ id: childTicket.id }] },
        status: TicketStatus.UNSCHEDULED,
      }
    );

    // this grandChild IS SCHEDULED, and should not appear in the response
    await createRandomTicket(organization, role, product, {
      successors: { connect: [{ id: childTicket.id }] },
      status: TicketStatus.SCHEDULED,
    });

    const { ticket: grandGrandChildTicket } = await createRandomTicket(
      organization,
      role,
      product,
      {
        successors: { connect: [{ id: grandChildTicket.id }] },
        status: TicketStatus.UNSCHEDULED,
      }
    );

    const response = await graphqlRequest({
      source: getAllUnscheduledDependenciesQuery,
      variableValues: { ticketIds: [ticket.id] },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const unscheduleTicket = get(
      response.data,
      "getAllUnscheduledDependencies",
      []
    );

    expect(unscheduleTicket.length).toBe(3);

    const unscheduleTicketIds = map(unscheduleTicket, "id");
    expect(unscheduleTicketIds).toContain(childTicket.id);
    expect(unscheduleTicketIds).toContain(grandChildTicket.id);
    expect(unscheduleTicketIds).toContain(grandGrandChildTicket.id);
  });
});
