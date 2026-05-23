import { useMemo, useState } from "react";
import { map } from "lodash";
import {
  CustomMultiSelect,
  RenderButtonParams,
  SelectOption,
} from "components/fields/CustomMultiSelect";
import { Role, Team } from "types/graphql";
import { gql, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { PlusIcon } from "@heroicons/react/solid";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  team: Team;
  className?: string;
  addMembers: (roles: Role[]) => void;
  removeMembers: (roles: Role[]) => void;
}

export const TeamAddMembers: FCWithFragments<Props> = (props) => {
  const { className, team, addMembers, removeMembers } = props;

  const [query, setQuery] = useState("");

  const paginationVariables = { first: 20, search: query, offset: 0 };

  const { data } = useQuery<QueryReturnValue["roles"]>(GET_ROLES_FOR_MEMBERS, {
    variables: { ...paginationVariables },
  });

  const dbRoles = data?.roles.nodes;

  const options: SelectOption<Role>[] = useMemo(
    () =>
      map(dbRoles, (role: Role) => ({
        value: role,
        label: role.name,
        description: role.type,
      })),
    [dbRoles]
  );

  const renderButton = ({ setOpen, isOpen }: RenderButtonParams<Role>) => (
    <div className="flex flex-row justify-between">
      <div className="text-lg font-medium leading-6 text-gray-900">
        Members
        <span className="ml-2 font-normal text-gray-500">
          ({team.memberIds.length})
        </span>
      </div>
      <button
        type="button"
        className="focus:ring-blue rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none"
        onClick={() => setOpen(!isOpen)}
      >
        <PlusIcon className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );

  // create series of fake member object for comparison
  const teamMembers = map(team.memberIds, (id) => ({ id: id.toString() }));

  return (
    <div className={className}>
      <CustomMultiSelect<Role>
        renderButton={renderButton}
        options={options}
        onSearch={(query: string) => setQuery(query)}
        values={teamMembers as any}
        identityMethod={(v) => v.id}
        onSelect={addMembers}
        onDeselect={removeMembers}
      />
    </div>
  );
};

TeamAddMembers.fragments = {
  TeamAddMembers_RoleFragment: gql`
    fragment TeamAddMembers_RoleFragment on Role {
      id
      type
      title
      name
      avatarUrl
    }
  `,
};

const GET_ROLES_FOR_MEMBERS = gql`
  query getRolesForMembers($first: Int!, $search: String, $offset: Int) {
    roles(first: $first, search: $search, offset: $offset) {
      totalCount
      nodes {
        ...TeamAddMembers_RoleFragment
      }
    }
  }
  ${TeamAddMembers.fragments.TeamAddMembers_RoleFragment}
`;
