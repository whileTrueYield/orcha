export type SortDirection = "ASC" | "DESC";
/**
 * Pagination is represented on page response from
 * the backend.
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  sortBy?: string;
  sortDirection: SortDirection;
}

/**
 * Paginator is based on Pagination but represented in the
 * URL, therefore there is no place for the total attribute
 */
export type PaginationURL = Pick<
  Pagination,
  "page" | "pageSize" | "sortBy" | "sortDirection"
>;

export interface PaginationUrlParams {
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
}
