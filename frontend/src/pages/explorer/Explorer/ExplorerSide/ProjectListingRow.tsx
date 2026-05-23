import React, { useState } from "react";
import cn from "classnames";
import { useHistory, useParams } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/outline";
import {
  ExplorerPageCategory,
  getUrlForExplorer,
} from "pages/explorer/Explorer/getUrlForExplorer";
import { MiniProject, ModelStage } from "types/graphql";

interface Props {
  project: MiniProject;
  onProjectOpen: (project: MiniProject) => void;
  onProjectClose: (project: MiniProject) => void;
  isOpened: boolean;
  onDrop: (source: string, projectId: number) => void;
  category: ExplorerPageCategory;
  depth: number;
  hasChildren?: boolean;
}

// TODO: projectId shouldn't be optional anymore
interface params {
  projectId?: string;
  orgId: string;
}

export const ProjectListingRow: React.FC<Props> = (props) => {
  const [isHovered, setHovered] = useState(false);
  const [isDragged, setDragged] = useState(false);

  const params = useParams<params>();
  const currentProjectId = params.projectId ? parseInt(params.projectId) : null;
  const isCurrent = props.project.id === currentProjectId;

  const isPublished =
    !props.project.ancestorIsArchived &&
    props.project.stage === ModelStage.Published;
  const isDraft =
    !props.project.ancestorIsArchived &&
    props.project.stage === ModelStage.Draft;
  const isArchived =
    props.project.ancestorIsArchived ||
    props.project.stage === ModelStage.Archived;

  const history = useHistory();
  const name = props.project.name;

  const { orgId } = useParams<{ orgId: string }>();

  const chevronIcon = cn("w-5 h-5 transition", {
    "-rotate-90 text-gray-500": props.isOpened,
  });

  const containerClass = cn(
    "flex-1 flex flex-row block items-center text-sm min-w-0 my-0.5",
    {
      "rounded-l pl-2": !isCurrent,
      "bg-gray-100 border-l-4 pl-1 border-gray-300 text-gray-600 rounded-l font-medium":
        isCurrent && isDraft,
      "bg-brand-100 border-l-4 pl-1 border-brand-500 text-brand-700 rounded-l font-medium":
        isCurrent && isPublished,
      "bg-orange-100 border-l-4 pl-1 border-orange-500 text-orange-700 rounded-l font-medium":
        isCurrent && isArchived,

      "text-gray-600": !isCurrent && isPublished,
      "text-gray-500": !isCurrent && isDraft,
      "text-orange-600": !isCurrent && isArchived,

      "bg-yellow-100": isHovered,
      "hover:bg-gray-100": !isCurrent && !isHovered,
    }
  );

  const renderExpandButton = () => (
    <button
      type="button"
      className="shrink-0 rounded px-2 py-1.5 text-gray-300 hover:text-gray-600"
      onClick={(event) => {
        event.stopPropagation();
        props.isOpened
          ? props.onProjectClose(props.project)
          : props.onProjectOpen(props.project);
      }}
      aria-label={
        props.isOpened ? "Collapse sub-projects" : "Open sub-projects"
      }
    >
      <ChevronLeftIcon className={chevronIcon} />
    </button>
  );

  return (
    <div className="flex flex-row">
      <div
        className="shrink-0"
        style={{
          paddingLeft: `${props.depth * 16}px`,
        }}
      ></div>
      <div
        role="button"
        onClick={() => {
          if (isCurrent) {
            props.isOpened
              ? props.onProjectClose(props.project)
              : props.onProjectOpen(props.project);
          } else {
            props.onProjectOpen(props.project);
            history.push(
              getUrlForExplorer(props.category, orgId, props.project.id)
            );
          }
        }}
        className={containerClass}
      >
        <div
          onDrop={(event) => {
            setDragged(false);
            setHovered(false);
            props.onDrop(
              event.dataTransfer.getData("record/ids"),
              props.project.id
            );
          }}
          id={`project-${props.project.id}`}
          className="flex-1 truncate py-1.5"
          title={name}
          draggable
          onDragEnd={() => {
            setDragged(false);
            setHovered(false);
          }}
          onDragStart={(event) => {
            setDragged(true);
            event.dataTransfer.setData(
              "record/ids",
              `project:${props.project.id}`
            );
          }}
          onDragLeave={() => isHovered && setHovered(false)}
          onDragOver={(event) => {
            if (!isHovered && !isDragged) {
              setHovered(true);
            }
            event.preventDefault();
          }}
        >
          {name}
        </div>
        {props.hasChildren ? renderExpandButton() : null}
      </div>
    </div>
  );
};
