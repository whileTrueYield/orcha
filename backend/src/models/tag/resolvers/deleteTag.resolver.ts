import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";
import { Tag, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Tag)
export class DeleteTagResolver {
  @Mutation((_returns) => Boolean)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("tagId", () => Int!) tagId: number
  ): Promise<boolean> {
    const tag = await ctx.prisma.tag.findFirstOrThrow({
      where: {
        id: tagId,
        organizationId: ctx.me.organizationId,
      },
    });

    await ctx.prisma.tag.delete({ where: { id: tag.id } });
    return true;
  }
}
