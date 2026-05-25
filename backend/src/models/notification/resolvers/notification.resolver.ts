/**
 * Query resolvers for fetching a single Notification.
 *
 * Provides:
 *  - notification(id):    fetch a specific notification by ID (scoped to org + role)
 *  - lastNotification:    fetch the most recent notification for the current user
 *
 * Both require hasRole auth scope.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// notification — fetch a single notification by ID
// ---------------------------------------------------------------------------

builder.queryField("notification", (t) =>
  t.prismaField({
    type: "Notification",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const notification = await ctx.prisma.notification.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
      });

      if (!notification) {
        throw new GraphQLError(
          "This notification does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return notification;
    },
  }),
);

// ---------------------------------------------------------------------------
// lastNotification — fetch the most recent notification for the current user
// ---------------------------------------------------------------------------

builder.queryField("lastNotification", (t) =>
  t.prismaField({
    type: "Notification",
    nullable: true,
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.notification.findFirst({
        ...query,
        where: {
          organizationId: me.organizationId,
          roleId: me.roleId,
        },
        orderBy: { id: "desc" },
      });
    },
  }),
);
