import { Arg, Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { Team } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { findTeamByCode } from "../helper";

@Resolver(Team)
export class TeamByCodeResolver {
  @Query(() => Team)
  @UseMiddleware(hasRole())
  async teamByCode(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("code") code: string
  ): Promise<Team> {
    const team = await findTeamByCode(code, ctx.me.organizationId);

    if (!team) {
      throw new UserInputError("This team does not exist or has been deleted");
    }
    return team;
  }
}
