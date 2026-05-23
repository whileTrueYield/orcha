import React, { useEffect, useMemo, useRef, useState } from "react";
import { groupBy, keyBy, without } from "lodash";
import { ProjectListingRow } from "./ProjectListingRow";
import { ExplorerPageCategory } from "pages/explorer/Explorer/getUrlForExplorer";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { ExplorerProjectCreateModal } from "../ExplorerMain/ExplorerProjectCreateModal";
import { MiniProject } from "types/graphql";
import { useHistory, useParams } from "react-router-dom";
import { FolderIcon } from "@heroicons/react/solid";
import cn from "classnames";
import { urlResolver } from "utils/navigation";
import { ToggleButton } from "components/fields/ToggleButton";
import { useSelector } from "react-redux";
import { getOpenedProjects, showArchivedProjects } from "reducers/selector";
import { useAppDispatch } from "store";
import { setOpenedProjects, setShowArchiveProjets } from "actions";
import { useMoveProjectToRoot, useMyMiniProjects } from "pages/explorer/hooks";

interface Props {
  onDrop: (source: string, projectId: number) => void;
  category: ExplorerPageCategory;
}

interface params {
  projectId: string;
  orgId: string;
}

export const ProjectListing: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const params = useParams<params>();
  const { projectId } = params;
  const projectListRef = useRef<HTMLDivElement>(null);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [isHovered, setHovered] = useState(false);
  const [isDragged, setDragged] = useState(false);

  const isArchiveProjectVisible = useSelector(showArchivedProjects);
  const openedProjects = useSelector(getOpenedProjects);

  const [moveProjectToRoot] = useMoveProjectToRoot();
  const { data } = useMyMiniProjects({
    variables: { includeArchived: isArchiveProjectVisible },
    fetchPolicy: "cache-and-network",
    onCompleted: ({ myMiniProjects }) => {
      const _openedProjects: number[] = [];
      const projectsById = keyBy(myMiniProjects, "id");
      let current: MiniProject | null = projectsById[projectId];
      while (current) {
        _openedProjects.push(current.id);
        current = current.parentId ? projectsById[current.parentId] : null;
      }
      dispatch(setOpenedProjects([..._openedProjects, ...openedProjects]));
    },
  });

  useEffect(() => {
    if (projectId) {
      const projectElt = document.getElementById(`project-${projectId}`);
      const listElt = projectListRef.current;
      if (projectElt && listElt) {
        const y =
          projectElt.getBoundingClientRect().top -
          listElt.getBoundingClientRect().y -
          50;

        projectListRef.current?.scroll({
          top: y,
          behavior: "smooth",
        });
      }
    }
  }, [projectId]);

  const miniProjects = useMemo(() => data?.myMiniProjects || [], [data]);

  const rootProjects = useMemo(
    () => miniProjects.filter((miniProject) => !miniProject.parentId),
    [miniProjects]
  );

  const projectsById = keyBy(miniProjects, "id");
  const projectsByParentId = groupBy(miniProjects, "parentId");

  const renderProject = (
    project: MiniProject,
    depth = 0
  ): React.ReactNode[] => {
    // we display project without parent and those who are marked as visible
    const isOpen = openedProjects.indexOf(project.id) > -1;
    const parent = project.parentId ? projectsById[project.parentId] : null;

    // if the project has no parent, it's automatically visible
    const isParentOpen = parent ? openedProjects.indexOf(parent.id) > -1 : true;
    const children = projectsByParentId[project.id] || [];

    if (isParentOpen) {
      const projectRow = (
        <ProjectListingRow
          key={project.id}
          isOpened={isOpen}
          onProjectOpen={(project) =>
            dispatch(setOpenedProjects([...openedProjects, project.id]))
          }
          onProjectClose={(project) =>
            dispatch(setOpenedProjects(without(openedProjects, project.id)))
          }
          project={project}
          onDrop={props.onDrop}
          category={props.category}
          depth={depth}
          hasChildren={children.length > 0}
        />
      );

      return [
        projectRow,
        ...children.map((project) => renderProject(project, depth + 1)),
      ];
    }

    return [];
  };

  const containerClass = cn(
    "sticky top-0 z-10 flex bg-white flex-row items-center justify-between p-2",
    {
      "bg-yellow-100": isHovered,
    }
  );

  const belowContainerClass = cn("flex-1", {
    "bg-yellow-100": isHovered,
  });

  return (
    <>
      <ExplorerProjectCreateModal
        parentId={parseInt(projectId)}
        organizationId={parseInt(params.orgId)}
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={(project) => {
          history.push(urlResolver.explorer.editor(params.orgId, project.id));
        }}
      />

      <div className="sticky top-6">
        <div
          ref={projectListRef}
          className="flex h-[calc(100vh-148px)] w-48 shrink-0 flex-col overflow-y-auto rounded border bg-white xl:w-56 2xl:w-72"
        >
          <div
            onDragOver={(event) => {
              if (!isHovered && !isDragged) {
                setHovered(true);
              }
              event.preventDefault();
            }}
            onDragLeave={() => isHovered && setHovered(false)}
            onDrop={(event) => {
              setDragged(false);
              setHovered(false);
              const [objectType, objectId] = event.dataTransfer
                .getData("record/ids")
                .split(":");

              if (objectType === "project") {
                moveProjectToRoot({
                  variables: { projectId: parseInt(objectId) },
                });
              }
            }}
            className={containerClass}
          >
            <span className="flex flex-row items-center space-x-1 text-sm font-medium text-gray-600">
              <FolderIcon className="h-5 w-5 text-yellow-400" />
              <span>Folders</span>
            </span>
            <Button
              onClick={() => setCreateModalVisible(true)}
              type="button"
              btnSize="xsmall"
              btnType="primary"
            >
              <PlusIcon className="-ml-0.5 mr-1 h-3 w-3" />
              New<span className="ml-1 hidden xl:inline"> Project</span>
            </Button>
          </div>
          <div className="shrink-0 pl-2">
            {rootProjects.map((project) => renderProject(project))}
          </div>
          <div
            onDragOver={(event) => {
              if (!isHovered && !isDragged) {
                setHovered(true);
              }
              event.preventDefault();
            }}
            onDragLeave={() => isHovered && setHovered(false)}
            onDrop={(event) => {
              setDragged(false);
              setHovered(false);
              const [objectType, objectId] = event.dataTransfer
                .getData("record/ids")
                .split(":");

              if (objectType === "project") {
                moveProjectToRoot({
                  variables: { projectId: parseInt(objectId) },
                });
              }
            }}
            className={belowContainerClass}
          ></div>
          <div className="sticky bottom-0 flex shrink-0 flex-row border-t bg-white py-2 pl-2">
            <ToggleButton
              checked={isArchiveProjectVisible}
              onChange={(show) => dispatch(setShowArchiveProjets(show))}
              label="Show Archived Projects"
              small
            />
          </div>
        </div>
      </div>
    </>
  );
};
