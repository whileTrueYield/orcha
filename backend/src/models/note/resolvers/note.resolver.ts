/**
 * Query resolvers for fetching a single Note.
 *
 * Provides:
 *  - note(id):    fetch a specific note by ID (scoped to org + owner)
 *  - lastNote:    fetch the most recent note for the current user
 *
 * Both require hasRole auth scope.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// note — fetch a single note by ID
// ---------------------------------------------------------------------------

builder.queryField("note", (t) =>
  t.prismaField({
    type: "Note",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // hasRole scope guarantees ctx.me is AuthRoleContext
      const me = ctx.me as AuthRoleContext;

      const note = await ctx.prisma.note.findFirst({
        ...query,
        where: {
          id: args.id,
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
      });

      if (!note) {
        throw new GraphQLError(
          "This note does not exist or has been deleted",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      return note;
    },
  }),
);

// ---------------------------------------------------------------------------
// lastNote — fetch the most recent note for the current user
// ---------------------------------------------------------------------------

builder.queryField("lastNote", (t) =>
  t.prismaField({
    type: "Note",
    nullable: true,
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.note.findFirst({
        ...query,
        where: {
          organizationId: me.organizationId,
          ownerId: me.roleId,
        },
        orderBy: { id: "desc" },
      });
    },
  }),
);
