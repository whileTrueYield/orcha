import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { BookmarkIcon, PencilIcon, PlusIcon } from "@heroicons/react/solid";
import { updateExplorerFilter } from "actions";
import { Checkbox } from "components/fields/Checkbox";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { find } from "lodash";
import { getParentProject } from "pages/explorer/helper";
import { TicketCreateModal } from "pages/ticket/TicketCreate/TicketCreateModal";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { getExplorerFilter, getMe } from "reducers/selector";
import { useAppDispatch } from "store";
import { FCWithFragments } from "types";
import { MutationDeleteProjectArgs, Project } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { ExplorerProjectCreateModal } from "./ExplorerProjectCreateModal";
import { ExplorerProjectEditModal } from "./ExplorerProjectEditModal";
import { usePinProject, useUnpinProject } from "pages/explorer/hooks";
import { MutationReturnValue } from "types/queryTypes";

interface Props {
  project: Project;
}

export const ExplorerProjectMenuBar: FCWithFragments<Props> = (props) => {
  const { project } = props;
  const history = useHistory();
  const me = useSelector(getMe);
  const [isCreateTicketVisible, setCreateTicketVisible] = useState(false);
  const [isCreateProjectVisible, setCreateProjectVisible] = useState(false);
  const [isEditProjectVisible, setEditProjectVisible] = useState(false);
  const [isDeleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const params = useParams<{ orgId: string; projectId?: string }>();
  const filter = useSelector(getExplorerFilter);
  const dispatch = useAppDispatch();

  const [pinProject] = usePinProject();
  const [unpinProject] = useUnpinProject();

  const [deleteProject] = useMutation<
    MutationReturnValue["deleteProject"],
    MutationDeleteProjectArgs
  >(DELETE_PROJECT_MUTATION, {
    refetchQueries: ["GetMiniProjectsForExplorer"],
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

  const isBookmarked = find(me?.role?.pinnedProjects, { id: project.id });

  const renderBookmarkButton = (project: Project) => {
    if (isBookmarked) {
      return (
        <button
          type="button"
          className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          onClick={() => unpinProject({ variables: { projectId: project.id } })}
        >
          <BookmarkIcon className=" h-5 w-5 text-pink-400 hover:text-pink-500" />
          <span className="hidden whitespace-nowrap 2xl:hidden">
            Bookmarked project
          </span>
          <span className="whitespace-nowrap 2xl:block">Bookmarked</span>
        </button>
      );
    } else {
      return (
        <button
          type="button"
          className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          onClick={() => pinProject({ variables: { projectId: project.id } })}
        >
          <BookmarkIcon className=" h-5 w-5 text-gray-300 group-hover:text-pink-500" />
          <span className="hidden whitespace-nowrap 2xl:block">
            Bookmark project
          </span>
          <span className="whitespace-nowrap 2xl:hidden">Bookmark</span>
        </button>
      );
    }
  };

  return (
    <>
      <DangerConfirm
        visible={isDeleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={onDeleteProject}
        title="Delete Project"
        description={`Deleting a project will delete all its sub projects too. The tickets will not be deleted but moved into the parent project (${
          getParentProject(params.projectId) || "Home"
        }).`}
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

      <div className="flex flex-row justify-between border-b bg-gray-50 px-2 py-1.5">
        <div className="flex flex-row space-x-2">
          <button
            type="button"
            onClick={() => setCreateTicketVisible(true)}
            className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50"
          >
            <PlusIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            <span className="hidden whitespace-nowrap 2xl:block">
              New Ticket
            </span>
            <span className="whitespace-nowrap 2xl:hidden">Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => setCreateProjectVisible(true)}
            className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50"
          >
            <PlusIcon className="h-4 w-4 opacity-50 group-hover:opacity-100" />
            <span className="hidden whitespace-nowrap 2xl:block">
              New Folder
            </span>
            <span className="whitespace-nowrap 2xl:hidden">Folder</span>
          </button>
          <button
            type="button"
            onClick={() => setEditProjectVisible(true)}
            className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            <PencilIcon className=" h-5 w-5 opacity-50 group-hover:opacity-100" />
            <span className="hidden whitespace-nowrap 2xl:block">
              Rename Folder
            </span>
            <span className="whitespace-nowrap 2xl:hidden">Rename</span>
          </button>
          <div className="h-full w-px bg-gray-200" />
          {/* <button
            type="button"
            onClick={() => props.exportProject(`project:${project.id}`)}
            className="group flex flex-row items-center space-x-1 rounded px-2 py-1 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-brand-600 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50 disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            <DownloadIcon className=" h-5 w-5 opacity-50 group-hover:opacity-100" />
            <span className="hidden whitespace-nowrap 2xl:block">
              Export tickets
            </span>
            <span className="whitespace-nowrap 2xl:hidden">Export</span>
          </button> */}

          {renderBookmarkButton(project)}
        </div>
        <div className="flex flex-row items-center">
          <label className="flex cursor-pointer flex-row items-center space-x-1.5 text-sm font-medium text-gray-500 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-50">
            <span>Hide completed</span>
            <Checkbox
              id="hide-completed"
              checked={!!filter.flags.hideCompleted.value}
              onChange={(event) =>
                dispatch(
                  updateExplorerFilter({
                    flags: {
                      hideCompleted: {
                        ...filter.flags.hideCompleted,
                        value: event.currentTarget.checked,
                      },
                    },
                  })
                )
              }
            />
          </label>
        </div>
      </div>
    </>
  );
};

const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProjectForExplorerMenuBar($projectId: Int!) {
    deleteProject(projectId: $projectId)
  }
`;

ExplorerProjectMenuBar.fragments = {
  ExplorerProjectMenuBarFragment: gql`
    fragment ExplorerProjectMenuBarFragment on Project {
      id
      organizationId
      parentId
      ...ExplorerProjectEditModalFragment
    }
    ${ExplorerProjectEditModal.fragments.ExplorerProjectEditModalFragment}
  `,
};
