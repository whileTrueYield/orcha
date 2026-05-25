/**
 * Mutation: deleteBlackoutTime — returns the deleted ID.
 */

import builder from "../../../schema/builder";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteBlackoutTime", (t) =>
  t.int({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      blackoutTimeId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const blackoutTime = await ctx.prisma.blackoutTime.findFirstOrThrow({
        where: {
          id: args.blackoutTimeId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      await ctx.prisma.blackoutTime.delete({
        where: { id: blackoutTime.id },
      });

      return args.blackoutTimeId;
    },
  }),
);
