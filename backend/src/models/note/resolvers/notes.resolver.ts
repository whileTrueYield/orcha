/**
 * Query resolver for fetching paginated Notes.
 *
 * Provides:
 *  - notes(colors, first, last, offset, sort, search): paginated note list
 *
 * Delegates to getPaginatedNotes helper for filtering and pagination.
 * Requires hasRole auth scope.
 */

import builder from "../../../schema/builder";
import { NoteColorEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";
import { PaginatedNotes } from "../entity";
import { getPaginatedNotes } from "../helper";

builder.queryField("notes", (t) =>
  t.field({
    type: PaginatedNotes,
    authScopes: { hasRole: true },
    args: {
      colors: t.arg({ type: [NoteColorEnum], required: false }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return getPaginatedNotes({
        organizationId: me.organizationId,
        ownerId: me.roleId,
        colors: args.colors ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      });
    },
  }),
);
