/**
 * Mutation resolvers for updating a Note.
 *
 * Provides:
 *  - updateNote(noteId, input):  update a note's body
 *  - updateNoteColor(noteId, color): change a note's color
 *
 * Both require hasRole auth scope and verify org/owner ownership.
 */

import builder from "../../../schema/builder";
import { NoteColorEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateNoteInput = builder.inputType("UpdateNoteInput", {
  fields: (t) => ({
    body: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// updateNote mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateNote", (t) =>
  t.prismaField({
    type: "Note",
    authScopes: { hasRole: true },
    args: {
      noteId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateNoteInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const note = await ctx.prisma.note.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.noteId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.note.update({
        ...query,
        where: { id: note.id },
        data: { body: args.input.body ?? undefined },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// updateNoteColor mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateNoteColor", (t) =>
  t.prismaField({
    type: "Note",
    authScopes: { hasRole: true },
    args: {
      noteId: t.arg.int({ required: true }),
      color: t.arg({ type: NoteColorEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const note = await ctx.prisma.note.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.noteId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.note.update({
        ...query,
        where: { id: note.id },
        data: { color: args.color },
      });
    },
  }),
);
