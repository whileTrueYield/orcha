import React from "react";
import { range } from "lodash";
import cn from "classnames";
import { getFirstFromQuery } from "utils";
import "./Paginator.css";
import { defaultPagination } from "config";
import { Pagination, PaginationURL } from "types";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid";
import { ClockIcon } from "@heroicons/react/outline";

interface Props extends Pagination {
  isLoading: boolean;
  setPage: (page: number) => any;
  itemCount: number;
  itemName: string;
  header?: string | React.ReactNode;
  className?: string;
  edges?: boolean;
  small?: boolean;
}

export const Paginator: React.FC<Props> = (props) => {
  const { page, small, isLoading, total, pageSize, itemCount, edges } = props;
  const maxPages = Math.ceil(total / pageSize);

  let fromPage = Math.max(0, page - 2);
  let toPage = Math.min(page + 3, maxPages);

  // we want to display at least 5 pages (or the max number of pages)
  const pagesToDisplay = Math.min(5, maxPages);

  // if we could display more pages
  if (toPage - fromPage < pagesToDisplay) {
    // if we're already maxed out on the fromPage, we'll have to increase toPage
    if (fromPage === 0) {
      toPage = pagesToDisplay;
    }
    if (toPage === maxPages) {
      fromPage = toPage - pagesToDisplay;
    }
  }

  const pages = range(fromPage, toPage);

  const setPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber !== page && pageNumber < maxPages) {
      props.setPage(pageNumber);
    }
  };

  if (!total && !isLoading) {
    return null;
  }

  const hasPreviousPages = page > 0 && maxPages > 0;
  const hasNextPages = page < maxPages - 1;
  const hasPages = hasPreviousPages || hasNextPages;

  const previousClasses = cn(
    "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md bg-white focus:outline-none transition ease-in-out duration-150",
    {
      "text-gray-700 hover:text-gray-500 focus:ring-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700":
        hasPreviousPages,
      "opacity-0": !hasPreviousPages,
    }
  );

  const nextClasses = cn(
    "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md bg-white focus:outline-none transition ease-in-out duration-150",
    {
      "text-gray-700 hover:text-gray-500 focus:ring-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700":
        hasNextPages,
      "opacity-0": !hasNextPages,
    }
  );

  const currentPageClasses =
    "-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-brand-100 text-sm leading-5 font-bold text-brand-800 focus:z-10 focus:outline-none cursor-default bg-brand-100";
  const otherPageClasses =
    "-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:ring-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150";

  const nextButtonClasses = cn(
    "-ml-px relative inline-flex items-center border border-gray-300 bg-white text-sm leading-5 font-medium transition ease-in-out duration-150 focus:outline-none",
    {
      "text-gray-500 hover:text-gray-400 focus:z-10 focus:border-blue-300 focus:ring-blue active:bg-gray-100 active:text-gray-500":
        hasNextPages,
      "text-gray-300 bg-gray-50 cursor-not-allowed": !hasNextPages,
      "rounded-r-md": !edges,
      "p-2": !small,
      "py-1 px-1.5": small,
    }
  );

  const previousButtonClasses = cn(
    "-ml-px relative inline-flex items-center border border-gray-300 bg-white text-sm leading-5 font-medium transition ease-in-out duration-150 focus:outline-none",
    {
      "text-gray-500 hover:text-gray-400 focus:z-10 focus:border-blue-300 focus:ring-blue active:bg-gray-100 active:text-gray-500":
        hasPreviousPages,
      "text-gray-300 bg-gray-50 cursor-not-allowed": !hasPreviousPages,
      "rounded-l-md": !edges,
      "p-2": !small,
      "py-1 px-1.5": small,
    }
  );

  const firstButtonClasses = cn(
    "-ml-px relative rounded-l-md inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium transition ease-in-out duration-150 focus:outline-none",
    {
      "text-gray-500 hover:text-gray-400 focus:z-10 focus:border-blue-300 focus:ring-blue active:bg-gray-100 active:text-gray-500":
        hasPreviousPages,
      "text-gray-300 bg-gray-50 cursor-not-allowed": !hasPreviousPages,
    }
  );

  const lastButtonClasses = cn(
    "-ml-px relative rounded-r-md inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium transition ease-in-out duration-150 focus:outline-none",
    {
      "text-gray-500 hover:text-gray-400 focus:z-10 focus:border-blue-300 focus:ring-blue active:bg-gray-100 active:text-gray-500":
        hasNextPages,
      "text-gray-300 bg-gray-50 cursor-not-allowed": !hasNextPages,
    }
  );

  const firstButton = (
    <button
      type="button"
      onClick={() => setPage(0)}
      className={firstButtonClasses}
    >
      <ChevronDoubleLeftIcon className="h-5 w-5" />
    </button>
  );

  const lastButton = (
    <button
      type="button"
      onClick={() => setPage(maxPages - 1)}
      className={lastButtonClasses}
    >
      <ChevronDoubleRightIcon className="h-5 w-5" />
    </button>
  );

  const nextButton = (
    <button
      type="button"
      onClick={() => setPage(page + 1)}
      className={nextButtonClasses}
    >
      <ChevronRightIcon className="h-5 w-5" />
    </button>
  );

  const previousButton = (
    <button
      type="button"
      className={previousButtonClasses}
      onClick={() => setPage(page > 0 ? page - 1 : 0)}
    >
      <ChevronLeftIcon className="h-5 w-5" />
    </button>
  );

  const resultDetail = (
    <p className="text-sm leading-5 text-gray-700">
      Showing
      <span className="font-medium"> {page * pageSize + 1} </span>
      to
      <span className="font-medium"> {page * pageSize + itemCount} </span>
      of
      <span className="font-medium"> {total} </span>
      {total === 1 ? props.itemName : `${props.itemName}s`}
    </p>
  );

  const mobilePageContainerClass = cn(
    "flex-1 flex justify-between items-center sm:hidden",
    { hidden: !hasPages }
  );

  const pageContainerClass = cn({ hidden: !hasPages });

  if (small) {
    return (
      <div className={props.className}>
        <div className="flex flex-1 items-center justify-between">
          {previousButton}
          {nextButton}
        </div>
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className={mobilePageContainerClass}>
        <span onClick={() => setPage(page - 1)} className={previousClasses}>
          Previous
        </span>
        <span className="text-center">
          {isLoading && !props.header ? (
            <span className="anim:loading-appear block text-sm leading-5 text-gray-500">
              <ClockIcon className="mr-1 inline-block h-4 w-4 align-text-top text-gray-400" />
              Still loading...
            </span>
          ) : (
            props.header
          )}
        </span>

        <span onClick={() => setPage(page + 1)} className={nextClasses}>
          Next
        </span>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          {props.header ? props.header : itemCount ? resultDetail : "0 results"}
        </div>
        {isLoading && !props.header ? (
          <span className="anim:loading-appear block text-sm leading-5 text-gray-500">
            <ClockIcon className="mr-1 inline-block h-4 w-4 align-text-top text-gray-400" />
            Still loading...
          </span>
        ) : null}
        <div className={pageContainerClass}>
          <span className="relative z-0 inline-flex shadow-sm">
            {props.edges ? firstButton : null}
            {previousButton}
            {pages.map((pageNumber) => (
              <button
                key={`page-${pageNumber}`}
                type="button"
                className={
                  page === pageNumber ? currentPageClasses : otherPageClasses
                }
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber + 1}
              </button>
            ))}
            {nextButton}
            {props.edges ? lastButton : null}
          </span>
        </div>
      </div>
    </div>
  );
};

export type PaginationParams = Partial<PaginationURL>;

/**
 * Return the pagination object from the URL
 */
export function getPaginationFromUrl(
  defaultValues?: PaginationParams
): PaginationURL {
  const pageStr = getFirstFromQuery(window.location.href, "page", "0");
  const page = parseInt(pageStr);

  const pageSizeStr = getFirstFromQuery(window.location.href, "pageSize", "");
  const pageSize = parseInt(pageSizeStr);

  const sortBy = getFirstFromQuery(window.location.href, "sortBy");

  const sortDirection = getFirstFromQuery(
    window.location.href,
    "sortDirection"
  );

  const pagination: PaginationParams = { ...defaultValues };

  if (pageSize && !isNaN(pageSize)) {
    pagination.pageSize = pageSize;
  }

  if (page && !isNaN(page)) {
    pagination.page = page;
  }

  if (sortBy) {
    pagination.sortBy = sortBy;
  }

  if (sortDirection && (sortDirection === "ASC" || sortDirection === "DESC")) {
    pagination.sortDirection = sortDirection;
  }

  return {
    ...defaultPagination,
    ...pagination,
  };
}
