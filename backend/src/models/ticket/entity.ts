/**
 * Ticket Pothos type definitions.
 *
 * Exports:
 *  - TicketRef: prismaObject for Ticket (omits checklist, paths, indexableContent)
 *  - TicketWorkflowStateRef: prismaObject for TicketWorkflowState
 *  - TicketWorkflowStateNoteRef: prismaObject for TicketWorkflowStateNote
 *  - PlanningTicketRef / NextTicketRef / ChecklistItemRef / etc.
 *  - MyUpcomingAssignedTicketRef / MyPreviousAssignedTicketRef
 *  - DependencySetRef / TicketDependencyRef / ProjectDependencyRef
 *  - TicketBatchPayloadRef
 *  - PaginatedTickets: paginated wrapper
 *  - ticketStatuses: all TicketStatus values
 */

import { TicketStatus as PrismaTicketStatus } from "@prisma/client";
import builder from "../../schema/builder";
import {
  ModelStageEnum,
  TicketStatusEnum,
  TicketWorkflowStateNoteCategoryEnum,
} from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";

export const ticketStatuses = Object.values(PrismaTicketStatus);

// ---------------------------------------------------------------------------
// Ticket prismaObject — omits checklist, paths, indexableContent
// ---------------------------------------------------------------------------

export const TicketRef = builder.prismaObject("Ticket", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    progress: t.exposeFloat("progress"),
    estimate: t.exposeInt("estimate"),
    localId: t.exposeInt("localId", { nullable: true }),
    milestone: t.exposeBoolean("milestone"),
    estimating: t.exposeBoolean("estimating"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    eta: t.expose("eta", { type: "DateTime", nullable: true }),
    closedAt: t.expose("closedAt", { type: "DateTime", nullable: true }),
    scheduledAt: t.expose("scheduledAt", { type: "DateTime", nullable: true }),
    archivedAt: t.expose("archivedAt", { type: "DateTime", nullable: true }),
    deletedAt: t.expose("deletedAt", { type: "DateTime", nullable: true }),
    status: t.expose("status", { type: TicketStatusEnum }),
    stage: t.expose("stage", { type: ModelStageEnum }),
    // description is defined as a computed field in ticket.resolver.ts
    // (reconstructed from the Yjs ticketText document)
    difficulty: t.exposeInt("difficulty", { nullable: true }),
    closingNote: t.exposeString("closingNote", { nullable: true }),
    foreignId: t.exposeString("foreignId", { nullable: true }),
    authorId: t.exposeInt("authorId", { nullable: true }),
    ownerId: t.exposeInt("ownerId", { nullable: true }),
    productId: t.exposeInt("productId", { nullable: true }),
    workflowId: t.exposeInt("workflowId", { nullable: true }),
    folderId: t.exposeInt("folderId", { nullable: true }),
    projectId: t.exposeInt("projectId"),
    organizationId: t.exposeInt("organizationId"),
    author: t.relation("author", { nullable: true }),
    owner: t.relation("owner", { nullable: true }),
    product: t.relation("product", { nullable: true }),
    workflow: t.relation("workflow", { nullable: true }),
    // folder is an internal navigation model — not exposed in the old schema
    project: t.relation("project"),
    organization: t.relation("organization"),
    ancestors: t.relation("ancestors"),
    successors: t.relation("successors"),
    // ticketText is internal (Yjs bytes) — description is a computed field in ticket.resolver.ts
    comments: t.relation("comments"),
    // questions are not exposed in the old schema
    tags: t.relation("tags"),
    watchers: t.relation("watchers"),
    personalTags: t.relation("personalTags"),
    features: t.relation("features"),
    ticketWorkflowStates: t.relation("ticketWorkflowStates"),
    scheduleItems: t.relation("scheduleItems"),
    cases: t.relation("cases"),
    // issues is an alias for the `cases` relation — the old schema exposed it as `issues`
    issues: t.relation("cases"),
    // DO NOT expose: checklist, paths, indexableContent
  }),
});

// ---------------------------------------------------------------------------
// TicketWorkflowState prismaObject — omits checklist
// ---------------------------------------------------------------------------

export const TicketWorkflowStateRef = builder.prismaObject("TicketWorkflowState", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    isActive: t.exposeBoolean("isActive"),
    isBlocked: t.exposeBoolean("isBlocked"),
    complete: t.exposeInt("complete"),
    todo: t.exposeInt("todo"),
    fractionable: t.exposeBoolean("fractionable"),
    position: t.exposeInt("position"),
    estimateMinimum: t.exposeInt("estimateMinimum", { nullable: true }),
    estimateMostLikely: t.exposeInt("estimateMostLikely", { nullable: true }),
    estimateMaximum: t.exposeInt("estimateMaximum", { nullable: true }),
    estimate: t.expose("estimate", { type: "DateTime", nullable: true }),
    assigneeId: t.exposeInt("assigneeId", { nullable: true }),
    ticketId: t.exposeInt("ticketId"),
    workflowStateId: t.exposeInt("workflowStateId", { nullable: true }),
    assignee: t.relation("assignee", { nullable: true }),
    ticket: t.relation("ticket"),
    workflowState: t.relation("workflowState", { nullable: true }),
    scheduleItems: t.relation("scheduleItems"),
    nextScheduleItems: t.relation("nextScheduleItems"),
    ticketWorkflowStateNotes: t.relation("ticketWorkflowStateNotes"),
    fromTicketWorkflowStateNotes: t.relation("fromTicketWorkflowStateNotes"),
    // DO NOT expose: checklist
  }),
});

// ---------------------------------------------------------------------------
// TicketWorkflowStateNote prismaObject
// ---------------------------------------------------------------------------

export const TicketWorkflowStateNoteRef = builder.prismaObject("TicketWorkflowStateNote", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    body: t.exposeString("body"),
    category: t.expose("category", { type: TicketWorkflowStateNoteCategoryEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    ticketWorkflowStateId: t.exposeInt("ticketWorkflowStateId"),
    authorId: t.exposeInt("authorId"),
    fromTicketWorkflowStateId: t.exposeInt("fromTicketWorkflowStateId"),
    ticketWorkflowState: t.relation("ticketWorkflowState"),
    author: t.relation("author"),
    fromTicketWorkflowState: t.relation("fromTicketWorkflowState"),
  }),
});

// ---------------------------------------------------------------------------
// PlanningTicket — lightweight ticket shape for planning views
// ---------------------------------------------------------------------------

interface PlanningTicketShape {
  title: string;
  status: PrismaTicketStatus;
  id: number;
  localId: number;
  productCode: string;
  eta: Date;
  milestone: boolean;
  workflowName: string;
  productName: string;
  projectName: string;
}

export const PlanningTicketRef = builder.objectRef<PlanningTicketShape>("PlanningTicket");
builder.objectType(PlanningTicketRef, {
  fields: (t) => ({
    title: t.exposeString("title"),
    status: t.field({ type: TicketStatusEnum, resolve: (p) => p.status }),
    id: t.exposeInt("id"),
    localId: t.exposeInt("localId"),
    productCode: t.exposeString("productCode"),
    eta: t.field({ type: "DateTime", resolve: (p) => p.eta }),
    milestone: t.exposeBoolean("milestone"),
    workflowName: t.exposeString("workflowName"),
    productName: t.exposeString("productName"),
    projectName: t.exposeString("projectName"),
  }),
});

// ---------------------------------------------------------------------------
// NextTicket — ticket + its next workflow state
// ---------------------------------------------------------------------------

export interface NextTicketShape {
  ticket: any;
  nextState: any;
}

export const NextTicketRef = builder.objectRef<NextTicketShape>("NextTicket");
builder.objectType(NextTicketRef, {
  fields: (t) => ({
    ticket: t.field({ type: TicketRef, resolve: (p) => p.ticket }),
    nextState: t.field({ type: TicketWorkflowStateRef, resolve: (p) => p.nextState }),
  }),
});

// ---------------------------------------------------------------------------
// MyUpcomingAssignedTicket / MyPreviousAssignedTicket
//
// Class inheritance in the old code is flattened: shared fields are
// duplicated into each concrete type.
// ---------------------------------------------------------------------------

export interface MyAssignedTicketShape {
  ticket: any;
  isPaused: boolean;
  isStarted: boolean;
  isActive: boolean;
  isDone: boolean;
  isNext: boolean;
  lastState: any | null;
}

export interface MyUpcomingAssignedTicketShape extends MyAssignedTicketShape {
  currentState: any;
}

export const MyUpcomingAssignedTicketRef =
  builder.objectRef<MyUpcomingAssignedTicketShape>("MyUpcomingAssignedTicket");
builder.objectType(MyUpcomingAssignedTicketRef, {
  fields: (t) => ({
    ticket: t.field({ type: TicketRef, resolve: (p) => p.ticket }),
    isPaused: t.exposeBoolean("isPaused"),
    isStarted: t.exposeBoolean("isStarted"),
    isActive: t.exposeBoolean("isActive"),
    isDone: t.exposeBoolean("isDone"),
    isNext: t.exposeBoolean("isNext"),
    lastState: t.field({
      type: TicketWorkflowStateRef,
      nullable: true,
      resolve: (p) => p.lastState,
    }),
    currentState: t.field({
      type: TicketWorkflowStateRef,
      resolve: (p) => p.currentState,
    }),
  }),
});

interface MyPreviousAssignedTicketShape extends MyAssignedTicketShape {
  currentState: any | null;
}

export const MyPreviousAssignedTicketRef =
  builder.objectRef<MyPreviousAssignedTicketShape>("MyPreviousAssignedTicket");
builder.objectType(MyPreviousAssignedTicketRef, {
  fields: (t) => ({
    ticket: t.field({ type: TicketRef, resolve: (p) => p.ticket }),
    isPaused: t.exposeBoolean("isPaused"),
    isStarted: t.exposeBoolean("isStarted"),
    isActive: t.exposeBoolean("isActive"),
    isDone: t.exposeBoolean("isDone"),
    isNext: t.exposeBoolean("isNext"),
    lastState: t.field({
      type: TicketWorkflowStateRef,
      nullable: true,
      resolve: (p) => p.lastState,
    }),
    currentState: t.field({
      type: TicketWorkflowStateRef,
      nullable: true,
      resolve: (p) => p.currentState,
    }),
  }),
});

// ---------------------------------------------------------------------------
// ChecklistItem — label + optional checked state
// ---------------------------------------------------------------------------

interface ChecklistItemShape {
  label: string;
  checked: boolean | null;
}

export const ChecklistItemRef = builder.objectRef<ChecklistItemShape>("ChecklistItem");
builder.objectType(ChecklistItemRef, {
  fields: (t) => ({
    label: t.exposeString("label"),
    checked: t.boolean({ nullable: true, resolve: (p) => p.checked }),
  }),
});

// ---------------------------------------------------------------------------
// TicketBatchPayload — count of affected tickets
// ---------------------------------------------------------------------------

interface TicketBatchPayloadShape {
  count: number;
}

export const TicketBatchPayloadRef = builder.objectRef<TicketBatchPayloadShape>(
  "TicketBatchPayload",
);
builder.objectType(TicketBatchPayloadRef, {
  fields: (t) => ({
    count: t.exposeInt("count"),
  }),
});

// ---------------------------------------------------------------------------
// TicketDependency / ProjectDependency / DependencySet
// ---------------------------------------------------------------------------

interface TicketDependencyShape {
  id: number;
  localId: number | null;
  productCode?: string;
  title: string;
  status: PrismaTicketStatus;
  ancestors: number[];
  successors: number[];
  projectId: number | null;
  milestone: boolean;
}

export const TicketDependencyRef = builder.objectRef<TicketDependencyShape>("TicketDependency");
builder.objectType(TicketDependencyRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    localId: t.int({ nullable: true, resolve: (p) => p.localId }),
    productCode: t.string({ nullable: true, resolve: (p) => p.productCode ?? null }),
    title: t.exposeString("title"),
    status: t.field({ type: TicketStatusEnum, resolve: (p) => p.status }),
    ancestors: t.intList({ resolve: (p) => p.ancestors }),
    successors: t.intList({ resolve: (p) => p.successors }),
    projectId: t.int({ nullable: true, resolve: (p) => p.projectId }),
    milestone: t.exposeBoolean("milestone"),
  }),
});

interface ProjectDependencyShape {
  id: number;
  parentId?: number | null;
  name: string;
  ancestors: number[];
  successors: number[];
}

export const ProjectDependencyRef = builder.objectRef<ProjectDependencyShape>(
  "ProjectDependency",
);
builder.objectType(ProjectDependencyRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    parentId: t.int({ nullable: true, resolve: (p) => p.parentId ?? null }),
    name: t.exposeString("name"),
    ancestors: t.intList({ resolve: (p) => p.ancestors }),
    successors: t.intList({ resolve: (p) => p.successors }),
  }),
});

interface DependencySetShape {
  tickets: TicketDependencyShape[];
  projects: ProjectDependencyShape[];
}

export const DependencySetRef = builder.objectRef<DependencySetShape>("DependencySet");
builder.objectType(DependencySetRef, {
  fields: (t) => ({
    tickets: t.field({ type: [TicketDependencyRef], resolve: (p) => p.tickets }),
    projects: t.field({ type: [ProjectDependencyRef], resolve: (p) => p.projects }),
  }),
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedTickets = createPaginatedType("Tickets", TicketRef);
