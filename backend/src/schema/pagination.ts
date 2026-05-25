/**
 * Pagination types and factory for the Pothos GraphQL schema.
 *
 * Provides:
 *  - `PageInfo` object type (hasNextPage, hasPreviousPage, pageNumber, etc.)
 *  - `createPaginatedType(name, nodeRef)` factory that wraps any object ref
 *    in a standard paginated response (nodes + totalCount + pageInfo)
 *
 * The runtime pagination logic (`paginateNodes`) lives in `../utils/pagination.ts`
 * and is unchanged — only the GraphQL type definitions moved here.
 *
 * Exports: PageInfo ref, createPaginatedType factory.
 */

import builder from "./builder";

// ---------------------------------------------------------------------------
// PageInfo — metadata about the current page of results
// ---------------------------------------------------------------------------

export const PageInfo = builder.simpleObject("PageInfo", {
  fields: (t) => ({
    hasNextPage: t.boolean({}),
    hasPreviousPage: t.boolean({}),
    pageNumber: t.int({}),
    pageCount: t.int({}),
    pageSize: t.int({}),
    endCursor: t.int({ nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// createPaginatedType — produces a `Paginated<Name>` wrapper type
//
// Usage:
//   const PaginatedTickets = createPaginatedType("Ticket", TicketRef);
//
// This generates a type like:
//   type PaginatedTicket {
//     nodes: [Ticket!]!
//     totalCount: Int!
//     pageInfo: PageInfo!
//   }
// ---------------------------------------------------------------------------

// We accept `any` for the node ref because Pothos ref types are heavily
// generic and vary by how the object was created (prismaObject vs simpleObject
// vs objectType). Constraining this more tightly would force every caller to
// carry the full SchemaTypes generic through, which adds noise without safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createPaginatedType(name: string, nodeRef: any) {
  return builder.simpleObject(`Paginated${name}`, {
    fields: (t) => ({
      nodes: t.field({ type: [nodeRef], nullable: false }),
      totalCount: t.int({}),
      pageInfo: t.field({ type: PageInfo, nullable: false }),
    }),
  });
}
