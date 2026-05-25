/**
 * Mutation: createReportQuery — create a new report query widget.
 *
 * This is a large input type with primary and secondary filter sets.
 */

import builder from "../../../schema/builder";
import {
  ReportWidgetTypeEnum,
  ReportAggregateFieldEnum,
  ReportGroupByEnum,
  ReportDateGranularityEnum,
} from "../../../schema/enums";
import { normalizeProjectPath } from "../../project/helper";
import { connectToRecords } from "../../../utils/query";
import { GraphQLError } from "graphql";
import { map } from "lodash";
import { AuthRoleContext } from "../../../types";

const CreateReportQueryInput = builder.inputType("CreateReportQueryInput", {
  fields: (t) => ({
    widgetType: t.field({ type: ReportWidgetTypeEnum, required: true }),
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

builder.mutationField("createReportQuery", (t) =>
  t.prismaField({
    type: "ReportQuery",
    authScopes: { hasRole: true },
    args: {
      reportId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateReportQueryInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const input = args.input;

      if (input.chartBy === input.groupBy) {
        throw new GraphQLError("Groupings cannot be identical", { extensions: { code: "BAD_USER_INPUT" } });
      }

      if (input.secondaryChartBy && input.secondaryChartBy === input.secondaryGroupBy) {
        throw new GraphQLError("Groupings cannot be identical", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const orgId = (ctx.me as AuthRoleContext).organizationId;

      // Helper to fetch records by IDs within organization
      const fetchByIds = async (model: string, ids: number[] | null | undefined) => {
        if (!ids?.length) return [];
        return (ctx.prisma as any)[model].findMany({
          where: { organizationId: orgId, id: { in: ids } },
        });
      };

      const [products, tags, workflows, tickets, assignees, authors, owners, workflowStates, workflowStateAssignees] =
        await Promise.all([
          fetchByIds("product", input.productIds),
          fetchByIds("tag", input.tagIds),
          fetchByIds("workflow", input.workflowIds),
          fetchByIds("ticket", input.ticketIds),
          fetchByIds("role", input.assigneeIds),
          fetchByIds("role", input.authorIds),
          fetchByIds("role", input.ownerIds),
          fetchByIds("workflowState", input.workflowStateIds),
          fetchByIds("role", input.workflowStateAssigneeIds),
        ]);

      const [secondaryProducts, secondaryTags, secondaryWorkflows, secondaryTickets, secondaryAssignees, secondaryAuthors, secondaryOwners, secondaryWorkflowStates, secondaryWorkflowStateAssignees] =
        await Promise.all([
          fetchByIds("product", input.secondaryProductIds),
          fetchByIds("tag", input.secondaryTagIds),
          fetchByIds("workflow", input.secondaryWorkflowIds),
          fetchByIds("ticket", input.secondaryTicketIds),
          fetchByIds("role", input.secondaryAssigneeIds),
          fetchByIds("role", input.secondaryAuthorIds),
          fetchByIds("role", input.secondaryOwnerIds),
          fetchByIds("workflowState", input.secondaryWorkflowStateIds),
          fetchByIds("role", input.secondaryWorkflowStateAssigneeIds),
        ]);

      const lastQuery = await ctx.prisma.reportQuery.findFirst({
        where: { reportId: args.reportId },
        select: { position: true },
        orderBy: { position: "desc" },
      });

      return ctx.prisma.reportQuery.create({
        ...query,
        data: {
          reportId: args.reportId,
          organizationId: orgId,
          title: input.title,
          noUnknowns: input.noUnknowns ?? true,
          cummulative: input.cummulative ?? false,
          byProducts: connectToRecords(products),
          byAssignees: connectToRecords(assignees),
          byAuthors: connectToRecords(authors),
          byOwners: connectToRecords(owners),
          byTags: connectToRecords(tags),
          byTickets: connectToRecords(tickets),
          byWorkflows: connectToRecords(workflows),
          byWorkflowStates: connectToRecords(workflowStates),
          byWorkflowStateAssignees: connectToRecords(workflowStateAssignees),
          byPaths: JSON.stringify(map(input.paths, normalizeProjectPath)),
          fromDate: input.fromDate,
          untilDate: input.untilDate,
          sameAsPrimaryFilter: input.sameAsPrimaryFilter ?? undefined,
          secondaryByProducts: connectToRecords(secondaryProducts),
          secondaryByAssignees: connectToRecords(secondaryAssignees),
          secondaryByAuthors: connectToRecords(secondaryAuthors),
          secondaryByOwners: connectToRecords(secondaryOwners),
          secondaryByTags: connectToRecords(secondaryTags),
          secondaryByTickets: connectToRecords(secondaryTickets),
          secondaryByWorkflows: connectToRecords(secondaryWorkflows),
          secondaryByWorkflowStates: connectToRecords(secondaryWorkflowStates),
          secondaryByWorkflowStateAssignees: connectToRecords(secondaryWorkflowStateAssignees),
          isTicketDone: input.isTicketDone,
          isTicketActive: input.isTicketActive,
          isTicketStarted: input.isTicketStarted,
          isTicketNotStarted: input.isTicketNotStarted,
          widgetType: input.widgetType,
          chartBy: input.chartBy,
          groupBy: input.groupBy,
          secondaryChartBy: input.secondaryChartBy,
          secondaryGroupBy: input.secondaryGroupBy,
          aggregateField: input.aggregateField,
          position: lastQuery ? lastQuery.position + 1 : 1,
          granularity: input.granularity ?? undefined,
        },
      });
    },
  }),
);
