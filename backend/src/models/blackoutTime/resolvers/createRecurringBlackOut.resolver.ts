/**
 * Mutation: createRecurringBlackoutTime.
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

const CreateRecurringBlackoutTimeInput = builder.inputType("CreateRecurringBlackoutTimeInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
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
  }),
});

builder.mutationField("createRecurringBlackoutTime", (t) =>
  t.prismaField({
    type: "RecurringBlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateRecurringBlackoutTimeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      let { startTime, stopTime } = args.input;

      if (startTime === stopTime) {
        throw new GraphQLError("start and stop time cannot be identical", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (startTime > stopTime) {
        [startTime, stopTime] = [stopTime, startTime];
      }

      const roles = await ctx.prisma.role.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: { in: args.input.roleIds },
        },
      });

      const recurringBlackoutTime = await ctx.prisma.recurringBlackoutTime.create({
        ...query,
        data: {
          name: args.input.name,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          roles: { connect: roles.map((role) => ({ id: role.id })) },
          startTime,
          stopTime,
          timeZone: (await (ctx.me as AuthRoleContext).getRole()).timeZone,
          monday: args.input.monday ?? undefined,
          tuesday: args.input.tuesday ?? undefined,
          wednesday: args.input.wednesday ?? undefined,
          thursday: args.input.thursday ?? undefined,
          friday: args.input.friday ?? undefined,
          saturday: args.input.saturday ?? undefined,
          sunday: args.input.sunday ?? undefined,
          disabled: false,
        },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return recurringBlackoutTime;
    },
  }),
);
