/**
 * Mutation resolvers for updating an Organisation.
 *
 * Registers:
 *  - Mutation.toggleOnboarding(showOnboarding: Boolean!): Organization!
 *  - Mutation.updateOrganization(input: UpdateOrganizationInput!): Organization!
 *
 * toggleOnboarding requires ADMIN or OWNER.
 * updateOrganization requires OWNER.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { OrganizationRef } from "../entity";
import { findOrganizationByName } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateOrganizationAddressInput = builder.inputType(
  "UpdateOrganizationAddressInput",
  {
    fields: (t) => ({
      address1: t.string({ required: true }),
      address2: t.string({ required: false }),
      zipcode: t.string({ required: true }),
      city: t.string({ required: true }),
      state: t.string({ required: true }),
      country: t.string({ required: true }),
    }),
  },
);

const UpdateOrganizationInput = builder.inputType("UpdateOrganizationInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    billingAddress: t.field({
      type: UpdateOrganizationAddressInput,
      required: false,
    }),
    coverUrl: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

builder.mutationField("toggleOnboarding", (t) =>
  t.prismaField({
    type: OrganizationRef,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      showOnboarding: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      await ctx.prisma.organization.findUniqueOrThrow({
        where: { id: (ctx.me as AuthRoleContext).organizationId },
      });

      return ctx.prisma.organization.update({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).organizationId },
        data: { showOnboarding: args.showOnboarding },
      });
    },
  }),
);

builder.mutationField("updateOrganization", (t) =>
  t.prismaField({
    type: OrganizationRef,
    authScopes: { hasRole: "OWNER" },
    args: {
      input: t.arg({ type: UpdateOrganizationInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const organization = await ctx.prisma.organization.findUniqueOrThrow({
        where: { id: (ctx.me as AuthRoleContext).organizationId },
        include: { billingAddress: true },
      });

      // Prevent name collisions when renaming the org
      if (args.input.name && args.input.name !== organization.name) {
        const existing = await findOrganizationByName(args.input.name);

        if (existing && existing.id !== organization.id) {
          throw new GraphQLError(
            "An organization with the same name already exists",
          );
        }
      }

      if (args.input.billingAddress) {
        if (organization.billingAddress) {
          await ctx.prisma.organizationAddress.update({
            where: { id: organization.billingAddress.id },
            data: args.input.billingAddress,
          });
        } else {
          const address = await ctx.prisma.organizationAddress.create({
            data: {
              ...args.input.billingAddress,
              organization: { connect: { id: organization.id } },
            },
          });

          await ctx.prisma.organization.update({
            where: { id: organization.id },
            data: { billingAddressId: address.id },
          });
        }
      }

      return ctx.prisma.organization.update({
        ...query,
        where: { id: organization.id },
        data: {
          name: args.input.name ?? undefined,
          coverUrl: args.input.coverUrl ?? undefined,
        },
      });
    },
  }),
);
