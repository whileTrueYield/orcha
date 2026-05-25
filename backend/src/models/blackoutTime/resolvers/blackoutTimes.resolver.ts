/**
 * Queries: blackoutTimes, paginatedBlackoutTimes.
 */

import builder from "../../../schema/builder";
import { PaginatedBlackoutTimes } from "../entity";
import { getPaginatedBlackoutTimes } from "../helper";
import { AuthRoleContext } from "../../../types";

builder.queryField("blackoutTimes", (t) =>
  t.prismaField({
    type: ["BlackoutTime"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.blackoutTime.findMany({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          stopAt: { gte: new Date() },
        },
        include: { ...query.include, roles: true },
      }),
  }),
);

builder.queryField("paginatedBlackoutTimes", (t) =>
  t.field({
    type: PaginatedBlackoutTimes,
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
      disabled: t.arg.boolean({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedBlackoutTimes({
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
