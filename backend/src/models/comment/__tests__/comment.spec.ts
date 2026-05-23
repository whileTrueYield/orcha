import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getCommentQuery = `
query getComment($id: Int!) {
  comment(id: $id) {
    id
    body
    createdAt
    updatedAt
    ticket {
      id
    }
    author {
      id
    }
    organization {
      id
    }
  }
}
`;

describe("get single comment", () => {
  it("retrieves an existing comment", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket } = await createRandomTicket(organization, role);

    const comment = await prisma.comment.create({
      data: {
        body: faker.lorem.paragraph(),
        ticketId: ticket.id,
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getCommentQuery,
      variableValues: {
        id: comment.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        comment: {
          id: comment.id,
          body: comment.body,
          organization: {
            id: organization.id,
          },
          author: {
            id: role.id,
          },
          ticket: {
            id: ticket.id,
          },
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        },
      },
    });
  });

  it("throws an exception when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: getCommentQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
