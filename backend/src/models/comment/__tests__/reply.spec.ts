import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { GraphQLError } from "graphql";

const addReplyMutation = `
mutation AddReply($commentId: Int!, $input: AddReplyInput!) {
  addReply(commentId: $commentId, input: $input) {
    id
    body
    author {
      id
    }
  }
}
`;

const deleteReplyMutation = `
mutation DeleteReply($commentReplyId: Int!) {
  deleteReply(commentReplyId: $commentReplyId)
}
`;

const deleteCommentMutation = `
mutation DeleteComment($commentId: Int!) {
  deleteComment(commentId: $commentId)
}
`;

describe("comment replies", () => {
  it("should return an error if not found", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const response = await graphqlRequest({
      source: deleteReplyMutation,
      variableValues: {
        commentReplyId: 9999999,
      },
      session,
    });

    expect(response).toEqual({
      data: null,
      errors: [new GraphQLError("No CommentReply found")],
    });
  });

  it("should add a reply", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket } = await createRandomTicket(organization, role);

    const commentBody = faker.lorem.paragraph();
    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        ticketId: ticket.id,
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const replyBody = faker.lorem.paragraph();
    const response = await graphqlRequest({
      source: addReplyMutation,
      variableValues: {
        commentId: comment.id,
        input: { body: replyBody },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        addReply: {
          id: expect.any(Number),
          body: replyBody,
          author: {
            id: role.id,
          },
        },
      },
    });
  });

  it("should delete a reply", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket } = await createRandomTicket(organization, role);

    const commentBody = faker.lorem.paragraph();
    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        ticketId: ticket.id,
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const replyBody = faker.lorem.paragraph();
    const reply = await prisma.commentReply.create({
      data: {
        body: replyBody,
        commentId: comment.id,
        authorId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteReplyMutation,
      variableValues: {
        commentReplyId: reply.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteReply: reply.id,
      },
    });
  });

  it("deletes replies when deleting a comment", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket } = await createRandomTicket(organization, role);

    const commentBody = faker.lorem.paragraph();
    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        ticketId: ticket.id,
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const replyBody = faker.lorem.paragraph();
    const reply = await prisma.commentReply.create({
      data: {
        body: replyBody,
        commentId: comment.id,
        authorId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteCommentMutation,
      variableValues: {
        commentId: comment.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteComment: true,
      },
    });

    const deletedReply = await prisma.commentReply.findUnique({
      where: { id: reply.id },
    });
    expect(deletedReply).toBeNull();
  });
});
