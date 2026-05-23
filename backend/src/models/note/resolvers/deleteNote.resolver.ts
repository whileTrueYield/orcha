import { Arg, Resolver, Mutation, Int, UseMiddleware, Ctx } from "type-graphql";

import { Note } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";

@Resolver(Note)
export class DeleteNoteResolver {
  @Mutation((_returns) => Note)
  @UseMiddleware(hasRole([]))
  async deleteNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("noteId", () => Int!) noteId: number
  ): Promise<Note> {
    const note = await ctx.prisma.note.findFirstOrThrow({
      where: {
        id: noteId,
        organizationId: ctx.me.organizationId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.note.delete({ where: { id: note.id } });
  }
}
