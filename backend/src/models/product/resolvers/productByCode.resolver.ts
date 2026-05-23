import { Arg, Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { Product } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Product)
export class ProductByCodeResolver {
  @Query(() => Product)
  @UseMiddleware(hasRole())
  async productByCode(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("code") code: string
  ): Promise<Product> {
    return ctx.prisma.product.findFirstOrThrow({
      where: {
        code,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}
