import { gql, useQuery } from "@apollo/client";
import { keyBy } from "lodash";
import { useCallback, useEffect } from "react";
import { MiniProject, Project } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

/**
 * From a project and it's ancestors build a path only containing the ancestors
 *
 * This uses Project or miniProject which can easily be cached and cheaply laoded
 * @param project
 * @param ancestors
 * @returns
 */
export function getProjectParentPath(
  project: MiniProject | Project,
  ancestors?: MiniProject[]
): string[] {
  const projectsById = keyBy(ancestors, "id");
  const paths: string[] = [];

  let current = projectsById[project.id];
  // prevents a runaway threads by limiting the loops to 100.
  // infinite loop could happen if a partial cache update was
  // to occur creating a recursive parent child relation
  let loop = 0;

  while (current && current.parentId && loop < 100) {
    loop += 1;
    current = projectsById[current.parentId];
    if (current) {
      paths.unshift(current.name);
    } else {
      console.warn("Could not find parent project in ancestors", { ancestors });
      return paths;
    }
  }

  return paths;
}

/**
 * From a project and it's ancestors build a path only containing the ancestors
 *
 * This uses Project or miniProject which can easily be cached and cheaply laoded
 * @param project
 * @param ancestors
 * @returns
 */
export function getProjectParents(
  project: MiniProject | Project,
  ancestors?: MiniProject[]
): MiniProject[] {
  const projectsById = keyBy(ancestors, "id");
  const parents: MiniProject[] = [];

  let current = projectsById[project.id];
  // prevents a runaway threads by limiting the loops to 100.
  // infinite loop could happen if a partial cache update was
  // to occur creating a recursive parent child relation
  let loop = 0;

  while (current && current.parentId && loop < 100) {
    loop += 1;
    current = projectsById[current.parentId];
    if (current) {
      parents.unshift(current);
    } else {
      console.warn("Could not find parent project in ancestors", { ancestors });
      return parents;
    }
  }

  return parents;
}

// In order to display project ancestry, we require all the project
// to be loaded to reconstruct their path. This hook allows
// getProjectParentPath above to display every project's ancestry
export function useProjectPath() {
  // Apollo 3.14 deprecated the `onError` callback. The recommended pattern is
  // to derive side-effects from the `error` returned by the hook via useEffect.
  const { data, error } = useQuery<QueryReturnValue["myMiniProjects"]>(
    GET_MINI_PROJECTS_QUERY
  );

  useEffect(() => {
    if (error) console.error("Could not retrieve projects");
  }, [error]);

  const miniProjects = data?.myMiniProjects;

  return useCallback(
    (project: Project | MiniProject): string[] =>
      getProjectParentPath(project, miniProjects),
    [miniProjects]
  );
}

// In order to display project ancestry, we require all the project
// to be loaded to reconstruct their path. This hook allows
// getProjectParentPath above to display every project's ancestry
export function useProjectParents() {
  // Apollo 3.14 deprecated the `onError` callback. The recommended pattern is
  // to derive side-effects from the `error` returned by the hook via useEffect.
  const { data, error } = useQuery<QueryReturnValue["myMiniProjects"]>(
    GET_MINI_PROJECTS_QUERY
  );

  useEffect(() => {
    if (error) console.error("Could not retrieve projects");
  }, [error]);

  const miniProjects = data?.myMiniProjects;

  return useCallback(
    (project: Project | MiniProject): MiniProject[] =>
      getProjectParents(project, miniProjects),
    [miniProjects]
  );
}

export const GET_MINI_PROJECTS_QUERY = gql`
  query GetMiniProjectsForParentPath {
    myMiniProjects(includeArchived: true) {
      id
      name
      parentId
    }
  }
`;
