import { gql } from "@apollo/client";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { FCWithFragments } from "types";
import cn from "classnames";
import { ExplorerPageCategory } from "../../explorer/Explorer/getUrlForExplorer";
import { Project } from "types/graphql";
import { useProjectParents } from "utils/project";
import { FolderIcon } from "@heroicons/react/outline";

interface Props {
  project?: Project | null;
  className?: string;
  category: ExplorerPageCategory;
  hideOnMobile?: boolean;
}

export const ProjectStaticCrumbs: FCWithFragments<Props> = (props) => {
  const getProjects = useProjectParents();

  if (!props.project) {
    return null;
  }

  const projectId = props.project.id;
  const projectAncestors = [...getProjects(props.project), props.project];

  const nodes = projectAncestors.map((project) => (
    <li key={project.id} className="min-w-0">
      <div className="flex min-w-0 items-center">
        {project.parentId ? (
          <ChevronRightIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
        ) : null}
        <span
          title={project.name}
          className={cn(
            "block whitespace-nowrap text-base font-medium text-gray-500",
            {
              "max-w-[12rem] truncate ": project.id !== projectId,
              "truncate ": project.id === projectId,
            }
          )}
        >
          {project.name}
        </span>
      </div>
    </li>
  ));

  const className = cn(
    "py-2 space-x-2 flex flex-row items-center overflow-x-auto",
    {
      flex: !props.hideOnMobile,
      "hidden sm:flex": props.hideOnMobile,
    },
    props.className
  );

  return (
    <ol className={className}>
      <FolderIcon className="h-5 w-5 shrink-0 text-gray-400" />
      {nodes}
    </ol>
  );
};

ProjectStaticCrumbs.fragments = {
  ProjectStaticCrumbsFragment: gql`
    fragment ProjectStaticCrumbsFragment on Project {
      id
      parentId
      name
      ancestors {
        id
        name
        parentId
      }
    }
  `,
};
