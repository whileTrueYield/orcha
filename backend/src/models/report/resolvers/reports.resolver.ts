import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Report, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedReports } from "../helper";
import { PaginatedReports } from "../entity";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Report)
export class ReportsResolver {
  @Query((_returns) => PaginatedReports)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async reports(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Report,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("stages", () => [ModelStage], { nullable: true }) stages: ModelStage[]
  ): Promise<PaginatedReports> {
    return getPaginatedReports({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
      stages,
    });
  }
}
