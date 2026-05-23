import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";
import { PersonalTag, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(PersonalTag)
export class DeletePersonalTagResolver {
  @Mutation((_returns) => Boolean)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deletePersonalTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("personalTagId", () => Int!) personalTagId: number
  ): Promise<boolean> {
    const personalTag = await ctx.prisma.personalTag.findFirstOrThrow({
      where: {
        id: personalTagId,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });

    await ctx.prisma.personalTag.delete({ where: { id: personalTag.id } });
    return true;
  }
}
