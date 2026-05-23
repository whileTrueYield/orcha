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
import { Note, NoteColor } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";

@InputType()
class UpdateNoteInput {
  @Field({ nullable: true })
  @Length(1, 2048)
  body: string;
}

@Resolver(Note)
export class UpdateNoteResolver {
  @Mutation(() => Note)
  @UseMiddleware(hasRole())
  async updateNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("noteId", () => Int) noteId: number,
    @Arg("input", () => UpdateNoteInput) input: UpdateNoteInput
  ): Promise<Note> {
    const note = await ctx.prisma.note.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: noteId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.note.update({
      where: { id: note.id },
      data: input,
    });
  }

  @Mutation(() => Note)
  @UseMiddleware(hasRole())
  async updateNoteColor(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("noteId", () => Int) noteId: number,
    @Arg("color", () => NoteColor) color: NoteColor
  ): Promise<Note> {
    const note = await ctx.prisma.note.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: noteId,
        ownerId: ctx.me.roleId,
      },
    });

    return ctx.prisma.note.update({
      where: { id: note.id },
      data: { color },
    });
  }
}
