/**
 * Mutations: updateReportQuerySize, updateReportQueryPlacement, updateReportQuery.
 */

import builder from "../../../schema/builder";
import {
  ReportAggregateFieldEnum,
  ReportGroupByEnum,
  ReportDateGranularityEnum,
} from "../../../schema/enums";
import { ReportQueryRef } from "../entity";
import { normalizeProjectPath } from "../../project/helper";
import { setToRecords } from "../../../utils/query";
import prisma from "../../../prisma";
import { GraphQLError } from "graphql";
import { filter, map } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateReportQuerySizeInput = builder.inputType("UpdateReportQuerySizeInput", {
  fields: (t) => ({
    rows: t.int({ required: true }),
    cols: t.int({ required: true }),
  }),
});

const UpdateReportQueryPlacementInput = builder.inputType("UpdateReportQueryPlacementInput", {
  fields: (t) => ({
    direction: t.string({ required: true }),
  }),
});

const UpdateReportQueryInput = builder.inputType("UpdateReportQueryInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    noUnknowns: t.boolean({ required: false, defaultValue: true }),
    cummulative: t.boolean({ required: false, defaultValue: false }),
    aggregateField: t.field({ type: ReportAggregateFieldEnum, required: true }),
    granularity: t.field({ type: ReportDateGranularityEnum, required: false }),
    fromDate: t.string({ required: false }),
    untilDate: t.string({ required: false }),
    productIds: t.intList({ required: false }),
    tagIds: t.intList({ required: false }),
    workflowIds: t.intList({ required: false }),
    ticketIds: t.intList({ required: false }),
    ownerIds: t.intList({ required: false }),
    authorIds: t.intList({ required: false }),
    assigneeIds: t.intList({ required: false }),
    workflowStateAssigneeIds: t.intList({ required: false }),
    workflowStateIds: t.intList({ required: false }),
    paths: t.stringList({ required: false }),
    isTicketCancelled: t.boolean({ required: false }),
    isTicketDone: t.boolean({ required: false }),
    isTicketActive: t.boolean({ required: false }),
    isTicketStarted: t.boolean({ required: false }),
    isTicketNotStarted: t.boolean({ required: false }),
    chartBy: t.field({ type: ReportGroupByEnum, required: true }),
    chartByLabel: t.string({ required: false }),
    groupBy: t.field({ type: ReportGroupByEnum, required: false }),
    groupByLabel: t.string({ required: false }),
    sameAsPrimaryFilter: t.boolean({ required: false }),
    secondaryProductIds: t.intList({ required: false }),
    secondaryTagIds: t.intList({ required: false }),
    secondaryWorkflowIds: t.intList({ required: false }),
    secondaryTicketIds: t.intList({ required: false }),
    secondaryOwnerIds: t.intList({ required: false }),
    secondaryAuthorIds: t.intList({ required: false }),
    secondaryAssigneeIds: t.intList({ required: false }),
    secondaryWorkflowStateAssigneeIds: t.intList({ required: false }),
    secondaryWorkflowStateIds: t.intList({ required: false }),
    secondaryPaths: t.stringList({ required: false }),
    secondaryIsTicketCancelled: t.boolean({ required: false }),
    secondaryIsTicketDone: t.boolean({ required: false }),
    secondaryIsTicketActive: t.boolean({ required: false }),
    secondaryIsTicketStarted: t.boolean({ required: false }),
    secondaryIsTicketNotStarted: t.boolean({ required: false }),
    secondaryChartBy: t.field({ type: ReportGroupByEnum, required: false }),
    secondaryChartByLabel: t.string({ required: false }),
    secondaryGroupBy: t.field({ type: ReportGroupByEnum, required: false }),
    secondaryGroupByLabel: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: updateReportQuerySize
// ---------------------------------------------------------------------------

builder.mutationField("updateReportQuerySize", (t) =>
  t.prismaField({
    type: "ReportQuery",
    authScopes: { hasRole: true },
    args: {
      reportQueryId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateReportQuerySizeInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
        where: {
          id: args.reportQueryId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.reportQuery.update({
        ...query,
        where: { id: reportQuery.id },
        data: {
          cols: args.input.cols,
          rows: args.input.rows,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateReportQueryPlacement
// ---------------------------------------------------------------------------

builder.mutationField("updateReportQueryPlacement", (t) =>
  t.field({
    type: [ReportQueryRef],
    authScopes: { hasRole: true },
    args: {
      reportQueryId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateReportQueryPlacementInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
        where: {
          id: args.reportQueryId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      if (args.input.direction === "left") {
        const targetReportQuery = await ctx.prisma.reportQuery.findFirst({
          where: {
            reportId: reportQuery.reportId,
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            position: { lt: reportQuery.position },
          },
          orderBy: { position: "desc" },
        });

        if (!targetReportQuery) {
          throw new GraphQLError("No previous widgets", { extensions: { code: "BAD_USER_INPUT" } });
        }

        return prisma.$transaction([
          ctx.prisma.reportQuery.update({
            where: { id: reportQuery.id },
            data: { position: targetReportQuery.position },
          }),
          ctx.prisma.reportQuery.update({
            where: { id: targetReportQuery.id },
            data: { position: reportQuery.position },
          }),
        ]);
      }

      const targetReportQuery = await ctx.prisma.reportQuery.findFirst({
        where: {
          reportId: reportQuery.reportId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          position: { gt: reportQuery.position },
        },
        orderBy: { position: "asc" },
      });

      if (!targetReportQuery) {
        throw new GraphQLError("No following widgets", { extensions: { code: "BAD_USER_INPUT" } });
      }

      return prisma.$transaction([
        ctx.prisma.reportQuery.update({
          where: { id: reportQuery.id },
          data: { position: targetReportQuery.position },
        }),
        ctx.prisma.reportQuery.update({
          where: { id: targetReportQuery.id },
          data: { position: reportQuery.position },
        }),
      ]);
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateReportQuery
// ---------------------------------------------------------------------------

builder.mutationField("updateReportQuery", (t) =>
  t.prismaField({
    type: "ReportQuery",
    authScopes: { hasRole: true },
    args: {
      reportQueryId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateReportQueryInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const input = args.input;

      if (input.chartBy === input.groupBy) {
        throw new GraphQLError("Groupings cannot be identical", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (input.secondaryChartBy && input.secondaryChartBy === input.secondaryGroupBy) {
        throw new GraphQLError("Groupings cannot be identical", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
        where: {
          id: args.reportQueryId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const orgId = (ctx.me as AuthRoleContext).organizationId;

      const fetchFiltered = async (model: string, ids: any) => {
        const filtered = filter(ids);
        if (!filtered.length) return [];
        return (ctx.prisma as any)[model].findMany({
          where: { organizationId: orgId, id: { in: filtered } },
        });
      };

      const [products, tags, workflows, tickets, assignees, authors, owners, workflowStates, workflowStateAssignees] =
        await Promise.all([
          fetchFiltered("product", input.productIds),
          fetchFiltered("tag", input.tagIds),
          fetchFiltered("workflow", input.workflowIds),
          fetchFiltered("ticket", input.ticketIds),
          fetchFiltered("role", input.assigneeIds),
          fetchFiltered("role", input.authorIds),
          fetchFiltered("role", input.ownerIds),
          fetchFiltered("workflowState", input.workflowStateIds),
          fetchFiltered("role", input.workflowStateAssigneeIds),
        ]);

      const [secondaryProducts, secondaryTags, secondaryWorkflows, secondaryTickets, secondaryAssignees, secondaryAuthors, secondaryOwners, secondaryWorkflowStates, secondaryWorkflowStateAssignees] =
        await Promise.all([
          fetchFiltered("product", input.secondaryProductIds),
          fetchFiltered("tag", input.secondaryTagIds),
          fetchFiltered("workflow", input.secondaryWorkflowIds),
          fetchFiltered("ticket", input.secondaryTicketIds),
          fetchFiltered("role", input.secondaryAssigneeIds),
          fetchFiltered("role", input.secondaryAuthorIds),
          fetchFiltered("role", input.secondaryOwnerIds),
          fetchFiltered("workflowState", input.secondaryWorkflowStateIds),
          fetchFiltered("role", input.secondaryWorkflowStateAssigneeIds),
        ]);

      return ctx.prisma.reportQuery.update({
        ...query,
        where: { id: reportQuery.id },
        data: {
          title: input.title,
          noUnknowns: input.noUnknowns ?? true,
          cummulative: input.cummulative ?? false,
          byProducts: setToRecords(products),
          byAssignees: setToRecords(assignees),
          byAuthors: setToRecords(authors),
          byOwners: setToRecords(owners),
          byTags: setToRecords(tags),
          byTickets: setToRecords(tickets),
          byWorkflows: setToRecords(workflows),
          byWorkflowStates: setToRecords(workflowStates),
          byWorkflowStateAssignees: setToRecords(workflowStateAssignees),
          byPaths: JSON.stringify(map(input.paths, normalizeProjectPath)),
          fromDate: input.fromDate,
          untilDate: input.untilDate,
          sameAsPrimaryFilter: input.sameAsPrimaryFilter ?? undefined,
          secondaryByProducts: setToRecords(secondaryProducts),
          secondaryByAssignees: setToRecords(secondaryAssignees),
          secondaryByAuthors: setToRecords(secondaryAuthors),
          secondaryByOwners: setToRecords(secondaryOwners),
          secondaryByTags: setToRecords(secondaryTags),
          secondaryByTickets: setToRecords(secondaryTickets),
          secondaryByWorkflows: setToRecords(secondaryWorkflows),
          secondaryByWorkflowStates: setToRecords(secondaryWorkflowStates),
          secondaryByWorkflowStateAssignees: setToRecords(secondaryWorkflowStateAssignees),
          isTicketDone: input.isTicketDone,
          isTicketActive: input.isTicketActive,
          isTicketStarted: input.isTicketStarted,
          isTicketNotStarted: input.isTicketNotStarted,
          chartBy: input.chartBy,
          groupBy: input.groupBy,
          secondaryChartBy: input.secondaryChartBy,
          secondaryGroupBy: input.secondaryGroupBy,
          chartByLabel: input.chartByLabel,
          groupByLabel: input.groupByLabel,
          secondaryChartByLabel: input.secondaryChartByLabel,
          secondaryGroupByLabel: input.secondaryGroupByLabel,
          aggregateField: input.aggregateField,
          granularity: input.granularity ?? undefined,
        },
      });
    },
  }),
);
