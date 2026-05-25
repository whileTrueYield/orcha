/**
 * Query resolver for listing the caller's personal tags (paginated).
 *
 * Registers: Query.personalTags(...): PaginatedPersonalTag
 *
 * Requires a linked role. Scoped to the caller's organisation
 * and owned by the caller's role.
 */

import builder from "../../../schema/builder";
import { PaginatedPersonalTags } from "../entity";
import { getPaginatedPersonalTags } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("personalTags", (t) =>
  t.field({
    type: PaginatedPersonalTags,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedPersonalTags({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        ownerId: (ctx.me as AuthRoleContext).roleId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);
