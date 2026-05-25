import React, { useCallback } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Avatar } from "components/views/Avatar";
import { usePagination } from "hooks/usePagination";
import { useDebouncedState } from "hooks/useDebouncedState";
import { useSlashForSearch } from "hooks/useSlashForSearch";
import { Paginator } from "components/views/Paginator";
import { FCWithFragments } from "types";
import {
  MutationAddMembersArgs,
  MutationRemoveMembersArgs,
  Role,
  Team,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { idsAsNumber } from "utils/string";
import { TeamAddMembers } from "./TeamAddMembers";
import { XIcon } from "@heroicons/react/solid";
import { SearchIcon } from "@heroicons/react/outline";
import { Panel, PanelBody } from "components/views/Panel";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";

interface Props {
  team: Team;
}

export const TeamMemberList: FCWithFragments<Props> = (props) => {
  const teamId = props.team.id;

  const pagination = usePagination({
    pageSize: 6,
  });
  const { setPage } = pagination;
  const resetPage = useCallback(() => setPage(0), [setPage]);
  const [debouncedFilter, debouncedSetFilter, filter, setFilter] =
    useDebouncedState("", 500, resetPage);
  const searchElt = useSlashForSearch();

  const { data, loading, refetch } = useQuery<QueryReturnValue["team"]>(
    GET_MEMBERS,
    {
      variables: { id: teamId },
      onError: onGraphQLError({ title: "Retrieve team members error" }),
    }
  );

  const [addMembers] = useMutation<
    MutationReturnValue["addMembers"],
    MutationAddMembersArgs
  >(MUTATE_ADD_MEMBERS, {
    onError: onGraphQLError({ title: "Could not add members to team" }),
    onCompleted: onMutationComplete({
      title: "Member added",
      callback: () => refetch(),
    }),
  });

  const [removeMembers] = useMutation<
    MutationReturnValue["removeMembers"],
    MutationRemoveMembersArgs
  >(MUTATE_REMOVE_MEMBERS, {
    onError: onGraphQLError({ title: "Could not remove members from team" }),
    onCompleted: onMutationComplete({
      title: "Member removed",
      callback: () => refetch(),
    }),
  });

  const team = data?.team;

  if (loading) {
    return null;
  }

  if (!team) {
    return null;
  }

  // members is now a plain Role[] — filter and paginate client-side
  // (the backend no longer exposes a paginated members resolver)
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

  const onRemoveMembers = (roles: Role[]) => {
    removeMembers({
      variables: {
        teamId: team.id,
        roleIds: idsAsNumber(roles),
      },
    });
  };

  const onAddMembers = (roles: Role[]) => {
    addMembers({
      variables: {
        teamId: team.id,
        roleIds: idsAsNumber(roles),
      },
    });
  };

  const renderMember = (member: Role) => (
    <li key={`member-${member.id}`}>
      <div className="group relative flex w-full items-center justify-between border-b bg-white p-6 md:hidden">
        <button
          onClick={() => onRemoveMembers([member])}
          className="absolute right-0 top-0 flex translate-x-3 -translate-y-3 transform justify-items-center rounded-full border-2 border-white bg-red-500 p-1 opacity-0 shadow transition-opacity duration-300 hover:bg-red-400 group-hover:opacity-100"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
        <Avatar
          src={member.avatarUrl}
          className="mx-auto mr-4 h-12 w-12 shrink-0 rounded-md bg-black"
          name={member.name}
        />
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {member.name}
            </h3>
            <span className="inline-block shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
              {member.type}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">{member.title}</p>
        </div>
      </div>
      <div className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow">
        <div className="group relative hidden flex-1 flex-col p-8 md:flex">
          <button
            onClick={() => onRemoveMembers([member])}
            className="absolute right-0 top-0 flex translate-x-3 -translate-y-3 transform justify-items-center rounded-full border-2 border-white bg-red-500 p-1 opacity-0 shadow transition-opacity duration-300 hover:bg-red-400 group-hover:opacity-100"
          >
            <XIcon className="h-4 w-4 text-white" />
          </button>
          <Avatar
            src={member.avatarUrl}
            className="mx-auto w-4/5 flex-none rounded-md bg-gray-200"
            name={member.name}
          />
          <h3 className="mt-6 text-sm font-medium text-gray-900">
            {member.name}
          </h3>
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
    <Panel className="mx-2 sm:mx-0">
      <PanelBody>
        <div className="grid-cols-3 gap-4 md:grid">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-2 md:px-0">
              <TeamAddMembers
                team={team}
                addMembers={onAddMembers}
                removeMembers={onRemoveMembers}
              />
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Add and remove people from this team. The team members are used
                by Autopilot to efficiently assign every tasks.
              </p>
              <div className="mt-4 flex-1">
                <div
                  className="relative rounded-md"
                  onClick={() => searchElt.current?.focus()}
                >
                  <SearchIcon className="absolute top-2 left-3 bottom-0 h-5 w-5 items-center text-gray-400" />
                  <input
                    id="search"
                    onChange={(e) => debouncedSetFilter(e.currentTarget.value)}
                    ref={searchElt}
                    value={debouncedFilter}
                    placeholder={`Search Members... (press "/" to focus)`}
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
            </div>
          </div>
          <div className="mt-4 px-4 sm:px-0 md:col-span-2 md:mt-0">
            <ul className=" grid grid-cols-1 overflow-hidden rounded-lg border sm:grid-cols-2 sm:gap-6 sm:border-0 sm:bg-gray-100 sm:p-4 md:grid-cols-2">
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
      </PanelBody>
    </Panel>
  );
};

TeamMemberList.fragments = {
  TeamMemberList_MembersFragment: gql`
    fragment TeamMemberList_MembersFragment on Role {
      id
      type
      title
      name
      avatarUrl
    }
  `,
};

const GET_MEMBERS = gql`
  query getTeamMembersForTeamMemberList($id: Int!) {
    team(id: $id) {
      id
      memberIds
      members {
        ...TeamMemberList_MembersFragment
      }
    }
  }
  ${TeamMemberList.fragments.TeamMemberList_MembersFragment}
`;

const MUTATE_REMOVE_MEMBERS = gql`
  mutation TeamRemoveMembers($teamId: Int!, $roleIds: [Int!]!) {
    removeMembers(teamId: $teamId, roleIds: $roleIds) {
      id
      memberIds
      members {
        ...TeamMemberList_MembersFragment
      }
    }
  }
  ${TeamMemberList.fragments.TeamMemberList_MembersFragment}
`;

const MUTATE_ADD_MEMBERS = gql`
  mutation TeamAddMembers($teamId: Int!, $roleIds: [Int!]!) {
    addMembers(teamId: $teamId, roleIds: $roleIds) {
      id
      memberIds
      members {
        ...TeamMemberList_MembersFragment
      }
    }
  }
  ${TeamMemberList.fragments.TeamMemberList_MembersFragment}
`;
