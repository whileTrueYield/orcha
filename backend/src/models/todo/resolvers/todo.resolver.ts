import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { Todo, Organization, Role } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";

@Resolver(Todo)
export class TodoResolver {
  @Query(() => Todo!)
  @UseMiddleware(hasRole())
  async todo(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Todo> {
    const todo = await ctx.prisma.todo.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });

    if (!todo) {
      throw new UserInputError("This todo does not exist or has been deleted");
    }

    return todo;
  }

  @Query(() => Todo, { nullable: true })
  @UseMiddleware(hasRole())
  async lastTodo(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<Todo | null> {
    return ctx.prisma.todo.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
      include: { owner: true },
      orderBy: { id: "desc" },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() todo: Todo
  ): Promise<Organization> {
    if (todo.organization) {
      return todo.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: todo.organizationId },
    });
  }

  @FieldResolver((_returns) => Role)
  async owner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() todo: Todo
  ): Promise<Role> {
    if (todo.owner) {
      return todo.owner;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: todo.ownerId },
    });
  }
}
