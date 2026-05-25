/**
 * Project Pothos type definitions.
 *
 * Exports:
 *  - ProjectRef: prismaObject for Project
 *  - MiniProjectRef / ProjectAnalyticsRef / ProjectTicketRef / etc.
 *  - PaginatedProjects: paginated wrapper
 *  - ProjectTicketQueryCategoryEnum: enum for ticket category queries
 *
 * Project.checklist is exposed as a computed field returning [ChecklistItem]
 * (see project.resolver.ts).
 */

import { TicketStatus, ModelStage } from "@prisma/client";
import builder from "../../schema/builder";
import {
  ModelStageEnum,
  TicketStatusEnum,
} from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// Project prismaObject
// ---------------------------------------------------------------------------

export const ProjectRef = builder.prismaObject("Project", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    duration: t.exposeInt("duration"),
    stage: t.expose("stage", { type: ModelStageEnum }),
    ancestorIsArchived: t.exposeBoolean("ancestorIsArchived"),
    indexableContent: t.exposeString("indexableContent"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    ownerId: t.exposeInt("ownerId", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),
    parentId: t.exposeInt("parentId", { nullable: true }),
    organization: t.relation("organization"),
    owner: t.relation("owner", { nullable: true }),
    author: t.relation("author", { nullable: true }),
    parent: t.relation("parent", { nullable: true }),
    children: t.relation("children"),
    // tickets is a simple relation — the old schema also returned Ticket[] (not paginated)
    tickets: t.relation("tickets"),
    pinnedByRoles: t.relation("pinnedByRoles"),
    scheduleConfigs: t.relation("scheduleConfigs"),
    // projectData and projectText are internal storage models — not exposed in the GraphQL schema
    // checklist is exposed as a computed field in project.resolver.ts
  }),
});

// ---------------------------------------------------------------------------
// MiniProject — lightweight shape for project trees
// ---------------------------------------------------------------------------

interface MiniProjectShape {
  id: number;
  name: string;
  parentId: number | null;
  stage: ModelStage;
  ancestorIsArchived: boolean;
}

export const MiniProjectRef = builder.objectRef<MiniProjectShape>("MiniProject");
builder.objectType(MiniProjectRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    parentId: t.int({ nullable: true, resolve: (p) => p.parentId }),
    stage: t.field({ type: ModelStageEnum, resolve: (p) => p.stage }),
    ancestorIsArchived: t.exposeBoolean("ancestorIsArchived"),
  }),
});

// ---------------------------------------------------------------------------
// ProjectAnalytics — ticket count breakdown per project
// ---------------------------------------------------------------------------

interface ProjectAnalyticsShape {
  projectId: number;
  organizationId: number;
  scheduledTicketCount: number;
  draftTicketCount: number;
  inProgressTicketCount: number;
  doneTicketCount: number;
  unassignedTicketCount: number;
  estimatedTicketCount: number;
  unestimatedTicketCount: number;
}

export const ProjectAnalyticsRef = builder.objectRef<ProjectAnalyticsShape>("ProjectAnalytics");
builder.objectType(ProjectAnalyticsRef, {
  fields: (t) => ({
    projectId: t.exposeInt("projectId"),
    organizationId: t.exposeInt("organizationId"),
    scheduledTicketCount: t.exposeInt("scheduledTicketCount"),
    draftTicketCount: t.exposeInt("draftTicketCount"),
    inProgressTicketCount: t.exposeInt("inProgressTicketCount"),
    doneTicketCount: t.exposeInt("doneTicketCount"),
    unassignedTicketCount: t.exposeInt("unassignedTicketCount"),
    estimatedTicketCount: t.exposeInt("estimatedTicketCount"),
    unestimatedTicketCount: t.exposeInt("unestimatedTicketCount"),
  }),
});

// ---------------------------------------------------------------------------
// DS_Shadow — differential sync shadow document
// ---------------------------------------------------------------------------

interface DS_ShadowShape {
  document: string;
  client: number;
  server: number;
}

export const DS_ShadowRef = builder.objectRef<DS_ShadowShape>("DS_Shadow");
builder.objectType(DS_ShadowRef, {
  fields: (t) => ({
    document: t.exposeString("document"),
    client: t.exposeInt("client"),
    server: t.exposeInt("server"),
  }),
});

// ---------------------------------------------------------------------------
// ProjectTicket — ticket summary within a project page
// ---------------------------------------------------------------------------

interface ProjectTicketShape {
  id: number;
  title: string;
  createdAt: Date;
  status: TicketStatus;
  stage: ModelStage;
  localId?: number;
  productCode?: string;
}

export const ProjectTicketRef = builder.objectRef<ProjectTicketShape>("ProjectTicket");
builder.objectType(ProjectTicketRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    createdAt: t.field({ type: "DateTime", resolve: (p) => p.createdAt }),
    status: t.field({ type: TicketStatusEnum, resolve: (p) => p.status }),
    stage: t.field({ type: ModelStageEnum, resolve: (p) => p.stage }),
    localId: t.int({ nullable: true, resolve: (p) => p.localId ?? null }),
    productCode: t.string({ nullable: true, resolve: (p) => p.productCode ?? null }),
  }),
});

// ---------------------------------------------------------------------------
// ProjectGoalStats — ticket status counts per project
// ---------------------------------------------------------------------------

interface ProjectGoalStatsShape {
  id: number;
  parentId: number | null;
  name: string;
  total: number;
  done: number;
  scheduled: number;
  unScheduled: number;
  cancelled: number;
}

export const ProjectGoalStatsRef = builder.objectRef<ProjectGoalStatsShape>("ProjectGoalStats");
builder.objectType(ProjectGoalStatsRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    parentId: t.int({ nullable: true, resolve: (p) => p.parentId }),
    name: t.exposeString("name"),
    total: t.exposeInt("total"),
    done: t.exposeInt("done"),
    scheduled: t.exposeInt("scheduled"),
    unScheduled: t.exposeInt("unScheduled"),
    cancelled: t.exposeInt("cancelled"),
  }),
});

// ---------------------------------------------------------------------------
// TicketExport — CSV export shape
// ---------------------------------------------------------------------------

interface TicketExportShape {
  id: number;
  title: string;
  description: string;
  created_at: string;
  status: TicketStatus;
  stage: ModelStage;
  eta: string;
  local_id: string;
  product: string;
  workflow: string;
  owner_name: string;
  owner_email: string;
  project: string;
  scheduled_at: string;
  closed_at: string;
  author_email: string;
  author_name: string;
  ancestor_tickets: string;
  successor_tickets: string;
  tags: string;
}

export const TicketExportRef = builder.objectRef<TicketExportShape>("TicketExport");
builder.objectType(TicketExportRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description"),
    created_at: t.exposeString("created_at"),
    status: t.field({ type: TicketStatusEnum, resolve: (p) => p.status }),
    stage: t.field({ type: ModelStageEnum, resolve: (p) => p.stage }),
    eta: t.exposeString("eta"),
    local_id: t.exposeString("local_id"),
    product: t.exposeString("product"),
    workflow: t.exposeString("workflow"),
    owner_name: t.exposeString("owner_name"),
    owner_email: t.exposeString("owner_email"),
    project: t.exposeString("project"),
    scheduled_at: t.exposeString("scheduled_at"),
    closed_at: t.exposeString("closed_at"),
    author_email: t.exposeString("author_email"),
    author_name: t.exposeString("author_name"),
    ancestor_tickets: t.exposeString("ancestor_tickets"),
    successor_tickets: t.exposeString("successor_tickets"),
    tags: t.exposeString("tags"),
  }),
});

// ---------------------------------------------------------------------------
// RoleWorkload — hours attributed to a role
// ---------------------------------------------------------------------------

interface RoleWorkloadShape {
  role: any;
  hours: number;
}

export const RoleWorkloadRef = builder.objectRef<RoleWorkloadShape>("RoleWorkload");
builder.objectType(RoleWorkloadRef, {
  fields: (t) => ({
    role: t.field({ type: "Role" as any, resolve: (p) => p.role }),
    hours: t.exposeFloat("hours"),
  }),
});

// ---------------------------------------------------------------------------
// FeatureDistribution — hours per feature
// ---------------------------------------------------------------------------

interface FeatureDistributionShape {
  feature: any;
  featureGroup: any;
  hours: number;
}

export const FeatureDistributionRef = builder.objectRef<FeatureDistributionShape>(
  "FeatureDistribution",
);
builder.objectType(FeatureDistributionRef, {
  fields: (t) => ({
    feature: t.field({ type: "Feature" as any, resolve: (p) => p.feature }),
    featureGroup: t.field({
      type: "FeatureGroup" as any,
      resolve: (p) => p.featureGroup,
    }),
    hours: t.exposeFloat("hours"),
  }),
});

// ---------------------------------------------------------------------------
// WorkflowDistribution — hours per workflow
// ---------------------------------------------------------------------------

interface WorkflowDistributionShape {
  workflow: any;
  hours: number;
}

export const WorkflowDistributionRef = builder.objectRef<WorkflowDistributionShape>(
  "WorkflowDistribution",
);
builder.objectType(WorkflowDistributionRef, {
  fields: (t) => ({
    workflow: t.field({
      type: "Workflow" as any,
      resolve: (p) => p.workflow,
    }),
    hours: t.exposeFloat("hours"),
  }),
});

// ---------------------------------------------------------------------------
// ProjectGoalProgress — progress tracking per project
// ---------------------------------------------------------------------------

interface ProjectGoalProgressShape {
  id: number;
  parentId: number | null;
  name: string;
  progress: number;
  accomplished: number;
  total: number;
  eta: Date;
}

export const ProjectGoalProgressRef = builder.objectRef<ProjectGoalProgressShape>(
  "ProjectGoalProgress",
);
builder.objectType(ProjectGoalProgressRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    parentId: t.int({ nullable: true, resolve: (p) => p.parentId }),
    name: t.exposeString("name"),
    progress: t.exposeFloat("progress"),
    accomplished: t.exposeFloat("accomplished"),
    total: t.exposeFloat("total"),
    eta: t.field({ type: "DateTime", resolve: (p) => p.eta }),
  }),
});

// ---------------------------------------------------------------------------
// OpenTicketsByWorkflow / TicketOpenByWorkflowDatum
// ---------------------------------------------------------------------------

interface TicketOpenByWorkflowDatumShape {
  date: Date;
  value: number;
}

export const TicketOpenByWorkflowDatumRef =
  builder.objectRef<TicketOpenByWorkflowDatumShape>("TicketOpenByWorkflowDatum");
builder.objectType(TicketOpenByWorkflowDatumRef, {
  fields: (t) => ({
    date: t.field({ type: "DateTime", resolve: (p) => p.date }),
    value: t.exposeInt("value"),
  }),
});

interface OpenTicketsByWorkflowShape {
  workflow: any;
  values: TicketOpenByWorkflowDatumShape[];
}

export const OpenTicketsByWorkflowRef = builder.objectRef<OpenTicketsByWorkflowShape>(
  "OpenTicketsByWorkflow",
);
builder.objectType(OpenTicketsByWorkflowRef, {
  fields: (t) => ({
    workflow: t.field({
      type: "Workflow" as any,
      resolve: (p) => p.workflow,
    }),
    values: t.field({
      type: [TicketOpenByWorkflowDatumRef],
      resolve: (p) => p.values,
    }),
  }),
});

// ---------------------------------------------------------------------------
// ProjectTicketQueryCategory enum — for projectTicketsForCategory query
// ---------------------------------------------------------------------------

export enum ProjectTicketQueryCategory {
  Scheduled = "SCHEDULED",
  Draft = "DRAFT",
  InProgress = "IN_PROGRESS",
  Done = "Done",
  Estimated = "ESTIMATED",
  Unestimated = "UNESTIMATED",
  Unassigned = "UNASSIGNED",
}

export const ProjectTicketQueryCategoryEnum = builder.enumType(
  ProjectTicketQueryCategory,
  { name: "ProjectTicketQueryCategory" },
);

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedProjects = createPaginatedType("Projects", ProjectRef);
