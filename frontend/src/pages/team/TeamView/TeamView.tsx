import React, { useCallback, useState } from "react";
import { useParams, RouteComponentProps, Link } from "react-router-dom";

import { TeamDeleteModal } from "../TeamDelete/TeamDeleteModal";
import { Tag } from "components/tags/Tag";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Button } from "components/fields/Button";
import { Role } from "types/graphql";
import { Avatar } from "components/views/Avatar";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { Paginator } from "components/views/Paginator";
import { Legend } from "components/fields/Legend";
import { SearchIcon } from "@heroicons/react/outline";
import { QueryReturnValue } from "types/queryTypes";
import PlainTextView from "components/PlainText/PlainTextView";

type Props = RouteComponentProps<{ teamId: string }>;

const GET_TEAM = gql`
  query getTeam($id: Int!) {
    team(id: $id) {
      id
      name
      code
      description
      coverUrl
      updatedAt
      createdAt
      members {
        id
        type
        title
        name
        avatarUrl
      }
    }
  }
`;

interface UrlParams {
  teamId: string;
  orgId: string;
}

export const TeamView: React.FC<Props> = (props) => {
  const params = useParams<UrlParams>();
  const teamId = parseInt(params.teamId);

  const pagination = usePagination({
    pageSize: 12,
  });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);
  const searchElt = useSlashForSearch();

  const { data, loading } = useQuery<QueryReturnValue["team"]>(GET_TEAM, {
    variables: { id: teamId || "0" },
  });

  const team = data?.team;

  const [deleteTeamModalVisible, setDeleteTeamModalVisibility] =
    useState(false);

  if (loading || !team) {
    return null;
  }

  // members is now a plain Role[] — paginate client-side
  const allMembers = filter
    ? team.members.filter((m) =>
        m.name.toLowerCase().includes(filter.toLowerCase())
      )
    : team.members;
  const members = allMembers.slice(
    pagination.page * pagination.pageSize,
    (pagination.page + 1) * pagination.pageSize
  );
  const total = allMembers.length;

  const displayCover = () => {
    if (team.coverUrl) {
      return (
        <img
          src={team.coverUrl}
          alt=""
          className="h-48 w-full rounded-t-lg object-cover"
        />
      );
    } else {
      return <div className="h-48 w-full rounded-t-lg object-cover" />;
    }
  };

  const renderMember = (member: Role) => (
    <li key={`member-${member.id}`}>
      <div className="group flex w-full items-center justify-between rounded-lg bg-white p-6 shadow md:hidden">
        <Avatar
          src={member.avatarUrl}
          className="mx-auto mr-4 h-12 w-12 flex-none rounded-md bg-black"
          name={member.name}
        />
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <Link
              to={urlResolver.role.view(params.orgId, member.id)}
              className="truncate text-sm font-medium text-gray-900 hover:underline"
            >
              {member.name}
            </Link>
            <span className="inline-block shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              {member.type}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">{member.title}</p>
        </div>
      </div>
      <div className="col-span-1 hidden h-full flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow md:flex">
        <div className="group relative hidden flex-1 flex-col p-8 md:flex">
          <Avatar
            src={member.avatarUrl}
            className="mx-auto w-4/5 flex-none rounded-md bg-gray-200"
            name={member.name}
          />
          <Link
            to={urlResolver.role.view(params.orgId, member.id)}
            className="mt-6 text-sm font-medium text-gray-900 hover:underline"
          >
            {member.name}
          </Link>
          <dl className="mt-1 flex flex-grow flex-col justify-between">
            <dt className="sr-only">Title</dt>
            <dd className="text-sm text-gray-500">{member.title}</dd>
            <dt className="sr-only">Role</dt>
            <dd className="mt-3">
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {member.type}
              </span>
            </dd>
          </dl>
        </div>
      </div>
    </li>
  );

  return (
    <div className="mb-8 w-full xl:mx-auto xl:max-w-6xl">
      <div className="mx-2 rounded-lg bg-white shadow sm:mx-0">
        <div className="relative h-48 rounded-t-lg bg-gray-300">
          {displayCover()}
        </div>

        <div className="px-4 py-5 sm:p-0">
          <dl>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
              <dt className="text-sm font-medium leading-5 text-gray-500">
                Team name
              </dt>
              <dd className="mt-1 text-base leading-5 text-gray-900 sm:col-span-2 sm:mt-0">
                {team.name}
                <Tag className="ml-2 bg-gray-100 shadow" round large>
                  {team.code}
                </Tag>
              </dd>
            </div>

            {team.description ? (
              <div className="mt-8 sm:mt-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-t sm:border-gray-200 sm:px-6 sm:py-5">
                <dt className="text-sm font-medium leading-5 text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm leading-5 text-gray-900 sm:col-span-2 sm:mt-0">
                  <PlainTextView content={team.description} />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex justify-between rounded-b-md bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button
            btnType="secondaryDanger"
            onClick={() => setDeleteTeamModalVisibility(true)}
          >
            Delete Team
          </Button>
          <Button
            btnType="white"
            asElement={(className) => (
              <Link
                to={urlResolver.team.edit(params.orgId, teamId)}
                className={className}
              >
                Edit Team
              </Link>
            )}
          />
          <TeamDeleteModal
            teamId={team.id}
            visible={deleteTeamModalVisible}
            onClose={() => setDeleteTeamModalVisibility(false)}
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center sm:flex-row sm:justify-between">
        <Legend>Members</Legend>
        <div className="mt-4 flex sm:mt-0">
          <div
            className="relative w-96 rounded-md"
            onClick={() => searchElt.current?.focus()}
          >
            <SearchIcon className="absolute bottom-0 left-3 top-2 h-5 w-5 items-center text-gray-400" />
            <input
              id="search"
              onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
              ref={searchElt}
              value={debouncedFilter}
              placeholder={`Search Members... (press "/" to focus)`}
              className="block w-full rounded-md border border-gray-100 bg-gray-200 py-2 pl-9 text-gray-600 transition duration-150 ease-in-out focus:border-gray-300 focus:bg-white focus:outline-none sm:text-sm sm:leading-5"
            />
            {debouncedFilter && (
              <div className="absolute bottom-0 right-2 top-0 flex items-center">
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
      </div>

      <div className="mt-4 px-4 sm:px-0 md:col-span-2 md:mt-0">
        <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member) => renderMember(member))}
        </ul>
        <Paginator
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={pagination.setPage}
          itemCount={members.length}
          itemName="member"
          className="mt-4"
        />
      </div>
    </div>
  );
};
