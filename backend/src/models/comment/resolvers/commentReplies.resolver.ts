/**
 * Query resolver for fetching replies to a comment.
 *
 * Provides:
 *  - replies(commentId): list of CommentReply records (last 200, desc by date)
 *
 * Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("replies", (t) =>
  t.prismaField({
    type: ["CommentReply"],
    authScopes: { hasRole: true },
    args: {
      commentId: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.commentReply.findMany({
        ...query,
        where: {
          comment: {
            id: args.commentId,
            organizationId: me.organizationId,
          },
        },
        // capture the last 200
        orderBy: { createdAt: "desc" },
        take: 200,
      });
    },
  }),
);
