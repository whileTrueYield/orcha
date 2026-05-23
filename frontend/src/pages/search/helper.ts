import { filter, groupBy, trim } from "lodash";

export interface ProjectSet {
  subProjects: ProjectSet[];
  depth: number;
  name: string;
  path: string[];
}

export const getProjectSet = (
  projects: { path: string }[],
  depth: number = 0,
  name: string = "",
  path: string[] = []
): ProjectSet => {
  const projectSet: ProjectSet = {
    subProjects: [],
    depth,
    name,
    path,
  };

  const roots = groupBy(
    filter(projects, ({ path }) => path.split("/").length > depth),
    ({ path }) => path.split("/")[depth]
  );

  for (const subRoot in roots) {
    projectSet.subProjects.push(
      getProjectSet(roots[subRoot], depth + 1, subRoot, [...path, subRoot])
    );
  }

  return projectSet;
};

export const formatPath = (path?: string | null): string => {
  path = path || "";
  const pathFragment = path.split("/");
  return pathFragment
    .map(trim) // remove spaces "foo/ bar  /baz" => "foo/bar/baz"
    .filter((part) => part) // remove empty parts like "/foo/ /bar/"
    .join("/");
};

export const getParentProject = (path?: string | null): string => {
  if (path) {
    const parts = formatPath(path).split("/");
    if (parts.length) {
      return parts.slice(0, parts.length - 1).join("/");
    }
  }

  return "";
};

export const getProjectName = (
  path?: string | null,
  rootName: string = "Home"
): string => {
  if (path) {
    const parts = formatPath(path).split("/");
    if (parts.length) {
      return parts[parts.length - 1];
    }
  }

  return rootName;
};
