import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Team, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Team)
export class DeleteTeamResolver {
  @Mutation((_returns) => Boolean)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteTeam(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("teamId", () => Int!) teamId: number
  ): Promise<boolean> {
    const team = await ctx.prisma.team.findFirstOrThrow({
      where: {
        id: teamId,
        organizationId: ctx.me.organizationId,
      },
    });

    await ctx.prisma.team.delete({ where: { id: team.id } });
    return true;
  }
}
