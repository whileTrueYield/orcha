/**
 * Mutation: deleteReport — soft-delete by setting stage to DELETED.
 */

import builder from "../../../schema/builder";
import { ModelStage } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteReport", (t) =>
  t.prismaField({
    type: "Report",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      reportId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const report = await ctx.prisma.report.findFirstOrThrow({
        where: {
          id: args.reportId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.report.update({
        ...query,
        where: { id: report.id },
        data: { stage: ModelStage.DELETED },
      });
    },
  }),
);
