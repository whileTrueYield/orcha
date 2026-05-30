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
import { assertLength } from "../../../utils/validation";

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

      // Legacy contract: a note body, when provided, must be 1–2048 chars.
      if (args.input.body !== null && args.input.body !== undefined) {
        assertLength(args.input.body, 1, 2048, "body");
      }

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
