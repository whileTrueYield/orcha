/**
 * Query: miniWorkflows — lightweight workflow list for fuzzy search.
 */

import builder from "../../../schema/builder";
import { MiniWorkflowRef } from "../entity";
import { ModelStage } from "@prisma/client";
import { getWorkflowQueryForProduct, toMiniWorkflow } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("miniWorkflows", (t) =>
  t.field({
    type: [MiniWorkflowRef],
    authScopes: { hasRole: true },
    args: {
      productId: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      if (args.productId) {
        const product = await ctx.prisma.product.findFirstOrThrow({
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            id: args.productId,
            stage: { not: ModelStage.DELETED },
          },
        });

        const workflows = await ctx.prisma.workflow.findMany({
          where: getWorkflowQueryForProduct(product),
        });

        return workflows.map(toMiniWorkflow);
      } else {
        const workflows = await ctx.prisma.workflow.findMany({
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });

        return workflows.map(toMiniWorkflow);
      }
    },
  }),
);
