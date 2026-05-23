import {
  Arg,
  Query,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  FieldResolver,
  Root,
  Mutation,
} from "type-graphql";

import {
  Feature,
  FeatureGroup,
  RoleType,
  Product,
  Organization,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import { trim } from "lodash";
import { PaginatedFeatures } from "../entity";
import { getPaginatedFeatures } from "../helper";

@Resolver(FeatureGroup)
export class FeatureGroupResolver {
  @Query(() => FeatureGroup)
  @UseMiddleware(hasRole())
  async featureGroup(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<FeatureGroup> {
    return ctx.prisma.featureGroup.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });
  }

  @Mutation(() => FeatureGroup)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async addFeature(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("featureGroupId", () => Int)
    featureGroupId: number,
    @Arg("name", () => String)
    name: string
  ): Promise<FeatureGroup> {
    const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
      where: {
        id: featureGroupId,
        organizationId: ctx.me.organizationId,
      },
    });

    await ctx.prisma.feature.create({
      data: {
        name: trim(name),
        featureGroupId,
      },
    });

    return featureGroup;
  }

  @Mutation(() => FeatureGroup)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteFeature(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("featureId", () => Int)
    featureId: number
  ): Promise<FeatureGroup> {
    const feature = await ctx.prisma.feature.findFirstOrThrow({
      where: {
        id: featureId,
        featureGroup: {
          organizationId: ctx.me.organizationId,
        },
      },
    });

    await ctx.prisma.feature.delete({ where: { id: featureId } });

    return ctx.prisma.featureGroup.findUniqueOrThrow({
      where: { id: feature.featureGroupId },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() featureGroup: FeatureGroup
  ): Promise<Organization> {
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: featureGroup.organizationId },
    });
  }

  @FieldResolver((_returns) => Product)
  async product(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() featureGroup: FeatureGroup
  ): Promise<Product> {
    return ctx.prisma.product.findUniqueOrThrow({
      where: {
        id: featureGroup.productId,
      },
    });
  }

  @FieldResolver((_returns) => PaginatedFeatures)
  async features(
    @Root() featureGroup: FeatureGroup,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Feature,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedFeatures> {
    return getPaginatedFeatures({
      organizationId: ctx.me.organizationId,
      featureGroupId: featureGroup.id,
      first,
      last,
      offset,
      sort,
    });
  }
}
