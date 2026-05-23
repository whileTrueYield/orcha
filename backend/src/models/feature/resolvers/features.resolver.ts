import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Feature } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { PaginatedFeatures } from "../entity";
import { getPaginatedFeatures } from "../helper";

@Resolver(Feature)
export class FeaturesResolver {
  @Query((_returns) => PaginatedFeatures)
  @UseMiddleware(hasRole())
  async features(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Feature,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("productId", () => Int, { nullable: true }) productId: number
  ) {
    return getPaginatedFeatures({
      organizationId: ctx.me.organizationId,
      productId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
