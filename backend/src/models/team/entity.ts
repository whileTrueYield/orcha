/**
 * Pothos type definitions for the Team model.
 *
 * Exports:
 *  - TeamRef:         prismaObject for the Team model
 *  - PaginatedTeams:  paginated wrapper for Team
 *
 * Computed field `memberIds` is defined inline because Pothos
 * collocates field definitions with their parent type.
 *
 * TODO: Once the role model is migrated to Pothos, add a `members`
 * paginated field resolver that returns PaginatedRoles.
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// Team — prismaObject
// ---------------------------------------------------------------------------

export const TeamRef = builder.prismaObject("Team", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    code: t.exposeString("code"),
    coverUrl: t.exposeString("coverUrl", { nullable: true }),
    description: t.exposeString("description", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    members: t.relation("members"),

    memberIds: t.intList({
      resolve: async (team, _args, ctx) => {
        const roles = await ctx.prisma.role.findMany({
          select: { id: true },
          where: { teams: { some: { id: team.id } } },
        });
        return roles.map((r) => r.id);
      },
    }),
  }),
});

// ---------------------------------------------------------------------------
// Paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedTeams = createPaginatedType("Teams", TeamRef);
