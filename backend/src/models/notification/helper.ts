/**
 * Pagination helper for Notifications.
 *
 * Builds a Prisma query with optional filters (role, search, unread)
 * and returns a paginated result compatible with the PaginatedNotifications type.
 *
 * Exports: getPaginatedNotifications, NotificationAncestry.
 */

import prisma from "../../prisma";
import { clamp, trim } from "lodash";
import { Notification, Prisma } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";

interface GetPageArgs extends GetPageArgsFor<Notification> {
  roleId?: number;
  organizationId: number;
  unread?: boolean;
}

export async function getPaginatedNotifications(args: GetPageArgs) {
  const { first, last, organizationId, roleId, search, unread } = args;

  // default offset to be at the start (or the end depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof Notification = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const notificationQuery: Prisma.NotificationWhereInput = {
    organizationId,
  };

  // We allow search on notifications by title
  const query = trim(search);
  if (query) {
    notificationQuery.title = { contains: query, mode: "insensitive" };
  }

  // optionally filter by owner
  if (roleId) {
    notificationQuery.roleId = roleId;
  }

  if (unread === false || unread === true) {
    notificationQuery.isRead = !unread;
  }

  const notifications = await prisma.notification.findMany({
    where: notificationQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
    include: { actor: true },
  });
  const count = await prisma.notification.count({ where: notificationQuery });

  return paginateNodes({ nodes: notifications, offset, pageSize, count });
}

export type NotificationAncestry = { [objectType: string]: number };
