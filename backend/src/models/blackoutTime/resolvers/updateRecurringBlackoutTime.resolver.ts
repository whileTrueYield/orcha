/**
 * Mutation: updateRecurringBlackoutTime.
 */

import builder from "../../../schema/builder";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

const UpdateRecurringBlackoutTimeInput = builder.inputType("UpdateRecurringBlackoutTimeInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    timeZone: t.string({ required: true }),
    startTime: t.string({ required: true }),
    stopTime: t.string({ required: true }),
    roleIds: t.intList({ required: true }),
    monday: t.boolean({ required: false }),
    tuesday: t.boolean({ required: false }),
    wednesday: t.boolean({ required: false }),
    thursday: t.boolean({ required: false }),
    friday: t.boolean({ required: false }),
    saturday: t.boolean({ required: false }),
    sunday: t.boolean({ required: false }),
    disabled: t.boolean({ required: false }),
  }),
});

builder.mutationField("updateRecurringBlackoutTime", (t) =>
  t.prismaField({
    type: "RecurringBlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      recurringBlackoutTimeId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateRecurringBlackoutTimeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      let { startTime, stopTime } = args.input;

      if (startTime > stopTime) {
        [startTime, stopTime] = [stopTime, startTime];
      }

      const recurringBlackoutTime =
        await ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
          where: {
            id: args.recurringBlackoutTimeId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        });

      const roles = await ctx.prisma.role.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: { in: args.input.roleIds },
        },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return ctx.prisma.recurringBlackoutTime.update({
        ...query,
        where: { id: recurringBlackoutTime.id },
        data: {
          name: args.input.name,
          startTime,
          stopTime,
          timeZone: args.input.timeZone,
          roles: { set: roles.map((role) => ({ id: role.id })) },
          monday: args.input.monday ?? undefined,
          tuesday: args.input.tuesday ?? undefined,
          wednesday: args.input.wednesday ?? undefined,
          thursday: args.input.thursday ?? undefined,
          friday: args.input.friday ?? undefined,
          saturday: args.input.saturday ?? undefined,
          sunday: args.input.sunday ?? undefined,
          disabled: args.input.disabled ?? undefined,
        },
      });
    },
  }),
);
