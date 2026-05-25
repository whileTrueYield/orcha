/**
 * Query resolver for listing lightweight product summaries.
 *
 * Registers: Query.miniProducts: [MiniProduct!]!
 *
 * Requires any linked role. Returns only non-deleted products
 * for the caller's organisation.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { MiniProductRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.queryField("miniProducts", (t) =>
  t.field({
    type: [MiniProductRef],
    authScopes: { hasRole: true },
    resolve: async (_root, _args, ctx) => {
      const products = await ctx.prisma.product.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        stage: p.stage,
      }));
    },
  }),
);
