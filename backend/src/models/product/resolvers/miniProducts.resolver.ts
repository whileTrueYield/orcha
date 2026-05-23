import { Query, Resolver, UseMiddleware, Ctx } from "type-graphql";
import { MiniProduct } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";

@Resolver(MiniProduct)
export class MiniProductsResolver {
  @Query((_returns) => [MiniProduct])
  @UseMiddleware(hasRole())
  async miniProducts(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<MiniProduct[]> {
    const products = await ctx.prisma.product.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    return products.map(
      (product): MiniProduct => ({
        id: product.id,
        name: product.name,
        stage: product.stage,
      })
    );
  }
}
