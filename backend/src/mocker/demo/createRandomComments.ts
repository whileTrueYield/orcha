import { random, range, sample } from "lodash";
import { Comment, CommentReply, Role, Ticket } from "../../models/entities";
import { faker } from "@faker-js/faker";
import prisma from "../../prisma";

/**
 * Generate random threads of comments on a ticket
 * @param ticket
 * @param roles
 * @returns
 */
export async function createRandomComments(
  ticket: Ticket,
  roles: Role[]
): Promise<Comment[]> {
  const comments: Comment[] = [];
  const authors: Role[] = [];

  if (roles.length === 0) {
    console.warn(
      "createRandomComments(): roles provided were an empty list, could not create comments for ticket",
      ticket.id
    );
    return comments;
  }

  const count = random(0, 20);

  let comment = await createRandomComment(ticket, sample(roles) as Role);
  comments.push(comment);

  for (const _ of range(count)) {
    authors.push(sample(roles) as Role);
  }

  // Creates random comments (10% of the time) and replies to the latest created comment.
  for (const author of authors) {
    if (Math.random() < 0.9) {
      await createRandomReply(comment, author);
    } else {
      comment = await createRandomComment(ticket, author);
      comments.push(comment);
    }
  }

  return comments;
}

// Comment bodies are Markdown source now (the Tiptap-JSON-over-Yjs storage was
// retired); the frontend renders the raw string, so seed plain Markdown text
// rather than the old ProseMirror JSON blob, which would render literally.
function createRandomComment(ticket: Ticket, author: Role): Promise<Comment> {
  return prisma.comment.create({
    data: {
      organizationId: ticket.organizationId,
      ticketId: ticket.id,
      authorId: author.id,
      body: faker.hacker.phrase(),
    },
  });
}

function createRandomReply(
  comment: Comment,
  author: Role
): Promise<CommentReply> {
  return prisma.commentReply.create({
    data: {
      organizationId: comment.organizationId,
      commentId: comment.id,
      authorId: author.id,
      body: faker.hacker.phrase(),
    },
  });
}
