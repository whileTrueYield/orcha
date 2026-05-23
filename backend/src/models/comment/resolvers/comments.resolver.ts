import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Comment } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedComments } from "../entity";
import { getPaginatedComments } from "../helper";

@Resolver(Comment)
export class CommentsResolver {
  @Query((_returns) => PaginatedComments)
  @UseMiddleware(hasRole())
  async comments(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Comment,
    @Arg("search", () => String, { nullable: true }) search: string,
    @Arg("commentId", () => Int, { nullable: true }) commentId: number | null,
    @Arg("replyId", () => Int, { nullable: true }) replyId: number | null
  ): Promise<PaginatedComments> {
    return getPaginatedComments({
      organizationId: ctx.me.organizationId,
      ticketId,
      first,
      last,
      offset,
      sort,
      search,
      replyId,
      commentId,
    });
  }
}
