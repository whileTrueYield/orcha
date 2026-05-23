import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { ModelStage, QueryProjectArgs } from "types/graphql";
import { ProjectListing } from "./ExplorerSide/ProjectListing";
import { onGraphQLError } from "utils/GQLClient";
import { ProjectCrumbs } from "pages/project/ProjectView/ProjectCrumbs";
import { ExplorerTabs } from "./ExplorerTabs";
import { Dependency } from "pages/dependencies/Dependency/Dependency";
import { EmptyState } from "components/views/EmtpyState";
import { FCWithFragments } from "types";
import { useMoveIntoProject } from "../hooks";
import { QueryReturnValue } from "types/queryTypes";

interface params {
  projectId: string;
  orgId: string;
}

export const ExplorerDependencies: FCWithFragments = () => {
  const params = useParams<params>();
  const orgId = params.orgId;
  const projectId = parseInt(params.projectId);

  usePageTitle("Dependencies");

  const [selection, setSelection] = useState<string[]>([]);

  const { data } = useQuery<QueryReturnValue["project"], QueryProjectArgs>(
    GET_PROJECT_QUERY,
    {
      fetchPolicy: "cache-and-network", // Used for first execution
      nextFetchPolicy: "cache-first", // Used for subsequent executions
      variables: { id: projectId },
      onError: onGraphQLError({ title: "Could not retrieve project" }),
    }
  );

  const [moveIntoProject] = useMoveIntoProject({
    onCompleted: () => setSelection([]),
  });

  const onDrop = (source: string, projectId: number) => {
    if (!source) {
      return;
    }
    if (selection.indexOf(source) > -1) {
      moveIntoProject({
        variables: {
          sources: selection,
          projectId,
        },
      });
    } else {
      moveIntoProject({
        variables: {
          sources: [source],
          projectId,
        },
      });
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col pb-6 sm:pb-0">
        <div className="flex flex-row items-center justify-end space-x-4 sm:my-4">
          <ExplorerTabs />
        </div>

        <div className="flex min-w-0 flex-row sm:space-x-2">
          <div className="hidden lg:block">
            <ProjectListing onDrop={onDrop} category="description" />
          </div>
          <EmptyState title="Select a project" />
        </div>
      </div>
    );
  }

  const { project } = data;

  return (
    <div className="flex flex-col pb-6 sm:pb-0">
      <div className="flex flex-row items-center justify-between space-x-4 sm:my-4">
        <ProjectCrumbs project={project} category="dependencies" hideOnMobile />
        <ExplorerTabs isDraft={project.stage === ModelStage.Draft} />
      </div>

      <div className="flex-1">
        <Dependency project={project} orgId={orgId} />
      </div>
    </div>
  );
};

ExplorerDependencies.fragments = {
  ExplorerDependenciesFragment: gql`
    fragment ExplorerDependenciesFragment on Project {
      id
      name
      parentId
      updatedAt
      owner {
        id
        name
        avatarUrl
      }
      ...ProjectCrumbsFragment
    }
    ${ProjectCrumbs.fragments.ProjectCrumbsFragment}
  `,
};

const GET_PROJECT_QUERY = gql`
  query getExplorerForDependencies($id: Int!) {
    project(id: $id) {
      id
      ...ExplorerDependenciesFragment
    }
  }
  ${ExplorerDependencies.fragments.ExplorerDependenciesFragment}
`;
