import { filter, groupBy } from "lodash";
import { ProjectGoalProgress } from "types/graphql";

/**
 * Sum the progress, total and accomplish of a project with its descendants.
 * The method also replaces the ETA with the largest ETA of its descendants.
 */
export function cumulateProjectProgress(
  goals?: ProjectGoalProgress[],
  acc: ProjectGoalProgress[] = []
): ProjectGoalProgress[] {
  if (!goals || goals.length === 0) {
    return acc;
  }

  // group every project by parentID to make the computation of
  // the inherited values easier.
  const children = groupBy(filter(goals, "parentId"), "parentId");

  for (const goal of goals) {
    acc.push({
      ...goal,
      ..._sumSubProject(goal, children),
    });
  }

  return acc;
}

interface ProjectProgress {
  progress: number;
  accomplished: number;
  total: number;
  eta: string;
}

/**
 * Recursive function suming the children, grand children... values of progress,
 * accomplished and total for a given project. It also selects the latest ETA date
 * from the children
 */
const _sumSubProject = (
  node: ProjectGoalProgress,
  children: { [parentId: number]: ProjectGoalProgress[] }
): ProjectProgress => {
  const acc = {
    progress: node.progress,
    accomplished: node.accomplished,
    total: node.total,
    eta: node.eta,
  };

  if (children[node.id]) {
    const subProjects = children[node.id].map((node) =>
      _sumSubProject(node, children)
    );

    for (const project of subProjects) {
      acc.progress += project.progress;
      acc.accomplished += project.accomplished;
      acc.total += project.total;

      if (project.eta > acc.eta) {
        acc.eta = project.eta;
      }
    }
  }

  return acc;
};
