import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { NotificationCategory, RoleType } from "@prisma/client";
import expect from "expect";
import prisma from "../../../prisma";

const createCommentMutation = `
mutation CreateComment($ticketId: Int!, $input:CreateCommentInput!) {
  createComment(
    ticketId: $ticketId
    input: $input
  ) {
    id
    comments {
      nodes {
        body
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
  }
}
`;

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

describe("create comment", () => {
  it("creates a new comment", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const { ticket } = await createRandomTicket(organization, role);

    const comment = {
      body: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createCommentMutation,
      variableValues: {
        input: comment,
        ticketId: ticket.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createComment: {
          id: ticket.id,
          comments: {
            nodes: [
              {
                organization: {
                  id: organization.id,
                },
                author: {
                  id: role.id,
                },
                ticket: {
                  id: ticket.id,
                },
                body: comment.body,
              },
            ],
          },
        },
      },
    });
  });

  it("does not create a comment without a body", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const { ticket } = await createRandomTicket(organization, role);

    const comment = {
      body: "",
    };

    const response = await graphqlRequest({
      source: createCommentMutation,
      variableValues: {
        input: comment,
        ticketId: ticket.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("creates a new comment creates only one notification", async () => {
    const {
      session: jeffSession,
      role: jeff,
      organization,
    } = await getTestSessionWithRole(RoleType.MEMBER);

    const { session: tedSession, role: ted } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    // creating a ticket using the first role
    const { ticket } = await createRandomTicket(organization, jeff, undefined, {
      owner: { connect: { id: jeff.id } },
      watchers: { connect: [{ id: jeff.id }] },
    });

    // create a comment tagging jeff
    const comment = {
      body: `:mention[jeff]{type=user id=${jeff.id}} faker.lorem.paragraph()`,
    };

    // ted creates a comment on it
    const response = await graphqlRequest({
      source: createCommentMutation,
      variableValues: {
        input: comment,
        ticketId: ticket.id,
      },
      session: tedSession,
    });

    const notifications = await prisma.notification.findMany({
      where: {
        roleId: jeff.id,
      },
    });

    // while the comment is created on a ticket Jeff owns and Jeff is
    // tagged on it, we should only get one notification from it
    expect(notifications.length).toBe(1);
  });

  it("notifiy the owner of the ticket on a new comment", async () => {
    const {
      session: jeffSession,
      role: jeff,
      organization,
    } = await getTestSessionWithRole(RoleType.MEMBER);

    const { session: tedSession, role: ted } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    const { session: johnSession, role: john } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    // creating a ticket using the first role
    const { ticket } = await createRandomTicket(organization, jeff, undefined, {
      owner: { connect: { id: jeff.id } },
      watchers: { connect: [{ id: jeff.id }] },
    });

    // create a comment tagging john on it (not the owner)
    const comment = {
      body: `:mention[john]{type=user id=${john.id}} faker.lorem.paragraph()`,
    };

    // ted creates a comment on it
    const response = await graphqlRequest({
      source: createCommentMutation,
      variableValues: {
        input: comment,
        ticketId: ticket.id,
      },
      session: tedSession,
    });

    // we should notify jeff because he's the owner of the ticket
    const notifications = await prisma.notification.findMany({
      where: {
        roleId: jeff.id,
      },
    });

    // while the comment is created on a ticket Jeff owns and Jeff is
    // tagged on it, we should only get one notification from it
    expect(notifications.length).toBe(1);
  });

  it("notifies a role mentioned via a Markdown :mention directive", async () => {
    const { session, role: author, organization } =
      await getTestSessionWithRole(RoleType.MEMBER);

    // A second role who is neither the ticket owner nor a watcher, so the only
    // notification they can possibly receive is the mention itself.
    const { role: mentioned } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    // createRandomTicket leaves owner and watchers unset by default.
    const { ticket } = await createRandomTicket(organization, author);

    // Canonical Markdown mention directive (ADR 0007), the resolved form the
    // Crepe mention picker emits — the Markdown replacement for the old TipTap
    // `mentionRole` node.
    const comment = {
      body: `:mention[someone]{type=user id=${mentioned.id}} please take a look`,
    };

    await graphqlRequest({
      source: createCommentMutation,
      variableValues: { input: comment, ticketId: ticket.id },
      session,
    });

    const notifications = await prisma.notification.findMany({
      where: { roleId: mentioned.id, category: NotificationCategory.MENTION },
    });

    expect(notifications.length).toBe(1);
  });

  it("does not notify for a loose @name that is not a resolved :mention directive", async () => {
    const { session, role: author, organization } =
      await getTestSessionWithRole(RoleType.MEMBER);

    // A role referenced only by a loose "@name" the author typed. Comments do
    // not run write-side mention resolution (see the resolver), so an unresolved
    // reference must never produce a notification — it is plain text, not a
    // mention.
    const { role: other } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    const { ticket } = await createRandomTicket(organization, author);

    const comment = {
      body: `hey @${other.name} can you look at this`,
    };

    await graphqlRequest({
      source: createCommentMutation,
      variableValues: { input: comment, ticketId: ticket.id },
      session,
    });

    const notifications = await prisma.notification.findMany({
      where: { roleId: other.id },
    });

    expect(notifications.length).toBe(0);
  });

  it("creates a new reply creates only one notification", async () => {
    const {
      session: jeffSession,
      role: jeff,
      organization,
    } = await getTestSessionWithRole(RoleType.MEMBER);

    const { session: tedSession, role: ted } = await getTestSessionWithRole(
      RoleType.MEMBER,
      undefined,
      organization
    );

    // Jeff creates a ticket and is the owner
    const { ticket } = await createRandomTicket(organization, jeff, undefined, {
      owner: { connect: { id: jeff.id } },
      watchers: { connect: [{ id: jeff.id }] },
    });

    // Jeff creates a comment on this ticket
    const comment = await prisma.comment.create({
      data: {
        ticketId: ticket.id,
        authorId: jeff.id,
        body: "just a comment",
        organizationId: ticket.organizationId,
      },
    });

    // ted creates a reply on
    await graphqlRequest({
      source: addReplyMutation,
      variableValues: {
        input: {
          body: `:mention[jeff]{type=user id=${jeff.id}} the reply`,
        },
        commentId: comment.id,
      },
      session: tedSession,
    });

    const notifications = await prisma.notification.findMany({
      where: {
        roleId: jeff.id,
      },
    });

    // while the comment is created on a ticket Jeff owns and Jeff is
    // tagged on it, we should only get one notification from it
    expect(notifications.length).toBe(1);
  });
});
