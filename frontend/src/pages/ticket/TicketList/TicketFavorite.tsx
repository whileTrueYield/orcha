import React, { useState, useCallback } from "react";
import { get, map } from "lodash";
import { TicketFavoriteRow } from "./TicketFavoriteRow";
import { useRouteMatch } from "react-router-dom";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { QueryTicketsArgs, Ticket } from "types/graphql";
import { SearchIcon, TicketIcon } from "@heroicons/react/outline";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ViewListIcon,
} from "@heroicons/react/solid";
import { useSelector } from "react-redux";
import { getTicketFilter } from "reducers/selector";
import { TicketListFilter } from "types";
import { useAppDispatch } from "store";
import { TicketFilterTags } from "./TicketFilterTags";
import { formatDateFilter } from "components/ListFilter/DateFilterTag";
import { TicketFilterButton } from "./TicketFilterButton";
import { TicketFieldButton } from "./TicketFieldButton";
import cn from "classnames";
import { usePageTitle } from "hooks/usePageTitle";
import { showTicketEditModal } from "actions";
import { QueryReturnValue } from "types/queryTypes";

const GET_TICKETS = gql`
  query GetFavoriteTickets(
    $first: Int
    $last: Int
    $search: String
    $projectId: Int
    $recursive: Boolean
    $sort: String
    $offset: Int
    $productId: Int
    $productIds: [Int!]
    $workflowIds: [Int!]
    $authorIds: [Int!]
    $assigneeIds: [Int!]
    $featureIds: [Int!]
    $tagIds: [Int!]
    $statuses: [TicketStatus!]
    $stages: [ModelStage!]
    $createdAtFilter: String
    $isActive: Boolean
  ) {
    tickets(
      first: $first
      last: $last
      search: $search
      projectId: $projectId
      recursive: $recursive
      sort: $sort
      offset: $offset
      productId: $productId
      productIds: $productIds
      workflowIds: $workflowIds
      authorIds: $authorIds
      assigneeIds: $assigneeIds
      featureIds: $featureIds
      tagIds: $tagIds
      statuses: $statuses
      stages: $stages
      createdAtFilter: $createdAtFilter
      isActive: $isActive
      watched: true
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        createdAt
        updatedAt
        description
        eta
        localId
        stage
        status
        title
        projectId
        milestone
        ticketWorkflowStates {
          id
          position
          name
          assignee {
            id
            name
            avatarUrl
          }
        }
        ...TicketFavoriteRowFragment
        lastScheduleItem {
          id
          done
          stoppedAt
          role {
            id
            name
            avatarUrl
          }
          nextTicketWorkflowState {
            id
            name
            assignee {
              id
              name
              avatarUrl
            }
          }
          ticketWorkflowState {
            id
            name
          }
        }
        project {
          id
          name
          parentId
        }
        author {
          id
          name
        }
        workflow {
          id
          name
          color
        }
        product {
          id
          name
          code
        }
      }
    }
  }
  ${TicketFavoriteRow.fragments.TicketFavoriteRowFragment}
`;

const AVAILABLE_TABLE_COLUMNS = [
  "id",
  "title",
  "assignee",
  "status",
  "due date",
  "eta",
  "product",
  "workflow",
  "author",
  "project",
  "creation date",
];

const DEFAULT_COLUMNS = ["id", "title", "project", "status", "due date", "eta"];

export const TicketFavorite: React.FC = () => {
  const pagination = usePagination({ pageSize: 10, sortDirection: "DESC" });
  const ticketFilter = useSelector(getTicketFilter);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const dispatch = useAppDispatch();

  usePageTitle("Favorites");

  const setListFilter = useCallback(
    (filter: TicketListFilter) => {
      dispatch({ type: "SET_TICKET_FILTER", payload: filter });
    },
    [dispatch]
  );

  const clearListFilter = () => {
    dispatch({ type: "CLEAR_TICKET_FILTER" });
  };

  const { setPage } = pagination;
  const resetPage = useCallback(() => {
    setPage(0);
  }, [setPage]);

  const [debouncedFilter, debouncedSetFilter, searchFilter, setSearchFilter] =
    useDebouncedState("", 500, resetPage);

  const { params } = useRouteMatch();
  const productId = get(params, "productId");

  const ticketQueryVariables: QueryTicketsArgs = {
    sort: pagination.sortBy,
    search: searchFilter,
    offset: pagination.pageSize * pagination.page,
  };

  if (pagination.sortDirection === "ASC") {
    ticketQueryVariables.first = pagination.pageSize;
  } else {
    ticketQueryVariables.last = pagination.pageSize;
  }

  ticketQueryVariables.projectId = ticketFilter.project?.id;
  ticketQueryVariables.recursive = ticketFilter.recursive;

  if (productId) {
    ticketQueryVariables.productId = parseInt(productId);
  }

  if (ticketFilter.recordSets.workflows.length) {
    ticketQueryVariables.workflowIds = map(
      ticketFilter.recordSets.workflows,
      "id"
    );
  }

  if (ticketFilter.recordSets.products.length) {
    ticketQueryVariables.productIds = map(
      ticketFilter.recordSets.products,
      "id"
    );
  }

  if (ticketFilter.recordSets.authors.length) {
    ticketQueryVariables.authorIds = map(ticketFilter.recordSets.authors, "id");
  }

  if (ticketFilter.valueSets.stages.length) {
    ticketQueryVariables.stages = map(ticketFilter.valueSets.stages, "value");
  }

  if (ticketFilter.valueSets.statuses.length) {
    ticketQueryVariables.statuses = map(
      ticketFilter.valueSets.statuses,
      "value"
    );
  }

  if (ticketFilter.recordSets.assignees.length) {
    ticketQueryVariables.assigneeIds = map(
      ticketFilter.recordSets.assignees,
      "id"
    );
  }

  if (ticketFilter.recordSets.features.length) {
    ticketQueryVariables.featureIds = map(
      ticketFilter.recordSets.features,
      "id"
    );
  }

  if (ticketFilter.recordSets.tags.length) {
    ticketQueryVariables.tagIds = map(ticketFilter.recordSets.tags, "id");
  }

  if (ticketFilter.dates.createdAt) {
    ticketQueryVariables.createdAtFilter = formatDateFilter(
      ticketFilter.dates.createdAt.afterDate,
      ticketFilter.dates.createdAt.beforeDate
    );
  }

  if (ticketFilter.flags.isActive.value) {
    ticketQueryVariables.isActive = true;
  }

  const { data, loading } = useQuery<QueryReturnValue["tickets"]>(GET_TICKETS, {
    // always load the page from network
    fetchPolicy: "network-only",

    // the following page should be using cache as to display empty heart to let the user undo
    nextFetchPolicy: "cache-first",
    variables: ticketQueryVariables,
  });

  const searchElt = useSlashForSearch();

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <TicketIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Tickets...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6">
      <EmptyState
        title="No Favorite Tickets."
        subTitle="You can add tickets to your favorites on the ticket view"
      ></EmptyState>
    </div>
  );

  const tickets = (data?.tickets ? data.tickets.nodes : []) as Ticket[];
  const total = data?.tickets ? data.tickets.totalCount : 0;

  const thClassText = `px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;
  const thSortableClassText = `px-6 py-1 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;

  const fieldClass = (fieldName: string, className?: string) => {
    const visible = visibleColumns.indexOf(fieldName) > -1;
    return cn(className, {
      "table-cell": visible,
      hidden: !visible,
    });
  };

  const sortableHeader = (title: string, key: string) => {
    const isSorted = pagination.sortBy === key;

    const buttonClass = cn(
      "inline-flex items-center group w-full text-left text-xs uppercase py-2",
      {
        "font-semibold text-gray-800": isSorted,
        "font-medium hover:text-gray-800": !isSorted,
      }
    );

    const showSortIcon = () => {
      if (pagination.sortDirection === "ASC") {
        return (
          <ChevronDownIcon className="ml-1 inline-block h-4 w-4 text-gray-700" />
        );
      } else {
        return (
          <ChevronUpIcon className="ml-1 inline-block h-4 w-4 text-gray-700" />
        );
      }
    };

    return (
      <button
        type="button"
        className={buttonClass}
        onClick={() => {
          pagination.setSortBy(key);

          if (isSorted) {
            pagination.setSortDirection(
              pagination.sortDirection === "ASC" ? "DESC" : "ASC"
            );
          } else {
            pagination.setSortDirection("DESC");
          }
        }}
      >
        {title}
        {isSorted ? (
          showSortIcon()
        ) : (
          <ChevronDownIcon className="ml-1 inline-block h-4 w-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </button>
    );
  };

  const ticketList = (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4">
        <div className="inline-block min-w-full overflow-hidden border-b border-gray-200 align-middle shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th></th>
                <th className={fieldClass("id", thSortableClassText)}>
                  {sortableHeader("ID", "localId")}
                </th>
                <th className={fieldClass("title", thSortableClassText)}>
                  {sortableHeader("Title", "title")}
                </th>
                <th className={fieldClass("assignee", thClassText)}>
                  Assignee
                </th>
                <th className={fieldClass("status", thClassText)}>Status</th>
                <th className={fieldClass("eta", thSortableClassText)}>
                  {sortableHeader("Completion", "eta")}
                </th>
                <th className={fieldClass("product", thSortableClassText)}>
                  {sortableHeader("Product", "product")}
                </th>
                <th className={fieldClass("workflow", thSortableClassText)}>
                  {sortableHeader("Workflow", "workflow")}
                </th>
                <th className={fieldClass("author", thSortableClassText)}>
                  {sortableHeader("Author", "author")}
                </th>
                <th className={fieldClass("project", thSortableClassText)}>
                  {sortableHeader("Project", "project")}
                </th>
                <th
                  className={fieldClass("creation date", thSortableClassText)}
                >
                  {sortableHeader("Creation Date", "createdAt")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {tickets.map((ticket, index) => (
                <TicketFavoriteRow
                  ticket={ticket}
                  key={ticket.id}
                  index={index}
                  onEditTicket={(ticketId) =>
                    dispatch(showTicketEditModal(ticketId))
                  }
                  visibleFields={visibleColumns}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const searchClassName = cn(
    "block w-full rounded-md border border-gray-100 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:outline-none sm:text-sm sm:leading-5",
    {
      "border-gray-300 bg-white": debouncedFilter,
      "focus:border-gray-300 bg-gray-200 focus:bg-white": !debouncedFilter,
    }
  );

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start sm:mt-6">
      <div>
        <div className="flex flex-col px-4 pt-2 sm:flex-row sm:px-0 sm:pt-4">
          <div className="flex flex-1 flex-col-reverse sm:mr-2 sm:flex-row sm:space-x-2">
            <div className="hidden flex-row space-x-2">
              <TicketFilterButton
                onChange={setListFilter}
                onClear={clearListFilter}
                filter={ticketFilter}
              />
              <TicketFieldButton
                onChange={setVisibleColumns}
                available={AVAILABLE_TABLE_COLUMNS}
                selected={visibleColumns}
              >
                <ViewListIcon className="mr-2 h-5 w-5 text-gray-500" />
                Columns
              </TicketFieldButton>
            </div>
            <div
              className="relative mb-2 max-w-lg flex-1 rounded-md sm:mb-0"
              onClick={() => searchElt.current?.focus()}
            >
              <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
              <input
                id="search"
                onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
                ref={searchElt}
                value={debouncedFilter}
                placeholder={`Search ticket... (press "/" to focus)`}
                className={searchClassName}
              />
              {searchFilter && (
                <div className="absolute right-2 top-0 bottom-0 flex items-center">
                  <button
                    onClick={() => setSearchFilter("")}
                    className="focus:ring-blue rounded-md bg-gray-300 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                  >
                    clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <TicketFilterTags
          className="pb-4"
          onChange={setListFilter}
          filter={ticketFilter}
        />
        <div>
          {tickets.length > 0 ? ticketList : loading ? loadingList : emptyList}
        </div>
        <Paginator
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={setPage}
          itemCount={tickets.length}
          itemName="ticket"
          className="mt-8 px-4 sm:px-0"
        />
      </div>
    </div>
  );
};
