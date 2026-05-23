import React, { useCallback, useState } from "react";
import { get } from "lodash";
import { IssueListRow } from "./IssueListRow";
import { useParams, useRouteMatch } from "react-router-dom";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { QueryIssuesArgs, Issue, IssueStatus } from "types/graphql";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  SearchIcon,
} from "@heroicons/react/solid";
import cn from "classnames";
import { usePageTitle } from "hooks/usePageTitle";
import { Tab, Tabs } from "components/fields/Tab";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { onGraphQLError } from "utils/GQLClient";
import { NoAccess } from "components/views/NoAccess";
import { QueryReturnValue } from "types/queryTypes";

const GET_ISSUES = gql`
  query GetIssues(
    $first: Int
    $last: Int
    $search: String
    $sort: String
    $offset: Int
    $productId: Int
    $statuses: [IssueStatus!]
    $assigneeId: Int
    $unread: Boolean
    $unassigned: Boolean
  ) {
    issues(
      first: $first
      last: $last
      search: $search
      sort: $sort
      offset: $offset
      productId: $productId
      statuses: $statuses
      assigneeId: $assigneeId
      unread: $unread
      unassigned: $unassigned
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
        ...IssueListRowFragment
      }
    }
  }
  ${IssueListRow.fragments.IssueListRowFragment}
`;

type IssueFilter =
  | "ALL"
  | "MY_ISSUES"
  | "MY_UNREAD"
  | "UNASSIGNED"
  | "NEW"
  | "UNRESOLVED";

export const IssueList: React.FC = () => {
  const pagination = usePagination({ pageSize: 10, sortDirection: "DESC" });
  const { orgId } = useParams<{ orgId: string }>();
  const me = useSelector(getMe);
  const [issueFilter, setIssueFilter] = useState<IssueFilter>("UNRESOLVED");

  usePageTitle("Issue Listing");

  const { setPage } = pagination;
  const resetPage = useCallback(() => {
    setPage(0);
  }, [setPage]);

  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const { params } = useRouteMatch();
  const productId = get(params, "productId");

  const issueQueryVariables: QueryIssuesArgs = {
    sort: pagination.sortBy,
    search: filter,
    offset: pagination.pageSize * pagination.page,
  };

  if (pagination.sortDirection === "ASC") {
    issueQueryVariables.first = pagination.pageSize;
  } else {
    issueQueryVariables.last = pagination.pageSize;
  }

  if (productId) {
    issueQueryVariables.productId = parseInt(productId);
  }

  if (issueFilter === "MY_ISSUES" && me?.role?.id) {
    issueQueryVariables.assigneeId = me.role.id;
    issueQueryVariables.statuses = [IssueStatus.New, IssueStatus.Processing];
  }

  if (issueFilter === "MY_UNREAD" && me?.role?.id) {
    issueQueryVariables.assigneeId = me.role.id;
    issueQueryVariables.unread = true;
    issueQueryVariables.statuses = [IssueStatus.New, IssueStatus.Processing];
  }

  if (issueFilter === "NEW") {
    issueQueryVariables.statuses = [IssueStatus.New];
  }

  if (issueFilter === "UNASSIGNED") {
    issueQueryVariables.unassigned = true;
    issueQueryVariables.statuses = [IssueStatus.New, IssueStatus.Processing];
  }

  if (issueFilter === "UNRESOLVED") {
    issueQueryVariables.statuses = [IssueStatus.New, IssueStatus.Processing];
  }

  const { data, loading, error } = useQuery<QueryReturnValue["issues"]>(
    GET_ISSUES,
    {
      variables: issueQueryVariables,
      fetchPolicy: "cache-and-network",
      onError: onGraphQLError({ title: "Could not access support" }),
    }
  );

  const searchElt = useSlashForSearch();

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <QuestionMarkCircleIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Issues...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6">
      <EmptyState title="No Issues." />
    </div>
  );

  const issues = (data?.issues ? data.issues.nodes : []) as Issue[];
  const total = data?.issues ? data.issues.totalCount : 0;

  const thClassText = `px-6 py-3 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;
  const thSortableClassText = `px-6 py-1 border-b border-gray-200 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap`;

  const sortableHeader = (title: string, key: string) => {
    const isSorted = pagination.sortBy === key;

    const buttonClass = cn(
      "inline-flex items-center group w-full text-left text-xs uppercase py-2",
      {
        "font-bold text-gray-900": isSorted,
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

  const issueList = (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4">
        <div className="inline-block min-w-full overflow-hidden border-b border-gray-200 align-middle shadow sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-9"></th>
                <th className={thSortableClassText}>
                  {sortableHeader("Description", "description")}
                </th>
                <th className={thSortableClassText}>
                  {sortableHeader("Author", "name")}
                </th>
                <th className={thSortableClassText}>
                  {sortableHeader("Creation Date", "createdAt")}
                </th>
                <th className={thClassText}>
                  {sortableHeader("Status", "status")}
                </th>
                <th className={thSortableClassText}>
                  {sortableHeader("Product", "product")}
                </th>
                <th className={thSortableClassText}>
                  {sortableHeader("Assignee", "assignee")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {issues.map((issue, index) => (
                <IssueListRow
                  issue={issue}
                  key={issue.id}
                  index={index}
                  url={urlResolver.issue.view(orgId, issue.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (error) {
    return <NoAccess className="h-full" />;
  }

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start sm:mt-6">
      <div className="mb-6 flex flex-col items-center justify-between md:flex-row">
        <div
          className="relative w-full flex-1 rounded-md sm:mr-4 sm:max-w-lg"
          onClick={() => searchElt.current?.focus()}
        >
          <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
          <input
            id="search"
            onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
            ref={searchElt}
            value={debouncedFilter}
            placeholder={`Search issues... (press "/" to focus)`}
            className="block w-full rounded-md border border-gray-100 bg-gray-200 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
          />
          {filter && (
            <div className="absolute right-2 top-0 bottom-0 flex items-center">
              <button
                onClick={() => setFilter("")}
                className="focus:ring-blue rounded-md bg-gray-300 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
              >
                clear
              </button>
            </div>
          )}
        </div>
        <div className="my-4 md:my-0">
          <Tabs>
            <Tab
              active={issueFilter === "UNRESOLVED"}
              onClick={() => setIssueFilter("UNRESOLVED")}
            >
              Unresolved
            </Tab>
            <Tab
              active={issueFilter === "MY_ISSUES"}
              onClick={() => setIssueFilter("MY_ISSUES")}
            >
              My Issues
            </Tab>
            <Tab
              active={issueFilter === "MY_UNREAD"}
              onClick={() => setIssueFilter("MY_UNREAD")}
            >
              My Unread
            </Tab>
            <Tab
              className="hidden md:flex"
              active={issueFilter === "UNASSIGNED"}
              onClick={() => setIssueFilter("UNASSIGNED")}
            >
              Unassigned
            </Tab>
            <Tab
              className="hidden md:flex"
              active={issueFilter === "NEW"}
              onClick={() => setIssueFilter("NEW")}
            >
              New
            </Tab>
            <Tab
              className="hidden md:flex"
              active={issueFilter === "ALL"}
              onClick={() => setIssueFilter("ALL")}
            >
              All Issues
            </Tab>
          </Tabs>
        </div>
      </div>
      <div>
        {issues.length > 0 ? issueList : loading ? loadingList : emptyList}
      </div>
      <Paginator
        total={total}
        {...pagination}
        isLoading={loading}
        setPage={setPage}
        itemCount={issues.length}
        itemName="support issue"
        className="mt-8 px-4 sm:px-0"
      />
    </div>
  );
};
