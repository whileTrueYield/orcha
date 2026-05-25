/**
 * Pothos type definitions for the Product model.
 *
 * Exports:
 *  - ProductRef:        prismaObject for Product
 *  - MiniProductRef:    lightweight product shape (id, name, stage)
 *  - PaginatedProducts: paginated wrapper for Product
 *
 * Computed field `workflowIds` is defined inline because Pothos
 * collocates field definitions with their parent type.
 *
 * TODO: Once ticket, workflow, and feature models are migrated to Pothos,
 * add paginated field resolvers for tickets, workflows, featureGroups,
 * and features.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import { ModelStageEnum } from "../../schema/enums";

// ---------------------------------------------------------------------------
// Product — prismaObject
// ---------------------------------------------------------------------------

export const ProductRef = builder.prismaObject("Product", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    description: t.exposeString("description", { nullable: true }),
    coverUrl: t.exposeString("coverUrl", { nullable: true }),
    isSupportActive: t.exposeBoolean("isSupportActive"),
    isUsingDefaultWorkflows: t.exposeBoolean("isUsingDefaultWorkflows"),
    stage: t.expose("stage", { type: ModelStageEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    featureGroups: t.relation("featureGroups"),
    workflows: t.relation("workflows"),

    workflowIds: t.intList({
      resolve: async (product, _args, ctx) => {
        const rows = await ctx.prisma.workflow.findMany({
          where: {
            products: { some: { id: product.id } },
            stage: { not: ModelStage.DELETED },
          },
          select: { id: true },
        });
        return rows.map((r) => r.id);
      },
    }),
  }),
});

// ---------------------------------------------------------------------------
// MiniProduct — lightweight shape for dropdown lists
// ---------------------------------------------------------------------------

interface MiniProductShape {
  id: number;
  name: string;
  stage: ModelStage;
}

export const MiniProductRef =
  builder.objectRef<MiniProductShape>("MiniProduct");

builder.objectType(MiniProductRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    stage: t.field({ type: ModelStageEnum, resolve: (p) => p.stage }),
  }),
});

// ---------------------------------------------------------------------------
// Paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedProducts = createPaginatedType("Products", ProductRef);
