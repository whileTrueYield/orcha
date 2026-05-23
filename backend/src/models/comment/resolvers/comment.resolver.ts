import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
  Mutation,
  InputType,
  Field,
} from "type-graphql";
import {
  Role,
  Ticket,
  Organization,
  Comment,
  CommentReply,
  NotificationCategory,
  NotificationTarget,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { MaxLength } from "class-validator";
import { UserInputError } from "apollo-server-express";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { getMentions } from "../../../utils/tiptap";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";

@InputType()
class AddReplyInput {
  @Field()
  @MaxLength(2048)
  body: string;
}

@InputType()
class UpdateReplyInput {
  // TODO: we should allow for an empty field that would delete the reply
  @Field()
  @MaxLength(2048)
  body: string;
}

@Resolver(Comment)
export class CommentResolver {
  @Mutation(() => CommentReply)
  @UseMiddleware(hasRole())
  async addReply(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentId", () => Int)
    commentId: number,
    @Arg("input")
    input: AddReplyInput,
  ): Promise<CommentReply> {
    const comment = await ctx.prisma.comment.findFirstOrThrow({
      where: {
        id: commentId,
        organizationId: ctx.me.organizationId,
      },
      include: { ticket: { include: { watchers: true } } },
    });

    const reply = await ctx.prisma.commentReply.create({
      data: {
        ...input,
        authorId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        commentId,
      },
    });

    const mentions = getMentions(reply.body);
    logger.info(JSON.stringify({ mentions }));
    let notifiedRolesForAction: number[] = [];

    // Create notifications for the mentioned if necessary
    if (mentions.length > 0) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.REPLY,
        reply.id,
        mentions,
        ctx.me.roleId,
        `{} mentioned you in a reply`,
        { comment: comment.id, ticket: comment.ticketId },
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    // notify the author of the comment only if the reply comes
    // from someone different than the author themselve
    if (comment.authorId !== ctx.me.roleId) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.REPLY,
        NotificationTarget.REPLY,
        reply.id,
        [comment.authorId],
        ctx.me.roleId,
        `{} replied to your comment`,
        { comment: comment.id, ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    // notify the ticket owner
    if (comment.ticket.ownerId && comment.ticket.ownerId !== ctx.me.roleId) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.OWNED,
        NotificationTarget.REPLY,
        reply.id,
        [comment.ticket.ownerId],
        ctx.me.roleId,
        `{} posted a reply on a ticket you own`,
        { comment: comment.id, ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }
    if (comment.ticket.watchers.length) {
      const notifiedRoleIds = await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.WATCHED,
        NotificationTarget.COMMENT,
        comment.id,
        comment.ticket.watchers.map((role) => role.id),
        ctx.me.roleId,
        `{} posted a reply on a ticket you watch`,
        { ticket: comment.ticketId },
        notifiedRolesForAction,
      );

      // update the list of notified roles
      notifiedRolesForAction = [...notifiedRoleIds, ...notifiedRolesForAction];
    }

    return reply;
  }

  @Mutation(() => Int)
  @UseMiddleware(hasRole())
  async deleteReply(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentReplyId", () => Int)
    commentReplyId: number,
  ): Promise<number> {
    // making sure the comment this replies belongs to is
    // associated with the organization of the current user
    const commentReply = await ctx.prisma.commentReply.findFirstOrThrow({
      where: {
        id: commentReplyId,
        comment: {
          organizationId: ctx.me.organizationId,
        },
      },
    });

    if (isAuthorOrAdmin(ctx.me, commentReply.authorId)) {
      await ctx.prisma.commentReply.delete({
        where: { id: commentReply.id },
      });

      // delete all notifications relating to this reply
      await ctx.prisma.notification.deleteMany({
        where: { target: NotificationTarget.REPLY, targetId: commentReplyId },
      });

      return commentReplyId;
    } else {
      throw new UserInputError("You cannot delete this reply");
    }
  }

  @Mutation(() => CommentReply)
  @UseMiddleware(hasRole())
  async updateReply(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentReplyId", () => Int)
    commentReplyId: number,
    @Arg("input")
    input: UpdateReplyInput,
  ): Promise<CommentReply> {
    // making sure the comment this replies belongs to is
    // associated with the organization of the current user
    const commentReply = await ctx.prisma.commentReply.findFirstOrThrow({
      where: {
        id: commentReplyId,
        comment: {
          organizationId: ctx.me.organizationId,
        },
      },
      include: {
        comment: true,
      },
    });

    if (isAuthorOrAdmin(ctx.me, commentReply.authorId)) {
      // Create notifications if necessary
      const mentions = getMentions(input.body);
      logger.info(JSON.stringify({ mentions }));
      await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.REPLY,
        commentReplyId,
        mentions,
        ctx.me.roleId,
        `{} mentioned you in a reply`,
        {
          comment: commentReply.comment.id,
          ticket: commentReply.comment.ticketId,
        },
      );

      return ctx.prisma.commentReply.update({
        where: { id: commentReply.id },
        data: input,
      });
    } else {
      throw new UserInputError("You cannot edit this reply");
    }
  }

  @Query(() => Comment!)
  @UseMiddleware(hasRole())
  async comment(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
  ): Promise<Comment> {
    return await ctx.prisma.comment.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: { author: true },
    });
  }

  @FieldResolver((_returns) => Ticket)
  async ticket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<Ticket> {
    return ctx.prisma.ticket.findUniqueOrThrow({
      where: { id: comment.ticketId },
    });
  }

  @FieldResolver((_returns) => Ticket)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<Organization> {
    if (comment.organization) {
      return comment.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: comment.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<Role> {
    if (comment.author) {
      return comment.author;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: comment.authorId },
    });
  }

  @FieldResolver((_returns) => CommentReply, { nullable: true })
  async acceptedReply(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<CommentReply | null> {
    if (comment.acceptedReplyId) {
      if (comment.acceptedReply) {
        return comment.acceptedReply;
      }

      return ctx.prisma.commentReply.findUniqueOrThrow({
        where: { id: comment.acceptedReplyId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => Int)
  async replyCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<number> {
    return ctx.prisma.commentReply.count({
      where: {
        commentId: comment.id,
      },
    });
  }

  @FieldResolver((_returns) => [CommentReply])
  async replies(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: Comment,
  ): Promise<CommentReply[]> {
    if (comment.replies) {
      return comment.replies;
    } else {
      return ctx.prisma.commentReply.findMany({
        where: {
          commentId: comment.id,
        },
        include: {
          author: true,
        },
      });
    }
  }
}
