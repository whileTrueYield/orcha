/**
 * Workflow and WorkflowState Pothos type definitions.
 *
 * Exports:
 *  - WorkflowRef: prismaObject for Workflow
 *  - WorkflowStateRef: prismaObject for WorkflowState
 *  - MiniWorkflowRef: lightweight Workflow for fuzzy search
 *  - PaginatedWorkflows / PaginatedWorkflowStates: paginated wrappers
 *  - WorkflowStateDirectionEnum: enum for reordering states
 */

import builder from "../../schema/builder";
import { ModelStageEnum } from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";
import { ModelStage } from "@prisma/client";

// ---------------------------------------------------------------------------
// Workflow prismaObject
// ---------------------------------------------------------------------------

export const WorkflowRef = builder.prismaObject("Workflow", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    color: t.exposeString("color"),
    isDefaultWorkflow: t.exposeBoolean("isDefaultWorkflow"),
    description: t.exposeString("description", { nullable: true }),
    stage: t.expose("stage", { type: ModelStageEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    products: t.relation("products"),
    tickets: t.relation("tickets"),
    states: t.relation("workflowStates"),
    scheduleConfigs: t.relation("scheduleConfigs"),
    // Page model has no GraphQL type — not exposed in the old schema
  }),
});

// ---------------------------------------------------------------------------
// WorkflowState prismaObject
// ---------------------------------------------------------------------------

export const WorkflowStateRef = builder.prismaObject("WorkflowState", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    position: t.exposeInt("position"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    workflowId: t.exposeInt("workflowId"),
    organization: t.relation("organization"),
    workflow: t.relation("workflow"),
    teams: t.relation("teams"),
    backupTeams: t.relation("backupTeams"),
    TicketWorkflowState: t.relation("TicketWorkflowState"),
  }),
});

// ---------------------------------------------------------------------------
// MiniWorkflow — lightweight shape for fuzzy search
// ---------------------------------------------------------------------------

export interface MiniWorkflowShape {
  id: number;
  name: string;
  stage: ModelStage;
}

export const MiniWorkflowRef = builder.objectRef<MiniWorkflowShape>("MiniWorkflow");
builder.objectType(MiniWorkflowRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    stage: t.field({ type: ModelStageEnum, resolve: (p) => p.stage }),
  }),
});

// ---------------------------------------------------------------------------
// WorkflowStateDirection enum — used by moveWorkflowState mutation
// ---------------------------------------------------------------------------

// TypeGraphQL registered enum keys as SDL values, so the old schema used
// lowercase (up, down, first, last). Pothos uses enum values, so we match.
export enum WorkflowStateDirection {
  up = "up",
  down = "down",
  first = "first",
  last = "last",
}

export const WorkflowStateDirectionEnum = builder.enumType(WorkflowStateDirection, {
  name: "WorkflowStateDirection",
  description: "Used to move a state amongst a workflow",
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedWorkflows = createPaginatedType("Workflows", WorkflowRef);
export const PaginatedWorkflowStates = createPaginatedType("WorkflowStates", WorkflowStateRef);
