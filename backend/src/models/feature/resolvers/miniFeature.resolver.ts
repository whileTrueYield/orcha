import { Query, Resolver, UseMiddleware, Ctx, Int, Arg } from "type-graphql";
import { MiniFeature } from "../entity";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { Prisma } from "@prisma/client";

@Resolver(MiniFeature)
export class MiniFeatureResolver {
  @Query((_returns) => [MiniFeature])
  @UseMiddleware(hasRole())
  async miniFeatures(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("productId", () => Int, { nullable: true }) productId?: number
  ): Promise<MiniFeature[]> {
    const featureWhereInput: Prisma.FeatureWhereInput = {
      featureGroup: {
        organizationId: ctx.me.organizationId,
      },
    };

    // for typing sakes, have to check the presence of featureGroup attr
    if (productId && featureWhereInput.featureGroup) {
      featureWhereInput.featureGroup.productId = productId;
    }

    const features = await ctx.prisma.feature.findMany({
      where: featureWhereInput,
      include: {
        featureGroup: {
          include: {
            product: true,
          },
        },
      },
    });

    return features.map(
      (feature): MiniFeature => ({
        id: feature.id,
        name: feature.name,
        featureGroupName: feature.featureGroup.name,
        productCode: feature.featureGroup.product.code,
        productName: feature.featureGroup.product.name,
      })
    );
  }
}
