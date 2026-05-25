/**
 * Query resolver for fetching paginated Todos.
 *
 * Provides:
 *  - todos(first, last, offset, sort, search, dynamic): paginated list
 *
 * Delegates to getPaginatedTodos helper. Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { PaginatedTodos } from "../entity";
import { getPaginatedTodos } from "../helper";

builder.queryField("todos", (t) =>
  t.field({
    type: PaginatedTodos,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      dynamic: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedTodos({
        organizationId: me.organizationId,
        ownerId: me.roleId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
        dynamic: args.dynamic ?? undefined,
      });
    },
  }),
);
