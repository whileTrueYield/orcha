import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length, MaxLength, IsUrl } from "class-validator";
import { Organization, RoleType } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { AppContext, AuthRoleContext } from "../../../types";
import { findOrganizationByName } from "../helper";

@InputType()
class UpdateOrganizationAddressInput {
  @Field()
  @Length(1, 128)
  address1: string;

  @Field({ nullable: true })
  @Length(1, 128)
  address2?: string;

  @Field()
  @Length(1, 10)
  zipcode: string;

  @Field()
  @Length(1, 128)
  city: string;

  @Field()
  @Length(1, 128)
  state: string;

  @Field()
  @Length(1, 128)
  country: string;
}

@InputType()
class UpdateOrganizationInput {
  @Field({ nullable: true })
  @Length(1, 128)
  name: string;

  @Field(() => UpdateOrganizationAddressInput, { nullable: true })
  billingAddress?: UpdateOrganizationAddressInput;

  @Field({ nullable: true })
  @MaxLength(2048)
  @IsUrl()
  coverUrl?: string;
}

@Resolver(() => Organization)
export class UpdateOrganizationResolver {
  @Mutation(() => Organization)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async toggleOnboarding(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("showOnboarding", () => Boolean) showOnboarding: boolean
  ): Promise<Organization> {
    const organization = await ctx.prisma.organization.findUniqueOrThrow({
      where: { id: ctx.me.organizationId },
      include: { billingAddress: true },
    });

    return ctx.prisma.organization.update({
      where: { id: organization.id },
      data: { showOnboarding },
    });
  }

  @Mutation(() => Organization)
  @UseMiddleware(hasRole([RoleType.OWNER]))
  async updateOrganization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateOrganizationInput) input: UpdateOrganizationInput
  ): Promise<Organization> {
    const organization = await ctx.prisma.organization.findUniqueOrThrow({
      where: { id: ctx.me.organizationId },
      include: { billingAddress: true },
    });

    // When the name is changed we don't want to take an
    // existing one
    if (input.name && input.name !== organization.name) {
      const existingOrganization = await findOrganizationByName(input.name);

      if (existingOrganization && existingOrganization.id !== organization.id) {
        throw new UserInputError(
          "An organization with the same name already exists"
        );
      }
    }

    if (input.billingAddress) {
      if (organization.billingAddress) {
        await ctx.prisma.organizationAddress.update({
          where: { id: organization.billingAddress.id },
          data: input.billingAddress,
        });
      } else {
        const address = await ctx.prisma.organizationAddress.create({
          data: {
            ...input.billingAddress,
            organization: {
              connect: { id: organization.id },
            },
          },
        });

        await ctx.prisma.organization.update({
          where: { id: organization.id },
          data: { billingAddressId: address.id },
        });
      }
    }

    return ctx.prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: input.name,
        coverUrl: input.coverUrl,
      },
    });
  }
}
