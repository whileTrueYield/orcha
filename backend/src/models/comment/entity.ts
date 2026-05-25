/**
 * Pothos type definitions for the Comment and CommentReply models.
 *
 * Exports:
 *  - CommentRef:              prismaObject for Comment
 *  - CommentReplyRef:         prismaObject for CommentReply
 *  - PaginatedComments:       paginated wrapper for Comment
 *  - PaginatedCommentReplies: paginated wrapper for CommentReply
 *
 * Field resolvers that need runtime logic (replyCount, replies, acceptedReply)
 * are added as prismaObjectFields here rather than in separate resolver files,
 * because they define the shape of the type itself.
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// CommentReply — prismaObject backed by the Prisma CommentReply model
// ---------------------------------------------------------------------------

export const CommentReplyRef = builder.prismaObject("CommentReply", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    body: t.exposeString("body"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    authorId: t.exposeInt("authorId"),
    commentId: t.exposeInt("commentId"),
    organizationId: t.exposeInt("organizationId", { nullable: true }),
    author: t.relation("author"),
  }),
});

// ---------------------------------------------------------------------------
// Comment — prismaObject backed by the Prisma Comment model
// ---------------------------------------------------------------------------

export const CommentRef = builder.prismaObject("Comment", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    body: t.exposeString("body"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    authorId: t.exposeInt("authorId"),
    organizationId: t.exposeInt("organizationId"),
    ticketId: t.exposeInt("ticketId"),
    acceptedReplyId: t.exposeInt("acceptedReplyId", { nullable: true }),
    author: t.relation("author"),
    ticket: t.relation("ticket"),
    organization: t.relation("organization"),
    acceptedReply: t.relation("acceptedReply", { nullable: true }),
    replies: t.relation("replies"),
  }),
});

// ---------------------------------------------------------------------------
// replyCount — computed field returning the number of replies on a comment
// ---------------------------------------------------------------------------

builder.prismaObjectField("Comment", "replyCount", (t) =>
  t.int({
    resolve: (comment, _args, ctx) =>
      ctx.prisma.commentReply.count({
        where: { commentId: comment.id },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Paginated wrappers
// ---------------------------------------------------------------------------

export const PaginatedComments = createPaginatedType("Comments", CommentRef);
export const PaginatedCommentReplies = createPaginatedType(
  "CommentReply",
  CommentReplyRef,
);
