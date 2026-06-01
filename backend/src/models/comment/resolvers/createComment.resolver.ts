/**
 * Mutation resolver for creating a Comment on a Ticket.
 *
 * Provides:
 *  - createComment(ticketId, input): creates a comment and returns the parent Ticket
 *
 * Requires hasRole auth scope. Creates notifications for:
 *  - mentioned users
 *  - ticket owner
 *  - ticket watchers
 */

import { NotificationCategory, NotificationTarget } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { analyze } from "../../../markdown/analysis";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";
import { assertLength } from "../../../utils/validation";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateCommentInput = builder.inputType("CreateCommentInput", {
  fields: (t) => ({
    body: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// createComment mutation — returns the parent Ticket
// ---------------------------------------------------------------------------

builder.mutationField("createComment", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateCommentInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      // Legacy contract: a comment body, when provided, must be 1–2048 chars
      // (an empty string is rejected). Mirrors the old @Length(1, 2048).
      if (args.input.body !== null && args.input.body !== undefined) {
        assertLength(args.input.body, 1, 2048, "body");
      }

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.ticketId,
        },
        include: { watchers: true },
      });

      const comment = await ctx.prisma.comment.create({
        data: {
          body: args.input.body ?? "",
          ticketId: args.ticketId,
          authorId: me.roleId,
          organizationId: me.organizationId,
        },
      });

      // we want to notify a role only once, so we store the
      // list of notified roles in there
      let notifiedRolesForAction: number[] = [];

      // Create notifications if necessary
      const mentions = analyze(comment.body).mentions;
      logger.info(JSON.stringify({ mentions }));
      if (mentions.length > 0) {
        const notifiedRoleIds = await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.MENTION,
          NotificationTarget.COMMENT,
          comment.id,
          mentions,
          me.roleId,
          `{} mentioned you in a comment`,
          { ticket: comment.ticketId },
          notifiedRolesForAction,
        );
        notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
      }

      // notify the ticket's owner
      if (ticket.ownerId) {
        const notifiedRoleIds = await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.OWNED,
          NotificationTarget.COMMENT,
          comment.id,
          [ticket.ownerId],
          me.roleId,
          `{} posted a comment on a ticket you own`,
          { ticket: comment.ticketId },
          notifiedRolesForAction,
        );
        notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
      }

      // notify any ticket watcher
      if (ticket.watchers.length) {
        await createNotificationsForTarget(
          me.organizationId,
          NotificationCategory.WATCHED,
          NotificationTarget.COMMENT,
          comment.id,
          ticket.watchers.map((role) => role.id),
          me.roleId,
          `{} posted a comment on a ticket you watch`,
          { ticket: comment.ticketId },
          notifiedRolesForAction,
        );
      }

      // Return the ticket so the frontend can refresh its state
      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);
