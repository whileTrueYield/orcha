/**
 * Query resolver for listing an Organization's Repository links.
 *
 * Registers:
 *  - Query.repositoryLinks: [RepositoryLink!]!
 *
 * ADMIN/OWNER only and scoped to the caller's Organization, so links never leak
 * across tenants. Credential material is omitted by RepositoryLinkRef.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("repositoryLinks", (t) =>
  t.prismaField({
    type: ["RepositoryLink"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.repositoryLink.findMany({
        ...query,
        where: { organizationId: me.organizationId },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
);
