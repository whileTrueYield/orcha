/**
 * Skill Pothos type registrations.
 *
 * Registers the PaginatedSkill wrapper type used by paginated skill queries.
 * The Skill Prisma object itself is registered elsewhere (or lazily by Pothos
 * when first referenced via `t.prismaField`).
 *
 * Exports: PaginatedSkills ref (for use in resolver return types).
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// Skill Prisma object — expose fields needed by the frontend
// ---------------------------------------------------------------------------

export const SkillRef = builder.prismaObject("Skill", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    value: t.exposeFloat("value"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    featureId: t.exposeInt("featureId"),
    roleId: t.exposeInt("roleId"),
    organization: t.relation("organization"),
    feature: t.relation("feature"),
    role: t.relation("role"),
    // SkillRating not exposed in the old schema
  }),
});

// ---------------------------------------------------------------------------
// PaginatedSkills — wraps Skill[] with totalCount + pageInfo
// ---------------------------------------------------------------------------

export const PaginatedSkills = createPaginatedType("Skills", SkillRef);
