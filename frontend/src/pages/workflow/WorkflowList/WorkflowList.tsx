import React, { useState, useCallback } from "react";
import { WorkflowListRow } from "./WorkflowListRow";
import { useRouteMatch } from "react-router-dom";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { WorkflowCreateModal } from "../WorkflowCreate/WorkflowCreateModal";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Workflow } from "types/graphql";
import { Button } from "components/fields/Button";
import { CollectionIcon, SearchIcon } from "@heroicons/react/outline";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { usePageTitle } from "hooks/usePageTitle";
import { QueryReturnValue } from "types/queryTypes";

const GET_WORKFLOWS = gql`
  query GetWorkflows($first: Int!, $search: String, $offset: Int) {
    workflows(first: $first, search: $search, offset: $offset) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        name
        stage
        description
        updatedAt
        color
        isDefaultWorkflow
      }
    }
  }
`;

export const WorkflowList: React.FC = (props) => {
  usePageTitle("Workflow Listing");
  const pagination = usePagination({
    pageSize: 10,
  });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const [createWorkflowModalVisible, setCreateWorkflowModalVisibility] =
    useState(false);

  const { url } = useRouteMatch();

  const searchElt = useSlashForSearch();

  const { data, loading } = useQuery<QueryReturnValue["workflows"]>(
    GET_WORKFLOWS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        first: pagination.pageSize,
        search: filter,
        offset: pagination.pageSize * pagination.page,
      },
    }
  );

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <CollectionIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Workflows...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6">
      <EmptyState title="No Workflows." />
    </div>
  );

  const workflows = (data?.workflows ? data.workflows.nodes : []) as Workflow[];
  const total = data?.workflows ? data.workflows.totalCount : 0;
  const thClass = "px-6 py-3 border-b border-gray-200";
  const thClassText = `${thClass} text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider`;
  const thClassTextOptional = `${thClass} hidden lg:table-cell text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider`;

  const workflowList = (
    <div className="inline-block min-w-full overflow-hidden border-b border-gray-200 align-middle shadow sm:rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className={thClassText}>Name</th>
            <th className={thClassTextOptional}>Description</th>
            <th className={thClassText}>Status</th>
            <th className={thClassTextOptional}>Availability</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow, index) => (
            <WorkflowListRow
              workflow={workflow}
              key={workflow.id}
              index={index}
              url={`${url}/${workflow.id}/view`}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="mx-auto mb-8 flex w-full flex-col justify-start">
      <WorkflowCreateModal
        visible={createWorkflowModalVisible}
        onClose={() => setCreateWorkflowModalVisibility(false)}
      />
      <div>
        <div className="flex flex-col px-4 pt-4 sm:flex-row sm:px-0">
          <div className="flex flex-1 flex-row space-x-2 sm:mr-2">
            <div
              className="relative flex-1 rounded-md"
              onClick={() => searchElt.current?.focus()}
            >
              <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
              <input
                id="search"
                onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
                ref={searchElt}
                value={debouncedFilter}
                placeholder={`Search workflow... (press "/" to focus)`}
                className="block w-full rounded-md border border-gray-100 bg-gray-200 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
              />
              {debouncedFilter && (
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
          </div>
          <div className="flex-0 mt-2 sm:mt-0">
            <Button
              type="button"
              btnType="white"
              onClick={() => setCreateWorkflowModalVisibility(true)}
              fullInMobile
            >
              <PlusCircleIcon className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" />
              New Workflow
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-col">
        <div className="-my-2 overflow-x-auto py-2 sm:-mx-4 sm:px-4">
          {workflows.length > 0
            ? workflowList
            : loading
            ? loadingList
            : emptyList}
        </div>
      </div>
      <Paginator
        total={total}
        {...pagination}
        isLoading={loading}
        setPage={pagination.setPage}
        itemCount={workflows.length}
        itemName="workflow"
        className="mt-6 px-4 sm:px-0"
      />
    </div>
  );
};
