import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const updateCommentMutation = `
mutation UpdateComment($commentId: Int!, $input:UpdateCommentInput!) {
  updateComment(
    commentId: $commentId
    input: $input
  ) {
    id
    body
    createdAt
    updatedAt
  }
}
`;

describe("updateComment", () => {
  it("changes the body of a comment", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
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

    const newBody = `${comment.body} edit`;
    const response = await graphqlRequest({
      source: updateCommentMutation,
      variableValues: {
        commentId: comment.id,
        input: { body: newBody },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateComment: {
          body: newBody,
          id: comment.id,
          updatedAt: expect.any(String),
          createdAt: comment.createdAt.toISOString(),
        },
      },
    });
  });
});
