import {
  getPaginationFromUrl,
  PaginationParams,
} from "components/views/Paginator";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

/**
 * A Hook to configure pagination params using the URL params. This method
 * also insert default values in the URL if none are found.
 * @param defaultValues
 */
export const usePagination = (defaultValues?: PaginationParams) => {
  const history = useHistory();
  const { location } = history;
  const pagination = getPaginationFromUrl(defaultValues);

  const [page, setPage] = useState(pagination.page);
  const [pageSize, setPageSize] = useState(pagination.pageSize);
  const [sortBy, setSortBy] = useState(pagination.sortBy);
  const [sortDirection, setSortDirection] = useState(pagination.sortDirection);
  const [search, setSearch] = useState(history.location.search);

  // when the location in the URL changes
  useEffect(() => {
    if (location.search !== search) {
      const pagination = getPaginationFromUrl();
      setPage(pagination.page);
      setPageSize(pagination.pageSize);
      setSortBy(pagination.sortBy);
      setSortDirection(pagination.sortDirection);
    }
  }, [search, location]);

  // when any parameter are programmatically changed update the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const hasPagination = searchParams.has("page");

    searchParams.set("page", page.toString());
    searchParams.set("pageSize", pageSize.toString());
    if (sortBy) {
      searchParams.set("sortBy", sortBy);
    } else {
      searchParams.delete("sortBy");
    }
    if (sortDirection) {
      searchParams.set("sortDirection", sortDirection);
    } else {
      searchParams.delete("sortDirection");
    }

    const newSearch = "?" + searchParams.toString();

    // we don't want to add a page to the history if we are filling
    // the url with search for the first time
    if (!hasPagination) {
      history.replace(newSearch);
    } else if (newSearch !== history.location.search) {
      history.push(newSearch);
    }
    setSearch(newSearch);
  }, [history, page, pageSize, sortBy, sortDirection]);

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
