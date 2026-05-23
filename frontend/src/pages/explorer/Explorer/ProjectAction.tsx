import { gql } from "@apollo/client";
import { Menu } from "@headlessui/react";
import { ArchiveIcon, TrashIcon, UploadIcon } from "@heroicons/react/outline";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { FCWithFragments } from "types";
import { ModelStage, Project } from "types/graphql";
import { onMutationComplete } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import cn from "classnames";
import {
  useArchiveProject,
  useDeleteProject,
  usePublishProject,
  useUnarchiveProject,
} from "../hooks";

interface Props {
  project: Project;
}

export const ProjectActions: FCWithFragments<Props> = (props) => {
  const { project } = props;
  const history = useHistory();
  const [confirmArchiveVisible, setConfirmArchiveVisible] = useState(false);
  const [confirmUnarchiveVisible, setConfirmUnarchiveVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [confirmPublishVisible, setConfirmPublishVisible] = useState(false);

  const [archiveProject] = useArchiveProject({
    variables: { projectId: project.id },
    onCompleted: onMutationComplete({
      title: "Project has been archived",
    }),
  });

  const [unarchiveProject] = useUnarchiveProject({
    variables: { projectId: project.id },
  });

  const [deleteProject] = useDeleteProject({
    variables: { projectId: project.id },
    onCompleted: onMutationComplete({
      title: "Project has been deleted",
      callback: () =>
        history.push(urlResolver.explorer.root(project.organizationId)),
    }),
    update: (cache, { data }) => {
      if (data) {
        // after deletion we want to flush the object cache
        cache.evict({ id: `MiniProject:${project.id}` });
        cache.evict({ id: `Project:${project.id}` });
      }
    },
  });

  const [publishProject] = usePublishProject({
    variables: { projectId: project.id },
  });

  const menuOptions: PopMenuOption[] = [];

  const deleteProjectOption: PopMenuOption = {
    label: "Delete Project",
    type: "button",
    danger: true,
    icon: (className) => <TrashIcon className={className} />,
    onClick: () => setConfirmDeleteVisible(true),
  };

  const archiveProjectOption: PopMenuOption = {
    label: "Archive Project",
    type: "button",
    danger: true,
    icon: (className) => <ArchiveIcon className={className} />,
    onClick: () => setConfirmArchiveVisible(true),
  };

  const publishProjectOption: PopMenuOption = {
    label: "Publish Project",
    type: "button",
    icon: (className) => <UploadIcon className={className} />,
    onClick: () => setConfirmPublishVisible(true),
  };

  const unarchiveProjectOption: PopMenuOption = {
    label: "Un-archive Project",
    type: "button",
    icon: (className) => <ArchiveIcon className={className} />,
    onClick: () => setConfirmUnarchiveVisible(true),
  };

  if (project.ancestorIsArchived) {
    menuOptions.push({
      type: "info",
      component: (
        <div className="border-b bg-orange-50 px-4 py-2 text-sm leading-6 text-orange-700">
          This project is archived because{" "}
          <strong className="font-semibold">
            one of its ancestor is archived
          </strong>
          . To un-archive this project, you'll need to un-archive its ancestor.
        </div>
      ),
    });
    menuOptions.push(deleteProjectOption);
  } else if (project.stage === ModelStage.Draft) {
    menuOptions.push({
      type: "info",
      component: (
        <div className="border-b bg-gray-50 px-4 py-2 text-sm leading-6 text-gray-700">
          <strong className="font-semibold">
            This project is in draft mode.
          </strong>{" "}
          This means it will not be listed to other member of your organization
          unless you share a link to it.
        </div>
      ),
    });
    menuOptions.push(publishProjectOption);
    menuOptions.push({ type: "separator" });
    menuOptions.push(archiveProjectOption);
    menuOptions.push(deleteProjectOption);
  } else if (project.stage === ModelStage.Published) {
    menuOptions.push(archiveProjectOption);
    menuOptions.push(deleteProjectOption);
  } else if (project.stage === ModelStage.Archived) {
    menuOptions.push({
      type: "info",
      component: (
        <div className="border-b bg-orange-50 px-4 py-2 text-sm leading-6 text-orange-700">
          <strong className="font-semibold">
            This project and all its sub-projects has been archived.
          </strong>{" "}
          Unarchiving this project will also unarchive all its published
          sub-projects.
        </div>
      ),
    });

    menuOptions.push(unarchiveProjectOption);
    menuOptions.push({ type: "separator" });
    menuOptions.push(deleteProjectOption);
  }

  const renderActionButton = () => {
    const className =
      "z-50 flex flex-row items-center space-x-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600";

    if (project.ancestorIsArchived) {
      return (
        <Menu.Button
          className={cn(
            className,
            "bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100"
          )}
        >
          <span className="text-sm">Child of Archived</span>
          <ChevronDownIcon className="h-5 w-5 text-orange-600" />
        </Menu.Button>
      );
    }
    if (project.stage === ModelStage.Archived) {
      return (
        <Menu.Button
          className={cn(
            className,
            "bg-orange-50 text-orange-700 transition-colors hover:bg-orange-100"
          )}
        >
          <span className="text-sm">Archived Project</span>
          <ChevronDownIcon className="h-5 w-5 text-orange-600" />
        </Menu.Button>
      );
    }
    if (project.stage === ModelStage.Draft) {
      return (
        <Menu.Button
          className={cn(
            className,
            "bg-gray-50 text-gray-700 transition-colors hover:bg-gray-100"
          )}
        >
          <span className="text-sm">Draft Project</span>
          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
        </Menu.Button>
      );
    }
    if (project.stage === ModelStage.Published) {
      return (
        <Menu.Button
          className={cn(
            className,
            "bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
          )}
        >
          <span className="text-sm">
            Published
            <span className="hidden sm:inline"> Project</span>
          </span>
          <ChevronDownIcon className="h-5 w-5 text-sky-600" />
        </Menu.Button>
      );
    }
  };

  return (
    <div>
      <DangerConfirm
        cta="Delete Project"
        description="Are you sure you want to delete this project? Only project without sub project and/or ticket can be deleted. This action cannot be undone."
        onConfirm={deleteProject}
        onClose={() => setConfirmDeleteVisible(false)}
        title={`Delete Project?`}
        visible={confirmDeleteVisible}
      />
      <WarningConfirm
        cta="Archive Project"
        description="Are you sure you want to archive this project? This action cannot be undone."
        onConfirm={archiveProject}
        onClose={() => setConfirmArchiveVisible(false)}
        title={`Archive Project?`}
        visible={confirmArchiveVisible}
      />
      <ConfirmModal
        onClose={() => setConfirmPublishVisible(false)}
        title="Publish Project?"
        description="Please confirm you want to publish this project. This will make this project visible to everyone in your organization."
        onConfirm={publishProject}
        visible={confirmPublishVisible}
        cta="Publish Project"
      />
      <ConfirmModal
        onClose={() => setConfirmUnarchiveVisible(false)}
        title="Un-archive Project?"
        description="Please confirm you want to un-archive this project. This will make this project visible to everyone in your organization."
        onConfirm={unarchiveProject}
        visible={confirmUnarchiveVisible}
        cta="Un-archive Project"
      />

      <PopMenu options={menuOptions} size="xlarge" direction="bottom-left">
        {renderActionButton()}
      </PopMenu>
    </div>
  );
};

ProjectActions.fragments = {
  ProjectActionsFragment: gql`
    fragment ProjectActionsFragment on Project {
      id
      organizationId
      stage
      ancestorIsArchived
    }
  `,
};
