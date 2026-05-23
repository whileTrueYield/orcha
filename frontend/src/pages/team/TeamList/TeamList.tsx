import React, { useState, useCallback } from "react";
import { TeamListRow } from "./TeamListRow";
import { useRouteMatch } from "react-router-dom";
import { Paginator } from "components/views/Paginator";
import { EmptyState } from "components/views/EmtpyState";
import { TeamCreateModal } from "../TeamCreate/TeamCreateModal";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Team } from "types/graphql";
import { Button } from "components/fields/Button";
import { SearchIcon, UserGroupIcon } from "@heroicons/react/outline";
import { PlusCircleIcon } from "@heroicons/react/solid";
import { QueryReturnValue } from "types/queryTypes";

const GET_TEAMS = gql`
  query GetTeams($first: Int!, $search: String, $offset: Int) {
    teams(first: $first, search: $search, offset: $offset) {
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
        code
        description
        updatedAt
        coverUrl
        members(first: 3) {
          totalCount
          nodes {
            id
            avatarUrl
            name
          }
        }
      }
    }
  }
`;

export const TeamList: React.FC = (props) => {
  const pagination = usePagination({
    pageSize: 6,
  });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);

  const [createTeamModalVisible, setCreateTeamModalVisibility] =
    useState(false);

  const { url } = useRouteMatch();

  const searchElt = useSlashForSearch();

  const { data, loading } = useQuery<QueryReturnValue["teams"]>(GET_TEAMS, {
    variables: {
      first: pagination.pageSize,
      search: filter,
      offset: pagination.pageSize * pagination.page,
    },
    fetchPolicy: "cache-and-network",
  });

  const loadingList = (
    <div className="col-span-6">
      <div className="flex h-64 w-full flex-col items-center justify-center">
        <UserGroupIcon className="h-12 w-12 text-gray-200" />
        <p className="mt-4 tracking-wide text-gray-400">Loading Teams...</p>
      </div>
    </div>
  );

  const emptyList = (
    <div className="col-span-6">
      <EmptyState title="No Teams." />
    </div>
  );

  const teams = (data?.teams ? data.teams.nodes : []) as Team[];
  const total = data?.teams ? data.teams.totalCount : 0;

  const teamList = teams.map((team, index) => (
    <TeamListRow
      team={team}
      key={team.id}
      index={index}
      url={`${url}/${team.id}/view`}
    />
  ));

  return (
    <>
      <TeamCreateModal
        visible={createTeamModalVisible}
        onClose={() => setCreateTeamModalVisibility(false)}
      />

      <div className="flex flex-col px-4 pb-4 sm:flex-row sm:px-0">
        <div className="flex-1">
          <div
            className="relative max-w-lg rounded-md sm:mr-4"
            onClick={() => searchElt.current?.focus()}
          >
            <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
            <input
              id="search"
              onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
              ref={searchElt}
              value={debouncedFilter}
              placeholder={`Search team... (press "/" to focus)`}
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
            onClick={() => setCreateTeamModalVisibility(true)}
            fullInMobile
          >
            <PlusCircleIcon className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" />
            New Team
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {teamList.length > 0 ? teamList : loading ? loadingList : emptyList}
      </div>
      <Paginator
        total={total}
        {...pagination}
        isLoading={loading}
        setPage={pagination.setPage}
        itemCount={teams.length}
        itemName="team"
        className="mt-4 px-4 sm:px-0"
      />
    </>
  );
};
