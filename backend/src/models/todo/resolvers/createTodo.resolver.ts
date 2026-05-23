import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
} from "type-graphql";

import { Length } from "class-validator";
import { Todo } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@InputType()
class CreateTodoInput {
  @Field({ nullable: true })
  @Length(1, 2048)
  body: string;
}

@Resolver(Todo)
export class CreateTodoResolver {
  @Mutation(() => Todo)
  @UseMiddleware(hasRole())
  async createTodo(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateTodoInput
  ): Promise<Todo> {
    return ctx.prisma.todo.create({
      data: {
        ...input,
        ownerId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
      },
    });
  }
}
