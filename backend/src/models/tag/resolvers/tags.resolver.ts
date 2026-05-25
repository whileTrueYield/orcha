/**
 * Query resolvers for listing tags.
 *
 * Registers:
 *  - Query.tags(...): PaginatedTag   — paginated list of org tags
 *  - Query.miniTags: [MiniTag!]!     — lightweight list for dropdowns
 *
 * Both require a linked role (hasRole scope) and are scoped
 * to the caller's organization.
 */

import builder from "../../../schema/builder";
import { MiniTagRef, PaginatedTags } from "../entity";
import { getPaginatedTags } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("tags", (t) =>
  t.field({
    type: PaginatedTags,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedTags({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);

builder.queryField("miniTags", (t) =>
  t.field({
    type: [MiniTagRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) =>
      ctx.prisma.tag.findMany({
        where: { organizationId: (ctx.me as AuthRoleContext).organizationId },
        select: { id: true, name: true, color: true },
        orderBy: { name: "asc" },
      }),
  }),
);
