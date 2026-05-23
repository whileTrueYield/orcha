import { Arg, Query, Resolver, Int, UseMiddleware, Ctx } from "type-graphql";

import { Note, NoteColor } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { getPaginatedNotes } from "../helper";
import { PaginatedNotes } from "../entity";

@Resolver(Note)
export class NotesResolver {
  @Query((_returns) => PaginatedNotes)
  @UseMiddleware(hasRole())
  async notes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("colors", () => [NoteColor], { nullable: true }) colors: NoteColor[],
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Note,
    @Arg("search", () => String, { nullable: true }) search: string
  ) {
    return getPaginatedNotes({
      organizationId: ctx.me.organizationId,
      ownerId: ctx.me.roleId,
      colors,
      first,
      last,
      offset,
      sort,
      search,
    });
  }
}
