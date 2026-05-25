/**
 * Mutation: deleteWorkflow — soft-delete by setting stage to DELETED.
 */

import builder from "../../../schema/builder";
import { ModelStage } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteWorkflow", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    deprecationReason: "Archive workflow instead of deleting it",
    args: {
      workflowId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: {
          id: args.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.workflow.update({
        ...query,
        where: { id: workflow.id },
        data: { stage: ModelStage.DELETED },
      });
    },
  }),
);
