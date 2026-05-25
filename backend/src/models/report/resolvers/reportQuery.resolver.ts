/**
 * ReportQuery queries and field resolvers:
 *  - reportQuery (query by ID)
 *  - values (field resolver — computes aggregates)
 *  - byProducts/byTags/etc. (field resolvers returning FilterElement[])
 */

import builder from "../../../schema/builder";
import { GraphQLError } from "graphql";
import { map } from "lodash";
import { ReportWidgetType } from "@prisma/client";
import { AuthRoleContext } from "../../../types";
import {
  FilterElementRef,
  ReportAggregateRef,
  type QueryAggregateShape,
} from "../entity";
import { toFilterElement } from "../helper";
import { processQuery } from "../query";

// ---------------------------------------------------------------------------
// Query: reportQuery
// ---------------------------------------------------------------------------

builder.queryField("reportQuery", (t) =>
  t.prismaField({
    type: "ReportQuery",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const reportQuery = await ctx.prisma.reportQuery.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
        include: {
          ...query.include,
          byAssignees: true,
          byAuthors: true,
          byFeatures: true,
          byOwners: true,
          byProducts: true,
          byTags: true,
          byTickets: true,
          byWorkflows: true,
          byWorkflowStateAssignees: true,
          byWorkflowStates: true,
          secondaryByAssignees: true,
          secondaryByAuthors: true,
          secondaryByFeatures: true,
          secondaryByOwners: true,
          secondaryByProducts: true,
          secondaryByTags: true,
          secondaryByTickets: true,
          secondaryByWorkflows: true,
          secondaryByWorkflowStateAssignees: true,
          secondaryByWorkflowStates: true,
        },
      });

      if (!reportQuery) {
        throw new GraphQLError("This report does not exist or has been deleted", { extensions: { code: "BAD_USER_INPUT" } });
      }

      return reportQuery;
    },
  }),
);

// ---------------------------------------------------------------------------
// Computed field: values — computes aggregates for this report query
// ---------------------------------------------------------------------------

builder.prismaObjectField("ReportQuery", "values", (t) =>
  t.field({
    type: ReportAggregateRef,
    resolve: async (rq, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const role = await me.getRole();

      let secondary: QueryAggregateShape[] = [];

      const primary = await processQuery({
        organizationId: me.organizationId,
        timeZone: role.timeZone,
        aggregateField: rq.aggregateField,
        chartBy: rq.chartBy,
        groupBy: rq.groupBy,
        workflowStateAssigneeIds: map((rq as any).byWorkflowStateAssignees, "id"),
        assigneeIds: map((rq as any).byAssignees, "id"),
        authorIds: map((rq as any).byAuthors, "id"),
        productIds: map((rq as any).byProducts, "id"),
        workflowIds: map((rq as any).byWorkflows, "id"),
        workflowStateIds: map((rq as any).byWorkflowStates, "id"),
        tagIds: map((rq as any).byTags, "id"),
        fromDate: rq.fromDate,
        untilDate: rq.fromDate,
      });

      if (
        rq.widgetType === ReportWidgetType.COMPARE_THROUGH_TIME ||
        rq.widgetType === ReportWidgetType.COMPARE_VALUES_NOW
      ) {
        if (rq.sameAsPrimaryFilter) {
          secondary = await processQuery({
            organizationId: me.organizationId,
            timeZone: role.timeZone,
            aggregateField: rq.aggregateField,
            chartBy: rq.secondaryChartBy,
            groupBy: rq.secondaryGroupBy,
            workflowStateAssigneeIds: map((rq as any).byWorkflowStateAssignees, "id"),
            assigneeIds: map((rq as any).byAssignees, "id"),
            authorIds: map((rq as any).byAuthors, "id"),
            productIds: map((rq as any).byProducts, "id"),
            workflowIds: map((rq as any).byWorkflows, "id"),
            workflowStateIds: map((rq as any).byWorkflowStates, "id"),
            tagIds: map((rq as any).byTags, "id"),
            fromDate: rq.fromDate,
            untilDate: rq.fromDate,
          });
        } else {
          secondary = await processQuery({
            organizationId: me.organizationId,
            timeZone: role.timeZone,
            aggregateField: rq.aggregateField,
            chartBy: rq.secondaryChartBy,
            groupBy: rq.secondaryGroupBy,
            workflowStateAssigneeIds: map((rq as any).secondaryByWorkflowStateAssignees, "id"),
            assigneeIds: map((rq as any).secondaryByAssignees, "id"),
            authorIds: map((rq as any).secondaryByAuthors, "id"),
            productIds: map((rq as any).secondaryByProducts, "id"),
            workflowIds: map((rq as any).secondaryByWorkflows, "id"),
            workflowStateIds: map((rq as any).secondaryByWorkflowStates, "id"),
            tagIds: map((rq as any).secondaryByTags, "id"),
            fromDate: rq.fromDate,
            untilDate: rq.fromDate,
          });
        }
      }

      return { primary, secondary };
    },
  }),
);

// ---------------------------------------------------------------------------
// Helper: create a filter field resolver for ReportQuery
//
// Each filter field checks if the relation was eager-loaded (from the query
// resolver's include), otherwise queries the DB.
// ---------------------------------------------------------------------------

function addFilterField(
  fieldName: string,
  prismaRelation: string,
  prismaReverse: string,
  labelField: string,
  entityType: string,
) {
  builder.prismaObjectField("ReportQuery", fieldName, (t) =>
    t.field({
      type: [FilterElementRef],
      resolve: async (rq, _args, ctx) => {
        if ((rq as any)[prismaRelation]) {
          return (rq as any)[prismaRelation].map(
            toFilterElement(entityType, labelField as any),
          );
        }

        const records = await (ctx.prisma as any)[entityType.charAt(0).toLowerCase() + entityType.slice(1)].findMany({
          where: { [prismaReverse]: { some: { id: rq.id } } },
          select: { id: true, [labelField]: true },
        });

        return records.map(toFilterElement(entityType.toLowerCase(), labelField as any));
      },
    }),
  );
}

// Primary filter fields
addFilterField("byProducts", "byProducts", "reportQueries", "name", "product");
addFilterField("byTags", "byTags", "reportQueries", "name", "tag");
addFilterField("byWorkflows", "byWorkflows", "reportQueries", "name", "workflow");
addFilterField("byTickets", "byTickets", "reportQueries", "title", "ticket");
addFilterField("byWorkflowStates", "byWorkflowStates", "reportQueries", "name", "workflowState");

// Role-based primary filters — need custom Prisma reverse relations
builder.prismaObjectField("ReportQuery", "byAssignees", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).byAssignees) {
        return (rq as any).byAssignees.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsAssignee: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "byAuthors", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).byAuthors) {
        return (rq as any).byAuthors.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsAuthor: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "byOwners", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).byOwners) {
        return (rq as any).byOwners.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsOwner: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "byWorkflowStateAssignees", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).byWorkflowStateAssignees) {
        return (rq as any).byWorkflowStateAssignees.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsWorkflowStateAssignee: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

// Secondary filter fields
addFilterField("secondaryByProducts", "secondaryByProducts", "reportSecondaryQueries", "name", "product");
addFilterField("secondaryByTags", "secondaryByTags", "reportSecondaryQueries", "name", "tag");
addFilterField("secondaryByWorkflows", "secondaryByWorkflows", "reportSecondaryQueries", "name", "workflow");
addFilterField("secondaryByTickets", "secondaryByTickets", "reportSecondaryQueries", "title", "ticket");
addFilterField("secondaryByWorkflowStates", "secondaryByWorkflowStates", "reportSecondaryQueries", "name", "workflowState");

builder.prismaObjectField("ReportQuery", "secondaryByAssignees", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).secondaryByAssignees) {
        return (rq as any).secondaryByAssignees.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsAssignee: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "secondaryByAuthors", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).secondaryByAuthors) {
        return (rq as any).secondaryByAuthors.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsAuthor: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "secondaryByOwners", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).secondaryByOwners) {
        return (rq as any).secondaryByOwners.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsOwner: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);

builder.prismaObjectField("ReportQuery", "secondaryByWorkflowStateAssignees", (t) =>
  t.field({
    type: [FilterElementRef],
    resolve: async (rq, _args, ctx) => {
      if ((rq as any).secondaryByWorkflowStateAssignees) {
        return (rq as any).secondaryByWorkflowStateAssignees.map(toFilterElement("role", "name" as any));
      }
      const records = await ctx.prisma.role.findMany({
        where: { reportQueriesAsWorkflowStateAssignee: { some: { id: rq.id } } },
        select: { id: true, name: true },
      });
      return records.map(toFilterElement("role", "name" as any));
    },
  }),
);
