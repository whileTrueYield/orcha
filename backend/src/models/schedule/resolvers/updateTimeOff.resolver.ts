/**
 * Mutation: updateTimeOff — edit a time-off entry, merging overlaps.
 *
 * Registers: Mutation.updateTimeOff(timeOffId, input): TimeOff
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateTimeOffInput = builder.inputType("UpdateTimeOffInput", {
  fields: (t) => ({
    startAt: t.string({ required: true }),
    stopAt: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateTimeOff", (t) =>
  t.prismaField({
    type: "TimeOff",
    authScopes: { hasRole: true },
    args: {
      timeOffId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateTimeOffInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      let { startAt, stopAt } = args.input;

      if (startAt === stopAt) {
        throw new GraphQLError("start and stop dates should not be identical", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // flip values if start date is after stop date
      if (startAt > stopAt) {
        [startAt, stopAt] = [stopAt, startAt];
      }

      const timeOff = await ctx.prisma.timeOff.findFirstOrThrow({
        where: {
          id: args.timeOffId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          roleId: (ctx.me as AuthRoleContext).roleId,
        },
      });

      // we'll merge all overlapping time off together (excluding the edited one)
      const overlappingTimeOffs = await ctx.prisma.timeOff.findMany({
        where: {
          roleId: (ctx.me as AuthRoleContext).roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          startAt: { lte: stopAt },
          stopAt: { gte: startAt },
          id: { not: timeOff.id },
        },
      });

      for (const overlap of overlappingTimeOffs) {
        if (overlap.startAt.toISOString() < startAt) {
          startAt = overlap.startAt.toISOString();
        }
        if (overlap.stopAt.toISOString() > stopAt) {
          stopAt = overlap.stopAt.toISOString();
        }
      }

      await ctx.prisma.timeOff.deleteMany({
        where: { id: { in: overlappingTimeOffs.map(({ id }) => id) } },
      });

      return ctx.prisma.timeOff.update({
        ...query,
        where: {
          id: timeOff.id,
        },
        data: {
          startAt,
          stopAt,
        },
      });
    },
  }),
);
