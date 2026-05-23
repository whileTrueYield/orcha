import cn from "classnames";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { Project } from "types/graphql";
import { useProjectPath } from "utils/project";

interface Props {
  project: Project;
  className?: string;
}
/**
 * Render a block component displaying the truncated full path of a project
 * but keeps the main folder visible:
 * "/foo/bar/biz/baz" -> "/foo/ba.../baz"
 *
 * This compnent use a project path caching hooks that rebuilds
 * the ancestry of the project provided, so long as the project
 * has its parentId attribute provided (see the fragment)
 */
export const TruncatedProjectPath: FCWithFragments<Props> = (props) => {
  const { project } = props;
  const getProjectPath = useProjectPath();
  const projectPath = getProjectPath(props.project);

  if (projectPath.length) {
    return (
      <div
        className={cn("flex min-w-0 flex-row truncate", props.className)}
        title={[...projectPath, project.name].join(" > ")}
      >
        <div className="flex-0 truncate opacity-70">
          {projectPath.join("/")}
        </div>
        <div className="shrink-0">
          <span>/{project.name}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className={cn("truncate", props.className)} title={project.name}>
        {project.name}
      </div>
    );
  }
};

TruncatedProjectPath.fragments = {
  TruncatedPathFragmentForProject: gql`
    fragment TruncatedPathFragmentForProject on Project {
      id
      name
      parentId
    }
  `,
};
