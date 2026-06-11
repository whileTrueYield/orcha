/**
 * Query resolver and reply mutations for the Comment model.
 *
 * Provides:
 *  - comment(id):                         fetch a single comment by ID
 *  - addReply(commentId, input):          add a reply to a comment
 *  - deleteReply(commentReplyId):         delete a reply (author or admin only)
 *  - updateReply(commentReplyId, input):  edit a reply (author or admin only)
 *
 * The reply mutations live here because they were historically part of the
 * Comment resolver and tightly coupled to comment ownership checks.
 *
 * Requires hasRole auth scope. Notifications are created for mentions,
 * comment authors, ticket owners, and ticket watchers.
 */

import { GraphQLError } from "graphql";
import { NotificationCategory, NotificationTarget } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { analyze } from "../../../markdown/analysis";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";
import { isAuthorOrAdmin } from "../../../utils/rbac";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const AddReplyInput = builder.inputType("AddReplyInput", {
  fields: (t) => ({
    body: t.string({ required: true }),
  }),
});

const UpdateReplyInput = builder.inputType("UpdateReplyInput", {
  fields: (t) => ({
    // TODO: we should allow for an empty field that would delete the reply
    body: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// comment query — fetch a single comment by ID
// ---------------------------------------------------------------------------

builder.queryField("comment", (t) =>
  t.prismaField({
    type: "Comment",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.comment.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// addReply mutation
// ---------------------------------------------------------------------------

builder.mutationField("addReply", (t) =>
  t.prismaField({
    type: "CommentReply",
    authScopes: { hasRole: true },
    args: {
      commentId: t.arg.int({ required: true }),
      input: t.arg({ type: AddReplyInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const comment = await ctx.prisma.comment.findFirstOrThrow({
        where: {
          id: args.commentId,
          organizationId: me.organizationId,
        },
        include: { ticket: { include: { watchers: true } } },
      });

      const reply = await ctx.prisma.commentReply.create({
        ...query,
        data: {
          body: args.input.body,
          authorId: me.roleId,
          organizationId: me.organizationId,
          commentId: args.commentId,
        },
      });

      const mentions = analyze(reply.body).mentions;
      logger.info(JSON.stringify({ mentions }));
      let notifiedRolesForAction: number[] = [];

      // Create notifications for the mentioned if necessary
      if (mentions.length > 0) {
        const notifiedRoleIds = await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.MENTION,
          NotificationTarget.REPLY,
          reply.id,
          mentions,
          me.roleId,
          `{} mentioned you in a reply`,
          { comment: comment.id, ticket: comment.ticketId },
        );
        notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
      }

      // notify the author of the comment only if the reply comes
      // from someone different than the author themselves
      if (comment.authorId !== me.roleId) {
        const notifiedRoleIds = await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.REPLY,
          NotificationTarget.REPLY,
          reply.id,
          [comment.authorId],
          me.roleId,
          `{} replied to your comment`,
          { comment: comment.id, ticket: comment.ticketId },
          notifiedRolesForAction,
        );
        notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
      }

      // notify the ticket owner
      if (comment.ticket.ownerId && comment.ticket.ownerId !== me.roleId) {
        const notifiedRoleIds = await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.OWNED,
          NotificationTarget.REPLY,
          reply.id,
          [comment.ticket.ownerId],
          me.roleId,
          `{} posted a reply on a ticket you own`,
          { comment: comment.id, ticket: comment.ticketId },
          notifiedRolesForAction,
        );
        notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
      }

      if (comment.ticket.watchers.length) {
        await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.WATCHED,
          NotificationTarget.COMMENT,
          comment.id,
          comment.ticket.watchers.map((role) => role.id),
          me.roleId,
          `{} posted a reply on a ticket you watch`,
          { ticket: comment.ticketId },
          notifiedRolesForAction,
        );
      }

      return reply;
    },
  }),
);

// ---------------------------------------------------------------------------
// deleteReply mutation
// ---------------------------------------------------------------------------

builder.mutationField("deleteReply", (t) =>
  t.int({
    authScopes: { hasRole: true },
    args: {
      commentReplyId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const commentReply = await ctx.prisma.commentReply.findFirstOrThrow({
        where: {
          id: args.commentReplyId,
          comment: {
            organizationId: me.organizationId,
          },
        },
      });

      if (!isAuthorOrAdmin(me, commentReply.authorId)) {
        throw new GraphQLError("You cannot delete this reply", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      await ctx.prisma.commentReply.delete({
        where: { id: commentReply.id },
      });

      // delete all notifications relating to this reply
      await ctx.prisma.notification.deleteMany({
        where: {
          target: NotificationTarget.REPLY,
          targetId: args.commentReplyId,
        },
      });

      return args.commentReplyId;
    },
  }),
);

// ---------------------------------------------------------------------------
// updateReply mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateReply", (t) =>
  t.prismaField({
    type: "CommentReply",
    authScopes: { hasRole: true },
    args: {
      commentReplyId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateReplyInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const commentReply = await ctx.prisma.commentReply.findFirstOrThrow({
        where: {
          id: args.commentReplyId,
          comment: {
            organizationId: me.organizationId,
          },
        },
        include: { comment: true },
      });

      if (!isAuthorOrAdmin(me, commentReply.authorId)) {
        throw new GraphQLError("You cannot edit this reply", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Create notifications for mentions if necessary
      const mentions = analyze(args.input.body).mentions;
      logger.info(JSON.stringify({ mentions }));
      await createNotificationsForTarget(
        me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.REPLY,
        args.commentReplyId,
        mentions,
        me.roleId,
        `{} mentioned you in a reply`,
        {
          comment: commentReply.comment.id,
          ticket: commentReply.comment.ticketId,
        },
      );

      return ctx.prisma.commentReply.update({
        ...query,
        where: { id: commentReply.id },
        data: { body: args.input.body },
      });
    },
  }),
);
