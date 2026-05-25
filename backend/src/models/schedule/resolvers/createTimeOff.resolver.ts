/**
 * Mutation: createTimeOff — create a time-off block, merging overlapping entries.
 *
 * Registers: Mutation.createTimeOff(input): TimeOff
 *
 * Also registers the TimeOff prismaObject so other schedule resolvers
 * can reference it by string name in t.prismaField.
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// TimeOff prismaObject — registered here because schedule/entity.ts owns
// only ScheduleItem and related custom types. Other TimeOff resolvers
// reference this via the Prisma model string "TimeOff".
// ---------------------------------------------------------------------------

export const TimeOffRef = builder.prismaObject("TimeOff", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    startAt: t.expose("startAt", { type: "DateTime" }),
    stopAt: t.expose("stopAt", { type: "DateTime" }),
    roleId: t.exposeInt("roleId"),
    organizationId: t.exposeInt("organizationId"),
    role: t.relation("role"),
    organization: t.relation("organization"),
  }),
});

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateTimeOffInput = builder.inputType("CreateTimeOffInput", {
  fields: (t) => ({
    startAt: t.string({ required: true }),
    stopAt: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createTimeOff", (t) =>
  t.prismaField({
    type: "TimeOff",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateTimeOffInput, required: true }),
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

      // we'll merge all overlapping time off together
      const overlappingTimeOffs = await ctx.prisma.timeOff.findMany({
        where: {
          roleId: (ctx.me as AuthRoleContext).roleId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          startAt: { lte: stopAt },
          stopAt: { gte: startAt },
        },
      });

      for (const timeOff of overlappingTimeOffs) {
        if (timeOff.startAt.toISOString() < startAt) {
          startAt = timeOff.startAt.toISOString();
        }
        if (timeOff.stopAt.toISOString() > stopAt) {
          stopAt = timeOff.stopAt.toISOString();
        }
      }

      const timeOff = await ctx.prisma.timeOff.create({
        ...query,
        data: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          roleId: (ctx.me as AuthRoleContext).roleId,
          startAt,
          stopAt,
        },
      });

      await ctx.prisma.timeOff.deleteMany({
        where: { id: { in: overlappingTimeOffs.map(({ id }) => id) } },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return timeOff;
    },
  }),
);
