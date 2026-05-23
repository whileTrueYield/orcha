import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { Length } from "class-validator";
import {
  NotificationCategory,
  Comment,
  RoleType,
  NotificationTarget,
} from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { getMentions } from "../../../utils/tiptap";
import { logger } from "../../../logger";
import { createNotificationsForTarget } from "../../notification/createNotification";

@InputType()
class UpdateCommentInput {
  @Field()
  @Length(1, 2048)
  body: string;
}

@Resolver(Comment)
export class UpdateCommentResolver {
  @Mutation(() => Comment)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateComment(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentId", () => Int) commentId: number,
    @Arg("input", () => UpdateCommentInput) input: UpdateCommentInput,
  ): Promise<Comment> {
    const comment = await ctx.prisma.comment.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: commentId,
      },
    });

    if (comment.body === input.body) {
      return comment;
    }

    if (isAuthorOrAdmin(ctx.me, comment.authorId)) {
      // Create notifications if necessary
      const mentions = getMentions(input.body);
      logger.info(JSON.stringify({ mentions }));
      await createNotificationsForTarget(
        ctx.me.organizationId,
        NotificationCategory.MENTION,
        NotificationTarget.COMMENT,
        comment.id,
        mentions,
        ctx.me.roleId,
        `{} mentioned you in a comment`,
        { ticket: comment.ticketId },
      );

      return ctx.prisma.comment.update({
        where: { id: comment.id },
        data: input,
      });
    } else {
      throw new UserInputError("You cannot edit this comment");
    }
  }

  @Mutation(() => Comment)
  @UseMiddleware(hasRole())
  async acceptReply(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentReplyId", () => Int) commentReplyId: number,
  ): Promise<Comment> {
    const reply = await ctx.prisma.commentReply.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: commentReplyId,
      },
      include: {
        comment: true,
      },
    });

    await createNotificationsForTarget(
      ctx.me.organizationId,
      NotificationCategory.ACCEPTED_REPLY,
      NotificationTarget.REPLY,
      reply.id,
      [reply.authorId],
      ctx.me.roleId,
      `{} accepted your reply`,
      { ticket: reply.comment.ticketId, comment: reply.commentId },
    );

    return ctx.prisma.comment.update({
      where: { id: reply.comment.id },
      data: {
        acceptedReplyId: reply.id,
      },
    });
  }
}
