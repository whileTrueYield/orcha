import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Todo } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedTodos } from "../helper";
import { PaginatedTodos } from "../entity";

@Resolver(Todo)
export class TodosResolver {
  @Query((_returns) => PaginatedTodos)
  @UseMiddleware(hasRole())
  async todos(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Todo,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("dynamic", () => Boolean, { nullable: true }) dynamic: boolean
  ) {
    return getPaginatedTodos({
      organizationId: ctx.me.organizationId,
      ownerId: ctx.me.roleId,
      first,
      last,
      offset,
      sort,
      search,
      dynamic,
    });
  }
}
