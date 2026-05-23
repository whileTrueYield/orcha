import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { PersonalTag } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { PaginatedPersonalTags } from "../entity";
import { getPaginatedPersonalTags } from "../helper";

@Resolver(PersonalTag)
export class PersonalTagsResolver {
  @Query((_returns) => PaginatedPersonalTags)
  @UseMiddleware(hasRole())
  async personalTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof PersonalTag,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedPersonalTags> {
    return getPaginatedPersonalTags({
      organizationId: ctx.me.organizationId,
      ownerId: ctx.me.roleId,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
