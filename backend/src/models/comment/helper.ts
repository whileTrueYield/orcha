/**
 * Pagination helpers for Comments and CommentReplies.
 *
 * Builds Prisma queries with optional filters (ticket, author, search)
 * and returns paginated results compatible with the Paginated* types.
 *
 * Exports: getPaginatedComments, getPaginatedCommentReplies.
 */

import { clamp, trim } from "lodash";
import { Comment, Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

interface GetPaginatedCommentsArgs extends GetPageArgsFor<Comment> {
  organizationId: number;
  ticketId?: number;
  authorId?: number;
  replyId?: number | null;
  commentId?: number | null;
}

export async function getPaginatedComments(args: GetPaginatedCommentsArgs) {
  const {
    first,
    last,
    search,
    ticketId,
    organizationId,
    authorId,
    commentId,
    replyId,
  } = args;

  // default offset to be at the start (or the end depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Comment = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const commentQuery: Prisma.CommentWhereInput = {
    organizationId,
  };

  // We allow search on comments by name
  const query = trim(search);
  if (query) {
    commentQuery.OR = [
      {
        body: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        author: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // filtering by ticket ID is optional since we might also want
  // to filter by author
  if (ticketId) {
    commentQuery.ticketId = ticketId;
  }

  if (commentId) {
    commentQuery.id = commentId;
  }

  if (replyId) {
    commentQuery.replies = { some: { id: replyId } };
  }

  // optionally filter by author
  if (authorId) {
    commentQuery.authorId = authorId;
  }

  const comments = await prisma.comment.findMany({
    where: commentQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
    include: {
      author: true,
      replies: {
        orderBy: { createdAt: "desc" },
        // if a replyId is provided, capture up to the last 200 replies
        take: replyId ? 200 : 3,
        include: {
          author: true,
        },
      },
    },
  });

  const count = await prisma.comment.count({ where: commentQuery });

  return paginateNodes({ nodes: comments, offset, pageSize, count });
}

interface GetPaginatedCommentRepliesArgs extends GetPageArgsFor<Comment> {
  organizationId: number;
  commentId: number;
}

export async function getPaginatedCommentReplies(
  args: GetPaginatedCommentRepliesArgs,
) {
  const { first, last, search, commentId, organizationId } = args;

  // default offset to be at the start (or the end depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Comment = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 200;
  const pageSize = clamp(requestedPageSize, 1, 200);

  const commentReplyQuery: Prisma.CommentReplyWhereInput = {
    comment: {
      id: commentId,
      organizationId: organizationId,
    },
  };

  // We allow search on comment replies by body or author name
  const query = trim(search);
  if (query) {
    commentReplyQuery.OR = [
      {
        body: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        author: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const commentReplies = await prisma.commentReply.findMany({
    where: commentReplyQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.commentReply.count({ where: commentReplyQuery });

  return paginateNodes({ nodes: commentReplies, offset, pageSize, count });
}
