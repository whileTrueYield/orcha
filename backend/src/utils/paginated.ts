/**
 * Pagination type definitions (legacy).
 *
 * These were TypeGraphQL @ObjectType classes used by the old schema.
 * The Pothos schema defines its own PageInfo and paginated wrapper in
 * `schema/pagination.ts`. These plain interfaces are kept only for
 * type compatibility with helper code that still references them.
 *
 * Exports: PageInfo, withPagination.
 */

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageCount: number;
  pageSize: number;
  endCursor: number;
}

// TODO: withPagination was a TypeGraphQL mixin that dynamically extended
// a class with totalCount and pageInfo fields. In Pothos, pagination is
// handled via the schema/pagination.ts module. This is kept for backward
// compatibility with existing entity types that extend it.
type Constructor<T = {}> = new (...args: any[]) => T;

export default function withPagination<TBase extends Constructor>(
  BaseClass: TBase,
) {
  return class PaginationTrait extends BaseClass {
    totalCount!: number;
    pageInfo!: PageInfo;
  };
}
