/**
 * Query resolver for listing Teams (paginated).
 *
 * Registers: Query.teams(...): PaginatedTeam
 *
 * Requires any linked role. Scoped to the caller's organisation.
 */

import builder from "../../../schema/builder";
import { PaginatedTeams } from "../entity";
import { getPaginatedTeams } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("teams", (t) =>
  t.field({
    type: PaginatedTeams,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedTeams({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);
