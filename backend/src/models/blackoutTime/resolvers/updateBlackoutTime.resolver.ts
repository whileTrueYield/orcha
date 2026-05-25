/**
 * Mutation: updateBlackoutTime.
 */

import builder from "../../../schema/builder";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { endOfDay, startOfDay } from "date-fns";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

const UpdateBlackoutTimeInput = builder.inputType("UpdateBlackoutTimeInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    startAt: t.string({ required: true }),
    stopAt: t.string({ required: true }),
    roleIds: t.intList({ required: true }),
    disabled: t.boolean({ required: false }),
  }),
});

builder.mutationField("updateBlackoutTime", (t) =>
  t.prismaField({
    type: "BlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      blackoutTimeId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateBlackoutTimeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      let { startAt, stopAt } = args.input;

      if (startAt > stopAt) {
        [startAt, stopAt] = [stopAt, startAt];
      }

      const blackoutTime = await ctx.prisma.blackoutTime.findFirstOrThrow({
        where: {
          id: args.blackoutTimeId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const roles = await ctx.prisma.role.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: { in: args.input.roleIds },
        },
      });

      let timeZone = (await (ctx.me as AuthRoleContext).getRole()).timeZone;
      if (roles.length === 1) {
        timeZone = roles[0].timeZone;
      }

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return ctx.prisma.blackoutTime.update({
        ...query,
        where: { id: blackoutTime.id },
        data: {
          name: args.input.name,
          startAt: zonedTimeToUtc(
            startOfDay(utcToZonedTime(new Date(startAt), timeZone)),
            timeZone,
          ),
          stopAt: zonedTimeToUtc(
            endOfDay(utcToZonedTime(new Date(stopAt), timeZone)),
            timeZone,
          ),
          roles: { set: roles.map((role) => ({ id: role.id })) },
          disabled: args.input.disabled ?? undefined,
        },
      });
    },
  }),
);
