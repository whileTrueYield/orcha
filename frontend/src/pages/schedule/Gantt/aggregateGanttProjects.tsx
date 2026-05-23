import { find, groupBy, keyBy, partition } from "lodash";
import { GanttProject, GanttProjectAncestry } from "./types";
import { Project } from "types/graphql";

/**
 * Creates a project tree with each project children stored under their
 * `parent.children` attribute.
 *
 * This method also aggregate children states and other information
 * onto the parent project to be displyed in a Gantt project.
 */
export function aggregateGanttProjects(
  projects?: GanttProject[],
  rootProjectId?: number
): GanttProject[] {
  const acc: GanttProject[] = [];

  if (!projects || projects.length === 0) {
    return acc;
  }

  // group every project by parentID to make the computation of
  // the inherited values easier.
  const [children, parents] = partition(projects, "parentId");
  const childrenByParentId = groupBy(children, "parentId");

  if (rootProjectId) {
    const project = find(projects, { id: rootProjectId });
    if (project) {
      return [_sumSubProject(project, childrenByParentId)];
    }
  }

  for (const project of parents) {
    acc.push(_sumSubProject(project, childrenByParentId));
  }

  return acc;
}

/**
 * Recursive function aggregating the children, grand children... for a project
 * It also captures the boundaries dates of the project based on all its children
 * and grand children and lower descent.
 */
const _sumSubProject = (
  project: GanttProject,
  projectIndex: { [parentId: number]: GanttProject[] },
  level: number = 0
): GanttProject => {
  project = {
    ...project,
    children: [...project.children],
    states: [...project.states],
    milestones: [...project.milestones],
    level,
  };

  if (projectIndex[project.id]) {
    const subProjects = projectIndex[project.id].map((project) =>
      _sumSubProject(project, projectIndex, level + 1)
    );

    for (const subProject of subProjects) {
      project.children.push(subProject);
      project.childrenStates = [
        ...project.childrenStates,
        ...subProject.states,
        ...subProject.childrenStates,
      ];
      project.childrenMilestones = [
        ...project.childrenMilestones,
        ...subProject.milestones,
        ...subProject.childrenMilestones,
      ];

      if (
        subProject.startDate &&
        (!project.startDate || subProject.startDate < project.startDate)
      ) {
        project.startDate = subProject.startDate;
      }

      if (
        subProject.stopDate &&
        (!project.stopDate || subProject.stopDate > project.stopDate)
      ) {
        project.stopDate = subProject.stopDate;
      }
    }
  }

  return project;
};

/**
 * Transform project tree and its children into a single level flat array.
 * In this flat list, children always follow their respective parent.
 *
 * Only project with an ID appearing in the opennedProjectIds argument will
 * display their children.
 *
 * @param project The project to flatten
 * @param opennedProjectIds number[] And array of opened project IDs
 * @returns
 */
export const flattenGanttTree = (
  project: GanttProject,
  opennedProjectIds: number[]
): GanttProject[] => {
  let projects = [project];

  if (opennedProjectIds.includes(project.id)) {
    for (const child of project.children) {
      projects = [...projects, ...flattenGanttTree(child, opennedProjectIds)];
    }
  }

  return projects;
};

/**
 * Create a key index of all project IDs with their ancestry. If
 * the project is a root project, its ancestry will be an empty array
 * @param projects
 * @returns
 */
export const getProjectAncestry = (
  projects: Project[]
): GanttProjectAncestry => {
  const projectByParentId = keyBy(projects, "id");

  const ancestry: GanttProjectAncestry = {};

  for (const project of projects) {
    ancestry[project.id] = [];
    let cursor = project;
    while (cursor.parentId) {
      ancestry[project.id].push(cursor.parentId);
      cursor = projectByParentId[cursor.parentId];
    }
  }

  return ancestry;
};
