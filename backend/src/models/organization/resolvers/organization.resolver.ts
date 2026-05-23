import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  UseMiddleware,
  Ctx,
} from "type-graphql";
import {
  Organization,
  OrganizationAddress,
  Role,
} from "@generated/type-graphql";
import {
  DEFAULT_ORGANIZATION_PREFERENCES,
  OnboardingStatus,
  OrganizationPreferences,
} from "../entity";
import { PaginatedRoles } from "../../role/entity";
import { getPaginatedRoles } from "../../role/helper";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage } from "@prisma/client";
import { logger } from "../../../logger";

@Resolver(Organization)
export class OrganizationResolver {
  @Query(() => Organization)
  @UseMiddleware(hasRole())
  async organization(@Ctx() ctx: AppContext<AuthRoleContext>) {
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: ctx.me.organizationId },
    });
  }

  @FieldResolver((_returns) => OrganizationAddress, { nullable: true })
  async billingAddress(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() organization: Organization
  ): Promise<OrganizationAddress | null> {
    if (organization.billingAddressId) {
      if (organization.billingAddress) {
        return organization.billingAddress;
      }
      return ctx.prisma.organizationAddress.findUnique({
        where: { id: organization.billingAddressId },
      });
    }
    return null;
  }

  @FieldResolver((_returns) => OnboardingStatus)
  async onboardingStatus(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() organization: Organization
  ): Promise<OnboardingStatus> {
    const products = await ctx.prisma.product.count({
      where: {
        organizationId: organization.id,
        stage: { not: ModelStage.DELETED },
      },
    });

    const roles = await ctx.prisma.role.count({
      where: { organizationId: organization.id },
    });

    const ticket = await ctx.prisma.ticket.count({
      where: {
        organizationId: organization.id,
        stage: { not: ModelStage.DELETED },
      },
    });

    return {
      invite: roles > 1,
      product: products > 0,
      ticket: ticket > 0,
    };
  }

  @FieldResolver((_returns) => PaginatedRoles)
  async roles(
    @Root() organization: Organization,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Role
  ): Promise<PaginatedRoles> {
    return getPaginatedRoles({
      first,
      last,
      offset,
      sort,
      organizationId: organization.id,
    });
  }

  @FieldResolver(() => OrganizationPreferences)
  async preferences(@Root() role: Role): Promise<OrganizationPreferences> {
    try {
      if (role.preferences) {
        return {
          ...DEFAULT_ORGANIZATION_PREFERENCES,
          ...JSON.parse(role.preferences),
        };
      }
    } catch {
      logger.warn(
        `Could not parse preferences for role ${role.id}: ${role.preferences}`
      );
    }

    return DEFAULT_ORGANIZATION_PREFERENCES;
  }
}
