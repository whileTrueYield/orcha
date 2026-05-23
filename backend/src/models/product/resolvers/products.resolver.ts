import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Product, ModelStage } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedProducts } from "../helper";
import { PaginatedProducts } from "../entity";

@Resolver(Product)
export class ProductsResolver {
  @Query((_returns) => PaginatedProducts)
  @UseMiddleware(hasRole())
  async products(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Product,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("stages", () => [ModelStage], { nullable: true }) stages: ModelStage[]
  ): Promise<PaginatedProducts> {
    return getPaginatedProducts({
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
