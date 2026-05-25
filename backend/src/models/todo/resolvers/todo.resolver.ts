/**
 * Query resolvers for fetching a single Todo.
 *
 * Provides:
 *  - todo(id):   fetch a specific todo by ID (scoped to org + owner)
 *  - lastTodo:   fetch the most recent todo for the current user
 *
 * Both require hasRole auth scope.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// todo — fetch a single todo by ID
// ---------------------------------------------------------------------------

builder.queryField("todo", (t) =>
  t.prismaField({
    type: "Todo",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const todo = await ctx.prisma.todo.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
      });

      if (!todo) {
        throw new GraphQLError(
          "This todo does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return todo;
    },
  }),
);

// ---------------------------------------------------------------------------
// lastTodo — fetch the most recent todo for the current user
// ---------------------------------------------------------------------------

builder.queryField("lastTodo", (t) =>
  t.prismaField({
    type: "Todo",
    nullable: true,
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.todo.findFirst({
        ...query,
        where: {
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
        orderBy: { id: "desc" },
      });
    },
  }),
);
