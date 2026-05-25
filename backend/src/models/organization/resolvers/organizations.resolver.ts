/**
 * Query resolver for listing all Organisations (staff-only).
 *
 * Registers: Query.organizations(...): PaginatedOrganization
 *
 * Requires the isStaff scope — only platform staff can list all orgs.
 */

import builder from "../../../schema/builder";
import { PaginatedOrganizations } from "../entity";
import { getPaginatedOrganizations } from "../helper";

builder.queryField("organizations", (t) =>
  t.field({
    type: PaginatedOrganizations,
    authScopes: { isStaff: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args) =>
      getPaginatedOrganizations({
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: args.sort as any,
        search: args.search ?? undefined,
      }),
  }),
);
