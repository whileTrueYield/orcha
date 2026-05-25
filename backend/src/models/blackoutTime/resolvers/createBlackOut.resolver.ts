/**
 * Mutation: createBlackoutTime.
 */

import builder from "../../../schema/builder";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { endOfDay, startOfDay } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { AuthRoleContext } from "../../../types";

const CreateBlackoutTimeInput = builder.inputType("CreateBlackoutTimeInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    startAt: t.string({ required: true }),
    stopAt: t.string({ required: true }),
    roleIds: t.intList({ required: true }),
  }),
});

builder.mutationField("createBlackoutTime", (t) =>
  t.prismaField({
    type: "BlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: CreateBlackoutTimeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      let { startAt, stopAt } = args.input;

      if (startAt > stopAt) {
        [startAt, stopAt] = [stopAt, startAt];
      }

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

      const blackoutTime = await ctx.prisma.blackoutTime.create({
        ...query,
        data: {
          name: args.input.name,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          roles: { connect: roles.map((role) => ({ id: role.id })) },
          startAt: zonedTimeToUtc(
            startOfDay(utcToZonedTime(new Date(startAt), timeZone)),
            timeZone,
          ),
          stopAt: zonedTimeToUtc(
            endOfDay(utcToZonedTime(new Date(stopAt), timeZone)),
            timeZone,
          ),
        },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return blackoutTime;
    },
  }),
);
