/**
 * Query: miniRoles — lightweight role list for fuzzy search.
 */

import builder from "../../../schema/builder";
import { MiniRoleRef } from "../entity";
import { RoleStatus } from "@prisma/client";
import { AuthRoleContext } from "../../../types";

builder.queryField("miniRoles", (t) =>
  t.field({
    type: [MiniRoleRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) =>
      ctx.prisma.role.findMany({
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
        },
        select: {
          id: true,
          name: true,
          title: true,
          avatarUrl: true,
        },
      }),
  }),
);
