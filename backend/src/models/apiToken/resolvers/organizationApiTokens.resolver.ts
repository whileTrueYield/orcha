/**
 * Query resolver for the Organization-wide Personal Access Token list.
 *
 * Registers:
 *  - Query.organizationApiTokens: [ApiToken!]!
 *
 * Restricted to ADMIN/OWNER, for offboarding and auditing. Returns every
 * token issued under the caller's Organization, regardless of which Role
 * created it. The hash is never exposed.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("organizationApiTokens", (t) =>
  t.prismaField({
    type: ["PersonalAccessToken"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.personalAccessToken.findMany({
        ...query,
        where: { organizationId: me.organizationId },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
);
