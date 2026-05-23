import { normalizeProjectPath } from "utils/string";

export interface ProjectSet {
  subProjects: ProjectSet[];
  depth: number;
  name: string;
  path: string[];
}

export const getParentProject = (path?: string | null): string => {
  if (path) {
    const parts = normalizeProjectPath(path).split("/");
    if (parts.length) {
      return parts.slice(0, parts.length - 1).join("/");
    }
  }

  return "";
};
