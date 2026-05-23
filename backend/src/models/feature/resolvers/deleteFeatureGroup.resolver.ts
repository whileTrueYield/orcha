import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { FeatureGroup, RoleType, Product } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(FeatureGroup)
export class DeleteFeatureGroupResolver {
  @Mutation((_returns) => Product)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteFeatureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("featureGroupId", () => Int!) featureGroupId: number
  ): Promise<Product> {
    const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
      where: {
        id: featureGroupId,
        organizationId: ctx.me.organizationId,
      },
    });

    await ctx.prisma.featureGroup.delete({ where: { id: featureGroupId } });

    return ctx.prisma.product.findUniqueOrThrow({
      where: { id: featureGroup.productId },
    });
  }
}
