/**
 * Mutation resolver for deleting a Notification.
 *
 * Provides:
 *  - deleteNotification(notificationId): deletes a notification belonging to the current user
 *
 * Requires hasRole auth scope. Verifies org + role before deleting.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteNotification", (t) =>
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
          id: args.notificationId,
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
      });

      return ctx.prisma.notification.delete({
        ...query,
        where: { id: notification.id },
      });
    },
  }),
);
