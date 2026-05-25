/**
 * Pothos type definitions for the Todo model.
 *
 * OMITTED FIELDS: checklist is NOT exposed per design decision.
 *
 * Exports:
 *  - TodoRef:        prismaObject for Todo
 *  - PaginatedTodos: paginated wrapper via createPaginatedType
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";

// ---------------------------------------------------------------------------
// Todo — prismaObject backed by the Prisma Todo model
// ---------------------------------------------------------------------------

export const TodoRef = builder.prismaObject("Todo", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    checked: t.exposeBoolean("checked"),
    body: t.exposeString("body"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    checkedAt: t.expose("checkedAt", { type: "DateTime", nullable: true }),
    dueDate: t.expose("dueDate", { type: "DateTime", nullable: true }),
    ownerId: t.exposeInt("ownerId"),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    owner: t.relation("owner"),
  }),
});

// ---------------------------------------------------------------------------
// PaginatedTodos — standard paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedTodos = createPaginatedType("Todos", TodoRef);
