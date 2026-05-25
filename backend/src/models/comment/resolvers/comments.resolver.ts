/**
 * Query resolver for fetching paginated Comments.
 *
 * Provides:
 *  - comments(ticketId, first, last, offset, sort, search, commentId, replyId):
 *    paginated list scoped to organization
 *
 * Delegates to getPaginatedComments helper. Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { PaginatedComments } from "../entity";
import { getPaginatedComments } from "../helper";

builder.queryField("comments", (t) =>
  t.field({
    type: PaginatedComments,
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      commentId: t.arg.int({ required: false }),
      replyId: t.arg.int({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedComments({
        organizationId: me.organizationId,
        ticketId: args.ticketId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
        commentId: args.commentId ?? undefined,
        replyId: args.replyId ?? undefined,
      });
    },
  }),
);
