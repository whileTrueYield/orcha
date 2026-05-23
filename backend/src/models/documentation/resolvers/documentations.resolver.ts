import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Documentation, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedDocumentations } from "../helper";
import { PaginatedDocumentations } from "../entity";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Documentation)
export class DocumentationsResolver {
  @Query((_returns) => PaginatedDocumentations)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.DOCUMENTATION))
  async documentations(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Documentation,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("stages", () => [ModelStage], { nullable: true }) stages: ModelStage[]
  ): Promise<PaginatedDocumentations> {
    return getPaginatedDocumentations({
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
