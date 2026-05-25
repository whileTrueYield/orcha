/**
 * FeatureFlag query — returns (or creates) the feature flag for the user's org.
 *
 * Exports: none (side-effect: registers `featureFlag` query on the builder).
 *
 * Assumes the caller is linked to an organization (hasRole auth scope).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

builder.queryField("featureFlag", (t) =>
  t.prismaField({
    type: "FeatureFlag",
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;

      const featureFlag = await ctx.prisma.featureFlag.findUnique({
        ...query,
        where: { organizationId: me.organizationId },
      });

      if (featureFlag) {
        return featureFlag;
      }

      // Lazily create the feature flag record when the org doesn't have one yet.
      return ctx.prisma.featureFlag.create({
        ...query,
        data: { organizationId: me.organizationId },
      });
    },
  }),
);
