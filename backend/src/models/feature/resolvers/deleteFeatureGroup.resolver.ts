/**
 * Mutation: deleteFeatureGroup — delete a feature group and return its product.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteFeatureGroup", (t) =>
  t.prismaField({
    type: "Product",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      featureGroupId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
        where: {
          id: args.featureGroupId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      await ctx.prisma.featureGroup.delete({ where: { id: args.featureGroupId } });

      return ctx.prisma.product.findUniqueOrThrow({
        ...query,
        where: { id: featureGroup.productId },
      });
    },
  }),
);
