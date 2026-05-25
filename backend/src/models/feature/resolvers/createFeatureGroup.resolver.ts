/**
 * Mutation: createFeatureGroup — create a new feature group under a product.
 */

import builder from "../../../schema/builder";
import { FeatureGroupStatus } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

const CreateFeatureGroupInput = builder.inputType("CreateFeatureGroupInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    productId: t.int({ required: true }),
    description: t.string({ required: false }),
  }),
});

builder.mutationField("createFeatureGroup", (t) =>
  t.prismaField({
    type: "FeatureGroup",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateFeatureGroupInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.input.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.featureGroup.create({
        ...query,
        data: {
          name: args.input.name,
          description: args.input.description,
          status: FeatureGroupStatus.ACTIVE,
          productId: product.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });
    },
  }),
);
