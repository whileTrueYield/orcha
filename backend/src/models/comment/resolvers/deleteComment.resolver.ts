/**
 * Mutation resolver for deleting a Comment.
 *
 * Provides:
 *  - deleteComment(commentId): deletes a comment and its related notifications
 *
 * Requires hasRole auth scope. Only the author or an admin can delete.
 * Also cleans up notifications for the comment and all its replies.
 */

import { GraphQLError } from "graphql";
import { NotificationTarget } from "@prisma/client";
import { map } from "lodash";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { isAuthorOrAdmin } from "../../../utils/rbac";

builder.mutationField("deleteComment", (t) =>
  t.boolean({
    authScopes: { hasRole: true },
    args: {
      commentId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const comment = await ctx.prisma.comment.findFirstOrThrow({
        where: {
          id: args.commentId,
          organizationId: me.organizationId,
        },
        include: { replies: true },
      });

      if (!isAuthorOrAdmin(me, comment.authorId)) {
        throw new GraphQLError("You cannot delete this comment", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      await ctx.prisma.comment.delete({ where: { id: comment.id } });

      // delete all notifications relating to this comment
      await ctx.prisma.notification.deleteMany({
        where: { target: NotificationTarget.COMMENT, targetId: comment.id },
      });

      // ... then delete notifications relating to its replies
      const replyIds = map(comment.replies, "id");
      await ctx.prisma.notification.deleteMany({
        where: {
          target: NotificationTarget.REPLY,
          targetId: { in: replyIds },
        },
      });

      return true;
    },
  }),
);
