/**
 * Pagination runtime helpers.
 *
 * The GraphQL type definitions (PageInfo, PaginatedType) now live in
 * `../schema/pagination.ts`. This file keeps only the plain TS interfaces
 * and the `paginateNodes` function that resolvers call at runtime.
 *
 * Exports: PageInfoShape, FilterOption, PaginateNodeArgs, paginateNodes, GetPageArgsFor.
 */

// TODO: FilterOption was a TypeGraphQL @InputType. Pothos input types will be
// defined inline in resolver files during later migration slices.
export interface FilterOption {
  first?: number;
  last?: number;
  offset?: number;
}

interface PaginateNodeArgs<T> {
  pageSize: number;
  offset: number;
  nodes: T[];
  count: number;
}

export const paginateNodes = <T extends { id: number }>(
  args: PaginateNodeArgs<T>
) => {
  const { pageSize, offset, nodes, count } = args;

  const hasNextPage = nodes.length == pageSize;
  const hasPreviousPage = offset > 0;
  return {
    nodes,
    totalCount: count,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      pageNumber: Math.floor(offset / pageSize),
      pageSize: pageSize,
      pageCount: Math.ceil(count / pageSize),
      endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : null,
    },
  };
};

// Commonly used arguments for get pages found
// in repository. This is defined here because it
// is expected to define the interface of all the
// get many API (get questions, get comments....)
// and should remain constant and familiar
// across the board
export interface GetPageArgsFor<T> {
  first?: number;
  last?: number;
  offset?: number;
  sort?: keyof T;
  search?: string;
  cursor?: number;
}
