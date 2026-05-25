/**
 * Pothos type definitions for the Note model.
 *
 * Exports:
 *  - NoteRef:           prismaObject for Note (all Prisma fields + relations)
 *  - PaginatedNotes:    paginated wrapper via createPaginatedType
 *
 * Relations (organization, owner) are exposed as lazy relations so Pothos
 * can batch-load them via the Prisma plugin when requested.
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import { NoteColorEnum } from "../../schema/enums";

// ---------------------------------------------------------------------------
// Note — prismaObject backed by the Prisma Note model
// ---------------------------------------------------------------------------

export const NoteRef = builder.prismaObject("Note", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    body: t.exposeString("body"),
    color: t.expose("color", { type: NoteColorEnum }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    ownerId: t.exposeInt("ownerId"),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    owner: t.relation("owner"),
  }),
});

// ---------------------------------------------------------------------------
// PaginatedNotes — standard paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedNotes = createPaginatedType("Notes", NoteRef);
