import { gql, useMutation } from "@apollo/client";
import { Menu } from "@headlessui/react";
import { CubeIcon } from "@heroicons/react/outline";
import {
  ChevronDownIcon,
  DownloadIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { MutationDeleteProjectArgs } from "types/graphql";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  id: string;
  onExportProject: (id: string) => void;
}

export const ProjectInlineMenuButton: React.FC<Props> = (props) => {
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const { orgId } = useParams<{ orgId: string }>();

  const projectId = parseInt(props.id.split(":")[1]);

  const [deleteProject] = useMutation<
    MutationReturnValue["deleteProject"],
    MutationDeleteProjectArgs
  >(DELETE_PROJECT_MUTATION, {
    refetchQueries: ["GetMiniProjectsForExplorer", "GetProjectsForExplorer"],
    onError: onGraphQLError({
      title: "Project deletion failed",
    }),
    onCompleted: onMutationComplete({
      title: "Project(s) Deleted",
    }),
  });

  const onDeleteProject = () => {
    deleteProject({ variables: { projectId } });
  };

  const menuOptions: PopMenuOption[] = [
    {
      label: "View Details",
      to: urlResolver.explorer.analytics(orgId, projectId),
      type: "link",
      icon: (className) => <CubeIcon className={className} />,
    },
    {
      label: "Export Project",
      onClick: () => props.onExportProject(props.id),
      type: "button",
      icon: (className) => <DownloadIcon className={className} />,
    },
    {
      type: "separator",
    },
    {
      label: "Delete Project",
      onClick: () => {
        setDeleteConfirmVisible(true);
      },
      type: "button",
      danger: true,
      icon: (className) => <TrashIcon className={className} />,
    },
  ];

  return (
    <>
      <DangerConfirm
        visible={isDeleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={onDeleteProject}
        title="Delete Project"
        description="Deleting a project will delete all its sub projects and all the tickets they contains"
        cta="Yes, Delete Project"
      />
      <div className="relative flex flex-row justify-end">
        <PopMenu options={menuOptions} direction="bottom-left" size="large">
          <Menu.Button
            aria-label="Open project menu"
            className="flex flex-row items-center justify-end px-2 py-1 text-xs font-medium text-gray-500 opacity-0 hover:text-gray-700 focus:text-gray-700 focus:outline-none group-hover:opacity-100"
          >
            <ChevronDownIcon className="h-5 w-5" />
          </Menu.Button>
        </PopMenu>
      </div>
    </>
  );
};

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProjectForExplorerInlineMenu($projectId: Int!) {
    deleteProject(projectId: $projectId)
  }
`;
