/**
 * Planning queries and mutations for ticket scheduling workflows.
 *
 * Registers:
 *  - Query.planningTickets: [PlanningTicket!]!
 *  - Query.planningDeliveredTickets(fromDate, toDate): [PlanningTicket!]!
 *  - Query.getUnscheduledTickets(...pagination): PaginatedTickets!
 *  - Query.getScheduledTickets: [Ticket!]!
 *  - Query.planningProjection(ticketIds, scheduleConfigs): [PlanningTicket!]!
 *  - Mutation.commitScheduleChanges(removeTicketIds, addTicketIds, scheduleConfigs): Boolean!
 *
 * Planning views show scheduled/delivered tickets with their ETAs.
 * commitScheduleChanges atomically schedules and unschedules tickets
 * and persists schedule configuration.
 */

import { ModelStage, TicketStatus } from "@prisma/client";
import { addMonths } from "date-fns";
import { isEmpty, keyBy, last, map } from "lodash";
import builder from "../../../schema/builder";
import { PlanningTicketRef } from "../entity";
import { PaginatedTickets } from "../entity";
import { AuthRoleContext } from "../../../types";
import { getPaginatedTickets } from "../helper";
import {
  buildUid,
  estimateTickets,
  requestEstimate,
} from "../jobs/estimateTickets";
import { assertCanScheduleTicket } from "./scheduleTicket.resolver";
import { UpdateScheduleConfigInput } from "../../schedule/resolvers/ScheduleConfig.resolver";

// ---------------------------------------------------------------------------
// Input types for schedule config (used by commitScheduleChanges and
// planningProjection)
// ---------------------------------------------------------------------------

const ScheduleItemForEstimateObjInput = builder.inputType(
  "ScheduleItemForEstimateObjInput",
  {
    fields: (t) => ({
      id: t.int({ required: true }),
    }),
  },
);

const ScheduleConfigForEstimateInput = builder.inputType(
  "ScheduleConfigForEstimateInput",
  {
    fields: (t) => ({
      priority: t.int({ required: true }),
      tags: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
      features: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
      projects: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
      products: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
      workflows: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
      tickets: t.field({
        type: [ScheduleItemForEstimateObjInput],
        required: true,
      }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Query: planningTickets
// ---------------------------------------------------------------------------

builder.queryField("planningTickets", (t) =>
  t.field({
    type: [PlanningTicketRef],
    authScopes: { hasRole: true },
    resolve: async (_root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: { in: [TicketStatus.SCHEDULED] },
          eta: { not: null, lt: addMonths(new Date(), 6) },
          localId: { not: null },
        },
        include: {
          product: { select: { code: true, name: true } },
          workflow: { select: { name: true } },
          project: { select: { name: true } },
        },
        orderBy: { eta: "asc" },
      });

      return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        productCode: ticket.product?.code || "N/A",
        localId: ticket.localId!,
        eta: ticket.eta!,
        milestone: ticket.milestone,
        workflowName: ticket.workflow?.name || "N/A",
        productName: ticket.product?.name || "N/A",
        projectName: ticket.project?.name || "N/A",
      }));
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: planningDeliveredTickets
// ---------------------------------------------------------------------------

builder.queryField("planningDeliveredTickets", (t) =>
  t.field({
    type: [PlanningTicketRef],
    authScopes: { hasRole: true },
    args: {
      fromDate: t.arg({ type: "DateTime", required: true }),
      toDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
          localId: { not: null },
          closedAt: { gte: args.fromDate, lte: args.toDate },
        },
        include: {
          product: { select: { code: true, name: true } },
          workflow: { select: { name: true } },
          project: { select: { name: true } },
        },
        orderBy: { eta: "asc" },
      });

      return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        productCode: ticket.product?.code || "N/A",
        localId: ticket.localId!,
        eta: ticket.closedAt!,
        milestone: ticket.milestone,
        workflowName: ticket.workflow?.name || "N/A",
        productName: ticket.product?.name || "N/A",
        projectName: ticket.project?.name || "N/A",
      }));
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: commitScheduleChanges
// ---------------------------------------------------------------------------

builder.mutationField("commitScheduleChanges", (t) =>
  t.boolean({
    authScopes: { hasRole: true },
    args: {
      removeTicketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
      addTicketIds: t.arg({ type: ['Int'], required: { list: true, items: false } }),
      scheduleConfigs: t.arg({
        type: [UpdateScheduleConfigInput],
        required: { list: true, items: false },
      }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      // Nullable-item lists — strip nulls before passing to Prisma
      const removeTicketIds = args.removeTicketIds.filter((id): id is number => id != null);
      const addTicketIds = args.addTicketIds.filter((id): id is number => id != null);

      const ticketsToUnschedule = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.SCHEDULED,
          id: { in: removeTicketIds },
        },
        include: { workflow: true, product: true, project: true },
      });

      const ticketsToSchedule = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          id: { in: addTicketIds },
        },
        include: { ticketWorkflowStates: { where: { isActive: true } } },
      });

      // Validate all tickets can be scheduled before making changes
      for (const ticket of ticketsToSchedule) {
        assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);
      }

      const now = new Date();

      // Schedule the new tickets
      await ctx.prisma.ticket.updateMany({
        where: { id: { in: addTicketIds } },
        data: { status: TicketStatus.SCHEDULED, scheduledAt: now },
      });

      // Unschedule the removed tickets
      await ctx.prisma.ticket.updateMany({
        where: { id: { in: map(ticketsToUnschedule, "id") } },
        data: { status: TicketStatus.UNSCHEDULED, scheduledAt: null },
      });

      // Close any active work on unscheduled tickets
      await ctx.prisma.scheduleItem.updateMany({
        where: {
          ticketId: { in: map(ticketsToUnschedule, "id") },
          stoppedAt: null,
        },
        data: { done: true, stoppedAt: now },
      });

      // Persist schedule configuration — delete old configs first
      await ctx.prisma.scheduleConfig.deleteMany({
        where: { organizationId: me.organizationId },
      });

      // Nullable-item list — skip null entries from the schedule configs
      const scheduleConfigs = args.scheduleConfigs.filter(
        (c): c is NonNullable<typeof c> => c != null,
      );

      for (const filter of scheduleConfigs) {
        const products = await ctx.prisma.product.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.productIds },
          },
        });

        const projects = await ctx.prisma.project.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.projectIds },
          },
        });

        const tags = await ctx.prisma.tag.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.tagIds },
          },
        });

        const workflows = await ctx.prisma.workflow.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.workflowIds },
          },
        });

        const tickets = await ctx.prisma.ticket.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.ticketIds },
          },
        });

        if (
          isEmpty(products) &&
          isEmpty(tags) &&
          isEmpty(tickets) &&
          isEmpty(workflows) &&
          isEmpty(projects)
        ) {
          continue;
        }

        await ctx.prisma.scheduleConfig.create({
          data: {
            organizationId: me.organizationId,
            priority: filter.priority,
            products: { connect: products.map(({ id }) => ({ id })) },
            tags: { connect: tags.map(({ id }) => ({ id })) },
            tickets: { connect: tickets.map(({ id }) => ({ id })) },
            projects: { connect: projects.map(({ id }) => ({ id })) },
            workflows: { connect: workflows.map(({ id }) => ({ id })) },
          },
        });
      }

      await requestEstimate(me.organizationId, true);

      return true;
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getUnscheduledTickets
// ---------------------------------------------------------------------------

builder.queryField("getUnscheduledTickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      last: t.arg.int({ required: false }),
      first: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      productId: t.arg.int({ required: false }),
      workflowId: t.arg.int({ required: false }),
      tagId: t.arg.int({ required: false }),
      projectId: t.arg.int({ required: false }),
      isReadyToSchedule: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTickets({
        roleId: me.roleId,
        organizationId: me.organizationId,
        stages: [ModelStage.PUBLISHED],
        statuses: [TicketStatus.UNSCHEDULED],
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        productId: args.productId ?? undefined,
        workflowId: args.workflowId ?? undefined,
        tagId: args.tagId ?? undefined,
        isReadyToSchedule: args.isReadyToSchedule ?? undefined,
        projectId: args.projectId ?? undefined,
        recursive: true,
        publishedProjectOnly: true,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: getScheduledTickets
// ---------------------------------------------------------------------------

builder.queryField("getScheduledTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
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
          ...query.include,
          workflow: true,
          product: true,
          project: true,
          tags: true,
          ticketWorkflowStates: { include: { assignee: true } },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: planningProjection
// ---------------------------------------------------------------------------

builder.queryField("planningProjection", (t) =>
  t.field({
    type: [PlanningTicketRef],
    authScopes: { hasRole: true },
    args: {
      ticketIds: t.arg.intList({ required: true }),
      scheduleConfigs: t.arg({
        type: [ScheduleConfigForEstimateInput],
        required: { list: true, items: false },
      }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const scheduledTickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          id: { in: args.ticketIds },
          // Exclude tickets with non-active assignees
          ticketWorkflowStates: {
            none: {
              isActive: true,
              assignee: { status: { not: "ACCEPTED" } },
            },
          },
        },
        include: {
          product: true,
          workflow: true,
          project: true,
          scheduleItems: {
            orderBy: { stoppedAt: "desc" },
            take: 1,
            include: {
              ticketWorkflowState: true,
              nextTicketWorkflowState: true,
            },
          },
          ticketWorkflowStates: {
            where: { isActive: true },
            orderBy: { position: "asc" },
          },
          ancestors: {
            include: {
              ticketWorkflowStates: {
                where: { isActive: true },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      // Nullable-item list — strip null entries before passing to estimator
      const scheduleConfigsForEstimate = args.scheduleConfigs.filter(
        (c): c is NonNullable<typeof c> => c != null,
      );

      const snapshots = keyBy(
        await estimateTickets(
          me.organizationId,
          scheduledTickets,
          scheduleConfigsForEstimate,
          true,
        ),
        "uid",
      );

      const planningTickets: Array<{
        id: number;
        title: string;
        status: TicketStatus;
        localId: number;
        eta: Date;
        milestone: boolean;
        workflowName: string;
        productCode: string;
        productName: string;
        projectName: string;
      }> = [];

      for (const ticket of scheduledTickets) {
        const lastState = last(ticket.ticketWorkflowStates);
        if (lastState) {
          const uid = buildUid("TicketWorkflowState", lastState.id);

          planningTickets.push({
            id: ticket.id,
            title: ticket.title,
            status: ticket.status,
            localId: ticket.localId || 0,
            // Estimates are in seconds, not milliseconds
            eta: new Date(snapshots[uid].end_p80 * 1000),
            milestone: ticket.milestone,
            workflowName: ticket.workflow?.name || "n/a",
            productCode: ticket.product?.code || "n/a",
            productName: ticket.product?.name || "n/a",
            projectName: ticket.project?.name || "n/a",
          });
        }
      }

      return planningTickets;
    },
  }),
);
