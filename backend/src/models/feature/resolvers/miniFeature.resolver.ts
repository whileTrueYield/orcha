/**
 * Query: miniFeatures — lightweight feature list for fuzzy search.
 */

import builder from "../../../schema/builder";
import { MiniFeatureRef } from "../entity";
import { Prisma } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.queryField("miniFeatures", (t) =>
  t.field({
    type: [MiniFeatureRef],
    authScopes: { hasRole: true },
    args: {
      productId: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const featureWhereInput: Prisma.FeatureWhereInput = {
        featureGroup: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      };

      if (args.productId && featureWhereInput.featureGroup) {
        (featureWhereInput.featureGroup as Prisma.FeatureGroupWhereInput).productId =
          args.productId;
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

      return features.map((feature) => ({
        id: feature.id,
        name: feature.name,
        featureGroupName: feature.featureGroup.name,
        productCode: feature.featureGroup.product.code,
        productName: feature.featureGroup.product.name,
      }));
    },
  }),
);
