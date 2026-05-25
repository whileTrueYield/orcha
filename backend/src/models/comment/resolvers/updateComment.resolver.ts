/**
 * Mutation resolvers for updating a Comment.
 *
 * Provides:
 *  - updateComment(commentId, input):     edit a comment (author or admin only)
 *  - acceptReply(commentReplyId):         mark a reply as the accepted answer
 *
 * Requires hasRole auth scope. updateComment additionally requires ADMIN or OWNER role.
 */

import { GraphQLError } from "graphql";
import {
  NotificationCategory,
  NotificationTarget,
  RoleType,
} from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { getMentions } from "../../../utils/tiptap";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateCommentInput = builder.inputType("UpdateCommentInput", {
  fields: (t) => ({
    body: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// updateComment mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateComment", (t) =>
  t.prismaField({
    type: "Comment",
    authScopes: { hasRole: [RoleType.ADMIN, RoleType.OWNER] },
    args: {
      commentId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateCommentInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const comment = await ctx.prisma.comment.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.commentId,
        },
      });

      if (comment.body === args.input.body) {
        return comment;
      }

      if (!isAuthorOrAdmin(me, comment.authorId)) {
        throw new GraphQLError("You cannot edit this comment", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Create notifications for mentions if necessary
      const mentions = getMentions(args.input.body);
      logger.info(JSON.stringify({ mentions }));
      await createNotificationsForTarget(
        me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.COMMENT,
        comment.id,
        mentions,
        me.roleId,
        `{} mentioned you in a comment`,
        { ticket: comment.ticketId },
      );

      return ctx.prisma.comment.update({
        ...query,
        where: { id: comment.id },
        data: { body: args.input.body },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// acceptReply mutation
// ---------------------------------------------------------------------------

builder.mutationField("acceptReply", (t) =>
  t.prismaField({
    type: "Comment",
    authScopes: { hasRole: true },
    args: {
      commentReplyId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const reply = await ctx.prisma.commentReply.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.commentReplyId,
        },
        include: { comment: true },
      });

      await createNotificationsForTarget(
        me.organizationId,
        NotificationCategory.ACCEPTED_REPLY,
        NotificationTarget.REPLY,
        reply.id,
        [reply.authorId],
        me.roleId,
        `{} accepted your reply`,
        { ticket: reply.comment.ticketId, comment: reply.commentId },
      );

      return ctx.prisma.comment.update({
        ...query,
        where: { id: reply.comment.id },
        data: { acceptedReplyId: reply.id },
      });
    },
  }),
);
