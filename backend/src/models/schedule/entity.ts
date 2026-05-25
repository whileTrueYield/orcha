/**
 * Schedule Pothos type definitions.
 *
 * Exports:
 *  - ScheduleItemRef: prismaObject for ScheduleItem
 *  - ScheduleItemUpdateBoundariesRef: date boundaries for schedule item updates
 *  - ScheduleEstimateRef: estimate data for a scheduled ticket
 *  - ScheduleRoleRef: role with capacity info
 *  - PaginatedScheduleItems: paginated wrapper
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// ScheduleItem prismaObject
// ---------------------------------------------------------------------------

export const ScheduleItemRef = builder.prismaObject("ScheduleItem", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    done: t.exposeBoolean("done"),
    startedAt: t.expose("startedAt", { type: "DateTime" }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    stoppedAt: t.expose("stoppedAt", { type: "DateTime", nullable: true }),
    extendedAt: t.expose("extendedAt", { type: "DateTime", nullable: true }),
    autoStopped: t.exposeBoolean("autoStopped"),
    autoStarted: t.exposeBoolean("autoStarted"),
    ticketWorkflowStateId: t.exposeInt("ticketWorkflowStateId"),
    nextTicketWorkflowStateId: t.exposeInt("nextTicketWorkflowStateId", { nullable: true }),
    roleId: t.exposeInt("roleId"),
    organizationId: t.exposeInt("organizationId"),
    ticketId: t.exposeInt("ticketId"),
    ticketWorkflowState: t.relation("ticketWorkflowState"),
    nextTicketWorkflowState: t.relation("nextTicketWorkflowState", { nullable: true }),
    role: t.relation("role"),
    organization: t.relation("organization"),
    ticket: t.relation("ticket"),
  }),
});

// ---------------------------------------------------------------------------
// ScheduleItemUpdateBoundaries — date range for valid updates
// ---------------------------------------------------------------------------

interface ScheduleItemUpdateBoundariesShape {
  minDate: Date | null;
  maxDate?: Date;
}

export const ScheduleItemUpdateBoundariesRef =
  builder.objectRef<ScheduleItemUpdateBoundariesShape>("ScheduleItemUpdateBoundaries");
builder.objectType(ScheduleItemUpdateBoundariesRef, {
  fields: (t) => ({
    minDate: t.field({
      type: "DateTime",
      nullable: true,
      resolve: (p) => p.minDate,
    }),
    maxDate: t.field({
      type: "DateTime",
      nullable: true,
      resolve: (p) => p.maxDate ?? null,
    }),
  }),
});

// ---------------------------------------------------------------------------
// ScheduleEstimate — predicted schedule for a ticket workflow state
// ---------------------------------------------------------------------------

interface ScheduleEstimateShape {
  roleId: number;
  ticketId: number;
  ticketTitle: string;
  ticketProductCode: string;
  ticketLocalId: number;
  ticketWorkflowStateName: string;
  ticketWorkflowStateId: number;
  startEpoch: number;
  stopEpoch: number;
  duration: number;
  start_min: number;
}

export const ScheduleEstimateRef = builder.objectRef<ScheduleEstimateShape>("ScheduleEstimate");
builder.objectType(ScheduleEstimateRef, {
  fields: (t) => ({
    roleId: t.exposeInt("roleId"),
    ticketId: t.exposeInt("ticketId"),
    ticketTitle: t.exposeString("ticketTitle"),
    ticketProductCode: t.exposeString("ticketProductCode"),
    ticketLocalId: t.exposeInt("ticketLocalId"),
    ticketWorkflowStateName: t.exposeString("ticketWorkflowStateName"),
    ticketWorkflowStateId: t.exposeInt("ticketWorkflowStateId"),
    startEpoch: t.exposeInt("startEpoch"),
    stopEpoch: t.exposeInt("stopEpoch"),
    duration: t.exposeInt("duration"),
    start_min: t.exposeInt("start_min"),
  }),
});

// ---------------------------------------------------------------------------
// ScheduleRole — role with past/future capacity
// ---------------------------------------------------------------------------

interface ScheduleRoleShape {
  id: number;
  name: string;
  title?: string | null;
  avatarUrl?: string | null;
  pastCapacity: number;
  futureCapacity: number;
}

export const ScheduleRoleRef = builder.objectRef<ScheduleRoleShape>("ScheduleRole");
builder.objectType(ScheduleRoleRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    title: t.exposeString("title", { nullable: true }),
    avatarUrl: t.exposeString("avatarUrl", { nullable: true }),
    pastCapacity: t.exposeFloat("pastCapacity"),
    futureCapacity: t.exposeFloat("futureCapacity"),
  }),
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedScheduleItems = createPaginatedType("ScheduleItems", ScheduleItemRef);
