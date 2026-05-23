import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Team } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedTeams } from "../entity";
import { getPaginatedTeams } from "../helper";

@Resolver(Team)
export class TeamsResolver {
  @Query((_returns) => PaginatedTeams)
  @UseMiddleware(hasRole())
  async teams(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Team,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedTeams> {
    return getPaginatedTeams({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
