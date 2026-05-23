import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Product, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";

@Resolver(Product)
export class DeleteProductResolver {
  @Mutation((_returns) => Product, {
    deprecationReason: "Archive product instead of deleting it",
  })
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteProduct(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int!) productId: number
  ): Promise<Product> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: productId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.product.update({
      where: { id: product.id },
      data: { stage: ModelStage.DELETED },
    });
  }
}
