import { Resolver, Ctx, Query, UseMiddleware, Arg, Int } from "type-graphql";
import { CommentReply } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@Resolver()
export class CommentRepliesResolver {
  @Query(() => [CommentReply])
  @UseMiddleware(hasRole())
  async replies(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("commentId", () => Int) commentId: number
  ): Promise<CommentReply[]> {
    return await ctx.prisma.commentReply.findMany({
      where: {
        comment: {
          id: commentId,
          organizationId: ctx.me.organizationId,
        },
      },
      include: { author: true },
      // capture the last 200
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }
}
