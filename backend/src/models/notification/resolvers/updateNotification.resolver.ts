/**
 * Mutation resolvers for marking Notifications as read/unread.
 *
 * Provides:
 *  - readNotification(notificationId):   mark a notification as read
 *  - unreadNotification(notificationId): mark a notification as unread
 *
 * Both require hasRole auth scope and verify org + role ownership.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// readNotification mutation
// ---------------------------------------------------------------------------

builder.mutationField("readNotification", (t) =>
  t.prismaField({
    type: "Notification",
    authScopes: { hasRole: true },
    args: {
      notificationId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const notification = await ctx.prisma.notification.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.notificationId,
          roleId: me.roleId,
        },
      });

      return ctx.prisma.notification.update({
        ...query,
        where: { id: notification.id },
        data: { isRead: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// unreadNotification mutation
// ---------------------------------------------------------------------------

builder.mutationField("unreadNotification", (t) =>
  t.prismaField({
    type: "Notification",
    authScopes: { hasRole: true },
    args: {
      notificationId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const notification = await ctx.prisma.notification.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.notificationId,
          roleId: me.roleId,
        },
      });

      return ctx.prisma.notification.update({
        ...query,
        where: { id: notification.id },
        data: { isRead: false },
      });
    },
  }),
);
