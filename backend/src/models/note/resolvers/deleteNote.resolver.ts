/**
 * Mutation resolver for deleting a Note.
 *
 * Provides:
 *  - deleteNote(noteId): deletes a note owned by the current user
 *
 * Requires hasRole auth scope. Verifies org + owner before deleting.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("deleteNote", (t) =>
  t.prismaField({
    type: "Note",
    authScopes: { hasRole: true },
    args: {
      noteId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const note = await ctx.prisma.note.findFirstOrThrow({
        where: {
          id: args.noteId,
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
      });

      return ctx.prisma.note.delete({ ...query, where: { id: note.id } });
    },
  }),
);
