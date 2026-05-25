/**
 * SearchResult Pothos type — custom (non-Prisma) object returned by
 * the full-text search queries.
 *
 * Exports: SearchResultRef (for use in resolver return types).
 */

import builder from "../../schema/builder";

// ---------------------------------------------------------------------------
// Shape interface — plain TS contract for the SearchResult type
// ---------------------------------------------------------------------------

interface SearchResultShape {
  id: string;
  name: string;
  description: string;
  meta: string;
}

// ---------------------------------------------------------------------------
// GraphQL object type
// ---------------------------------------------------------------------------

export const SearchResultRef =
  builder.objectRef<SearchResultShape>("SearchResult");

builder.objectType(SearchResultRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    meta: t.exposeString("meta"),
  }),
});
