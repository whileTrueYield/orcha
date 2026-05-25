/**
 * Pothos type definitions for the Notification model.
 *
 * Exports:
 *  - NotificationRef:        prismaObject for Notification
 *  - PaginatedNotifications: paginated wrapper via createPaginatedType
 *
 * Relations (organization, role, actor) are exposed as lazy relations.
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import {
  NotificationCategoryEnum,
  NotificationTargetEnum,
} from "../../schema/enums";

// ---------------------------------------------------------------------------
// Notification — prismaObject backed by the Prisma Notification model
// ---------------------------------------------------------------------------

export const NotificationRef = builder.prismaObject("Notification", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    isRead: t.exposeBoolean("isRead"),
    title: t.exposeString("title"),
    category: t.expose("category", { type: NotificationCategoryEnum }),
    target: t.expose("target", { type: NotificationTargetEnum }),
    targetId: t.exposeInt("targetId"),
    description: t.exposeString("description", { nullable: true }),
    ancestry: t.exposeString("ancestry", { nullable: true }),
    roleId: t.exposeInt("roleId"),
    actorId: t.exposeInt("actorId"),
    organizationId: t.exposeInt("organizationId"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    organization: t.relation("organization"),
    role: t.relation("role"),
    actor: t.relation("actor"),
  }),
});

// ---------------------------------------------------------------------------
// PaginatedNotifications — standard paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedNotifications = createPaginatedType(
  "Notifications",
  NotificationRef,
);
