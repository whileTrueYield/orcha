/**
 * Query: blackoutTime — single blackout time by ID.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("blackoutTime", (t) =>
  t.prismaField({
    type: "BlackoutTime",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.blackoutTime.findFirstOrThrow({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.id,
        },
      }),
  }),
);
