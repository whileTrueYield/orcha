/**
 * Query: timeOffs — list time-off entries within a date range.
 *
 * Registers: Query.timeOffs(fromDate, toDate): [TimeOff]
 *
 * Auth: hasRole (any linked user).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("timeOffs", (t) =>
  t.prismaField({
    type: ["TimeOff"],
    authScopes: { hasRole: true },
    args: {
      fromDate: t.arg({ type: "DateTime", required: true }),
      toDate: t.arg({ type: "DateTime", required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.timeOff.findMany({
        ...query,
        where: {
          roleId: me.roleId,
          organizationId: me.organizationId,
          startAt: { lte: args.toDate },
          stopAt: { gte: args.fromDate },
        },
      });
    },
  }),
);
