/**
 * Mutation resolvers for updating a Todo.
 *
 * Provides:
 *  - updateTodo(todoId, input):       update a todo's body
 *  - checkTodo(todoId, checked):      toggle a todo's checked state
 *
 * Both require hasRole auth scope and verify org/owner ownership.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateTodoInput = builder.inputType("UpdateTodoInput", {
  fields: (t) => ({
    body: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// updateTodo mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateTodo", (t) =>
  t.prismaField({
    type: "Todo",
    authScopes: { hasRole: true },
    args: {
      todoId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateTodoInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const todo = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.todoId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.todo.update({
        ...query,
        where: { id: todo.id },
        data: { body: args.input.body ?? undefined },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// checkTodo mutation
// ---------------------------------------------------------------------------

builder.mutationField("checkTodo", (t) =>
  t.prismaField({
    type: "Todo",
    authScopes: { hasRole: true },
    args: {
      todoId: t.arg.int({ required: true }),
      checked: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const todo = await ctx.prisma.todo.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.todoId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.todo.update({
        ...query,
        where: { id: todo.id },
        data: {
          checked: args.checked,
          checkedAt: args.checked ? new Date() : null,
        },
      });
    },
  }),
);
