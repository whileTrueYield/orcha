/**
 * Feature mutation: updateFeature.
 *
 * Allows ADMIN/OWNER to rename a feature within a feature group.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateFeatureInput = builder.inputType("UpdateFeatureInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: updateFeature
// ---------------------------------------------------------------------------

builder.mutationField("updateFeature", (t) =>
  t.prismaField({
    type: "Feature",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      featureId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateFeatureInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const feature = await ctx.prisma.feature.findFirstOrThrow({
        where: {
          id: args.featureId,
          featureGroup: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        },
        include: { featureGroup: true },
      });

      return ctx.prisma.feature.update({
        ...query,
        where: { id: feature.id },
        data: { name: args.input.name },
      });
    },
  }),
);
