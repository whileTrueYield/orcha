/**
 * Mutation resolver for revoking a connected client (an OAuth grant).
 *
 * Registers:
 *  - Mutation.revokeOAuthGrant(familyId): OAuthGrant!
 *
 * Revokes by familyId, the grant's identity. Tenant-scoped to the caller's Role
 * + Organization: a family that is not theirs reads as not-found (never
 * forbidden), so one tenant cannot probe another's grants. The revoke kills the
 * whole chain — every live access AND refresh token — so the client immediately
 * loses access and cannot refresh.
 */

import { GraphQLError } from "graphql";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { revokeGrant, GrantNotFoundError } from "../../../mcp/oauth/grants";
import { OAuthGrantRef } from "../entity";

builder.mutationField("revokeOAuthGrant", (t) =>
  t.field({
    type: OAuthGrantRef,
    authScopes: { hasRole: true },
    args: {
      familyId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      try {
        return await revokeGrant({
          familyId: args.familyId,
          organizationId: me.organizationId,
          roleId: me.roleId,
        });
      } catch (caught) {
        // Not the caller's grant (or already gone): surface as not-found, the
        // same opaque answer the PAT revoke gives for another tenant's token.
        if (caught instanceof GrantNotFoundError) {
          throw new GraphQLError("Connected app not found");
        }
        throw caught;
      }
    },
  }),
);
