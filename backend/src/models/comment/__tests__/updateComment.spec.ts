import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { NotificationCategory, RoleType } from "@prisma/client";
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

  it("notifies a role newly mentioned via a Markdown :mention directive on edit", async () => {
    const { session, organization, role: author } =
      await getTestSessionWithRole(RoleType.ADMIN);

    // Neither owner nor watcher, so a mention is their only notification source.
    const { role: mentioned } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    const { ticket } = await createRandomTicket(organization, author);

    const comment = await prisma.comment.create({
      data: {
        body: "nothing here yet",
        ticketId: ticket.id,
        organizationId: organization.id,
        authorId: author.id,
      },
    });

    await graphqlRequest({
      source: updateCommentMutation,
      variableValues: {
        commentId: comment.id,
        input: {
          body: `:mention[someone]{type=user id=${mentioned.id}} please review`,
        },
      },
      session,
    });

    const notifications = await prisma.notification.findMany({
      where: { roleId: mentioned.id, category: NotificationCategory.MENTION },
    });

    expect(notifications.length).toBe(1);
  });
});
