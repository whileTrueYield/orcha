/**
 * Bulk ticket listing queries: filtered, paginated, and role-scoped.
 *
 * Registers:
 *  - Query.myTickets: [Ticket!]!
 *  - Query.blockingTickets: [TicketWorkflowState!]!
 *  - Query.ticketsForMyCalendar(search?): [Ticket!]!
 *  - Query.tickets(...filters): PaginatedTickets!
 *  - Query.moreTickets(...filters, cursor): PaginatedTickets!
 *  - Query.myTicketsToEstimate: [Ticket!]!
 *  - Query.myNotScheduledTickets(...pagination): PaginatedTickets!
 *  - Query.myWatchedTickets: [Ticket!]!
 *  - Query.myRecentlyCreatedTickets(projectId?, ...pagination): PaginatedTickets!
 *  - Query.myEstimatedTickets: [Ticket!]!
 *  - Query.myUnestimatedTickets: [Ticket!]!
 *  - Query.myPreviousTickets: [MyPreviousAssignedTicket!]!
 *  - Query.moreTicketsForProject(projectId, ...pagination): PaginatedTickets!
 *
 * All queries are scoped to the caller's organization.
 */

import { ModelStage, Prisma, RoleStatus, TicketStatus } from "@prisma/client";
import { last, reduce, trim } from "lodash";
import { subDays } from "date-fns";
import builder from "../../../schema/builder";
import { PaginatedTickets, MyPreviousAssignedTicketRef } from "../entity";
import { TicketStatusEnum, ModelStageEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";
import {
  getMyTicketsToEstimate,
  getPaginatedTickets,
  getPaginatedTicketsForProject,
  getTicketCurrentState,
} from "../helper";
import prisma from "../../../prisma";

// ---------------------------------------------------------------------------
// Query: myTickets — the user's own tickets and drafts
// ---------------------------------------------------------------------------

builder.queryField("myTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          OR: [
            { ownerId: me.roleId, status: TicketStatus.UNSCHEDULED },
            {
              ownerId: null,
              authorId: me.roleId,
              stage: ModelStage.DRAFT,
            },
            { ownerId: me.roleId, stage: ModelStage.DRAFT },
            {
              project: {
                OR: [
                  { ancestorIsArchived: false },
                  { stage: ModelStage.PUBLISHED },
                ],
              },
            },
          ],
        },
        include: {
          ...query.include,
          workflow: true,
          product: true,
          author: true,
          owner: true,
          ticketWorkflowStates: true,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: blockingTickets — scheduled tickets that cannot be estimated
// ---------------------------------------------------------------------------

builder.queryField("blockingTickets", (t) =>
  t.prismaField({
    type: ["TicketWorkflowState"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticketWorkflowState.findMany({
        ...query,
        where: {
          ticket: {
            organizationId: me.organizationId,
            status: TicketStatus.SCHEDULED,
            stage: ModelStage.PUBLISHED,
          },
          assignee: { status: { not: RoleStatus.ACCEPTED } },
        },
        include: {
          ...query.include,
          assignee: true,
          ticket: { include: { workflow: true, product: true } },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: ticketsForMyCalendar
// ---------------------------------------------------------------------------

builder.queryField("ticketsForMyCalendar", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      search: t.arg.string({ required: false }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticketQuery: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        stage: ModelStage.PUBLISHED,
        status: {
          in: [
            TicketStatus.CANCELLED,
            TicketStatus.SCHEDULED,
            TicketStatus.DONE,
          ],
        },
        ticketWorkflowStates: {
          some: { assigneeId: me.roleId },
        },
      };

      const andClauses: Prisma.TicketWhereInput[] = [
        {
          OR: [
            { closedAt: { gte: subDays(new Date(), 30) } },
            { status: TicketStatus.SCHEDULED },
          ],
        },
      ];

      const searchTerm = trim(args.search ?? undefined);
      if (searchTerm) {
        const searchQuery: Prisma.TicketWhereInput = {};
        searchQuery.OR = [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ];

        const parts = /([a-z]+)[^\d]?(\d+)/gi.exec(searchTerm);
        if (parts) {
          const productCode = parts[1];
          const ticketLocalId = parts[2];
          searchQuery.OR.push({
            AND: [
              { localId: parseInt(ticketLocalId) },
              {
                product: {
                  code: { contains: productCode, mode: "insensitive" },
                },
              },
            ],
          });
        }

        andClauses.push(searchQuery);
      }

      ticketQuery.AND = andClauses;

      return prisma.ticket.findMany({
        ...query,
        where: { ...ticketQuery },
        take: 20,
        orderBy: [{ closedAt: "desc" }, { scheduledAt: "desc" }],
        include: { ...query.include, product: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: tickets — primary paginated listing with all filters
// ---------------------------------------------------------------------------

builder.queryField("tickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      projectId: t.arg.int({ required: false }),
      recursive: t.arg.boolean({ required: false }),
      search: t.arg.string({ required: false }),
      productId: t.arg.int({ required: false }),
      productIds: t.arg.intList({ required: false }),
      workflowIds: t.arg.intList({ required: false }),
      authorIds: t.arg.intList({ required: false }),
      assigneeIds: t.arg.intList({ required: false }),
      featureIds: t.arg.intList({ required: false }),
      tagIds: t.arg.intList({ required: false }),
      isActive: t.arg.boolean({ required: false }),
      unassigned: t.arg.boolean({ required: false }),
      isReadyToSchedule: t.arg.boolean({ required: false }),
      unestimated: t.arg.boolean({ required: false }),
      untagged: t.arg.boolean({ required: false }),
      watched: t.arg.boolean({ required: false }),
      unfinished: t.arg.boolean({ required: false }),
      createdAtFilter: t.arg.string({ required: false }),
      etaFilter: t.arg.string({ required: false }),
      statuses: t.arg({ type: [TicketStatusEnum], required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTickets({
        roleId: me.roleId,
        organizationId: me.organizationId,
        productId: args.productId ?? undefined,
        productIds: args.productIds ?? undefined,
        workflowIds: args.workflowIds ?? undefined,
        authorIds: args.authorIds ?? undefined,
        featureIds: args.featureIds ?? undefined,
        tagIds: args.tagIds ?? undefined,
        assigneeIds: args.assigneeIds ?? undefined,
        statuses: args.statuses ?? undefined,
        stages: args.stages ?? undefined,
        projectId: args.projectId ?? undefined,
        recursive: args.recursive ?? undefined,
        createdAtFilter: args.createdAtFilter ?? undefined,
        etaFilter: args.etaFilter ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        isActive: args.isActive ?? undefined,
        untagged: args.untagged ?? undefined,
        watched: args.watched ?? undefined,
        unfinished: args.unfinished ?? undefined,
        unassigned: args.unassigned ?? undefined,
        unestimated: args.unestimated ?? undefined,
        isReadyToSchedule: args.isReadyToSchedule ?? undefined,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: moreTickets — cursor-based pagination variant with all filters
// ---------------------------------------------------------------------------

builder.queryField("moreTickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      cursor: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      projectId: t.arg.int({ required: false }),
      recursive: t.arg.boolean({ required: false }),
      search: t.arg.string({ required: false }),
      productId: t.arg.int({ required: false }),
      productIds: t.arg.intList({ required: false }),
      workflowIds: t.arg.intList({ required: false }),
      authorIds: t.arg.intList({ required: false }),
      ownerIds: t.arg.intList({ required: false }),
      assigneeIds: t.arg.intList({ required: false }),
      featureIds: t.arg.intList({ required: false }),
      tagIds: t.arg.intList({ required: false }),
      intersectTagIds: t.arg.intList({ required: false }),
      hideCompleted: t.arg.boolean({ required: false }),
      isActive: t.arg.boolean({ required: false }),
      atRisk: t.arg.boolean({ required: false }),
      unassigned: t.arg.boolean({ required: false }),
      isReadyToSchedule: t.arg.boolean({ required: false }),
      untagged: t.arg.boolean({ required: false }),
      unestimated: t.arg.boolean({ required: false }),
      allUntagged: t.arg.boolean({ required: false }),
      createdAtFilter: t.arg.string({ required: false }),
      etaFilter: t.arg.string({ required: false }),
      closedAtFilter: t.arg.string({ required: false }),
      statuses: t.arg({ type: [TicketStatusEnum], required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTickets({
        roleId: me.roleId,
        organizationId: me.organizationId,
        productId: args.productId ?? undefined,
        productIds: args.productIds ?? undefined,
        workflowIds: args.workflowIds ?? undefined,
        authorIds: args.authorIds ?? undefined,
        ownerIds: args.ownerIds ?? undefined,
        featureIds: args.featureIds ?? undefined,
        tagIds: args.tagIds ?? undefined,
        intersectTagIds: args.intersectTagIds ?? undefined,
        assigneeIds: args.assigneeIds ?? undefined,
        statuses: args.statuses ?? undefined,
        stages: args.stages ?? undefined,
        projectId: args.projectId ?? undefined,
        recursive: args.recursive ?? undefined,
        createdAtFilter: args.createdAtFilter ?? undefined,
        etaFilter: args.etaFilter ?? undefined,
        closedAtFilter: args.closedAtFilter ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        cursor: args.cursor ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        isActive: args.isActive ?? undefined,
        hideCompleted: args.hideCompleted ?? undefined,
        untagged: args.untagged ?? undefined,
        allUntagged: args.allUntagged ?? undefined,
        atRisk: args.atRisk ?? undefined,
        unassigned: args.unassigned ?? undefined,
        isReadyToSchedule: args.isReadyToSchedule ?? undefined,
        unestimated: args.unestimated ?? undefined,
        publishedProjectOnly: args.stages?.includes(ModelStage.ARCHIVED)
          ? false
          : true,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myTicketsToEstimate — tickets assigned to me for estimation
// ---------------------------------------------------------------------------

builder.queryField("myTicketsToEstimate", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    resolve: (_query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      // getMyTicketsToEstimate returns raw Prisma results, delegate directly
      return getMyTicketsToEstimate({
        roleId: me.roleId,
        organizationId: me.organizationId,
        includeEstimated: true,
      }) as any;
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myNotScheduledTickets
// ---------------------------------------------------------------------------

builder.queryField("myNotScheduledTickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTickets({
        ownerId: me.roleId,
        organizationId: me.organizationId,
        statuses: [TicketStatus.UNSCHEDULED],
        stages: [ModelStage.PUBLISHED],
        publishedProjectOnly: true,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myWatchedTickets
// ---------------------------------------------------------------------------

builder.queryField("myWatchedTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          watchers: { some: { id: me.roleId } },
          OR: [
            {
              stage: ModelStage.PUBLISHED,
              status: {
                in: [TicketStatus.SCHEDULED, TicketStatus.UNSCHEDULED],
              },
            },
            { stage: ModelStage.DRAFT },
            {
              project: {
                stage: ModelStage.PUBLISHED,
                ancestorIsArchived: false,
              },
            },
          ],
        },
        include: {
          ...query.include,
          product: true,
          workflow: true,
          ticketWorkflowStates: { include: { assignee: true } },
          author: true,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myRecentlyCreatedTickets
// ---------------------------------------------------------------------------

builder.queryField("myRecentlyCreatedTickets", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: false }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTickets({
        organizationId: me.organizationId,
        authorId: me.roleId,
        stages: [ModelStage.DRAFT, ModelStage.PUBLISHED],
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) || "createdAt",
        projectId: args.projectId ?? undefined,
        recentlyCreated: true,
        publishedProjectOnly: true,
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myEstimatedTickets
// ---------------------------------------------------------------------------

builder.queryField("myEstimatedTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          authorId: me.roleId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.UNSCHEDULED,
          ticketWorkflowStates: {
            every: {
              OR: [
                {
                  estimateMinimum: { not: null },
                  estimateMostLikely: { not: null },
                  estimateMaximum: { not: null },
                  isActive: true,
                },
                { isActive: false },
              ],
            },
          },
        },
        include: { ...query.include, product: true, workflow: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myUnestimatedTickets
// ---------------------------------------------------------------------------

builder.queryField("myUnestimatedTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
          authorId: me.roleId,
          stage: ModelStage.PUBLISHED,
          status: TicketStatus.UNSCHEDULED,
          ticketWorkflowStates: {
            some: {
              estimateMinimum: null,
              estimateMostLikely: null,
              estimateMaximum: null,
              isActive: true,
            },
          },
        },
        include: { ...query.include, product: true, workflow: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myPreviousTickets — tickets the user worked on previously
// ---------------------------------------------------------------------------

builder.queryField("myPreviousTickets", (t) =>
  t.field({
    type: [MyPreviousAssignedTicketRef],
    authScopes: { hasRole: true },
    resolve: async (_root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const tickets = await prisma.ticket.findMany({
        where: {
          organizationId: me.organizationId,
          stage: ModelStage.PUBLISHED,
          scheduleItems: {
            some: { roleId: { in: [me.roleId] } },
          },
          OR: [
            { status: TicketStatus.SCHEDULED },
            {
              // Also show tickets closed within the past 2 weeks
              status: TicketStatus.DONE,
              closedAt: { gt: subDays(new Date(), 14) },
            },
          ],
        },
        include: {
          product: true,
          author: true,
          ticketWorkflowStates: {
            orderBy: { position: "asc" },
            where: { isActive: true },
            include: { assignee: true },
          },
          scheduleItems: {
            orderBy: { startedAt: "desc" },
            take: 1,
            include: {
              ticketWorkflowState: { include: { assignee: true } },
            },
          },
        },
      });

      return reduce(
        tickets,
        (acc: any[], ticket): any[] => {
          const lastItem = last(ticket.scheduleItems);

          if (ticket.status === TicketStatus.DONE) {
            return [
              ...acc,
              {
                ticket,
                currentState: null,
                lastState: lastItem ? lastItem.ticketWorkflowState : null,
                isStarted: true,
                isActive: false,
                isPaused: false,
                isDone: false,
                isNext: false,
              },
            ];
          }

          if (lastItem) {
            const currentState = getTicketCurrentState(
              ticket.ticketWorkflowStates,
              lastItem,
            );

            const isDone = !!lastItem.nextTicketWorkflowStateId;
            const isPaused = !isDone && !!lastItem.stoppedAt;
            const isActive = !isPaused && !lastItem.stoppedAt;

            return [
              ...acc,
              {
                ticket,
                currentState,
                lastState: lastItem.ticketWorkflowState,
                isStarted: true,
                isActive,
                isPaused,
                isDone,
                isNext: currentState.assigneeId === me.roleId,
              },
            ];
          }

          return acc;
        },
        [],
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: moreTicketsForProject — cursor-based pagination for a project view
// ---------------------------------------------------------------------------

builder.queryField("moreTicketsForProject", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      cursor: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      hideCompleted: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return getPaginatedTicketsForProject({
        roleId: me.roleId,
        organizationId: me.organizationId,
        hideCompleted: args.hideCompleted ?? undefined,
        projectId: args.projectId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        cursor: args.cursor ?? undefined,
        sort: (args.sort as any) ?? undefined,
      });
    },
  }),
);
