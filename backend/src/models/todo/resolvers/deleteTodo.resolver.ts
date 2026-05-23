import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Todo } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Todo)
export class DeleteTodoResolver {
  @Mutation((_returns) => Todo)
  @UseMiddleware(hasRole([]))
  async deleteTodo(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("todoId", () => Int!) todoId: number
  ): Promise<Todo> {
    const todo = await ctx.prisma.todo.findFirstOrThrow({
      where: {
        id: todoId,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.todo.delete({ where: { id: todo.id } });
  }
}
