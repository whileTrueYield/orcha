/**
 * Mutation resolver for deleting a Todo.
 *
 * Provides:
 *  - deleteTodo(todoId): deletes a todo owned by the current user
 *
 * Requires hasRole auth scope. Verifies org + owner before deleting.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteTodo", (t) =>
  t.prismaField({
    type: "Todo",
    authScopes: { hasRole: true },
    args: {
      todoId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const todo = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          id: args.todoId,
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.todo.delete({ ...query, where: { id: todo.id } });
    },
  }),
);
