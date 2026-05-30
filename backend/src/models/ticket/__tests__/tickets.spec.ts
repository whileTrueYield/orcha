import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
  createRandomWorkflow,
  createRandomProject,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, TicketStatus } from "@prisma/client";
import { map, range, sortBy, take } from "lodash";
import prisma from "../../../prisma";
import expect from "expect";

const getTicketsQuery = `
query getTickets {
  tickets (first: 10, sort: "title") {
    totalCount
    nodes {
      id
      title
      status
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      pageNumber
      pageSize
      pageCount
      endCursor
    }
  }
}
`;

describe("get many tickets", () => {
  it("returns pagination and an array of tickets", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const project = await createRandomProject(organization);
    const workflow = await createRandomWorkflow(organization);
    const product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });

    const ticketPromises = map(
      range(20),
      async (index) =>
        await prisma.ticket.create({
          data: {
            localId: index,
            title: `Take care of the ${faker.commerce.product()} - ${index}`,
            status: TicketStatus.UNSCHEDULED,
            productId: product.id,
            authorId: role.id,
            organizationId: organization.id,
            workflowId: workflow.id,
            projectId: project.id,
          },
        }),
    );

    const tickets = await Promise.all(ticketPromises);
    const expectedTicketObjs = map(tickets, ({ id, title, status }) => ({
      id,
      title,
      status,
    }));

    const response = await graphqlRequest({
      source: getTicketsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        tickets: {
          totalCount: 20,
          nodes: take(sortBy(expectedTicketObjs, "title"), 10),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 2,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      },
    });
  });
});
