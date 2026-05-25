/**
 * Role Pothos type definitions and preference utilities.
 *
 * Exports:
 *  - RoleRef: prismaObject for Role (omits preferences, workWeek)
 *  - MiniRoleRef: lightweight Role for fuzzy search
 *  - RoleWorkDayRef / WorkWeekTimeRef: work schedule shapes
 *  - HabitProductWorkflowRef / RoleHabitRef: habit tracking types
 *  - RoleNoteColorPreferencesRef / RolePreferencesRef: preference types
 *  - PaginatedRoles: paginated wrapper
 *  - DEFAULT_WORK_WEEK / EMPTY_WORK_WEEK / DEFAULT_ROLE_PREFERENCES: constants
 *  - getRolePreferences / updateRolePreferences: preference helpers
 *  - roleStatuses / roleTypes: enum value lists
 */

import { RoleStatus, RoleType } from "@prisma/client";
import builder from "../../schema/builder";
import { RoleStatusEnum, RoleTypeEnum } from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";
import { logger } from "../../logger";

export const roleStatuses = Object.values(RoleStatus);
export const roleTypes = Object.values(RoleType);

// ---------------------------------------------------------------------------
// Role prismaObject — omits preferences, workWeek
// ---------------------------------------------------------------------------

export const RoleRef = builder.prismaObject("Role", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    timeZone: t.exposeString("timeZone"),
    name: t.exposeString("name"),
    title: t.exposeString("title", { nullable: true }),
    description: t.exposeString("description", { nullable: true }),
    avatarUrl: t.exposeString("avatarUrl", { nullable: true }),
    coverUrl: t.exposeString("coverUrl", { nullable: true }),
    status: t.expose("status", { type: RoleStatusEnum }),
    type: t.expose("type", { type: RoleTypeEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    userId: t.exposeInt("userId"),
    organizationId: t.exposeInt("organizationId"),
    user: t.relation("user"),
    organization: t.relation("organization"),
    skills: t.relation("skills"),
    teams: t.relation("teams"),
    ticketsAuthored: t.relation("ticketsAuthored"),
    ticketsOwned: t.relation("ticketsOwned"),
    ticketsWatched: t.relation("ticketsWatched"),
    assignments: t.relation("assignments"),
    notes: t.relation("notes"),
    checklists: t.relation("checklists"),
    notifications: t.relation("notifications"),
    pinnedProjects: t.relation("pinnedProjects"),
    roleEmail: t.relation("roleEmail", { nullable: true }),
    roleStartReminder: t.relation("roleStartReminder", { nullable: true }),
    roleAutoResume: t.relation("roleAutoResume", { nullable: true }),
    preferences: t.exposeString("preferences"),
    workWeek: t.exposeString("workWeek"),
  }),
});

// ---------------------------------------------------------------------------
// RoleEmail — email notification settings for a role
// ---------------------------------------------------------------------------

export const RoleEmailRef = builder.prismaObject("RoleEmail", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    roleId: t.exposeInt("roleId"),
    nextWorkDayNotificationDate: t.expose("nextWorkDayNotificationDate", { type: "DateTime" }),
    nextWorkDayNotificationOffset: t.exposeInt("nextWorkDayNotificationOffset"),
    nextWorkDayNotificationOptOut: t.exposeBoolean("nextWorkDayNotificationOptOut"),
  }),
});

// ---------------------------------------------------------------------------
// RoleStartReminder — start-of-day reminder settings for a role
// ---------------------------------------------------------------------------

export const RoleStartReminderRef = builder.prismaObject("RoleStartReminder", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    roleId: t.exposeInt("roleId"),
    nextStartNotificationDate: t.expose("nextStartNotificationDate", { type: "DateTime" }),
    nextStartNotificationOffset: t.exposeInt("nextStartNotificationOffset"),
    nextStartNotificationOptOut: t.exposeBoolean("nextStartNotificationOptOut"),
  }),
});

// ---------------------------------------------------------------------------
// RoleAutoResume — auto-resume settings for a role
// ---------------------------------------------------------------------------

export const RoleAutoResumeRef = builder.prismaObject("RoleAutoResume", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    roleId: t.exposeInt("roleId"),
    nextStartNotificationDate: t.expose("nextStartNotificationDate", { type: "DateTime" }),
    nextStartNotificationOptOut: t.exposeBoolean("nextStartNotificationOptOut"),
  }),
});

// ---------------------------------------------------------------------------
// MiniRole — lightweight shape for fuzzy search
// ---------------------------------------------------------------------------

interface MiniRoleShape {
  id: number;
  name: string;
  title?: string | null;
  avatarUrl?: string | null;
}

export const MiniRoleRef = builder.objectRef<MiniRoleShape>("MiniRole");
builder.objectType(MiniRoleRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    title: t.exposeString("title", { nullable: true }),
    avatarUrl: t.exposeString("avatarUrl", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// RoleWorkDay / WorkWeekTime — work schedule shapes
// ---------------------------------------------------------------------------

export interface RoleWorkDayShape {
  startTime: string;
  stopTime: string;
}

export const RoleWorkDayRef = builder.objectRef<RoleWorkDayShape>("RoleWorkDay");
builder.objectType(RoleWorkDayRef, {
  fields: (t) => ({
    startTime: t.exposeString("startTime"),
    stopTime: t.exposeString("stopTime"),
  }),
});

export interface WorkWeekTime {
  monday: RoleWorkDayShape[];
  tuesday: RoleWorkDayShape[];
  wednesday: RoleWorkDayShape[];
  thursday: RoleWorkDayShape[];
  friday: RoleWorkDayShape[];
  saturday: RoleWorkDayShape[];
  sunday: RoleWorkDayShape[];
}

export const WorkWeekTimeRef = builder.objectRef<WorkWeekTime>("WorkWeekTime");
builder.objectType(WorkWeekTimeRef, {
  fields: (t) => ({
    monday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.monday }),
    tuesday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.tuesday }),
    wednesday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.wednesday }),
    thursday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.thursday }),
    friday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.friday }),
    saturday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.saturday }),
    sunday: t.field({ type: [RoleWorkDayRef], resolve: (p) => p.sunday }),
  }),
});

// ---------------------------------------------------------------------------
// HabitProductWorkflow / RoleHabit — habit tracking types
// ---------------------------------------------------------------------------

interface HabitProductWorkflowShape {
  product: any;
  workflow: any;
}

export const HabitProductWorkflowRef = builder.objectRef<HabitProductWorkflowShape>(
  "HabitProductWorkflow",
);
builder.objectType(HabitProductWorkflowRef, {
  fields: (t) => ({
    product: t.field({
      type: "Product" as any,
      resolve: (p) => p.product,
    }),
    workflow: t.field({
      type: "Workflow" as any,
      resolve: (p) => p.workflow,
    }),
  }),
});

interface RoleHabitShape {
  productWorkflows: HabitProductWorkflowShape[];
  projects: any[];
}

export const RoleHabitRef = builder.objectRef<RoleHabitShape>("RoleHabit");
builder.objectType(RoleHabitRef, {
  fields: (t) => ({
    productWorkflows: t.field({
      type: [HabitProductWorkflowRef],
      resolve: (p) => p.productWorkflows,
    }),
    projects: t.field({
      type: ["Project" as any],
      resolve: (p) => p.projects,
    }),
  }),
});

// ---------------------------------------------------------------------------
// RoleNoteColorPreferences / RolePreferences
// ---------------------------------------------------------------------------

interface RoleNoteColorPreferencesShape {
  YELLOW: string;
  BLUE: string;
  PURPLE: string;
  GREEN: string;
  PINK: string;
  ORANGE: string;
}

export const RoleNoteColorPreferencesRef =
  builder.objectRef<RoleNoteColorPreferencesShape>("RoleNoteColorPreferences");
builder.objectType(RoleNoteColorPreferencesRef, {
  fields: (t) => ({
    YELLOW: t.exposeString("YELLOW"),
    BLUE: t.exposeString("BLUE"),
    PURPLE: t.exposeString("PURPLE"),
    GREEN: t.exposeString("GREEN"),
    PINK: t.exposeString("PINK"),
    ORANGE: t.exposeString("ORANGE"),
  }),
});

export interface RolePreferences {
  showOnboarding: boolean;
  recentSearchHits: string[];
  recentlyVisited: string[];
  lastProjectId: number | null;
  noteColors: RoleNoteColorPreferencesShape;
}

export const RolePreferencesRef = builder.objectRef<RolePreferences>("RolePreferences");
builder.objectType(RolePreferencesRef, {
  fields: (t) => ({
    showOnboarding: t.exposeBoolean("showOnboarding"),
    recentSearchHits: t.stringList({ resolve: (p) => p.recentSearchHits }),
    recentlyVisited: t.stringList({ resolve: (p) => p.recentlyVisited }),
    lastProjectId: t.int({ nullable: true, resolve: (p) => p.lastProjectId }),
    noteColors: t.field({
      type: RoleNoteColorPreferencesRef,
      resolve: (p) => p.noteColors,
    }),
  }),
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const EMPTY_WORK_WEEK: WorkWeekTime = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

export const DEFAULT_WORK_WEEK: WorkWeekTime = {
  monday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  tuesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  wednesday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  thursday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  friday: [
    { startTime: "08:00", stopTime: "12:00" },
    { startTime: "13:00", stopTime: "17:00" },
  ],
  saturday: [],
  sunday: [],
};

export const DEFAULT_ROLE_PREFERENCES: RolePreferences = {
  showOnboarding: true,
  recentSearchHits: [],
  recentlyVisited: [],
  lastProjectId: null,
  noteColors: {
    YELLOW: "Yellow",
    BLUE: "Blue",
    PURPLE: "Purple",
    GREEN: "Green",
    PINK: "Pink",
    ORANGE: "Orange",
  },
};

// ---------------------------------------------------------------------------
// Preference helpers
// ---------------------------------------------------------------------------

/**
 * Partially update the preferences of a role.
 *
 * Falls back on DEFAULT_ROLE_PREFERENCES when none are set.
 * Resilient to badly formatted JSON — logs but does not crash.
 */
export const updateRolePreferences = (
  role: any,
  values: Partial<RolePreferences>,
): RolePreferences => {
  return {
    ...getRolePreferences(role),
    ...values,
  };
};

/**
 * Resilient retrieval of role preferences. Falls back to defaults
 * when the stored JSON is malformed.
 */
export const getRolePreferences = (role: any): RolePreferences => {
  try {
    return {
      ...DEFAULT_ROLE_PREFERENCES,
      ...JSON.parse(role.preferences || "{}"),
    };
  } catch {
    logger.warn(`Could not parse role preferences for role ID ${role.id}`);
    return { ...DEFAULT_ROLE_PREFERENCES };
  }
};

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedRoles = createPaginatedType("Roles", RoleRef);
