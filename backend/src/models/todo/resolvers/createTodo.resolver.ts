/**
 * Mutation resolver for creating a Todo.
 *
 * Provides:
 *  - createTodo(input): creates a new todo for the current user/org
 *
 * Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { assertLength } from "../../../utils/validation";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateTodoInput = builder.inputType("CreateTodoInput", {
  fields: (t) => ({
    body: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// createTodo mutation
// ---------------------------------------------------------------------------

builder.mutationField("createTodo", (t) =>
  t.prismaField({
    type: "Todo",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateTodoInput, required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      // Legacy contract: a todo body, when provided, must be 1–2048 chars.
      if (args.input.body !== null && args.input.body !== undefined) {
        assertLength(args.input.body, 1, 2048, "body");
      }

      return ctx.prisma.todo.create({
        ...query,
        data: {
          body: args.input.body ?? "",
          ownerId: me.roleId,
          organizationId: me.organizationId,
        },
      });
    },
  }),
);
