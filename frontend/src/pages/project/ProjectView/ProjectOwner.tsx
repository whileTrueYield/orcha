import React from "react";
import { gql } from "@apollo/client";
import { Avatar } from "components/views/Avatar";
import { RoleSelect } from "components/fields/RoleSelect";
import { FCWithFragments } from "types";
import {
  MiniRole,
  Project,
  Role,
  MutationUpdateProjectOwnerArgs,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { XIcon } from "@heroicons/react/outline";
import { useBlockingMutation } from "utils/graphql";

interface ProjectOwnerProps {
  project: Project;
  className?: string;
}

export const ProjectOwner: FCWithFragments<ProjectOwnerProps> = (props) => {
  const { project } = props;

  const clearOwner = () => {
    updateProject({
      variables: {
        projectId: project.id,
        ownerId: null,
      },
    });
  };

  const setOwner = (role: MiniRole | null) => {
    if (role) {
      updateProject({
        variables: {
          projectId: project.id,
          ownerId: role.id,
        },
      });
    }
  };

  const [updateProject] = useBlockingMutation<
    { updateProjectOwner: Project },
    MutationUpdateProjectOwnerArgs
  >(MUTATE_UPDATE_PROJECT, {
    onError: onGraphQLError({ title: "Could not set project lead" }),
    onCompleted: onMutationComplete({
      title: "Project Lead Updated",
    }),
  });

  const renderOwner = (owner: Role) => (
    <div
      key={owner.id}
      className="group my-1 flex flex-row items-center rounded-lg py-1 pr-2 pl-1 text-gray-700 transition duration-100 hover:bg-gray-200"
    >
      <Avatar
        src={owner.avatarUrl}
        className="flex-0 mr-2 h-10 w-10 rounded-md border-2 border-white bg-gray-200 shadow"
        name={owner.name}
      />
      <span className="block flex-1 truncate">{owner.name}</span>
      <button
        type="button"
        className="flex-0 inline-block rounded p-1 leading-4 text-gray-700 opacity-0 transition duration-100 hover:bg-gray-300 focus:outline-none focus:ring group-hover:opacity-100"
        onClick={() => clearOwner()}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );

  if (project.owner) {
    return (
      <div className={props.className}>
        <div className="text-lg text-gray-700">Owner</div>
        {renderOwner(project.owner)}
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className="text-lg text-gray-700">Owner</div>
      <RoleSelect onChange={setOwner} className="mt-1" includeMe />
    </div>
  );
};

ProjectOwner.fragments = {
  ProjectOwnerFragment: gql`
    fragment ProjectOwnerFragment on Project {
      id
      owner {
        id
        type
        name
        avatarUrl
      }
    }
  `,
};

const MUTATE_UPDATE_PROJECT = gql`
  mutation UpdateProjectOwner($projectId: Int!, $ownerId: Int) {
    updateProjectOwner(projectId: $projectId, ownerId: $ownerId) {
      ...ProjectOwnerFragment
    }
  }
  ${ProjectOwner.fragments.ProjectOwnerFragment}
`;
