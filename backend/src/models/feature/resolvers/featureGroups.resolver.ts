import {
  Arg,
  Query,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  ID,
} from "type-graphql";

import { FeatureGroup } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { getPaginatedFeatureGroups } from "../helper";
import { PaginatedFeatureGroups } from "../entity";

@Resolver(FeatureGroup)
export class FeatureGroupsResolver {
  @Query((_returns) => PaginatedFeatureGroups)
  @UseMiddleware(hasRole())
  async featureGroups(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof FeatureGroup,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("productId", () => ID, { nullable: true }) productId: number
  ) {
    return getPaginatedFeatureGroups({
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
