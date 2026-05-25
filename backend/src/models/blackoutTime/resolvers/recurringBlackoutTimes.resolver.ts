/**
 * Queries: recurringBlackoutTimes, paginatedRecurringBlackoutTimes.
 */

import builder from "../../../schema/builder";
import { PaginatedRecurringBlackoutTimes } from "../entity";
import { getPaginatedRecurringBlackoutTimes } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("recurringBlackoutTimes", (t) =>
  t.prismaField({
    type: ["RecurringBlackoutTime"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      includeDisabled: t.arg.boolean({ required: false }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.recurringBlackoutTime.findMany({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          disabled: args.includeDisabled ? undefined : false,
        },
        include: { ...query.include, roles: true },
        orderBy: { startTime: "asc" },
      }),
  }),
);

builder.queryField("paginatedRecurringBlackoutTimes", (t) =>
  t.field({
    type: PaginatedRecurringBlackoutTimes,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      search: t.arg.string({ required: false }),
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      disabled: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedRecurringBlackoutTimes({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        search: args.search ?? undefined,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        disabled: args.disabled ?? undefined,
      }),
  }),
);
