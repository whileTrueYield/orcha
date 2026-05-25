/**
 * Query resolver for fetching the caller's current Organisation.
 *
 * Registers: Query.organization: Organization!
 *
 * Requires any linked role. Returns the organisation the caller
 * is currently linked to via their role.
 */

import builder from "../../../schema/builder";
import { OrganizationRef } from "../entity";
import { AuthRoleContext } from "../../../types";

builder.queryField("organization", (t) =>
  t.prismaField({
    type: OrganizationRef,
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.organization.findUniqueOrThrow({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).organizationId },
      }),
  }),
);
