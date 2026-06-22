/**
 * Ticket Pothos type definitions.
 *
 * Exports:
 *  - TicketRef: prismaObject for Ticket
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
import { config } from "../../config";
import {
  ModelStageEnum,
  TicketStatusEnum,
  TicketWorkflowStateNoteCategoryEnum,
} from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";
import { PaginatedComments } from "../comment/entity";
import { getPaginatedComments } from "../comment/helper";

export const ticketStatuses = Object.values(PrismaTicketStatus);

// ---------------------------------------------------------------------------
// Ticket prismaObject
// ---------------------------------------------------------------------------

export const TicketRef = builder.prismaObject("Ticket", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    // A direct link to this ticket in the web app, built from the configured
    // web-app base (ORCHA_WEBAPP_URI) so it resolves to the same place the UI
    // navigates to. Lets an API/MCP consumer close the loop by handing the user
    // a link straight after creating or referencing a ticket. The trailing
    // slash on the base (if an operator sets one) is trimmed to avoid `//org`.
    url: t.string({
      resolve: (ticket) =>
        `${config.webAppUri.replace(/\/$/, "")}/org/${
          ticket.organizationId
        }/ticket/${ticket.id}/view`,
    }),
    progress: t.exposeFloat("progress"),
    estimate: t.exposeInt("estimate"),
    localId: t.exposeInt("localId", { nullable: true }),
    milestone: t.exposeBoolean("milestone"),
    estimating: t.exposeBoolean("estimating"),
    indexableContent: t.exposeString("indexableContent"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    eta: t.expose("eta", { type: "DateTime", nullable: true }),
    closedAt: t.expose("closedAt", { type: "DateTime", nullable: true }),
    scheduledAt: t.expose("scheduledAt", { type: "DateTime", nullable: true }),
    archivedAt: t.expose("archivedAt", { type: "DateTime", nullable: true }),
    deletedAt: t.expose("deletedAt", { type: "DateTime", nullable: true }),
    status: t.expose("status", { type: TicketStatusEnum }),
    stage: t.expose("stage", { type: ModelStageEnum }),
    // The legacy `description` computed field (backed by Yjs ticketText) was
    // retired in #45 — the body now lives in TicketText.markdown, exposed via
    // ticketBody.resolver.ts.
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
    // Supersession lineage (ADR 0010, #110): "this became that", distinct from
    // the ancestors/successors dependency DAG. `supersededBy` is this ticket's
    // successor (set when a worked ticket's workflow changes); `supersedes` is
    // the reverse — the originals this ticket continues.
    supersededById: t.exposeInt("supersededById", { nullable: true }),
    supersededBy: t.relation("supersededBy", { nullable: true }),
    supersedes: t.relation("supersedes"),
    // Total elapsed logged work in seconds across every ScheduleItem (an open
    // session is counted up to now). The UI reads this to choose, on a workflow
    // change, between the in-place reset and the supersede path (any logged work
    // means supersede — ADR 0010); the resolver remains the authoritative gate.
    loggedWorkSeconds: t.int({
      resolve: async (ticket, _args, ctx) => {
        const items = await ctx.prisma.scheduleItem.findMany({
          where: { ticketId: ticket.id },
          select: { startedAt: true, stoppedAt: true },
        });
        const millis = items.reduce((sum, item) => {
          const end = item.stoppedAt ?? new Date();
          return sum + Math.max(0, end.getTime() - item.startedAt.getTime());
        }, 0);
        return Math.round(millis / 1000);
      },
    }),
    // ticketText is internal — its Markdown body is exposed through
    // ticketBody.resolver.ts, not as a relation here.
    //
    // `comments` is a *paginated* field (not a flat relation): the legacy
    // schema exposed it as PaginatedComments with first/last/offset/search
    // args, and the frontend queries it as `comments { nodes { … } }`.
    // Resolving via the prisma relation directly would drop the connection
    // wrapper and break those queries.
    comments: t.field({
      type: PaginatedComments,
      args: {
        first: t.arg.int({ required: false }),
        last: t.arg.int({ required: false }),
        offset: t.arg.int({ required: false }),
        search: t.arg.string({ required: false }),
      },
      resolve: (ticket, args) =>
        getPaginatedComments({
          ticketId: ticket.id,
          organizationId: ticket.organizationId,
          first: args.first ?? undefined,
          last: args.last ?? undefined,
          offset: args.offset ?? undefined,
          search: args.search ?? undefined,
        }),
    }),
    // questions are not exposed in the old schema
    tags: t.relation("tags"),
    watchers: t.relation("watchers"),
    personalTags: t.relation("personalTags"),
    features: t.relation("features"),
    // `ticketWorkflowStates` is *filtered*, not a raw relation: a scheduled
    // ticket only exposes its active states, while an UNSCHEDULED ticket
    // exposes every state so the UI can toggle them on/off. The Pothos
    // migration had flattened this to `t.relation(...)`, which leaked
    // deactivated states on scheduled tickets.
    //
    // The live plan is only ever the *current* workflow's stages. Changing a
    // workflow in place (ADR 0010) deactivates the old workflow's rows rather
    // than deleting them (so logged work stays attached) — those tombstones
    // belong to a previous workflow and must never surface in the assignee/skip
    // form, even though it shows inactive rows on an UNSCHEDULED ticket. Scoping
    // to the current workflow hides them while keeping a skipped *current* stage
    // (isActive=false, same workflow) visible so it can be toggled back on.
    ticketWorkflowStates: t.field({
      type: [TicketWorkflowStateRef],
      resolve: (ticket, _args, ctx) =>
        ctx.prisma.ticketWorkflowState.findMany({
          where: {
            ticketId: ticket.id,
            isActive:
              ticket.status === PrismaTicketStatus.UNSCHEDULED
                ? undefined
                : true,
            ...(ticket.workflowId
              ? { workflowState: { workflowId: ticket.workflowId } }
              : {}),
          },
        }),
    }),
    scheduleItems: t.relation("scheduleItems"),
    cases: t.relation("cases"),
    // issues is an alias for the `cases` relation — the old schema exposed it as `issues`
    issues: t.relation("cases"),
    // GitHub pull requests mirrored onto this ticket (ADR 0011, #121). Newest
    // GitHub activity first so the Changes tab leads with the latest movement.
    linkedPullRequests: t.relation("linkedPullRequests", {
      query: { orderBy: { githubUpdatedAt: "desc" } },
    }),
    // checklist is exposed as a computed field in ticketWorkflowState.resolver.ts
  }),
});

// ---------------------------------------------------------------------------
// TicketWorkflowState prismaObject
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
    // checklist is exposed as a computed field in ticketWorkflowState.resolver.ts
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
