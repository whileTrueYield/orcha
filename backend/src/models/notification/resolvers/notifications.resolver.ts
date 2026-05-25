/**
 * Query resolver for fetching paginated Notifications.
 *
 * Provides:
 *  - myNotifications(first, last, offset, sort, search, unread): paginated list
 *
 * Delegates to getPaginatedNotifications helper. Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { PaginatedNotifications } from "../entity";
import { getPaginatedNotifications } from "../helper";

builder.queryField("myNotifications", (t) =>
  t.field({
    type: PaginatedNotifications,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      unread: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedNotifications({
        organizationId: me.organizationId,
        roleId: me.roleId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
        unread: args.unread ?? undefined,
      });
    },
  }),
);
