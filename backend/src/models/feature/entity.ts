/**
 * Feature and FeatureGroup Pothos type definitions.
 *
 * Exports:
 *  - FeatureRef: prismaObject for Feature
 *  - FeatureGroupRef: prismaObject for FeatureGroup
 *  - MiniFeatureRef: lightweight Feature for fuzzy search
 *  - PaginatedFeatures / PaginatedFeatureGroups: paginated wrappers
 *  - featureGroupStatuses: all FeatureGroupStatus values
 *
 * Feature has no omitted fields.
 */

import { FeatureGroupStatus } from "@prisma/client";
import builder from "../../schema/builder";
import {
  FeatureGroupStatusEnum,
} from "../../schema/enums";
import { createPaginatedType } from "../../schema/pagination";

export const featureGroupStatuses = Object.values(FeatureGroupStatus);

// ---------------------------------------------------------------------------
// Feature prismaObject
// ---------------------------------------------------------------------------

export const FeatureRef = builder.prismaObject("Feature", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    featureGroupId: t.exposeInt("featureGroupId"),
    featureGroup: t.relation("featureGroup"),
    skills: t.relation("skills"),
    tickets: t.relation("tickets"),
    scheduleConfigs: t.relation("scheduleConfigs"),
    // Page model has no GraphQL type — not exposed in the old schema
  }),
});

// ---------------------------------------------------------------------------
// FeatureGroup prismaObject
// ---------------------------------------------------------------------------

export const FeatureGroupRef = builder.prismaObject("FeatureGroup", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    isActive: t.exposeBoolean("isActive"),
    description: t.exposeString("description", { nullable: true }),
    status: t.expose("status", { type: FeatureGroupStatusEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    productId: t.exposeInt("productId"),
    organization: t.relation("organization"),
    product: t.relation("product"),
    features: t.relation("features"),
  }),
});

// ---------------------------------------------------------------------------
// MiniFeature — lightweight shape for fuzzy search in the frontend
// ---------------------------------------------------------------------------

interface MiniFeatureShape {
  id: number;
  name: string;
  featureGroupName: string;
  productCode: string;
  productName: string;
}

export const MiniFeatureRef = builder.objectRef<MiniFeatureShape>("MiniFeature");
builder.objectType(MiniFeatureRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    featureGroupName: t.exposeString("featureGroupName"),
    productCode: t.exposeString("productCode"),
    productName: t.exposeString("productName"),
  }),
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedFeatures = createPaginatedType("Features", FeatureRef);
export const PaginatedFeatureGroups = createPaginatedType("FeatureGroups", FeatureGroupRef);
