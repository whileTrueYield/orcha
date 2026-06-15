/**
 * Query resolver for listing the caller's connected clients (OAuth grants).
 *
 * Registers:
 *  - Query.myOAuthGrants: [OAuthGrant!]!
 *
 * Scoped to the caller's Role + Organization, so a Role only ever sees the
 * clients it consented to. The work lives in mcp/oauth/grants (a grant is a
 * familyId, not a row); this is just the authenticated GraphQL seam over it.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { listGrants } from "../../../mcp/oauth/grants";
import { OAuthGrantRef } from "../entity";

builder.queryField("myOAuthGrants", (t) =>
  t.field({
    type: [OAuthGrantRef],
    authScopes: { hasRole: true },
    resolve: (_root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      return listGrants({
        organizationId: me.organizationId,
        roleId: me.roleId,
      });
    },
  }),
);
