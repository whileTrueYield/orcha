/**
 * Pothos type definitions for the Tag and PersonalTag models.
 *
 * Exports:
 *  - TagRef:               prismaObject for the Tag model
 *  - PersonalTagRef:       prismaObject for the PersonalTag model
 *  - MiniTagRef:           lightweight tag shape (id, name, color) for dropdowns
 *  - PaginatedTags:        paginated wrapper for Tag
 *  - PaginatedPersonalTags: paginated wrapper for PersonalTag
 *
 * Relation fields (organization, author, owner) are exposed via t.relation()
 * on the prismaObject so Pothos can optimise loading via query merging.
 *
 * Computed field resolvers (ticketCount) are defined inline because Pothos
 * collocates field definitions with their parent type.
 *
 * TODO: Once the ticket model is migrated to Pothos, add a `tickets`
 * paginated field resolver on TagRef that returns PaginatedTickets.
 */

import { ModelStage } from "@prisma/client";
import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// Tag — prismaObject
// ---------------------------------------------------------------------------

export const TagRef = builder.prismaObject("Tag", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    color: t.exposeString("color"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    replacedByTagId: t.exposeInt("replacedByTagId", { nullable: true }),
    replacedBy: t.relation("replacedBy", { nullable: true }),
    replacesTags: t.relation("replacesTags"),
    authorId: t.exposeInt("authorId", { nullable: true }),
    author: t.relation("author", { nullable: true }),

    ticketCount: t.int({
      resolve: async (tag, _args, ctx) =>
        ctx.prisma.ticket.count({
          where: {
            stage: ModelStage.PUBLISHED,
            project: {
              stage: ModelStage.PUBLISHED,
              ancestorIsArchived: false,
            },
            tags: { some: { id: tag.id } },
          },
        }),
    }),
  }),
});

// ---------------------------------------------------------------------------
// PersonalTag — prismaObject
// ---------------------------------------------------------------------------

export const PersonalTagRef = builder.prismaObject("PersonalTag", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    ownerId: t.exposeInt("ownerId"),
    owner: t.relation("owner"),
    replacedByTagId: t.exposeInt("replacedByTagId", { nullable: true }),
    replacedBy: t.relation("replacedBy", { nullable: true }),
    replacesTags: t.relation("replacesTags"),
  }),
});

// ---------------------------------------------------------------------------
// MiniTag — lightweight shape for dropdown lists
// ---------------------------------------------------------------------------

interface MiniTagShape {
  id: number;
  name: string;
  color: string;
}

export const MiniTagRef = builder.objectRef<MiniTagShape>("MiniTag");

builder.objectType(MiniTagRef, {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    color: t.exposeString("color"),
  }),
});

// ---------------------------------------------------------------------------
// Paginated wrappers
// ---------------------------------------------------------------------------

export const PaginatedTags = createPaginatedType("Tags", TagRef);
export const PaginatedPersonalTags = createPaginatedType(
  "PersonalTags",
  PersonalTagRef,
);
