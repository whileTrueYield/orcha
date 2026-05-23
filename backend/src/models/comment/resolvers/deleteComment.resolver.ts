import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";
import { Comment, NotificationTarget } from "@generated/type-graphql";

import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { map } from "lodash";

@Resolver(Comment)
export class DeleteCommentResolver {
  @Mutation((_returns) => Boolean)
  @UseMiddleware(hasRole([]))
  async deleteComment(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentId", () => Int!) commentId: number
  ): Promise<boolean> {
    const comment = await ctx.prisma.comment.findFirstOrThrow({
      where: {
        id: commentId,
        organizationId: ctx.me.organizationId,
      },
      include: {
        replies: true,
      },
    });

    if (isAuthorOrAdmin(ctx.me, comment.authorId)) {
      await ctx.prisma.comment.delete({ where: { id: comment.id } });

      // delete all notifications relating to this comment
      await ctx.prisma.notification.deleteMany({
        where: { target: NotificationTarget.COMMENT, targetId: comment.id },
      });

      // ... then delete notifications relating to its replies
      const replyIds = map(comment.replies, "id");
      await ctx.prisma.notification.deleteMany({
        where: { target: NotificationTarget.REPLY, targetId: { in: replyIds } },
      });

      return true;
    } else {
      throw new UserInputError("You cannot delete this comment");
    }
  }
}
