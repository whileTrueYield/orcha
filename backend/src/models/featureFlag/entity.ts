/**
 * FeatureFlag Pothos type registration.
 *
 * Registers the FeatureFlag Prisma object so it can be referenced
 * by the featureFlag resolver via `t.prismaField({ type: "FeatureFlag" })`.
 *
 * Exports: FeatureFlagRef.
 */

import builder from "../../schema/builder";

export const FeatureFlagRef = builder.prismaObject("FeatureFlag", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    documentation: t.exposeBoolean("documentation"),
    support: t.exposeBoolean("support"),
    report: t.exposeBoolean("report"),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
  }),
});
