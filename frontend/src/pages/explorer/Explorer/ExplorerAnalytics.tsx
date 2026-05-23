import { usePageTitle } from "hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { ProjectCrumbs } from "pages/project/ProjectView/ProjectCrumbs";
import { ExplorerTabs } from "./ExplorerTabs";
import { LazyProjectAnalyticView } from "pages/project/ProjectAnalytics/LazyProjectAnalyticView";
import { gql, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { ModelStage, QueryProjectArgs } from "types/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { QueryReturnValue } from "types/queryTypes";

interface params {
  projectId: string;
  orgId: string;
}

export const ExplorerAnalytics: FCWithFragments = () => {
  const params = useParams<params>();
  const projectId = parseInt(params.projectId);

  usePageTitle("Analytics");

  const { data } = useQuery<QueryReturnValue["project"], QueryProjectArgs>(
    GET_PROJECT_QUERY,
    {
      fetchPolicy: "cache-and-network", // Used for first execution
      variables: { id: projectId },
      onError: onGraphQLError({ title: "Could not retrieve project" }),
    }
  );

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col pb-20 sm:pb-6">
      <div className="my-4 flex flex-row items-center justify-between sm:my-4">
        <ProjectCrumbs
          project={data.project}
          category="analytics"
          hideOnMobile
        />
        <ExplorerTabs isDraft={data.project.stage === ModelStage.Draft} />
      </div>
      <div className="flex-1">
        <div className="mx-auto max-w-7xl">
          <LazyProjectAnalyticView projectId={projectId} />
        </div>
      </div>
    </div>
  );
};

ExplorerAnalytics.fragments = {
  ExplorerAnalyticsFragment: gql`
    fragment ExplorerAnalyticsFragment on Project {
      id
      ...ProjectCrumbsFragment
    }
    ${ProjectCrumbs.fragments.ProjectCrumbsFragment}
  `,
};

const GET_PROJECT_QUERY = gql`
  query getExplorerProjectForAnalytics($id: Int!) {
    project(id: $id) {
      id
      ...ExplorerAnalyticsFragment
    }
  }
  ${ExplorerAnalytics.fragments.ExplorerAnalyticsFragment}
`;
