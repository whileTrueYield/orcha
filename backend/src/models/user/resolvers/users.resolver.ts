import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";
import { User } from "@generated/type-graphql";
import { StaffOnly } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import { getPaginatedUsers } from "../helper";
import { PaginatedUsers } from "../entity";

@Resolver(User)
export class UsersResolver {
  @Query((_returns) => PaginatedUsers)
  @UseMiddleware(StaffOnly)
  async users(
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof User,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<PaginatedUsers> {
    return getPaginatedUsers({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
