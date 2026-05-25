/**
 * Query: reports — paginated reports list.
 */

import builder from "../../../schema/builder";
import { PaginatedReports } from "../entity";
import { ModelStageEnum } from "../../../schema/enums";
import { getPaginatedReports } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("reports", (t) =>
  t.field({
    type: PaginatedReports,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      stages: t.arg({ type: [ModelStageEnum], required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedReports({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
        stages: args.stages ?? undefined,
      }),
  }),
);
