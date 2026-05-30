import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getCommentsQuery = `
query getComments($ticketId: Int!) {
  comments (ticketId: $ticketId, first: 2, sort: "body") {
    totalCount
    nodes {
      body
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

describe("get many comments", () => {
  it("returns pagination and an array of comments", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const { ticket } = await createRandomTicket(organization, role);

    const commentPromises = map(range(5), async (counter) =>
      prisma.comment.create({
        data: {
          body: counter.toString() + faker.lorem.paragraph(),
          ticketId: ticket.id,
          organizationId: organization.id,
          authorId: role.id,
        },
      })
    );

    const comments = await Promise.all(commentPromises);

    const response = await graphqlRequest({
      source: getCommentsQuery,
      variableValues: {
        ticketId: ticket.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        comments: {
          totalCount: 5,
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 3,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    const sortedComments = sortBy(comments, "body");
    expect(response.data!.comments.nodes.length).toBe(2);
    expect(sortedComments[0]).toMatchObject(response.data!.comments.nodes[0]);
    expect(sortedComments[1]).toMatchObject(response.data!.comments.nodes[1]);
  });
});
