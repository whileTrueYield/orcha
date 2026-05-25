/**
 * Query resolver for fetching a single Tag by ID.
 *
 * Registers: Query.tag(id: Int!): Tag!
 *
 * Requires the caller to have a linked role (hasRole scope).
 * Scopes the lookup to the caller's organization.
 */

import builder from "../../../schema/builder";
import { TagRef } from "../entity";
import { PaginatedTickets } from "../../ticket/entity";
import { getPaginatedTickets } from "../../ticket/helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("tag", (t) =>
  t.prismaField({
    type: TagRef,
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.tag.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Computed field: tickets — paginated tickets with this tag
// ---------------------------------------------------------------------------

builder.prismaObjectField("Tag", "tickets", (t) =>
  t.field({
    type: PaginatedTickets,
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      offset: t.arg.int({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (tag, args) =>
      getPaginatedTickets({
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        sort: args.sort as any,
        offset: args.offset ?? undefined,
        search: args.search ?? undefined,
        tagId: tag.id,
        organizationId: tag.organizationId,
      }),
  }),
);
