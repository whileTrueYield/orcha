/**
 * ScheduleItem list queries — paginated, period-based, and unfinished items.
 *
 * Registers:
 *  - Query.scheduleItems(...): PaginatedScheduleItems
 *  - Query.scheduleItemPeriod(fromDate, toDate, roleId?): [ScheduleItem]
 *  - Query.myScheduleItemPeriod(fromDate, toDate): [ScheduleItem]
 *  - Query.myOpenScheduleItems: [ScheduleItem]
 *  - Query.myUnfinishedScheduleItems: [ScheduleItem]
 *
 * Auth: hasRole (various levels depending on query).
 */

import builder from "../../../schema/builder";
import { Prisma, TicketStatus, ModelStage } from "@prisma/client";
import { PaginatedScheduleItems } from "../entity";
import { getPaginatedScheduleItems } from "../helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: scheduleItems — paginated list (admin/owner only)
// ---------------------------------------------------------------------------

builder.queryField("scheduleItems", (t) =>
  t.field({
    type: PaginatedScheduleItems,
    authScopes: { hasRole: ["OWNER", "ADMIN"] },
    args: {
      roleId: t.arg.int({ required: false }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedScheduleItems({
        organizationId: me.organizationId,
        roleId: args.roleId ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: scheduleItemPeriod — items in a date range, optionally for a role
// ---------------------------------------------------------------------------

builder.queryField("scheduleItemPeriod", (t) =>
  t.prismaField({
    type: ["ScheduleItem"],
    authScopes: { hasRole: true },
    args: {
      fromDate: t.arg({ type: "DateTime", required: true }),
      toDate: t.arg({ type: "DateTime", required: false }),
      roleId: t.arg.int({ required: false }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const where: Prisma.ScheduleItemWhereInput = {
        organizationId: me.organizationId,
      };

      if (args.roleId) {
        where.roleId = args.roleId;
      }

      if (!args.toDate) {
        where.startedAt = { gte: args.fromDate };
      } else if (args.toDate > new Date()) {
        where.OR = [
          { startedAt: { lt: args.toDate }, stoppedAt: { gt: args.fromDate } },
          { startedAt: { lt: args.toDate }, stoppedAt: null },
        ];
      } else {
        where.startedAt = { lt: args.toDate };
        where.stoppedAt = { gt: args.fromDate };
      }

      return ctx.prisma.scheduleItem.findMany({
        ...query,
        where,
        include: {
          ticketWorkflowState: true,
          ticket: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myScheduleItemPeriod — current user's items in a date range
// ---------------------------------------------------------------------------

builder.queryField("myScheduleItemPeriod", (t) =>
  t.prismaField({
    type: ["ScheduleItem"],
    authScopes: { hasRole: true },
    args: {
      fromDate: t.arg({ type: "DateTime", required: true }),
      toDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const where: Prisma.ScheduleItemWhereInput = {
        organizationId: me.organizationId,
        roleId: me.roleId,
      };

      if (args.toDate > new Date()) {
        where.OR = [
          { startedAt: { lt: args.toDate }, stoppedAt: { gt: args.fromDate } },
          { startedAt: { lt: args.toDate }, stoppedAt: null },
        ];
      } else {
        where.startedAt = { lt: args.toDate };
        where.stoppedAt = { gt: args.fromDate };
      }

      return ctx.prisma.scheduleItem.findMany({
        ...query,
        where,
        include: {
          ticketWorkflowState: true,
          ticket: {
            include: {
              product: true,
            },
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myOpenScheduleItems — items without a stop date
// ---------------------------------------------------------------------------

builder.queryField("myOpenScheduleItems", (t) =>
  t.prismaField({
    type: ["ScheduleItem"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleItem.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          roleId: me.roleId,
          stoppedAt: null,
        },
        include: {
          ticketWorkflowState: true,
          ticket: {
            include: {
              workflow: true,
              product: true,
              ticketWorkflowStates: true,
            },
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myUnfinishedScheduleItems — last item per ticket where work remains
// ---------------------------------------------------------------------------

builder.queryField("myUnfinishedScheduleItems", (t) =>
  t.prismaField({
    type: ["ScheduleItem"],
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      // Capture the last schedule item on every open task
      // of the organization
      const items = await ctx.prisma.scheduleItem.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          ticket: {
            status: TicketStatus.SCHEDULED,
            stage: ModelStage.PUBLISHED,
            ticketWorkflowStates: {
              some: { assigneeId: me.roleId },
            },
          },
        },
        include: {
          ticket: {
            include: {
              product: true,
              workflow: true,
              ticketWorkflowStates: true,
            },
          },
          ticketWorkflowState: true,
        },
        orderBy: { stoppedAt: "desc" },
        distinct: ["ticketId"],
      });

      // only return the last item if the stoppedAt has been set on it
      // and it is not done
      return items.filter(
        (item) =>
          me.roleId === item.ticketWorkflowState.assigneeId &&
          item.stoppedAt &&
          !item.done,
      );
    },
  }),
);
