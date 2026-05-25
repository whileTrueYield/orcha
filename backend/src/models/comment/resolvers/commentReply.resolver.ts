/**
 * Query resolver for fetching a single CommentReply.
 *
 * Provides:
 *  - commentReply(id): fetch a single reply by ID (scoped to org)
 *
 * Requires hasRole auth scope.
 *
 * NOTE: The original TypeGraphQL resolver registered this query as "comment"
 * which collided with the Comment query. This was renamed to "commentReply"
 * to avoid the conflict.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("commentReply", (t) =>
  t.prismaField({
    type: "CommentReply",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.commentReply.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
        },
      });
    },
  }),
);
