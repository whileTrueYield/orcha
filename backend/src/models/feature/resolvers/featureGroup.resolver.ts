/**
 * FeatureGroup queries and mutations:
 *  - featureGroup (query by ID)
 *  - addFeature (mutation)
 *  - deleteFeature (mutation)
 */

import builder from "../../../schema/builder";
import { trim } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: featureGroup
// ---------------------------------------------------------------------------

builder.queryField("featureGroup", (t) =>
  t.prismaField({
    type: "FeatureGroup",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.featureGroup.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addFeature
// ---------------------------------------------------------------------------

builder.mutationField("addFeature", (t) =>
  t.prismaField({
    type: "FeatureGroup",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      featureGroupId: t.arg.int({ required: true }),
      name: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const featureGroup = await ctx.prisma.featureGroup.findFirstOrThrow({
        where: {
          id: args.featureGroupId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      await ctx.prisma.feature.create({
        data: {
          name: trim(args.name),
          featureGroupId: featureGroup.id,
        },
      });

      return ctx.prisma.featureGroup.findUniqueOrThrow({
        ...query,
        where: { id: featureGroup.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: deleteFeature
// ---------------------------------------------------------------------------

builder.mutationField("deleteFeature", (t) =>
  t.prismaField({
    type: "FeatureGroup",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      featureId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const feature = await ctx.prisma.feature.findFirstOrThrow({
        where: {
          id: args.featureId,
          featureGroup: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
          },
        },
      });

      await ctx.prisma.feature.delete({ where: { id: args.featureId } });

      return ctx.prisma.featureGroup.findUniqueOrThrow({
        ...query,
        where: { id: feature.featureGroupId },
      });
    },
  }),
);
