import { gql, useMutation } from "@apollo/client";
import { Menu } from "@headlessui/react";
import { MenuIcon } from "@heroicons/react/outline";
import {
  TicketIcon,
  FolderIcon,
  PencilIcon,
  EyeOffIcon,
  EyeIcon,
} from "@heroicons/react/solid";
import { updateExplorerFilter } from "actions";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { TicketCreateModal } from "pages/ticket/TicketCreate/TicketCreateModal";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getExplorerFilter } from "reducers/selector";
import { useAppDispatch } from "store";
import { FCWithFragments } from "types";
import { MutationDeleteProjectArgs, Project } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { GET_MINI_PROJECTS_QUERY_FOR_EXPLORER } from "../queries";
import { ExplorerProjectCreateModal } from "./ExplorerProjectCreateModal";
import { ExplorerProjectEditModal } from "./ExplorerProjectEditModal";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  project: Project;
}

export const ProjectMenuButton: FCWithFragments<Props> = (props) => {
  const history = useHistory();
  const { project } = props;
  const [isCreateTicketVisible, setCreateTicketVisible] = useState(false);
  const [isCreateProjectVisible, setCreateProjectVisible] = useState(false);
  const [isEditProjectVisible, setEditProjectVisible] = useState(false);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const filter = useSelector(getExplorerFilter);
  const dispatch = useAppDispatch();

  const [deleteProject] = useMutation<
    MutationReturnValue["deleteProject"],
    MutationDeleteProjectArgs
  >(DELETE_PROJECT_MUTATION, {
    refetchQueries: [GET_MINI_PROJECTS_QUERY_FOR_EXPLORER],
    onError: onGraphQLError({
      title: "Project deletion failed",
    }),
    onCompleted: onMutationComplete({
      title: "Project(s) Deleted",
      callback: () => {
        if (project.parentId) {
          history.push(
            urlResolver.explorer.listing(
              project.organizationId,
              project.parentId
            )
          );
        } else {
          history.push(urlResolver.explorer.root(project.organizationId));
        }
      },
    }),
  });

  const onDeleteProject = () => {
    deleteProject({ variables: { projectId: project.id } });
  };

  const menuOptions: PopMenuOption[] = [
    {
      type: "info",
      component: (
        <div className="flex items-center bg-gradient-to-br from-gray-800 to-gray-500 px-4 py-2 text-sm font-medium tracking-wide text-gray-50">
          <FolderIcon className="mr-2 inline h-5 w-5 text-yellow-400" />
          {project.name}
        </div>
      ),
    },
    {
      label: "New Ticket",
      onClick: () => {
        setCreateTicketVisible(true);
      },
      type: "button",
      icon: (className) => <TicketIcon className={className} />,
    },
    {
      label: "New Sub Project",
      onClick: () => {
        setCreateProjectVisible(true);
      },
      type: "button",
      icon: (className) => <FolderIcon className={className} />,
    },
    {
      label: "Rename Project",
      onClick: () => {
        setEditProjectVisible(true);
      },
      type: "button",
      icon: (className) => <PencilIcon className={className} />,
    },
    {
      label: filter.flags.hideCompleted.value
        ? "Show completed"
        : "Hide completed",
      onClick: () => {
        dispatch(
          updateExplorerFilter({
            flags: {
              hideCompleted: {
                ...filter.flags.hideCompleted,
                value: !filter.flags.hideCompleted.value,
              },
            },
          })
        );
      },
      type: "button",
      icon: (className) =>
        filter.flags.hideCompleted.value ? (
          <EyeIcon className={className} />
        ) : (
          <EyeOffIcon className={className} />
        ),
    },
    // {
    //   type: "separator",
    // },
    // {
    //   label: "Export Project",
    //   onClick: () => props.exportProject(`project:${project.id}`),
    //   type: "button",
    //   icon: (className) => <DownloadIcon className={className} />,
    // },
    // {
    //   label: "Dependencies",
    //   to: urlResolver.dependency.dependency(orgId, params.path),
    //   type: "link",
    //   icon: (className) => <LinkIcon className={className} />,
    // },
    // {
    //   type: "separator",
    // },
    // {
    //   label: "Delete Project",
    //   onClick: () => {
    //     setDeleteConfirmVisible(true);
    //   },
    //   type: "button",
    //   danger: true,
    //   icon: (className) => <TrashIcon className={className} />,
    //   disabled: isHome,
    // },
  ];

  return (
    <>
      <DangerConfirm
        visible={isDeleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={onDeleteProject}
        title="Delete Project"
        description={`Deleting a project will delete all its sub projects too and all the tickets it contains.`}
        cta="Yes, Delete Project"
      />
      <TicketCreateModal
        visible={isCreateTicketVisible}
        onClose={() => setCreateTicketVisible(false)}
        defaultProjectId={project.id}
      />
      <ExplorerProjectCreateModal
        visible={isCreateProjectVisible}
        onClose={() => setCreateProjectVisible(false)}
        parentId={project.id}
        organizationId={project.organizationId}
        onCreate={(project) =>
          history.push(
            urlResolver.explorer.listing(project.organizationId, project.id)
          )
        }
      />
      <ExplorerProjectEditModal
        visible={isEditProjectVisible}
        onClose={() => setEditProjectVisible(false)}
        project={project}
        redirectOnUpdate
      />

      <PopMenu options={menuOptions} direction="bottom-left" size="large">
        <Menu.Button className="ml-1 shrink-0 rounded border border-transparent p-2 py-2.5 text-xs text-gray-500 transition hover:bg-brand-100 hover:text-brand-700 group-hover:text-gray-600 sm:py-2 md:ml-0 md:p-2">
          <MenuIcon className="h-5 w-5" />
        </Menu.Button>
      </PopMenu>
    </>
  );
};

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProjectForExplorer($projectId: Int!) {
    deleteProject(projectId: $projectId)
  }
`;

ProjectMenuButton.fragments = {
  ProjectMenuButtonFragment: gql`
    fragment ProjectMenuButtonFragment on Project {
      id
      name
      organizationId
      parentId
      ...ExplorerProjectEditModalFragment
    }
    ${ExplorerProjectEditModal.fragments.ExplorerProjectEditModalFragment}
  `,
};
