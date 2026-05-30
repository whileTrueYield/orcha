/**
 * Query resolver for listing the caller's own Personal Access Tokens.
 *
 * Registers:
 *  - Query.myApiTokens: [ApiToken!]!
 *
 * Scoped to the caller's Role, so a Role only ever sees the tokens it issued.
 * The hash is never exposed (see ApiTokenRef in ../entity).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("myApiTokens", (t) =>
  t.prismaField({
    type: ["PersonalAccessToken"],
    authScopes: { hasRole: true },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.personalAccessToken.findMany({
        ...query,
        where: { roleId: me.roleId },
        orderBy: { createdAt: "desc" },
      });
    },
  }),
);
