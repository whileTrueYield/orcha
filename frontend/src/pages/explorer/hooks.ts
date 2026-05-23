import {
  gql,
  MutationHookOptions,
  QueryHookOptions,
  useQuery,
} from "@apollo/client";
import {
  MutationArchiveProjectArgs,
  MutationDeleteProjectArgs,
  MutationMoveIntoProjectArgs,
  MutationMoveProjectToRootArgs,
  MutationPinProjectArgs,
  MutationPublishProjectArgs,
  MutationUnarchiveProjectArgs,
  MutationUnpinProjectArgs,
  QueryMyMiniProjectsArgs,
} from "types/graphql";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";

export const useArchiveProject = (
  options?: MutationHookOptions<any, MutationArchiveProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["archiveProject"],
    MutationPublishProjectArgs
  >(ARCHIVE_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not archive project" }),
    onCompleted: onMutationComplete({
      title: "Project has been archived",
    }),
    update: (cache, { data }) => {
      if (data) {
        // after archiving we want to flush the object cache
        // since the project should only be visible using a filter
        const project = data.archiveProject;
        cache.evict({ id: `MiniProject:${project.id}` });
        cache.evict({ id: `Project:${project.id}` });
      }
    },
    ...options,
  });

export const usePinProject = (
  options?: MutationHookOptions<any, MutationPinProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["pinProject"],
    MutationPinProjectArgs
  >(PIN_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not bookmark project" }),
    onCompleted: onMutationComplete({ title: "Bookmark created" }),
    ...options,
  });

export const useUnpinProject = (
  options?: MutationHookOptions<any, MutationPinProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["unpinProject"],
    MutationUnpinProjectArgs
  >(UNPIN_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not delete bookmark" }),
    onCompleted: onMutationComplete({ title: "Bookmark deleted" }),
    ...options,
  });

export const useDeleteProject = (
  options?: MutationHookOptions<any, MutationDeleteProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["deleteProject"],
    MutationDeleteProjectArgs
  >(DELETE_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not delete project" }),
    onCompleted: onMutationComplete({
      title: "Project has been deleted",
    }),
    ...options,
  });

export const usePublishProject = (
  options?: MutationHookOptions<any, MutationPublishProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["publishProject"],
    MutationPublishProjectArgs
  >(PUBLISH_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not publish project" }),
    update: (cache, { data }) => {
      if (data) {
        // update the MiniProject cache with the new stage
        const project = data.publishProject;
        cache.writeFragment({
          data: {
            stage: project.stage,
            ancestorIsArchived: project.ancestorIsArchived,
          },
          id: `MiniProject:${project.id}`,
          fragment: gql`
            fragment NewlyPublishedMiniProject on MiniProject {
              stage
              ancestorIsArchived
            }
          `,
        });
      }
    },
    ...options,
  });

export const useUnarchiveProject = (
  options?: MutationHookOptions<any, MutationUnarchiveProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["unarchiveProject"],
    MutationUnarchiveProjectArgs
  >(UNARCHIVE_PROJECT_MUTATION, {
    onError: onGraphQLError({ title: "Could not unarchiveProject project" }),
    update: (cache, { data }) => {
      if (data) {
        // update the MiniProject cache with the new stage
        const project = data.unarchiveProject;
        cache.writeFragment({
          data: {
            stage: project.stage,
            ancestorIsArchived: project.ancestorIsArchived,
          },
          id: `MiniProject:${project.id}`,
          fragment: gql`
            fragment NewlyPublishedMiniProject on MiniProject {
              stage
              ancestorIsArchived
            }
          `,
        });
      }
    },
    ...options,
  });

export const useMoveIntoProject = (
  options?: MutationHookOptions<any, MutationMoveIntoProjectArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["moveIntoProject"],
    MutationMoveIntoProjectArgs
  >(MOVE_INTO_PROJECT_MUTATION, {
    refetchQueries: ["myMiniProjects", "miniProjects", "GetTicketsForProject"],
    onError: onGraphQLError({ title: "Could not execute move" }),
    onCompleted: onMutationComplete({ title: "Move executed" }),
    ...options,
  });

export const useMoveProjectToRoot = (
  options?: MutationHookOptions<any, MutationMoveProjectToRootArgs>
) =>
  useBlockingMutation<
    MutationReturnValue["moveProjectToRoot"],
    MutationMoveProjectToRootArgs
  >(MOVE_PROJECT_TO_ROOT_MUTATION, {
    refetchQueries: ["myMiniProjects", "miniProjects", "GetTicketsForProject"],
    onError: onGraphQLError({ title: "Could not execute move" }),
    onCompleted: onMutationComplete({ title: "Move executed" }),
    ...options,
  });

export const useMyMiniProjects = (
  options?: QueryHookOptions<any, QueryMyMiniProjectsArgs>
) =>
  useQuery<QueryReturnValue["myMiniProjects"], QueryMyMiniProjectsArgs>(
    GET_MY_MINI_PROJECTS_QUERY,
    options
  );

const PUBLISH_PROJECT_MUTATION = gql`
  mutation publishProject($projectId: Int!) {
    publishProject(projectId: $projectId) {
      id
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

const UNARCHIVE_PROJECT_MUTATION = gql`
  mutation unarchiveProject($projectId: Int!) {
    unarchiveProject(projectId: $projectId) {
      id
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

const MOVE_INTO_PROJECT_MUTATION = gql`
  mutation moveIntoProject($projectId: Int!, $sources: [String!]!) {
    moveIntoProject(projectId: $projectId, sources: $sources)
  }
`;

const MOVE_PROJECT_TO_ROOT_MUTATION = gql`
  mutation moveProjectToRoot($projectId: Int!) {
    moveProjectToRoot(projectId: $projectId) {
      id
      name
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

export const GET_MY_MINI_PROJECTS_QUERY = gql`
  query myMiniProjects($includeArchived: Boolean) {
    myMiniProjects(includeArchived: $includeArchived) {
      id
      name
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

export const GET_MINI_PROJECTS_QUERY = gql`
  query miniProjects {
    miniProjects {
      id
      name
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

const DELETE_PROJECT_MUTATION = gql`
  mutation deleteProjectForActions($projectId: Int!) {
    deleteProject(projectId: $projectId)
  }
`;

const ARCHIVE_PROJECT_MUTATION = gql`
  mutation archiveProjectForActions($projectId: Int!) {
    archiveProject(projectId: $projectId) {
      id
      organizationId
      stage
      ancestorIsArchived
    }
  }
`;

export const PIN_PROJECT_MUTATION = gql`
  mutation PinProject($projectId: Int!) {
    pinProject(projectId: $projectId) {
      id
      pinnedProjects {
        id
        name
      }
    }
  }
`;

export const UNPIN_PROJECT_MUTATION = gql`
  mutation UnpinProject($projectId: Int!) {
    unpinProject(projectId: $projectId) {
      id
      pinnedProjects {
        id
        name
      }
    }
  }
`;
