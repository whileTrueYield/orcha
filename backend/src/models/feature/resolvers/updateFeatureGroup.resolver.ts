/**
 * Mutation: updateFeatureGroup — update name/description of a feature group.
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

const UpdateFeatureGroupInput = builder.inputType("UpdateFeatureGroupInput", {
  fields: (t) => ({
    name: t.string({ required: false }),
    description: t.string({ required: false }),
  }),
});

builder.mutationField("updateFeatureGroup", (t) =>
  t.prismaField({
    type: "FeatureGroup",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      featureGroupId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateFeatureGroupInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
        where: {
          id: args.featureGroupId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      return ctx.prisma.featureGroup.update({
        ...query,
        where: { id: featureGroup.id },
        data: {
          name: args.input.name ?? undefined,
          description: args.input.description ?? undefined,
        },
      });
    },
  }),
);
