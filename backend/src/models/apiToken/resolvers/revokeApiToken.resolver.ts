/**
 * Mutation resolver for revoking a Personal Access Token.
 *
 * Registers:
 *  - Mutation.revokeApiToken(id): ApiToken!
 *
 * A Role may revoke its own tokens; an ADMIN or OWNER may revoke any token in
 * their Organization. The token is only ever looked up within the caller's
 * Organization, so tokens in other tenants are invisible (reported as
 * not-found rather than forbidden).
 */

import { GraphQLError } from "graphql";
import { RoleType } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.mutationField("revokeApiToken", (t) =>
  t.prismaField({
    type: "PersonalAccessToken",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const token = await ctx.prisma.personalAccessToken.findFirst({
        where: { id: args.id, organizationId: me.organizationId },
      });

      if (!token) {
        throw new GraphQLError("Token not found");
      }

      const isOwner = token.roleId === me.roleId;
      const isOrgAdmin =
        me.roleType === RoleType.ADMIN || me.roleType === RoleType.OWNER;

      if (!isOwner && !isOrgAdmin) {
        throw new GraphQLError("You can only revoke your own tokens");
      }

      return ctx.prisma.personalAccessToken.update({
        ...query,
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });
    },
  }),
);
