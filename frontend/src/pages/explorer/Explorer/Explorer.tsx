import { gql, useQuery } from "@apollo/client";
import { usePageTitle } from "hooks/usePageTitle";
import { useParams } from "react-router-dom";
import { ModelStage, QueryProjectArgs } from "types/graphql";
import { ExplorerMain } from "./ExplorerMain/ExplorerMain";
import { ProjectListing } from "./ExplorerSide/ProjectListing";
import { onGraphQLError } from "utils/GQLClient";
import { ProjectCrumbs } from "pages/project/ProjectView/ProjectCrumbs";
import { ExplorerTabs } from "./ExplorerTabs";
import { EmptyState } from "components/views/EmtpyState";
import { FCWithFragments } from "types";
import { useMoveIntoProject } from "../hooks";
import { Transition } from "@headlessui/react";
import { TicketBatchEditOverlay } from "pages/ticket/TicketBatchEdit/TicketBatchEditOverlay";
import { clearSelection } from "actions";
import { useAppDispatch } from "store";
import { useSelector } from "react-redux";
import { getSelectedItems } from "reducers/selector";
import { QueryReturnValue } from "types/queryTypes";

interface params {
  projectId: string;
  orgId: string;
}

export const Explorer: FCWithFragments = () => {
  const params = useParams<params>();
  const projectId = parseInt(params.projectId);
  const selection = useSelector(getSelectedItems("project"));
  const dispatch = useAppDispatch();
  usePageTitle("Tickets");

  const { data } = useQuery<QueryReturnValue["project"], QueryProjectArgs>(
    GET_PROJECT_QUERY,
    {
      fetchPolicy: "cache-and-network", // Used for first execution
      nextFetchPolicy: "cache-first", // Used for subsequent executions
      variables: { id: projectId },
      onError: onGraphQLError({ title: "Could not retrieve project" }),
    },
  );

  const [moveIntoProject] = useMoveIntoProject({
    onCompleted: () => dispatch(clearSelection("search")),
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
      <div className="flex flex-col pb-20 sm:pb-0">
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
    <div className="flex flex-col pb-20 sm:pb-0">
      <div className="flex flex-row items-center justify-between space-x-4 sm:my-4">
        <ProjectCrumbs project={project} category="listing" hideOnMobile />
        <ExplorerTabs isDraft={project.stage === ModelStage.Draft} />
      </div>
      <div className="flex min-w-0 flex-row sm:space-x-2">
        <div className="hidden sm:block">
          <ProjectListing onDrop={onDrop} category="listing" />
        </div>
        <ExplorerMain project={project} onDrop={onDrop} />
      </div>
      <Transition
        appear={true}
        show={selection.length > 0}
        className="fixed bottom-12 right-1/2 z-20 -mr-[150px] transition-all sm:right-1/4 lg:right-1/3"
        enter="duration-500"
        enterFrom="opacity-0 -bottom-0"
        enterTo="opacity-100 bottom-14"
        entered="bottom-14"
        leave="duration-250"
        leaveFrom="opacity-100 bottom-14"
        leaveTo="opacity-0 -bottom-0"
      >
        <div className="flex flex-row items-center justify-center">
          <TicketBatchEditOverlay className="shadow-lg" domain="project" />
        </div>
      </Transition>
    </div>
  );
};

Explorer.fragments = {
  ExplorerFragment: gql`
    fragment ExplorerFragment on Project {
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
      ...ExplorerMainFragment
    }
    ${ProjectCrumbs.fragments.ProjectCrumbsFragment}
    ${ExplorerMain.fragments.ExplorerMainFragment}
  `,
};

const GET_PROJECT_QUERY = gql`
  query getExplorerForTicketListing($id: Int!) {
    project(id: $id) {
      id
      ...ExplorerFragment
    }
  }
  ${Explorer.fragments.ExplorerFragment}
`;
