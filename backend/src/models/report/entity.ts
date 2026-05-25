/**
 * Report and ReportQuery Pothos type definitions.
 *
 * Exports:
 *  - ReportRef: prismaObject for Report
 *  - ReportQueryRef: prismaObject for ReportQuery (omits byPaths, secondaryByPaths)
 *  - FilterElementRef / QueryAggregateRef / ReportAggregateRef: custom types
 *  - PaginatedReports: paginated wrapper
 *  - reportWidgetTypes: all ReportWidgetType values
 */

import { ReportWidgetType } from "@prisma/client";
import builder from "../../schema/builder";
import {
  ModelStageEnum,
  ReportAggregateFieldEnum,
  ReportDateGranularityEnum,
  ReportGroupByEnum,
  ReportWidgetTypeEnum,
} from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";

export const reportWidgetTypes = Object.values(ReportWidgetType);

// ---------------------------------------------------------------------------
// Report prismaObject
// ---------------------------------------------------------------------------

export const ReportRef = builder.prismaObject("Report", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    stage: t.expose("stage", { type: ModelStageEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    queries: t.relation("reportQueries"),
  }),
});

// ---------------------------------------------------------------------------
// ReportQuery prismaObject — omits byPaths, secondaryByPaths
// ---------------------------------------------------------------------------

export const ReportQueryRef = builder.prismaObject("ReportQuery", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    position: t.exposeInt("position"),
    rows: t.exposeInt("rows"),
    cols: t.exposeInt("cols"),
    noUnknowns: t.exposeBoolean("noUnknowns"),
    cummulative: t.exposeBoolean("cummulative"),
    widgetType: t.expose("widgetType", { type: ReportWidgetTypeEnum }),
    aggregateField: t.expose("aggregateField", { type: ReportAggregateFieldEnum }),
    organizationId: t.exposeInt("organizationId"),
    reportId: t.exposeInt("reportId"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    fromDate: t.exposeString("fromDate", { nullable: true }),
    untilDate: t.exposeString("untilDate", { nullable: true }),
    granularity: t.expose("granularity", { type: ReportDateGranularityEnum }),
    chartBy: t.expose("chartBy", { type: ReportGroupByEnum }),
    chartByLabel: t.exposeString("chartByLabel", { nullable: true }),
    groupBy: t.expose("groupBy", { type: ReportGroupByEnum, nullable: true }),
    groupByLabel: t.exposeString("groupByLabel", { nullable: true }),
    sameAsPrimaryFilter: t.exposeBoolean("sameAsPrimaryFilter"),
    secondaryChartBy: t.expose("secondaryChartBy", { type: ReportGroupByEnum, nullable: true }),
    secondaryChartByLabel: t.exposeString("secondaryChartByLabel", { nullable: true }),
    secondaryGroupBy: t.expose("secondaryGroupBy", { type: ReportGroupByEnum, nullable: true }),
    secondaryGroupByLabel: t.exposeString("secondaryGroupByLabel", { nullable: true }),
    isTicketDone: t.exposeBoolean("isTicketDone", { nullable: true }),
    isTicketActive: t.exposeBoolean("isTicketActive", { nullable: true }),
    isTicketStarted: t.exposeBoolean("isTicketStarted", { nullable: true }),
    isTicketNotStarted: t.exposeBoolean("isTicketNotStarted", { nullable: true }),
    secondaryIsTicketDone: t.exposeBoolean("secondaryIsTicketDone", { nullable: true }),
    secondaryIsTicketActive: t.exposeBoolean("secondaryIsTicketActive", { nullable: true }),
    secondaryIsTicketStarted: t.exposeBoolean("secondaryIsTicketStarted", { nullable: true }),
    secondaryIsTicketNotStarted: t.exposeBoolean("secondaryIsTicketNotStarted", { nullable: true }),
    organization: t.relation("organization"),
    report: t.relation("report"),
    // DO NOT expose: byPaths, secondaryByPaths
  }),
});

// ---------------------------------------------------------------------------
// FilterElement — represents a filter item in a report query
// ---------------------------------------------------------------------------

export interface FilterElementShape {
  id: string;
  recordId: number;
  label: string;
}

export const FilterElementRef = builder.objectRef<FilterElementShape>("FilterElement");
builder.objectType(FilterElementRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    recordId: t.exposeInt("recordId"),
    label: t.exposeString("label"),
  }),
});

// ---------------------------------------------------------------------------
// QueryAggregate — a single aggregated data point
// ---------------------------------------------------------------------------

export interface QueryAggregateShape {
  value: number;
  main?: string;
  secondary?: string;
}

export const QueryAggregateRef = builder.objectRef<QueryAggregateShape>("QueryAggregate");
builder.objectType(QueryAggregateRef, {
  fields: (t) => ({
    value: t.exposeFloat("value"),
    main: t.exposeString("main", { nullable: true }),
    secondary: t.exposeString("secondary", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// ReportAggregate — primary + secondary aggregation results
// ---------------------------------------------------------------------------

export interface ReportAggregateShape {
  primary: QueryAggregateShape[];
  secondary: QueryAggregateShape[];
}

export const ReportAggregateRef = builder.objectRef<ReportAggregateShape>("ReportAggregate");
builder.objectType(ReportAggregateRef, {
  fields: (t) => ({
    primary: t.field({ type: [QueryAggregateRef], resolve: (p) => p.primary }),
    secondary: t.field({ type: [QueryAggregateRef], resolve: (p) => p.secondary }),
  }),
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedReports = createPaginatedType("Reports", ReportRef);
