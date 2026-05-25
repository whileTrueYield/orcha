/**
 * Barrel re-export of all model entity types.
 *
 * This file consolidates entity exports so consuming code (mocker, cron,
 * helpers) can import types from a single path. Prisma model types are
 * now sourced from @prisma/client instead of the removed @generated/type-graphql.
 */

export * from "./auth/entity";
export * from "./comment/entity";
export * from "./documentation/entity";
export * from "./feature/entity";
export * from "./project/entity";
export * from "./issue/entity";
export * from "./note/entity";
export * from "./notification/entity";
export * from "./organization/entity";
export * from "./product/entity";
export * from "./report/entity";
export * from "./role/entity";
export * from "./schedule/entity";
export * from "./search/entity";
export * from "./skill/entity";
export * from "./tag/entity";
export * from "./team/entity";
export * from "./ticket/entity";
export * from "./todo/entity";
export * from "./user/entity";
export * from "./workflow/entity";

// Re-export Prisma model types so consumers that previously imported from
// @generated/type-graphql/models via this barrel continue to work.
export {
  BlackoutTime,
  Comment,
  CommentReply,
  DemoRequest,
  Documentation,
  DocumentationPage,
  Estimate,
  Feature,
  FeatureFlag,
  FeatureGroup,
  Issue,
  IssueAction,
  Note,
  Notification,
  Organization,
  OrganizationAddress,
  Page,
  Product,
  Project,
  RecurringBlackoutTime,
  Report,
  ReportQuery,
  Role,
  ScheduleConfig,
  ScheduleItem,
  Skill,
  Tag,
  Team,
  Ticket,
  TicketText,
  TicketWorkflowState,
  TimeOff,
  Todo,
  User,
  Workflow,
  WorkflowState,
} from "@prisma/client";
