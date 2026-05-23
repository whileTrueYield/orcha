import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Tag } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { MiniTag, PaginatedTags } from "../entity";
import { getPaginatedTags } from "../helper";

@Resolver(Tag)
export class TagsResolver {
  @Query((_returns) => PaginatedTags)
  @UseMiddleware(hasRole())
  async tags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Tag,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedTags> {
    return getPaginatedTags({
      organizationId: ctx.me.organizationId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }

  @Query((_returns) => [MiniTag])
  @UseMiddleware(hasRole())
  async miniTags(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<MiniTag[]> {
    return ctx.prisma.tag.findMany({
      where: {
        organizationId: ctx.me.organizationId,
      },
      select: {
        name: true,
        color: true,
        id: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}
