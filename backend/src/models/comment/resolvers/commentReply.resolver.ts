import {
  Resolver,
  FieldResolver,
  Root,
  Ctx,
  Query,
  UseMiddleware,
  Arg,
  Int,
} from "type-graphql";
import { Role, CommentReply } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@Resolver(CommentReply)
export class CommentReplyResolver {
  @Query(() => CommentReply)
  @UseMiddleware(hasRole())
  async comment(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<CommentReply> {
    return await ctx.prisma.commentReply.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: { author: true },
    });
  }

  @FieldResolver((_returns) => Role)
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() comment: CommentReply
  ): Promise<Role> {
    if (comment.author) {
      return comment.author;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: comment.authorId },
    });
  }
}
