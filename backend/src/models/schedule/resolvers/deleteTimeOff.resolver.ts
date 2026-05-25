/**
 * Mutation: deleteTimeOff — remove a time-off entry and re-estimate.
 *
 * Registers: Mutation.deleteTimeOff(timeOffId): TimeOff
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteTimeOff", (t) =>
  t.prismaField({
    type: "TimeOff",
    authScopes: { hasRole: true },
    args: {
      timeOffId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const timeOff = await ctx.prisma.timeOff.findFirstOrThrow({
        where: {
          id: args.timeOffId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          roleId: (ctx.me as AuthRoleContext).roleId,
        },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return ctx.prisma.timeOff.delete({
        ...query,
        where: { id: timeOff.id },
      });
    },
  }),
);
