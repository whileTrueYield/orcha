import { filter, groupBy, trim } from "lodash";

export interface ProjectSet {
  subProjects: ProjectSet[];
  depth: number;
  name: string;
  path: string[];
}

export const getProjectSet = (
  paths: string[],
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
    filter(paths, (path) => path.split("/").length > depth),
    (path) => path.split("/")[depth]
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
  return "/" + pathFragment.map(trim).join("/");
};

export interface MdTitle {
  level: number;
  text: string;
}

export const getTitlesFromMarkdown = (markdown?: string | null): MdTitle[] => {
  const titles: MdTitle[] = [];

  if (!markdown) {
    return titles;
  }

  for (const line of markdown.split("\n")) {
    const results = /^(#+) ([^$]+)$/gi.exec(line);
    if (results) {
      titles.push({
        level: results[1].length,
        text: results[2],
      });
    }
  }

  return titles;
};
