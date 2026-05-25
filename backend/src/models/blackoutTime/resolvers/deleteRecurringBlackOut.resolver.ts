/**
 * Mutation: deleteRecurringBlackoutTime — returns the deleted ID.
 */

import builder from "../../../schema/builder";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteRecurringBlackoutTime", (t) =>
  t.int({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      recurringBlackoutTimeId: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const recurringBlackoutTime =
        await ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
          where: {
            id: args.recurringBlackoutTimeId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      await ctx.prisma.recurringBlackoutTime.delete({
        where: { id: recurringBlackoutTime.id },
      });

      return args.recurringBlackoutTimeId;
    },
  }),
);
