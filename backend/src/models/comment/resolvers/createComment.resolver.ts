import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { Length } from "class-validator";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  Ticket,
  NotificationCategory,
  NotificationTarget,
} from "@generated/type-graphql";
import { getMentions } from "../../../utils/tiptap";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";

@InputType()
class CreateCommentInput {
  @Field({ nullable: true })
  @Length(1, 2048)
  body: string;
}

@Resolver(Ticket)
export class CreateCommentResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async createComment(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("input")
    input: CreateCommentInput,
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: ticketId,
      },
      include: {
        watchers: true,
      },
    });

    const comment = await ctx.prisma.comment.create({
      data: {
        ...input,
        ticketId,
        authorId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
      },
    });

    // we want to notify a role only once, so we store the
    // list of notified roles in there
    let notifiedRolesForAction: number[] = [];

    // Create notifications if necessary
    const mentions = getMentions(comment.body);
    logger.info(JSON.stringify({ mentions }));
    if (mentions.length > 0) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.COMMENT,
        comment.id,
        mentions,
        ctx.me.roleId,
        `{} mentioned you in a comment`,
        { ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    // notify the ticket's owner
    if (ticket.ownerId) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.OWNED,
        NotificationTarget.COMMENT,
        comment.id,
        [ticket.ownerId],
        ctx.me.roleId,
        `{} posted a comment on a ticket you own`,
        { ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    // notify any ticket watcher
    if (ticket.watchers.length) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.WATCHED,
        NotificationTarget.COMMENT,
        comment.id,
        ticket.watchers.map((role) => role.id),
        ctx.me.roleId,
        `{} posted a comment on a ticket you watch`,
        { ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    return ticket;
  }
}
