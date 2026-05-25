/**
 * Query: recurringBlackoutTime — single recurring blackout time by ID.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("recurringBlackoutTime", (t) =>
  t.prismaField({
    type: "RecurringBlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.recurringBlackoutTime.findFirstOrThrow({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.id,
        },
      }),
  }),
);
