import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { MaxLength, Length } from "class-validator";

import { FeatureGroup, FeatureGroupStatus } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { RoleType } from "@generated/type-graphql";

@InputType()
class CreateFeatureGroupInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field(() => Int)
  productId: number;

  @Field({ nullable: true })
  @MaxLength(10 * 1024)
  description?: string;
}

@Resolver(FeatureGroup)
export class CreateFeatureGroupResolver {
  @Mutation(() => FeatureGroup)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async createFeatureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input") input: CreateFeatureGroupInput
  ): Promise<FeatureGroup> {
    const product = await ctx.prisma.product.findFirstOrThrow({
      where: {
        id: input.productId,
        organizationId: ctx.me.organizationId,
      },
    });

    return await ctx.prisma.featureGroup.create({
      data: {
        ...input,
        status: FeatureGroupStatus.ACTIVE,
        productId: product.id,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}
