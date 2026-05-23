import { gql, useQuery } from "@apollo/client";
import {
  CustomMultiSelect,
  RenderButtonParams,
  SelectOption,
} from "components/fields/CustomMultiSelect";
import { Tag } from "components/tags/Tag";
import { map } from "lodash";
import { useMemo, useState } from "react";
import { FCWithFragments } from "types";
import { Team } from "types/graphql";
import { PlusIcon } from "@heroicons/react/solid";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  description?: string;
  className?: string;
  onRemoveTeams: (teams: Team[]) => void;
  onAddTeams: (teams: Team[]) => void;
  teams: any[];
  title: string;
}

export const WorkflowStateTeams: FCWithFragments<Props> = (props) => {
  const { teams, description, className } = props;
  const [query, setQuery] = useState("");

  const { data } = useQuery<QueryReturnValue["teams"]>(
    GET_TEAMS_FOR_WORFKLOW_STATE,
    {
      variables: {
        first: 20,
        search: query,
        offset: 0,
      },
    }
  );

  const dbTeams = data?.teams.nodes;

  const options: SelectOption<Team>[] = useMemo(
    () =>
      map(dbTeams, (team: Team) => ({
        value: team,
        label: team.name,
        description: team.code,
      })),
    [dbTeams]
  );

  const renderButton = ({ setOpen, isOpen }: RenderButtonParams<Team>) => {
    return (
      <div className="flex flex-row justify-between">
        <div className="text-gray-700">{props.title}</div>
        <button
          type="button"
          className="focus:ring-blue rounded p-1 leading-5 transition duration-150 ease-in-out hover:bg-gray-200 focus:border-blue-300 focus:outline-none"
          onClick={() => setOpen(!isOpen)}
        >
          <PlusIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    );
  };

  const renderTeam = (team: Team) => (
    <div className="inline-flex flex-row" key={`team-${team.id}`}>
      <Tag
        large
        title={team.name}
        className="mr-2 mt-2 min-w-0 bg-gray-300 text-gray-700 shadow-sm"
        actionBgColor="hover:bg-gray-400"
        onDelete={() => props.onRemoveTeams([team])}
      >
        {team.name}
      </Tag>
    </div>
  );

  const renderNoTeams = () => (
    <div className="p-2">
      <div className="mt-2 rounded-lg bg-gray-200 py-4 text-center text-base text-gray-600">
        No teams
        <div className="text-center text-sm text-gray-500">
          Click
          <PlusIcon className="mx-1 inline-block h-4 w-4 rounded bg-gray-300 leading-4" />
          to add teams
        </div>
      </div>
    </div>
  );

  const renderDescription = () => {
    if (description) {
      return (
        <div className="mt-2 ml-1 text-sm text-gray-500">{description}</div>
      );
    }

    return null;
  };

  return (
    <div className={className}>
      <CustomMultiSelect<Team>
        renderButton={renderButton}
        id="assigneeSelector"
        options={options}
        onSearch={(query: string) => setQuery(query)}
        values={teams}
        identityMethod={(v) => v.id}
        onSelect={props.onAddTeams}
        onDeselect={props.onRemoveTeams}
      />
      {teams.length ? map(teams, renderTeam) : renderNoTeams()}
      {renderDescription()}
    </div>
  );
};

WorkflowStateTeams.fragments = {
  WorkflowStateTeamsFragment: gql`
    fragment WorkflowStateTeamsFragment on Team {
      id
      name
      code
    }
  `,
};

const GET_TEAMS_FOR_WORFKLOW_STATE = gql`
  query GetTeamsForWorkflowState($first: Int!, $search: String, $offset: Int) {
    teams(first: $first, search: $search, offset: $offset) {
      totalCount
      nodes {
        ...WorkflowStateTeamsFragment
      }
    }
  }
  ${WorkflowStateTeams.fragments.WorkflowStateTeamsFragment}
`;
