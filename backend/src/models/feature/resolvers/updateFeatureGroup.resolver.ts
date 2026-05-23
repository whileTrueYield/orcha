import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, MaxLength } from "class-validator";
import { FeatureGroup, RoleType } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@InputType()
class UpdateFeatureGroupInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field({ nullable: true })
  @MaxLength(10 * 1024)
  description: string;
}

@Resolver(FeatureGroup)
export class UpdateFeatureResolver {
  @Mutation(() => FeatureGroup)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateFeatureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("featureGroupId", () => Int) featureGroupId: number,
    @Arg("input", () => UpdateFeatureGroupInput) input: UpdateFeatureGroupInput
  ): Promise<FeatureGroup> {
    const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
      where: {
        id: featureGroupId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.featureGroup.update({
      where: { id: featureGroup.id },
      data: input,
    });
  }
}
