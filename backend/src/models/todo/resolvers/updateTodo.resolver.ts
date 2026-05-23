import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import { Length } from "class-validator";
import { Todo } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@InputType()
class UpdateTodoInput {
  @Field({ nullable: true })
  @Length(1, 2048)
  body: string;
}

@Resolver(Todo)
export class UpdateTodoResolver {
  @Mutation(() => Todo)
  @UseMiddleware(hasRole())
  async updateTodo(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("todoId", () => Int) todoId: number,
    @Arg("input", () => UpdateTodoInput) input: UpdateTodoInput
  ): Promise<Todo> {
    const todo = await ctx.prisma.todo.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: todoId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.todo.update({
      where: { id: todo.id },
      data: input,
    });
  }

  @Mutation(() => Todo)
  @UseMiddleware(hasRole())
  async checkTodo(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("todoId", () => Int) todoId: number,
    @Arg("checked", () => Boolean) checked: boolean
  ): Promise<Todo> {
    const todo = await ctx.prisma.todo.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: todoId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.todo.update({
      where: { id: todo.id },
      data: {
        checked,
        checkedAt: checked ? new Date() : null,
      },
    });
  }
}
