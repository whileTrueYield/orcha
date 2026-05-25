/**
 * Ticket scheduling mutations and queries:
 *  - scheduleTicket, getUnscheduledDependencies, getAllUnscheduledDependencies
 *
 * Exports: assertCanScheduleTicket (used by schedule resolvers)
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { ModelStage, TicketStatus } from "@prisma/client";
import { requestEstimate } from "../jobs/estimateTickets";
import { filter, map } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Shared assertion — exported for use by createScheduleItem
// ---------------------------------------------------------------------------

export const assertCanScheduleTicket = (
  ticket: any,
  ticketWorkflowStates: any[],
): void => {
  if (ticket.status === TicketStatus.SCHEDULED) {
    throw new GraphQLError("This ticket is already scheduled", { extensions: { code: "BAD_USER_INPUT" } });
  }

  const activeStates = filter(ticketWorkflowStates, "isActive");

  if (activeStates.length === 0) {
    throw new GraphQLError("Scheduling requires at least one state to be active", { extensions: { code: "BAD_USER_INPUT" } });
  }

  for (const state of activeStates) {
    if (!state.assigneeId) {
      throw new GraphQLError("Every active state needs to be assigned", { extensions: { code: "BAD_USER_INPUT" } });
    }
    if (!state.estimateMinimum || !state.estimateMostLikely || !state.estimateMaximum) {
      throw new GraphQLError("Every active state needs have an estimate", { extensions: { code: "BAD_USER_INPUT" } });
    }
  }
};

// ---------------------------------------------------------------------------
// Mutation: scheduleTicket
// ---------------------------------------------------------------------------

builder.mutationField("scheduleTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { not: ModelStage.DELETED },
        },
        include: { ticketWorkflowStates: { where: { isActive: true } } },
      });

      assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);

      const updatedTicket = await ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: { status: TicketStatus.SCHEDULED, scheduledAt: new Date() },
      });

      await requestEstimate((ctx.me as AuthRoleContext).organizationId);

      return updatedTicket;
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getUnscheduledDependencies
// ---------------------------------------------------------------------------

builder.queryField("getUnscheduledDependencies", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg.intList({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.ticket.findMany({
        ...query,
        where: {
          successors: { some: { id: { in: args.ticketIds } } },
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.UNSCHEDULED,
        },
        include: { ...query.include, product: true, workflow: true, ancestors: true },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Query: getAllUnscheduledDependencies
// ---------------------------------------------------------------------------

builder.queryField("getAllUnscheduledDependencies", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (args.ticketIds.length === 0) return [];

      const allTickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          successors: { some: {} },
          status: TicketStatus.UNSCHEDULED,
          stage: ModelStage.PUBLISHED,
        },
        select: {
          id: true,
          successors: { select: { id: true } },
        },
      });

      const ancestorMap = new Map<number, number[]>();
      for (const ticket of allTickets) {
        ancestorMap.set(ticket.id, map(ticket.successors, "id"));
      }

      const resultIds = new Set<number>();
      const queue = [...args.ticketIds];

      while (queue.length > 0) {
        const currentId = queue.pop()!;
        for (const [ancestorId, successorIds] of ancestorMap) {
          if (successorIds.includes(currentId) && !resultIds.has(ancestorId)) {
            resultIds.add(ancestorId);
            queue.push(ancestorId);
          }
        }
      }

      if (resultIds.size === 0) return [];

      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          id: { in: [...resultIds] },
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
        include: { ...query.include, product: true, workflow: true, ancestors: true },
      });
    },
  }),
);
