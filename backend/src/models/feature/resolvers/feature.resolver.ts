import { MaxLength } from "class-validator";
import {
  Resolver,
  FieldResolver,
  Root,
  Mutation,
  UseMiddleware,
  Int,
  InputType,
  Field,
  Ctx,
  Arg,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { Feature, FeatureGroup, RoleType } from "@generated/type-graphql";

@InputType()
class UpdateFeatureInput {
  @Field()
  @MaxLength(50)
  name: string;
}

@Resolver(Feature)
export class FeatureResolver {
  @Mutation(() => Feature)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateFeature(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("featureId", () => Int)
    featureId: number,
    @Arg("input")
    input: UpdateFeatureInput
  ): Promise<Feature> {
    const feature = await ctx.prisma.feature.findFirstOrThrow({
      where: {
        id: featureId,
        featureGroup: {
          organizationId: ctx.me.organizationId,
        },
      },
      include: { featureGroup: true },
    });

    return ctx.prisma.feature.update({
      where: { id: feature.id },
      data: input,
    });
  }

  @FieldResolver((_returns) => FeatureGroup)
  async featureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() feature: Feature
  ): Promise<FeatureGroup> {
    if (feature.featureGroup) {
      return feature.featureGroup;
    }

    return ctx.prisma.featureGroup.findUniqueOrThrow({
      where: { id: feature.featureGroupId },
    });
  }
}
