/**
 * Swimlane queries — roles and scheduled/awaiting-estimate tasks.
 *
 * Registers:
 *  - Query.getAllRoles: [Role]
 *  - Query.getAllScheduledTasks: [Ticket]
 *  - Query.getAllAwaitingEstimateTasks: [Ticket]
 *
 * Auth: hasRole (various levels depending on query).
 */

import builder from "../../../schema/builder";
import { RoleStatus, TicketStatus, ModelStage } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: getAllRoles — accepted roles in the organization
// ---------------------------------------------------------------------------

builder.queryField("getAllRoles", (t) =>
  t.prismaField({
    type: ["Role"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.role.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          status: RoleStatus.ACCEPTED,
        },
        orderBy: { name: "asc" },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getAllScheduledTasks — tickets currently scheduled (admin/owner)
// ---------------------------------------------------------------------------

builder.queryField("getAllScheduledTasks", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: ["OWNER", "ADMIN"] },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.SCHEDULED,
        },
        include: {
          scheduleItems: {
            take: 1,
            orderBy: { stoppedAt: "desc" },
            include: {
              ticketWorkflowState: {
                include: {
                  assignee: true,
                },
              },
              nextTicketWorkflowState: {
                include: {
                  assignee: true,
                },
              },
              role: true,
            },
          },
          ticketWorkflowStates: {
            where: {
              isActive: true,
            },
            orderBy: { position: "asc" },
            include: {
              assignee: true,
            },
          },
          product: true,
          workflow: true,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getAllAwaitingEstimateTasks — unscheduled tickets needing estimates
// ---------------------------------------------------------------------------

builder.queryField("getAllAwaitingEstimateTasks", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: ["OWNER", "ADMIN"] },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.UNSCHEDULED,
          estimating: true,
          ticketWorkflowStates: {
            some: {
              isActive: true,
              assigneeId: { not: null },
              OR: [
                { estimateMaximum: null },
                { estimateMinimum: null },
                { estimateMostLikely: null },
              ],
            },
          },
        },
        include: {
          ticketWorkflowStates: {
            include: {
              assignee: true,
            },
            where: {
              isActive: true,
            },
            orderBy: { position: "asc" },
          },
          product: true,
          workflow: true,
        },
      });
    },
  }),
);
