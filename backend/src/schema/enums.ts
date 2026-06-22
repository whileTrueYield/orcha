/**
 * Central enum registration for the Pothos GraphQL schema.
 *
 * Every Prisma enum is registered here exactly once so that model files
 * can import the refs without duplicating registration calls.
 *
 * Import this module for its side-effects (it mutates the builder)
 * and use the named exports when you need to reference an enum type
 * in a field definition.
 *
 * Exports: one `*Enum` ref per Prisma enum.
 */

import * as PrismaEnums from "@prisma/client";
import builder from "./builder";

// ---------------------------------------------------------------------------
// Enum registration — one call per Prisma enum, alphabetically sorted
// ---------------------------------------------------------------------------

export const DemoStatusEnum = builder.enumType(PrismaEnums.DemoStatus, {
  name: "DemoStatus",
});

export const EstimateTypeEnum = builder.enumType(PrismaEnums.EstimateType, {
  name: "EstimateType",
});

export const FeatureGroupStatusEnum = builder.enumType(
  PrismaEnums.FeatureGroupStatus,
  { name: "FeatureGroupStatus" },
);

export const IssueActionCategoryEnum = builder.enumType(
  PrismaEnums.IssueActionCategory,
  { name: "IssueActionCategory" },
);

export const IssueStatusEnum = builder.enumType(PrismaEnums.IssueStatus, {
  name: "IssueStatus",
});

export const ModelStageEnum = builder.enumType(PrismaEnums.ModelStage, {
  name: "ModelStage",
});

export const NoteColorEnum = builder.enumType(PrismaEnums.NoteColor, {
  name: "NoteColor",
});

export const NotificationCategoryEnum = builder.enumType(
  PrismaEnums.NotificationCategory,
  { name: "NotificationCategory" },
);

export const NotificationTargetEnum = builder.enumType(
  PrismaEnums.NotificationTarget,
  { name: "NotificationTarget" },
);

export const OrganizationStatusEnum = builder.enumType(
  PrismaEnums.OrganizationStatus,
  { name: "OrganizationStatus" },
);

export const ReportAggregateFieldEnum = builder.enumType(
  PrismaEnums.ReportAggregateField,
  { name: "ReportAggregateField" },
);

export const ReportDateGranularityEnum = builder.enumType(
  PrismaEnums.ReportDateGranularity,
  { name: "ReportDateGranularity" },
);

export const ReportGroupByEnum = builder.enumType(PrismaEnums.ReportGroupBy, {
  name: "ReportGroupBy",
});

export const ReportWidgetTypeEnum = builder.enumType(
  PrismaEnums.ReportWidgetType,
  { name: "ReportWidgetType" },
);

export const PullRequestStateEnum = builder.enumType(
  PrismaEnums.PullRequestState,
  { name: "PullRequestState" },
);

export const RepositoryLinkStatusEnum = builder.enumType(
  PrismaEnums.RepositoryLinkStatus,
  { name: "RepositoryLinkStatus" },
);

export const RoleStatusEnum = builder.enumType(PrismaEnums.RoleStatus, {
  name: "RoleStatus",
});

export const RoleTypeEnum = builder.enumType(PrismaEnums.RoleType, {
  name: "RoleType",
});

export const ScheduleStatusEnum = builder.enumType(
  PrismaEnums.ScheduleStatus,
  { name: "ScheduleStatus" },
);

export const TicketStatusEnum = builder.enumType(PrismaEnums.TicketStatus, {
  name: "TicketStatus",
});

export const TicketWorkflowStateNoteCategoryEnum = builder.enumType(
  PrismaEnums.TicketWorkflowStateNoteCategory,
  { name: "TicketWorkflowStateNoteCategory" },
);

export const UserStatusEnum = builder.enumType(PrismaEnums.UserStatus, {
  name: "UserStatus",
});
