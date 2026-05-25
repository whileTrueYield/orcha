/**
 * Queries: roles (paginated), myRoles (user's roles across orgs).
 */

import builder from "../../../schema/builder";
import { PaginatedRoles } from "../entity";
import { getPaginatedRoles } from "../helper";
import { OrganizationStatus, RoleStatus } from "@prisma/client";
import { AuthRoleContext, AuthUserContext } from "../../../types";

builder.queryField("roles", (t) =>
  t.field({
    type: PaginatedRoles,
    authScopes: { hasRole: true },
    args: {
      first: t.arg.int({ required: false }),
      last: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      sort: t.arg.string({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: (_root, args, ctx) =>
      getPaginatedRoles({
        organizationId: (ctx.me as AuthRoleContext).organizationId,
        first: args.first ?? undefined,
        last: args.last ?? undefined,
        offset: args.offset ?? undefined,
        sort: (args.sort as any) ?? undefined,
        search: args.search ?? undefined,
      }),
  }),
);

builder.queryField("myRoles", (t) =>
  t.prismaField({
    type: ["Role"],
    authScopes: { isAuthenticated: true },
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.role.findMany({
        ...query,
        where: {
          userId: (ctx.me as AuthUserContext).userId,
          status: { in: [RoleStatus.ACCEPTED, RoleStatus.INVITED] },
          organization: { status: OrganizationStatus.ACTIVE },
        },
        include: { ...query.include, organization: true },
        orderBy: { organization: { name: "asc" } },
      }),
  }),
);
