import { urlResolver } from "utils/navigation";

export type ExplorerPageCategory =
  | "listing"
  | "description"
  | "analytics"
  | "dependencies";

export const getUrlForExplorer = (
  category: ExplorerPageCategory,
  orgId: string,
  projectId: number
): string => {
  switch (category) {
    case "analytics":
      return urlResolver.explorer.analytics(orgId, projectId);
    case "dependencies":
      return urlResolver.explorer.dependencies(orgId, projectId);
    case "description":
      return urlResolver.explorer.editor(orgId, projectId);
    case "listing":
    default:
      return urlResolver.explorer.listing(orgId, projectId);
  }
};
