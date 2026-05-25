/**
 * Mutation resolver for soft-deleting a Product.
 *
 * Registers: Mutation.deleteProduct(productId: Int!): Product!
 *
 * Requires ADMIN or OWNER role. Soft-deletes by setting stage to DELETED.
 *
 * @deprecated Archive product instead of deleting it.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { ProductRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteProduct", (t) =>
  t.prismaField({
    type: ProductRef,
    deprecationReason: "Archive product instead of deleting it",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      productId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: args.productId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.product.update({
        ...query,
        where: { id: product.id },
        data: { stage: ModelStage.DELETED },
      });
    },
  }),
);
