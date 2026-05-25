/**
 * Mutation resolver for creating a Note.
 *
 * Provides:
 *  - createNote(input): creates a new note for the current user/org
 *
 * Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateNoteInput = builder.inputType("CreateNoteInput", {
  fields: (t) => ({
    body: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// createNote mutation
// ---------------------------------------------------------------------------

builder.mutationField("createNote", (t) =>
  t.prismaField({
    type: "Note",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateNoteInput, required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.note.create({
        ...query,
        data: {
          body: args.input.body ?? "",
          ownerId: me.roleId,
          organizationId: me.organizationId,
        },
      });
    },
  }),
);
