import { Query, Resolver, Ctx, UseMiddleware } from "type-graphql";
import { FeatureFlag } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(FeatureFlag)
export class FeatureFlagResolver {
  @Query(() => FeatureFlag)
  @UseMiddleware(hasRole())
  async featureFlag(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<FeatureFlag> {
    const featureFlag = await ctx.prisma.featureFlag.findUnique({
      where: { organizationId: ctx.me.organizationId },
    });

    if (featureFlag) {
      return featureFlag;
    }

    // create the featureFlag object if none exist yet for that organization
    return ctx.prisma.featureFlag.create({
      data: { organizationId: ctx.me.organizationId },
    });
  }
}
