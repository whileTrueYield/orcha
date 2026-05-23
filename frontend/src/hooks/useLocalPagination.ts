import { PaginationParams } from "components/views/Paginator";
import { useState } from "react";
import { SortDirection } from "types";

/**
 * A hook to generate pagination relying on a local state. Unlike the
 * `usePagination()` hook, this one does not rely on the URL's information
 * @param defaultValues
 */
export const useLocalPagination = (defaultValues?: PaginationParams) => {
  const pagination = {
    page: 0,
    pageSize: 10,
    search: "",
    sortDirection: "ASC" as SortDirection,
    sortBy: undefined,
    ...defaultValues,
  };

  const [page, setPage] = useState(pagination.page);
  const [pageSize, setPageSize] = useState(pagination.pageSize);
  const [sortBy, setSortBy] = useState(pagination.sortBy);
  const [sortDirection, setSortDirection] = useState(pagination.sortDirection);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    setSortBy,
    setSortDirection,
    sortBy,
    sortDirection,
  };
};
