import React, { useState, useCallback } from "react";
import { RoleListRow } from "./RoleListRow";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { UserCreateModal } from "../UserCreate/UserCreateModal";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Role } from "types/graphql";
import { withRouter } from "react-router";
import { urlResolver } from "utils/navigation";
import { Button } from "components/fields/Button";
import { PlusIcon, SearchIcon, UsersIcon } from "@heroicons/react/outline";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { usePageTitle } from "hooks/usePageTitle";
import { useUrlQuery } from "hooks/useUrlQuery";
import { useParams } from "react-router-dom";
import { QueryReturnValue } from "types/queryTypes";

const RoleListBase: React.FC = () => {
  usePageTitle("Role Listing");
  const urlQuery = useUrlQuery();
  const { orgId } = useParams<{ orgId: string }>();
  const pagination = usePagination({ pageSize: 10 });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);

  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const [createUserModalVisible, setCreateUserModalVisibility] = useState(
    urlQuery.get("create") === "true"
  );

  const { data, loading } = useQuery<QueryReturnValue["roles"]>(GET_ROLES, {
    variables: {
      first: pagination.pageSize,
      search: filter,
      offset: pagination.pageSize * pagination.page,
    },
    fetchPolicy: "cache-and-network",
  });

  const searchElt = useSlashForSearch();

  const loadingList = (
    <li>
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <UsersIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading People...</p>
      </div>
    </li>
  );

  const emptyList = (
    <EmptyState title="No Results">
      <Button
        className="my-4"
        type="button"
        btnType="primary"
        onClick={() => setCreateUserModalVisibility(true)}
      >
        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
        Invite a new User
      </Button>
    </EmptyState>
  );

  const roles = (data?.roles ? data.roles.nodes : []) as Role[];
  const total = data?.roles ? data.roles.totalCount : 0;

  const roleList = roles.map((role, index) => (
    <RoleListRow
      role={role}
      key={role.id}
      index={index}
      url={urlResolver.role.edit(orgId, role.id)}
    />
  ));

  return (
    <>
      <UserCreateModal
        visible={createUserModalVisible}
        onClose={() => setCreateUserModalVisibility(false)}
      />
      <div className="flex flex-col px-4 pb-4 sm:flex-row sm:px-0">
        <div className="flex-1 overflow-hidden bg-white shadow sm:rounded-md">
          <div className="flex flex-col justify-between px-4 py-3 sm:flex-row sm:px-6">
            <div
              className="relative max-w-lg flex-1 rounded-md sm:mr-4"
              onClick={() => searchElt.current?.focus()}
            >
              <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
              <input
                id="search"
                onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
                ref={searchElt}
                value={debouncedFilter}
                placeholder={`Search for people... (press "/" to focus)`}
                className="block w-full rounded-md border border-gray-100 bg-gray-100 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
              />
              {debouncedFilter && (
                <div className="absolute right-2 top-0 bottom-0 flex items-center">
                  <button
                    onClick={() => setFilter("")}
                    className="focus:ring-blue rounded-md bg-gray-200 px-4 py-1 text-xs font-bold uppercase tracking-wide text-gray-400 transition-all duration-150 hover:bg-gray-300 hover:text-gray-500 focus:outline-none"
                  >
                    clear
                  </button>
                </div>
              )}
            </div>
            <div className="flex-0 mt-2 sm:mt-0">
              <Button
                type="button"
                btnType="white"
                onClick={() => setCreateUserModalVisibility(true)}
                fullInMobile
              >
                <PlusCircleIcon className="mr-2 h-4 w-4 text-gray-500" />
                Invite a User
              </Button>
            </div>
          </div>
          <ul>
            {roleList.length > 0 ? roleList : loading ? loadingList : emptyList}
          </ul>
          <Paginator
            total={total}
            {...pagination}
            isLoading={loading}
            setPage={pagination.setPage}
            itemCount={roles.length}
            itemName="user"
            className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 sm:rounded-b-md sm:px-6"
          />
        </div>
      </div>
    </>
  );
};

export const RoleList = withRouter(RoleListBase);

const GET_ROLES = gql`
  query GetRoles($first: Int!, $search: String, $offset: Int) {
    roles(first: $first, search: $search, offset: $offset) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        ...RoleListRowDetails
      }
    }
  }
  ${RoleListRow.fragments.RoleListRowDetails}
`;
