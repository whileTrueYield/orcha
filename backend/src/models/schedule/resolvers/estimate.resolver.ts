/**
 * Estimate queries — schedule forecasting and role capacity.
 *
 * Registers:
 *  - Query.getScheduleRoles(fromDate, toDate): [ScheduleRole]
 *  - Query.getAllEstimates: [Estimate]
 *  - Query.getEstimates(toDate): [ScheduleEstimate]
 *
 * Also registers the Estimate prismaObject so it can be used
 * as a return type from getAllEstimates.
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { EstimateTypeEnum } from "../../../schema/enums";
import { GraphQLError } from "graphql";
import { ScheduleEstimateRef, ScheduleRoleRef } from "../entity";
import { Prisma, RoleStatus } from "@prisma/client";
import { keyBy, map, round, uniq } from "lodash";
import { EMPTY_WORK_WEEK } from "../../role/entity";
import { getAvailableWorkHoursAt } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Estimate prismaObject — the raw solver output stored in the DB.
// Registered here because no dedicated entity file exists for Estimate.
// ---------------------------------------------------------------------------

export const EstimateRef = builder.prismaObject("Estimate", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    organizationId: t.exposeInt("organizationId"),
    type: t.expose("type", { type: EstimateTypeEnum }),
    epoch: t.exposeInt("epoch"),
    updatedEpoch: t.exposeInt("updatedEpoch"),
    assigneeId: t.exposeInt("assigneeId"),
    end_p50: t.exposeInt("end_p50"),
    end_p70: t.exposeInt("end_p70"),
    end_p80: t.exposeInt("end_p80"),
    end_p90: t.exposeInt("end_p90"),
    end_p95: t.exposeInt("end_p95"),
    end_min: t.exposeInt("end_min"),
    end_max: t.exposeInt("end_max"),
    start_p50: t.exposeInt("start_p50"),
    start_p70: t.exposeInt("start_p70"),
    start_p80: t.exposeInt("start_p80"),
    start_p90: t.exposeInt("start_p90"),
    start_p95: t.exposeInt("start_p95"),
    start: t.exposeInt("start"),
    end: t.exposeInt("end"),
    start_min: t.exposeInt("start_min"),
    start_max: t.exposeInt("start_max"),
    assignee: t.relation("assignee"),
  }),
});

// ---------------------------------------------------------------------------
// Query: getScheduleRoles
// ---------------------------------------------------------------------------

builder.queryField("getScheduleRoles", (t) =>
  t.field({
    type: [ScheduleRoleRef],
    authScopes: { hasRole: true },
    args: {
      fromDate: t.arg({ type: "DateTime", required: true }),
      toDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const now = new Date();

      if (args.fromDate > now) {
        throw new GraphQLError(
          "lower boundary date (fromDate) should be in the past",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      if (args.toDate < now) {
        throw new GraphQLError(
          "upper boundary date (toDate) should be in the future",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      const roles = await ctx.prisma.role.findMany({
        where: {
          organizationId: me.organizationId,
          status: RoleStatus.ACCEPTED,
        },
      });

      return map(roles, (role) => {
        const workWeek = { ...EMPTY_WORK_WEEK, ...JSON.parse(role.workWeek) };
        const pastCapacity = getAvailableWorkHoursAt(
          workWeek,
          role.timeZone,
          args.fromDate,
          now,
        );

        const futureCapacity = getAvailableWorkHoursAt(
          workWeek,
          role.timeZone,
          now,
          args.toDate,
        );

        return {
          id: role.id,
          name: role.name,
          title: role.title,
          avatarUrl: role.avatarUrl,
          pastCapacity: round(pastCapacity, 2),
          futureCapacity: round(futureCapacity, 2),
        };
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getAllEstimates
// ---------------------------------------------------------------------------

builder.queryField("getAllEstimates", (t) =>
  t.prismaField({
    type: ["Estimate"],
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const lastEpoch = await ctx.prisma.estimate.findFirst({
        where: {
          type: "TicketWorkflowState",
          organizationId: me.organizationId,
        },
        take: 1,
        orderBy: { epoch: "desc" },
      });

      if (lastEpoch) {
        return ctx.prisma.estimate.findMany({
          ...query,
          where: {
            organizationId: me.organizationId,
            type: "TicketWorkflowState",
            epoch: lastEpoch.epoch,
          },
        });
      }

      return [];
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getEstimates — enriched estimates with ticket/workflow metadata
// ---------------------------------------------------------------------------

// Raw type returned by the $queryRaw call — matches Prisma Estimate columns
// that we actually reference in the mapping below.
interface RawEstimate {
  id: number;
  assigneeId: number;
  start_p80: number;
  end_p80: number;
  start_min: number;
}

builder.queryField("getEstimates", (t) =>
  t.field({
    type: [ScheduleEstimateRef],
    authScopes: { hasRole: true },
    args: {
      toDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const upperLimit = round(args.toDate.getTime() / 1000);

      // first we'll find the latest estimate
      const estimates = await ctx.prisma.$queryRaw<RawEstimate[]>(Prisma.sql`
        SELECT *
        FROM "Estimate"
        WHERE
          "organizationId" = ${me.organizationId} AND
          epoch = (
            SELECT epoch
            FROM "Estimate"
            WHERE "organizationId" = ${me.organizationId}
            ORDER BY epoch DESC
            LIMIT 1) AND
          start < ${upperLimit}
        ORDER BY start ASC
      `);

      const ticketWorkflowStateIds = uniq(map(estimates, "id"));

      const ticketWorkflowStates = await ctx.prisma.ticketWorkflowState.findMany({
        where: {
          id: { in: ticketWorkflowStateIds },
        },
      });

      const ticketWorkflowStateById = keyBy(ticketWorkflowStates, "id");

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          id: { in: uniq(map(ticketWorkflowStates, "ticketId")) },
        },
        include: {
          product: true,
        },
      });

      const ticketById = keyBy(tickets, "id");

      return estimates.map((estimate) => {
        const state = ticketWorkflowStateById[estimate.id];
        const ticket = ticketById[state.ticketId];
        const ticketId = state.ticketId;

        return {
          roleId: estimate.assigneeId,
          ticketId,
          ticketTitle: ticket.title,
          ticketLocalId: ticket.localId || 0,
          ticketProductCode: ticket.product?.code || "n/a",
          ticketWorkflowStateName: state.name,
          ticketWorkflowStateId: state.id,
          startEpoch: estimate.start_p80,
          stopEpoch: estimate.end_p80,
          start_min: estimate.start_min,
          duration:
            (state.estimateMinimum! +
              state.estimateMaximum! +
              state.estimateMostLikely! * 4) /
            6,
        };
      });
    },
  }),
);
