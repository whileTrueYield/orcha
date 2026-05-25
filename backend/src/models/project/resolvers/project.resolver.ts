/**
 * Project queries and field resolvers.
 *
 * Queries: project, myLastProject, projectTextAccessToken, projectAccessToken,
 *          exportTickets, projectTickets, projectTicketsForCategory,
 *          projectGoalStats, deliveredTicketForPeriod, workedTicketForPeriod,
 *          scheduledTicketToBeWorked, scheduledTicketToBeClosing,
 *          ticketStatusHistogram, projectedWorkload, pastGoalProgress,
 *          projectedGoalProgress, projectedWorkflowDistribution, pastWorkflowDistribution
 *
 * Mutations: setProjectChecklist
 */

import builder from "../../../schema/builder";
import {
  ProjectRef,
  ProjectTicketRef,
  TicketExportRef,
  ProjectGoalStatsRef,
  ProjectGoalProgressRef,
  OpenTicketsByWorkflowRef,
  RoleWorkloadRef,
  WorkflowDistributionRef,
  ProjectTicketQueryCategoryEnum,
  ProjectTicketQueryCategory,
} from "../entity";
import { ChecklistItemRef } from "../../ticket/entity";
import { PaginatedTickets } from "../../ticket/entity";
import { TicketStatusEnum, ModelStageEnum } from "../../../schema/enums";
import { Prisma, ModelStage, TicketStatus, TicketWorkflowState } from "@prisma/client";
import {
  getTicketQueryForDone,
  getTicketQueryForDraft,
  getTicketQueryForEstimated,
  getTicketQueryForProject,
  getTicketQueryForInProgress,
  getTicketQueryForPublishedAndArchived,
  getTicketQueryForScheduled,
  getTicketQueryForUnassigned,
  getTicketQueryForUnestimated,
  getProjectDescendantIds,
  getProjectParentIds,
} from "../helper";
import {
  clamp,
  filter,
  groupBy,
  keyBy,
  map,
  max,
  orderBy,
  reduce,
  sum,
  uniq,
  values,
  without,
} from "lodash";
import { addDays, subDays } from "date-fns";
import { getRolePreferences, updateRolePreferences } from "../../role/entity";
import { GraphQLError } from "graphql";
import { getTicketSorting } from "../../ticket/helper";
import { paginateNodes } from "../../../utils/pagination";
import jwt from "jsonwebtoken";
import { config } from "../../../config";
import { DocumentToken } from "../../../hocuspocus/documentToken";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateProjectChecklistInput = builder.inputType("UpdateProjectChecklistInput", {
  fields: (t) => ({
    label: t.string({ required: true }),
    checked: t.boolean({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Query: project
// ---------------------------------------------------------------------------

builder.queryField("project", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
      visited: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      if (args.visited) {
        const role = await (ctx.me as AuthRoleContext).getRole();
        const preferences = getRolePreferences(role);
        const objectId = `project:${args.id}:${project.name}`;
        const recentlyVisited = [
          objectId,
          ...without(preferences.recentlyVisited, objectId),
        ];

        const updatedPreferences = updateRolePreferences(role, {
          lastProjectId: args.id,
          recentlyVisited: recentlyVisited.slice(0, 10),
        });

        await ctx.prisma.role.update({
          where: { id: (ctx.me as AuthRoleContext).roleId },
          data: { preferences: JSON.stringify(updatedPreferences) },
        });
      }

      return project;
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: myLastProject
// ---------------------------------------------------------------------------

builder.queryField("myLastProject", (t) =>
  t.prismaField({
    type: "Project",
    nullable: true,
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) => {
      const preferences = getRolePreferences(await (ctx.me as AuthRoleContext).getRole());

      if (preferences.lastProjectId) {
        const project = await ctx.prisma.project.findFirst({
          ...query,
          where: {
            id: preferences.lastProjectId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        });
        if (project) return project;
      }

      return ctx.prisma.project.findFirst({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          OR: [
            { stage: ModelStage.PUBLISHED, ancestorIsArchived: false },
            { stage: ModelStage.DRAFT, authorId: (ctx.me as AuthRoleContext).roleId, ancestorIsArchived: false },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectTextAccessToken
// ---------------------------------------------------------------------------

builder.queryField("projectTextAccessToken", (t) =>
  t.string({
    nullable: true,
    authScopes: { hasRole: true },
    args: { id: t.arg.int({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { id: args.id, organizationId: (ctx.me as AuthRoleContext).organizationId, stage: { not: ModelStage.DELETED } },
      });
      const readOnly = project.ancestorIsArchived || project.stage === "ARCHIVED";
      const accessToken: DocumentToken = {
        roleId: (ctx.me as AuthRoleContext).roleId, orgId: (ctx.me as AuthRoleContext).organizationId,
        documentId: project.id, documentType: "projectText",
        mode: readOnly ? "read" : "write",
      };
      return jwt.sign(accessToken, config.sessionSecret, { expiresIn: 900 });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectAccessToken
// ---------------------------------------------------------------------------

builder.queryField("projectAccessToken", (t) =>
  t.string({
    nullable: true,
    authScopes: { hasRole: true },
    args: { id: t.arg.int({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { id: args.id, organizationId: (ctx.me as AuthRoleContext).organizationId, stage: { not: ModelStage.DELETED } },
      });
      const readOnly = project.ancestorIsArchived || project.stage === "ARCHIVED";
      const accessToken: DocumentToken = {
        roleId: (ctx.me as AuthRoleContext).roleId, orgId: (ctx.me as AuthRoleContext).organizationId,
        documentId: project.id, documentType: "projectText",
        mode: readOnly ? "read" : "write",
      };
      return jwt.sign(accessToken, config.sessionSecret, { expiresIn: 900 });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: exportTickets
// ---------------------------------------------------------------------------

builder.queryField("exportTickets", (t) =>
  t.field({
    type: [TicketExportRef],
    authScopes: { hasRole: true },
    args: { sources: t.arg.stringList({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const ticketIds: number[] = [];
      const projectNames: string[] = [];

      for (const source of args.sources) {
        const [sourceType, sourceId] = source.split(":");
        switch (sourceType) {
          case "ticket": ticketIds.push(parseInt(sourceId, 10)); break;
          case "project": projectNames.push(sourceId); break;
        }
      }

      const ticketWhere: Prisma.TicketWhereInput = {
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        stage: { not: ModelStage.DELETED },
        OR: [
          { id: { in: ticketIds } },
          { project: { organizationId: (ctx.me as AuthRoleContext).organizationId, name: { in: projectNames, mode: "insensitive" } } },
        ],
      };

      const tickets = await ctx.prisma.ticket.findMany({
        where: ticketWhere,
        include: {
          product: true,
          owner: { include: { user: true } },
          author: { include: { user: true } },
          workflow: true,
          project: true,
          tags: true,
          successors: true,
          ancestors: true,
        },
      });

      return tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description || "",
        created_at: ticket.createdAt.toISOString(),
        status: ticket.status,
        stage: ticket.stage,
        eta: ticket.eta ? ticket.eta.toISOString() : "",
        local_id: ticket.localId && ticket.product ? `${ticket.product.code}-${ticket.localId}` : "",
        product: ticket.product ? ticket.product.name : "",
        workflow: ticket.workflow ? ticket.workflow.name : "",
        owner_email: ticket.owner ? ticket.owner.user.email : "",
        owner_name: ticket.owner ? ticket.owner.name : "",
        project: ticket.project ? ticket.project.name : "",
        scheduled_at: ticket.scheduledAt ? ticket.scheduledAt.toISOString() : "",
        closed_at: ticket.closedAt ? ticket.closedAt.toISOString() : "",
        author_email: ticket.author ? ticket.author.user.email : "unknown",
        author_name: ticket.author ? ticket.author.name : "unknown",
        ancestor_tickets: ticket.ancestors.map(({ id }) => id).join(","),
        successor_tickets: ticket.successors.map(({ id }) => id).join(","),
        tags: ticket.tags.map(({ name }) => name).join(","),
      }));
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectTickets
// ---------------------------------------------------------------------------

builder.queryField("projectTickets", (t) =>
  t.field({
    type: [ProjectTicketRef],
    authScopes: { hasRole: true },
    args: {
      name: t.arg.string({ required: true }),
      myDraft: t.arg.boolean({ required: false }),
      statuses: t.arg({ type: [TicketStatusEnum], required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const OR: Prisma.TicketWhereInput[] = [];
      const where: Prisma.TicketWhereInput = {
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        stage: { not: ModelStage.DELETED },
        project: { name: { equals: args.name, mode: "insensitive" } },
        OR,
      };

      if (args.statuses?.length) {
        for (const status of args.statuses) {
          OR.push({ stage: ModelStage.PUBLISHED, status });
        }
      }
      if (args.stages?.length) {
        for (const stage of args.stages) {
          OR.push({ stage });
        }
      }
      if (args.myDraft) {
        OR.push({ stage: ModelStage.DRAFT, authorId: (ctx.me as AuthRoleContext).roleId });
      }

      const tickets = await ctx.prisma.ticket.findMany({
        where,
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });

      return tickets.map((ticket) => ({
        id: ticket.id,
        localId: ticket.localId || undefined,
        productCode: ticket.product?.code,
        title: ticket.title,
        createdAt: ticket.createdAt,
        stage: ticket.stage,
        status: ticket.status,
      }));
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectTicketsForCategory
// ---------------------------------------------------------------------------

builder.queryField("projectTicketsForCategory", (t) =>
  t.field({
    type: PaginatedTickets,
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      category: t.arg({ type: ProjectTicketQueryCategoryEnum, required: true }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx) => {
      const project = await ctx.prisma.project.findFirst({
        where: { id: args.projectId, organizationId: (ctx.me as AuthRoleContext).organizationId },
      });

      const offset = args.offset ?? 0;
      const sort = args.sort ?? "createdAt";
      const direction: Prisma.SortOrder = args.last ? Prisma.SortOrder.desc : Prisma.SortOrder.asc;
      const requestedPageSize = args.first ?? args.last ?? 10;
      const pageSize = clamp(requestedPageSize, 1, 50);

      let ticketQuery: Prisma.TicketWhereInput;
      switch (args.category) {
        case ProjectTicketQueryCategory.Scheduled:
          ticketQuery = await getTicketQueryForScheduled((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.Draft:
          ticketQuery = await getTicketQueryForDraft((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.Estimated:
          ticketQuery = await getTicketQueryForEstimated((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.Unestimated:
          ticketQuery = await getTicketQueryForUnestimated((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.Unassigned:
          ticketQuery = await getTicketQueryForUnassigned((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.InProgress:
          ticketQuery = await getTicketQueryForInProgress((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        case ProjectTicketQueryCategory.Done:
          ticketQuery = await getTicketQueryForDone((ctx.me as AuthRoleContext).organizationId, project?.id); break;
        default:
          throw new GraphQLError(`category ${args.category} is not a valid option`, { extensions: { code: "BAD_USER_INPUT" } });
      }

      const tickets = await ctx.prisma.ticket.findMany({
        where: ticketQuery,
        skip: offset,
        take: pageSize,
        orderBy: getTicketSorting(sort, direction),
        include: {
          ticketWorkflowStates: { where: { isActive: true }, include: { assignee: true } },
          scheduleItems: {
            include: {
              nextTicketWorkflowState: { include: { assignee: true } },
              ticketWorkflowState: true,
              role: true,
            },
            orderBy: { startedAt: "desc" },
            take: 1,
          },
          workflow: true,
          product: true,
        },
      });

      const count = await ctx.prisma.ticket.count({ where: ticketQuery });
      return paginateNodes({ nodes: tickets, offset, pageSize, count });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectGoalStats
// ---------------------------------------------------------------------------

builder.queryField("projectGoalStats", (t) =>
  t.field({
    type: [ProjectGoalStatsRef],
    args: { projectId: t.arg.int({ required: true }) },
    resolve: async (_root, args, ctx) => {
      const projectQuery: Prisma.ProjectWhereInput = { organizationId: (ctx.me as AuthRoleContext).organizationId };
      if (args.projectId) {
        projectQuery.id = { in: [args.projectId, ...(await getProjectDescendantIds(args.projectId))] };
      }

      const subProjects = await ctx.prisma.project.findMany({ where: projectQuery });
      const scheduledTickets = await ctx.prisma.ticket.findMany({
        where: { stage: ModelStage.PUBLISHED, projectId: { in: subProjects.map((p) => p.id) } },
        include: { project: true },
      });

      return map(subProjects, (project) => {
        const goalTickets = filter(scheduledTickets, { projectId: project.id });
        return {
          id: project.id, name: project.name, parentId: project.parentId,
          total: goalTickets.length,
          done: filter(goalTickets, { status: TicketStatus.DONE }).length,
          scheduled: filter(goalTickets, { status: TicketStatus.SCHEDULED }).length,
          unScheduled: filter(goalTickets, { status: TicketStatus.UNSCHEDULED }).length,
          cancelled: filter(goalTickets, { status: TicketStatus.CANCELLED }).length,
        };
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: setProjectChecklist
// ---------------------------------------------------------------------------

builder.mutationField("setProjectChecklist", (t) =>
  t.prismaField({
    type: "Project",
    authScopes: { hasRole: true },
    args: {
      projectId: t.arg.int({ required: true }),
      input: t.arg({ type: [UpdateProjectChecklistInput], required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: { id: args.projectId, organizationId: (ctx.me as AuthRoleContext).organizationId },
      });

      return ctx.prisma.project.update({
        ...query,
        where: { id: project.id },
        data: { checklist: JSON.stringify(args.input) },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Remaining project analytics queries — delivered, worked, scheduled tickets, etc.
// These use t.prismaField or t.field depending on return type.
// ---------------------------------------------------------------------------

builder.queryField("deliveredTicketForPeriod", (t) =>
  t.prismaField({
    type: ["Ticket"],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const where = await getTicketQueryForProject((ctx.me as AuthRoleContext).organizationId, args.projectId);
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          ...where,
          closedAt: { gte: args.startDate, lt: args.stopDate },
          stage: ModelStage.PUBLISHED,
          status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
        },
        include: { ...query.include, product: true },
      });
    },
  }),
);

builder.queryField("workedTicketForPeriod", (t) =>
  t.prismaField({
    type: ["Ticket"],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const where = await getTicketQueryForProject((ctx.me as AuthRoleContext).organizationId, args.projectId);
      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          ...where,
          stage: ModelStage.PUBLISHED,
          scheduleItems: { some: { startedAt: { lt: args.stopDate }, stoppedAt: { gte: args.startDate } } },
        },
        include: {
          ...query.include, product: true, ticketWorkflowStates: true,
          scheduleItems: {
            take: 1, orderBy: { startedAt: "desc" },
            include: { nextTicketWorkflowState: true, ticketWorkflowState: true },
          },
        },
        orderBy: [{ closedAt: "asc" }, { eta: "asc" }],
      });
    },
  }),
);

builder.queryField("scheduledTicketToBeClosing", (t) =>
  t.prismaField({
    type: ["Ticket"],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const where = await getTicketQueryForScheduled((ctx.me as AuthRoleContext).organizationId, args.projectId);
      return ctx.prisma.ticket.findMany({
        ...query,
        where: { ...where, eta: { gte: args.startDate, lt: args.stopDate } },
        include: { ...query.include, product: true },
        orderBy: { eta: "asc" },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: ancestors — all ancestor projects in the hierarchy
// ---------------------------------------------------------------------------

builder.prismaObjectField("Project", "ancestors", (t) =>
  t.field({
    type: [ProjectRef],
    resolve: async (project, _args, ctx) => {
      const ancestorIds = await getProjectParentIds(project.id);
      return ctx.prisma.project.findMany({
        where: { id: { in: ancestorIds } },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: checklist — parsed from JSON string stored on project
// ---------------------------------------------------------------------------

builder.prismaObjectField("Project", "checklist", (t) =>
  t.field({
    type: [ChecklistItemRef],
    resolve: (project) => {
      try {
        return JSON.parse((project as any).checklist as string) || [];
      } catch {
        return [];
      }
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: scheduledTicketToBeWorked
// ---------------------------------------------------------------------------

builder.queryField("scheduledTicketToBeWorked", (t) =>
  t.prismaField({
    type: ["Ticket"],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const startEpoch = Math.round(args.startDate.getTime() / 1000);
      const stopEpoch = Math.round(args.stopDate.getTime() / 1000);

      // Find the latest estimate epoch and get estimates that overlap the period
      const estimates = await ctx.prisma.$queryRaw<{ id: number }[]>(Prisma.sql`
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
            "start" < ${stopEpoch} AND
            "end" > ${startEpoch}
        ORDER BY start ASC
      `);

      const ticketWorkflowStateIds = uniq(map(estimates, "id"));

      const where = await getTicketQueryForScheduled(me.organizationId, args.projectId);

      return ctx.prisma.ticket.findMany({
        ...query,
        where: {
          ...where,
          ticketWorkflowStates: { some: { id: { in: ticketWorkflowStateIds } } },
        },
        include: {
          ...query.include,
          product: true,
          ticketWorkflowStates: true,
          scheduleItems: {
            take: 1,
            orderBy: { startedAt: "desc" },
            include: {
              nextTicketWorkflowState: true,
              ticketWorkflowState: true,
            },
          },
        },
        orderBy: { eta: "asc" },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: ticketStatusHistogram
// ---------------------------------------------------------------------------

builder.queryField("ticketStatusHistogram", (t) =>
  t.field({
    type: [OpenTicketsByWorkflowRef],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const where = await getTicketQueryForProject(me.organizationId, args.projectId);

      const tickets = await ctx.prisma.ticket.findMany({
        where: { ...where, stage: ModelStage.PUBLISHED },
        include: { workflow: true },
        orderBy: { scheduledAt: "asc" },
      });

      const ticketOpenByWorkflow: Record<number, any> = {};

      for (const ticket of tickets) {
        const workflow = ticket.workflow;
        if (workflow && !ticketOpenByWorkflow[workflow.id]) {
          ticketOpenByWorkflow[workflow.id] = {
            workflow,
            values: [{ date: args.startDate, value: 0 }],
          };
        }
      }

      // Cumulate open and closed at the beginning of the period
      for (const ticket of tickets) {
        if (ticket.workflow) {
          if (!ticketOpenByWorkflow[ticket.workflow.id]) {
            ticketOpenByWorkflow[ticket.workflow.id] = {
              workflow: ticket.workflow,
              values: [{ date: args.startDate, value: 0 }],
            };
          }
          const record = ticketOpenByWorkflow[ticket.workflow.id];
          if (ticket.scheduledAt && ticket.scheduledAt < args.startDate) {
            record.values[0].value += 1;
          }
          if (ticket.closedAt && ticket.closedAt < args.startDate) {
            record.values[0].value -= 1;
          }
        }
      }

      // Build histogram day by day
      let cursor = addDays(args.startDate, 1);
      const endPeriod = addDays(args.stopDate, 1);

      while (cursor < endPeriod) {
        for (const workflowId in ticketOpenByWorkflow) {
          const record = ticketOpenByWorkflow[workflowId];
          record.values.push({
            date: cursor,
            value: record.values[record.values.length - 1].value,
          });
        }

        const nextCursor = addDays(cursor, 1);

        for (const ticket of tickets) {
          if (ticket.workflowId) {
            const record = ticketOpenByWorkflow[ticket.workflowId];
            if (!record) {
              throw new Error(`Could not find record for workflow ${ticket.workflowId}`);
            }
            const lastValue = record.values[record.values.length - 1];
            if (ticket.scheduledAt && ticket.scheduledAt > cursor && ticket.scheduledAt < nextCursor) {
              lastValue.value += 1;
            }
            if (ticket.closedAt && ticket.closedAt > cursor && ticket.closedAt < nextCursor) {
              lastValue.value -= 1;
            }
          }
        }
        cursor = nextCursor;
      }

      return values(ticketOpenByWorkflow);
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectedWorkload
// ---------------------------------------------------------------------------

builder.queryField("projectedWorkload", (t) =>
  t.field({
    type: [RoleWorkloadRef],
    deprecationReason: "Not useful",
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const lastEpoch = await ctx.prisma.estimate.findFirst({
        where: { organizationId: me.organizationId },
        orderBy: { epoch: "desc" },
      });

      if (!lastEpoch) return [];

      const where = await getTicketQueryForScheduled(me.organizationId, args.projectId);
      const scheduledTickets = await ctx.prisma.ticket.findMany({
        where,
        include: { ticketWorkflowStates: { where: { isActive: true } } },
      });

      const twStates = reduce(
        scheduledTickets,
        (acc: TicketWorkflowState[], ticket) => [...ticket.ticketWorkflowStates, ...acc],
        [],
      );
      const twStateIds = map(twStates, "id");
      const twStateById = keyBy(twStates, "id");

      const startEpoch = Math.round(args.startDate.getTime() / 1000);
      const stopEpoch = Math.round(args.stopDate.getTime() / 1000);

      const estimates = await ctx.prisma.estimate.findMany({
        where: {
          id: { in: twStateIds },
          epoch: lastEpoch.epoch,
          AND: [{ start_p80: { lt: stopEpoch } }, { end_p80: { gt: startEpoch } }],
        },
        include: { assignee: true },
      });

      const timeSpentPerAssignee = groupBy(estimates, "assigneeId");

      return map(timeSpentPerAssignee, (ests) => ({
        role: ests[0].assignee,
        hours: reduce(ests, (acc, estimate) => {
          const state = twStateById[estimate.id];
          let pert = (state.estimateMinimum! + state.estimateMaximum! + state.estimateMostLikely! * 4) / 6;

          if (estimate.start_p80 < startEpoch && estimate.end_p80 > stopEpoch) {
            pert = pert / 3;
          } else if (estimate.start_p80 < startEpoch) {
            pert = (pert * 2) / 3;
          } else if (estimate.end_p80 > stopEpoch) {
            pert = (pert * 2) / 3;
          }

          return acc + pert / 3600;
        }, 0),
      }));
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: pastGoalProgress
// ---------------------------------------------------------------------------

builder.queryField("pastGoalProgress", (t) =>
  t.field({
    type: [ProjectGoalProgressRef],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const ticketWhere: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        stage: ModelStage.PUBLISHED,
      };

      const projectIds = args.projectId
        ? [args.projectId, ...(await getProjectDescendantIds(args.projectId))]
        : null;

      if (projectIds) ticketWhere.projectId = { in: projectIds };

      const allTickets = await ctx.prisma.ticket.findMany({
        where: ticketWhere,
        include: {
          project: true,
          ticketWorkflowStates: { where: { isActive: true } },
          scheduleItems: { where: { startedAt: { gte: subDays(args.startDate, 14) } } },
        },
      });

      const projectQuery: Prisma.ProjectWhereInput = { organizationId: me.organizationId };
      if (projectIds) projectQuery.id = { in: projectIds };

      const subProjects = await ctx.prisma.project.findMany({ where: projectQuery });

      return subProjects.map((project) => {
        const tickets = allTickets.filter((t) => t.projectId === project.id);

        const goalProgress = {
          name: project.name,
          id: project.id,
          parentId: project.parentId,
          progress: 0,
          accomplished: 0,
          total: 0,
          eta: max(map(tickets, "eta")) || new Date(),
        };

        for (const ticket of tickets) {
          const ticketScheduleItems = orderBy(ticket.scheduleItems, "stoppedAt", "asc");
          const ticketWorkflowStates = orderBy(ticket.ticketWorkflowStates, "position", "asc");
          const twsById = keyBy(ticket.ticketWorkflowStates, "id");

          if (ticket.status === TicketStatus.CANCELLED) continue;

          let lastPosition = 0;

          for (const scheduleItem of ticketScheduleItems) {
            if (scheduleItem.startedAt > args.stopDate) continue;

            const stoppedAt = Math.min(
              new Date().getTime(),
              scheduleItem.stoppedAt ? scheduleItem.stoppedAt.getTime() : new Date().getTime(),
            );
            const timeSpent = stoppedAt - scheduleItem.startedAt.getTime();

            if (scheduleItem.startedAt > args.startDate) {
              goalProgress.progress += timeSpent / 1000;
              goalProgress.total += timeSpent / 1000;
            } else {
              goalProgress.accomplished += timeSpent / 1000;
              goalProgress.total += timeSpent / 1000;
            }

            lastPosition =
              twsById[
                scheduleItem.nextTicketWorkflowStateId
                  ? scheduleItem.nextTicketWorkflowStateId
                  : scheduleItem.ticketWorkflowStateId
              ].position;
          }

          if (ticket.status === TicketStatus.SCHEDULED) {
            for (const state of ticketWorkflowStates) {
              if (state.position >= lastPosition) {
                goalProgress.total +=
                  (state.estimateMinimum! + state.estimateMaximum! + state.estimateMostLikely! * 4) / 6;
              }
            }
          }
        }

        return goalProgress;
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectedGoalProgress
// ---------------------------------------------------------------------------

builder.queryField("projectedGoalProgress", (t) =>
  t.field({
    type: [ProjectGoalProgressRef],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const stopEpoch = Math.round(args.stopDate.getTime() / 1000);
      const startEpoch = Math.round(args.startDate.getTime() / 1000);

      const lastEpoch = await ctx.prisma.estimate.findFirst({
        where: { organizationId: me.organizationId },
        orderBy: { epoch: "desc" },
      });

      if (!lastEpoch) return [];

      const ticketWhere: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        stage: ModelStage.PUBLISHED,
      };

      const projectIds = args.projectId
        ? [args.projectId, ...(await getProjectDescendantIds(args.projectId))]
        : null;

      if (projectIds) ticketWhere.projectId = { in: projectIds };

      const allTickets = await ctx.prisma.ticket.findMany({
        where: ticketWhere,
        include: {
          project: true,
          ticketWorkflowStates: { where: { isActive: true } },
          scheduleItems: {
            where: {
              startedAt: { gte: subDays(args.startDate, 14) },
              OR: [{ stoppedAt: null }, { stoppedAt: { lte: new Date() } }],
            },
          },
        },
      });

      const projectQuery: Prisma.ProjectWhereInput = { organizationId: me.organizationId };
      if (projectIds) projectQuery.id = { in: projectIds };

      const subProjects = await ctx.prisma.project.findMany({ where: projectQuery });

      const allEstimates = await ctx.prisma.estimate.findMany({
        where: {
          epoch: lastEpoch.epoch,
          AND: [{ start: { lt: stopEpoch } }, { end: { gt: startEpoch } }],
        },
      });

      return subProjects.map((project) => {
        const tickets = allTickets.filter((t) => t.projectId === project.id);

        const previousWork = reduce(
          tickets,
          (acc: any[], ticket) => [...acc, ...ticket.scheduleItems],
          [],
        );

        const timeSpent = sum(
          map(previousWork, (scheduleItem) => {
            const stop = scheduleItem.stoppedAt
              ? scheduleItem.stoppedAt.getTime()
              : new Date().getTime();
            return (stop - scheduleItem.startedAt.getTime()) / 1000;
          }),
        );

        const goalProgress = {
          name: project.name,
          id: project.id,
          parentId: project.parentId,
          progress: 0,
          accomplished: timeSpent,
          total: timeSpent,
          eta: max(map(tickets, "eta")) || new Date(),
        };

        for (const ticket of tickets) {
          const ticketScheduleItems = orderBy(ticket.scheduleItems, "stoppedAt", "asc");
          const ticketWorkflowStates = orderBy(ticket.ticketWorkflowStates, "position", "asc");
          const twsById = keyBy(ticket.ticketWorkflowStates, "id");

          if (ticket.status === TicketStatus.SCHEDULED) {
            let lastPosition = 0;
            for (const scheduleItem of ticketScheduleItems) {
              lastPosition =
                twsById[
                  scheduleItem.nextTicketWorkflowStateId
                    ? scheduleItem.nextTicketWorkflowStateId
                    : scheduleItem.ticketWorkflowStateId
                ].position;
            }

            for (const state of ticketWorkflowStates) {
              if (state.position >= lastPosition) {
                goalProgress.total +=
                  (state.estimateMinimum! + state.estimateMaximum! + state.estimateMostLikely! * 4) / 6;
              }
            }
          }
        }

        // Project progress from estimates
        const twStates = reduce(
          tickets,
          (acc: TicketWorkflowState[], ticket) => [...acc, ...ticket.ticketWorkflowStates],
          [],
        );
        const twsById = keyBy(twStates, "id");
        const twsIds = map(twStates, "id");

        const estimates = allEstimates.filter((e) => twsIds.indexOf(e.id) > -1);

        for (const estimate of estimates) {
          const state = twsById[estimate.id];
          let pert = (state.estimateMinimum! + state.estimateMaximum! + state.estimateMostLikely! * 4) / 6;

          if (estimate.start_p80 < startEpoch && estimate.end_p80 > stopEpoch) {
            pert = pert / 3;
          } else if (estimate.start_p80 < startEpoch) {
            pert = (pert * 2) / 3;
          } else if (estimate.end_p80 > stopEpoch) {
            pert = (pert * 2) / 3;
          }

          goalProgress.progress += pert;
        }

        return goalProgress;
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: projectedWorkflowDistribution
// ---------------------------------------------------------------------------

builder.queryField("projectedWorkflowDistribution", (t) =>
  t.field({
    type: [WorkflowDistributionRef],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const lastEpoch = await ctx.prisma.estimate.findFirst({
        where: { organizationId: me.organizationId },
        orderBy: { epoch: "desc" },
      });

      if (!lastEpoch) return [];

      const where = await getTicketQueryForScheduled(me.organizationId, args.projectId);

      const scheduledTickets = await ctx.prisma.ticket.findMany({
        where,
        include: {
          ticketWorkflowStates: { where: { isActive: true } },
          workflow: true,
        },
      });

      const twStates = reduce(
        scheduledTickets,
        (acc: TicketWorkflowState[], ticket) => [...ticket.ticketWorkflowStates, ...acc],
        [],
      );
      const twStateIds = map(twStates, "id");

      const startEpoch = Math.round(args.startDate.getTime() / 1000);
      const stopEpoch = Math.round(args.stopDate.getTime() / 1000);

      const estimates = await ctx.prisma.estimate.findMany({
        where: {
          id: { in: twStateIds },
          epoch: lastEpoch.epoch,
          AND: [{ start: { lt: stopEpoch } }, { end: { gt: startEpoch } }],
        },
      });

      const estimateById = keyBy(estimates, "id");
      const distributionByWorkflow: Record<number, any> = {};

      for (const ticket of scheduledTickets) {
        for (const state of ticket.ticketWorkflowStates) {
          if (state.id in estimateById) {
            const estimate = estimateById[state.id];
            let pert = (state.estimateMinimum! + state.estimateMaximum! + state.estimateMostLikely! * 4) / 6;

            if (estimate.start_p80 < startEpoch && estimate.end_p80 > stopEpoch) {
              pert = pert / 3;
            } else if (estimate.start_p80 < startEpoch) {
              pert = (pert * 2) / 3;
            } else if (estimate.end_p80 > stopEpoch) {
              pert = (pert * 2) / 3;
            }

            if (ticket.workflow) {
              if (!distributionByWorkflow[ticket.workflow.id]) {
                distributionByWorkflow[ticket.workflow.id] = {
                  workflow: ticket.workflow,
                  hours: 0,
                };
              }
              distributionByWorkflow[ticket.workflow.id].hours += pert / 3600;
            }
          }
        }
      }

      return values(distributionByWorkflow);
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: pastWorkflowDistribution
// ---------------------------------------------------------------------------

builder.queryField("pastWorkflowDistribution", (t) =>
  t.field({
    type: [WorkflowDistributionRef],
    args: {
      projectId: t.arg.int({ required: true }),
      startDate: t.arg({ type: "DateTime", required: true }),
      stopDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const whereTickets = await getTicketQueryForPublishedAndArchived(me.organizationId, args.projectId);

      const scheduledItems = await ctx.prisma.scheduleItem.findMany({
        where: {
          ticket: whereTickets,
          startedAt: { lt: args.stopDate },
          OR: [{ stoppedAt: { gt: args.startDate } }, { stoppedAt: null }],
        },
        include: { ticket: { select: { workflow: true } } },
      });

      const workflowDistributionById: Record<number, any> = {};

      for (const scheduledItem of scheduledItems) {
        const workflow = scheduledItem.ticket.workflow;
        if (!workflow) continue;

        if (!workflowDistributionById[workflow.id]) {
          workflowDistributionById[workflow.id] = { workflow, hours: 0 };
        }

        const timeSpent = scheduledItem.stoppedAt
          ? scheduledItem.stoppedAt.getTime() - scheduledItem.startedAt.getTime()
          : new Date().getTime() - scheduledItem.startedAt.getTime();

        workflowDistributionById[workflow.id].hours += timeSpent / 3600000;
      }

      return values(workflowDistributionById);
    },
  }),
);
