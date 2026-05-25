/**
 * Query resolver for fetching paginated Users.
 *
 * Provides:
 *  - users(first, last, offset, sort, search): paginated user list (staff only)
 *
 * Delegates to getPaginatedUsers helper. Requires isStaff auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { PaginatedUsers } from "../entity";
import { getPaginatedUsers } from "../helper";

builder.queryField("users", (t) =>
  t.field({
    type: PaginatedUsers,
    authScopes: { isStaff: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedUsers({
        organizationId: me.organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      });
    },
  }),
);
