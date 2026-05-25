/**
 * Query: featureGroups — paginated feature groups list.
 */

import builder from "../../../schema/builder";
import { PaginatedFeatureGroups } from "../entity";
import { getPaginatedFeatureGroups } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("featureGroups", (t) =>
  t.field({
    type: PaginatedFeatureGroups,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      productId: t.arg.int({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedFeatureGroups({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        productId: args.productId ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
      }),
  }),
);
