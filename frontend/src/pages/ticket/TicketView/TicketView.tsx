import { useState } from "react";

import { useHistory, useParams } from "react-router-dom";

import { gql } from "@apollo/client";
import {
  Ticket,
  TicketStatus,
  ModelStage,
  MutationUpdateTicketStageArgs,
  MutationUpdateTicketStatusArgs,
  MutationMarkTicketNotDoneArgs,
  MutationChangeTicketWorkflowArgs,
  MutationSupersedeTicketWorkflowArgs,
} from "types/graphql";
import { urlResolver } from "utils/navigation";
import { useQuery } from "@apollo/client";
import { EmptyState } from "components/views/EmtpyState";
import { TicketBody } from "./TicketBody";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { TicketInfo } from "./TicketInfo";
import { TicketComments } from "./TicketComments";
import { TicketFeatures } from "./TicketFeatures";
import { TicketWorkflowStateAssigneeModal } from "./TicketWorkflowState";
import { TicketEstimateModal } from "./TicketWorkflowState/TicketEstimateModal";
import { TicketNote } from "./TicketNote";
import { TicketStageManager } from "./TicketStageManager/TicketStageManager";
import { TicketOtherActions } from "./TicketOtherActions";
import { FCWithFragments } from "types";
import { TicketDependency } from "./TicketDependency/TicketDependency";
import { Tab, Tabs } from "components/fields/Tab";
import { plural } from "utils/string";
import { TicketRating } from "./TicketRating";
import { TicketClosingNote } from "./TicketClosingNote";
import { useBlockingMutation } from "utils/graphql";
import { TicketOwner } from "./TicketOwner";
import { usePageTitle } from "hooks/usePageTitle";
import { TicketProject } from "./TicketProject";
import { TicketTagInput } from "./TicketTagInput";
import { TicketMilestone } from "./TicketMilestone";
import { TicketIssues } from "./TicketIssues";
import { ProjectCrumbs } from "pages/project/ProjectView/ProjectCrumbs";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { TicketNotes } from "./TicketNotes";
import { TicketChanges } from "./TicketChanges";
import { MutationReturnValue, QueryReturnValue } from "types/queryTypes";
import { TicketDependencyWarning } from "./TicketDependencyWarning";
import { useAddToRecentlyVisitedTicket } from "utils/preferences";
import { TicketTitle } from "./TicketTitle";
import {
  TicketSupersededByBanner,
  TicketSupersedesChip,
} from "./TicketSupersedeLineage";

interface TicketViewUrlParams {
  orgId: string;
  ticketId: string;
}

export const TicketView: FCWithFragments = () => {
  const urlParams = useParams<TicketViewUrlParams>();
  const ticketId = parseInt(urlParams.ticketId);
  const history = useHistory();
  const addToRecentlyVisitedTicket = useAddToRecentlyVisitedTicket();
  const [subTab, setSubTab] = useState<
    "comments" | "dependencies" | "notes" | "changes"
  >("comments");
  usePageTitle("Ticket View");

  const { data, loading } = useQuery<QueryReturnValue["ticket"]>(
    GET_TICKET_QUERY,
    {
      fetchPolicy: "cache-and-network", // Used for first execution
      nextFetchPolicy: "cache-first", // Used for subsequent executions
      variables: {
        id: ticketId,
      },
      onError: onGraphQLError({ title: "Could not retrieve ticket" }),
      onCompleted: ({ ticket }) => {
        addToRecentlyVisitedTicket(ticket);
      },
    },
  );

  useRefetchOnVisible([GET_TICKET_QUERY]);

  const [updateTicketStage] = useBlockingMutation<
    { updateTicketStage: Ticket },
    MutationUpdateTicketStageArgs
  >(UPDATE_TICKET_STAGE_MUTATION, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been updated",
    }),
  });

  const [markTicketNotDone] = useBlockingMutation<
    MutationReturnValue["markTicketNotDone"],
    MutationMarkTicketNotDoneArgs
  >(UPDATE_TICKET_AS_NOT_DONE, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been updated",
    }),
  });

  const [updateTicketStatus] = useBlockingMutation<
    { updateTicketStatus: Ticket },
    MutationUpdateTicketStatusArgs
  >(UPDATE_TICKET_STATUS_MUTATION, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket has been updated",
    }),
  });

  const [changeTicketWorkflow] = useBlockingMutation<
    { changeTicketWorkflow: Ticket },
    MutationChangeTicketWorkflowArgs
  >(CHANGE_TICKET_WORKFLOW_MUTATION, {
    // This mutation now serves both an in-place workflow reset and a product
    // move that may keep the workflow (plan preserved). A neutral message stays
    // accurate for both; the stage UI already prompts for estimates when the
    // ticket actually re-enters estimation.
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket updated",
    }),
  });

  const onTicketStatusChange = (status: TicketStatus, note?: string) => {
    updateTicketStatus({ variables: { ticketId: ticket.id, note, status } });
  };

  // Superseding closes this ticket and creates a new linked successor under the
  // chosen workflow (ADR 0010). The mutation returns the successor, so on success
  // we navigate there — staying on the now-closed original would be confusing.
  const [supersedeTicketWorkflow] = useBlockingMutation<
    { supersedeTicketWorkflow: Ticket },
    MutationSupersedeTicketWorkflowArgs
  >(SUPERSEDE_TICKET_WORKFLOW_MUTATION, {
    onError: onGraphQLError({ title: "Could not supersede ticket" }),
    onCompleted: (mutationData) => {
      onMutationComplete<{ supersedeTicketWorkflow: Ticket }>({
        title: "Ticket superseded — continue on the new ticket",
      })(mutationData);
      history.push(
        urlResolver.ticket.view(
          urlParams.orgId,
          mutationData.supersedeTicketWorkflow.id,
        ),
      );
    },
  });

  // productId is optional (Phase 2, ADR 0010): present when the action also moves
  // the ticket to another product, omitted for a same-product workflow change.
  const onChangeWorkflow = (workflowId: number, productId?: number) => {
    changeTicketWorkflow({
      variables: { ticketId: ticket.id, workflowId, productId },
    });
  };

  const onSupersedeWorkflow = (workflowId: number, productId?: number) => {
    supersedeTicketWorkflow({
      variables: { ticketId: ticket.id, workflowId, productId },
    });
  };

  const onTicketStageChange = (stage: ModelStage) => {
    updateTicketStage({ variables: { ticketId: ticket.id, stage } });
  };

  const onMarkTicketNotDone = () => {
    markTicketNotDone({ variables: { ticketId: ticket.id } });
  };

  if (loading) {
    return null;
  }

  if (!data) {
    return <EmptyState title="Ticket not found..." />;
  }

  const ticket = data!.ticket;

  const renderSubTabs = () => {
    switch (subTab) {
      case "dependencies":
        return <TicketDependency ticket={ticket} />;
      case "comments":
        return (
          <TicketComments
            ticketId={ticketId}
            className="space-y-8 px-4 sm:px-0"
          />
        );
      case "notes":
        return <TicketNotes ticketId={ticketId} />;
      case "changes":
        return <TicketChanges pullRequests={ticket.linkedPullRequests} />;
      default:
        return null;
    }
  };

  const dependencyCount = ticket.successors.length + ticket.ancestors.length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="pt-4 sm:mb-8 md:py-4">
        <ProjectCrumbs
          project={ticket.project}
          className="sm:mb-4"
          category="listing"
        />

        <div className="flex-row-reverse gap-x-6 pb-6 md:flex md:flex-row">
          <div className="min-w-0 flex-1">
            <div className="bg-white shadow sm:mt-0 sm:rounded-lg">
              <TicketSupersedesChip ticket={ticket} className="ml-4 mt-2" />
              <TicketTitle
                title={ticket.title}
                ticketId={ticketId}
                ticketLocaLId={ticket.localId}
                productCode={ticket.product?.code}
              />
              <TicketBody ticketId={ticketId} />
            </div>
            {ticket.status === TicketStatus.Scheduled ? (
              <TicketNote
                className="mx-2 mt-6 sm:mx-0"
                ticketId={ticket.id}
                onSeeAll={
                  subTab !== "notes" ? () => setSubTab("notes") : undefined
                }
              />
            ) : null}

            {ticket.stage === ModelStage.Published ? (
              <TicketClosingNote ticket={ticket} className="mt-6" />
            ) : null}

            <TicketSupersededByBanner ticket={ticket} className="mt-6" />

            {ticket.stage === ModelStage.Published &&
            ticket.status === TicketStatus.Scheduled ? (
              <TicketDependencyWarning
                ticketId={ticket.id}
                className="mx-auto mt-6 max-w-xl"
                onClickDependency={() => setSubTab("dependencies")}
              />
            ) : null}

            <Tabs className="my-6" layoutId="ticket-view">
              <Tab
                onClick={() => setSubTab("comments")}
                active={subTab === "comments"}
              >
                Comments
              </Tab>
              <Tab
                onClick={() => setSubTab("dependencies")}
                active={subTab === "dependencies"}
              >
                {plural(
                  "{} Dependency",
                  "{} Dependencies",
                  dependencyCount,
                  "No Dependencies",
                )}
              </Tab>
              <Tab
                onClick={() => setSubTab("notes")}
                active={subTab === "notes"}
              >
                Notes
              </Tab>
              <Tab
                onClick={() => setSubTab("changes")}
                active={subTab === "changes"}
              >
                {plural(
                  "{} Change",
                  "{} Changes",
                  ticket.linkedPullRequests.length,
                  "Changes",
                )}
              </Tab>
            </Tabs>
            {renderSubTabs()}
          </div>
          <div className="mt-5 flex-1 px-4 md:mt-0 md:w-80 md:flex-none md:px-0 lg:w-96">
            <TicketStageManager ticket={ticket} />

            <TicketOwner className="mt-4" ticket={ticket} />

            <TicketProject className="mt-4" ticket={ticket} />

            {/* <TicketRating
              difficulty={ticket.difficulty}
              ticketId={ticket.id}
              className="mt-4"
              readOnly={isArchived}
            />

            {ticket.product?.id ? (
              <TicketFeatures
                className="mt-4"
                productId={ticket.product.id}
                ticket={ticket}
                features={ticket.features}
                readOnly={isArchived}
              />
            ) : null} */}

            <div className="mt-4">
              <TicketTagInput ticket={ticket} />
            </div>

            <div className="mt-4">
              <TicketIssues ticket={ticket} />
            </div>

            <TicketMilestone ticket={ticket} className="mt-6" />

            <TicketOtherActions
              ticket={ticket}
              className="mt-6 flex flex-row justify-end sm:justify-start"
              onTicketStageChange={onTicketStageChange}
              onTicketStatusChange={onTicketStatusChange}
              onMarkTicketNotDone={onMarkTicketNotDone}
              onChangeWorkflow={onChangeWorkflow}
              onSupersedeWorkflow={onSupersedeWorkflow}
            />
            <div className="mt-4 border-t-2 border-gray-200" />
            <TicketInfo ticket={ticket} className="mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

TicketView.fragments = {
  TicketViewFragment: gql`
    fragment TicketViewFragment on Ticket {
      id
      localId
      status
      stage
      title
      ticketWorkflowStates {
        id
        ...TicketWorkflowStateAssigneeModalFragment
        ...TicketEstimateFragment
      }
      workflow {
        id
        name
      }
      project {
        id
        name
      }
      product {
        id
        name
        code
      }
      ancestors {
        id
        localId
        product {
          id
          code
          name
        }
      }
      ...TicketTitleFragment
      ...TicketSupersededByBannerFragment
      ...TicketSupersedesChipFragment
      ...TicketInfoFragment
      ...TicketFeaturesFragment
      ...ticketStageManagerFragment
      ...TicketOtherActionsDetails
      ...TicketDependencyDetails
      ...TicketRatingFragment
      ...TicketClosingNoteFragment
      ...TicketOwnerFragment
      ...TicketProjectFragment
      ...TicketTagInputFragment
      ...TicketMilestoneFragment
      ...TicketIssuesFragment
      ...TicketChangesFragment
    }
    ${TicketTitle.fragments.TicketTitleFragment}
    ${TicketSupersededByBanner.fragments.TicketSupersededByBannerFragment}
    ${TicketSupersedesChip.fragments.TicketSupersedesChipFragment}
    ${TicketInfo.fragments.TicketInfoFragment}
    ${TicketFeatures.fragments.TicketFeaturesFragment}
    ${TicketWorkflowStateAssigneeModal.fragments
      .TicketWorkflowStateAssigneeModalFragment}
    ${TicketEstimateModal.fragments.TicketEstimateFragment}
    ${TicketStageManager.fragments.ticketStageManagerFragment}
    ${TicketOtherActions.fragments.TicketOtherActionsDetails}
    ${TicketDependency.fragments.TicketDependencyDetails}
    ${TicketRating.fragments.TicketRatingFragment}
    ${TicketClosingNote.fragments.TicketClosingNoteFragment}
    ${TicketOwner.fragments.TicketOwnerFragment}
    ${TicketProject.fragments.TicketProjectFragment}
    ${TicketTagInput.fragments.TicketTagInputFragment}
    ${TicketMilestone.fragments.TicketMilestoneFragment}
    ${TicketIssues.fragments.TicketIssuesFragment}
    ${TicketChanges.fragments.TicketChangesFragment}
  `,
};

export const GET_TICKET_QUERY = gql`
  query GetSingleTicket($id: Int!) {
    ticket(id: $id, visited: true) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;

const UPDATE_TICKET_STAGE_MUTATION = gql`
  mutation UpdateTickdetStageForTicketView(
    $ticketId: Int!
    $stage: ModelStage!
  ) {
    updateTicketStage(ticketId: $ticketId, stage: $stage) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;

const UPDATE_TICKET_AS_NOT_DONE = gql`
  mutation markTicketNotDone($ticketId: Int!) {
    markTicketNotDone(ticketId: $ticketId) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;

const UPDATE_TICKET_STATUS_MUTATION = gql`
  mutation UpdateTicketStatusForTicketView(
    $ticketId: Int!
    $status: TicketStatus!
    $note: String
  ) {
    updateTicketStatus(ticketId: $ticketId, status: $status, note: $note) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;

const CHANGE_TICKET_WORKFLOW_MUTATION = gql`
  mutation ChangeTicketWorkflowForTicketView(
    $ticketId: Int!
    $workflowId: Int!
    $productId: Int
  ) {
    changeTicketWorkflow(
      ticketId: $ticketId
      workflowId: $workflowId
      productId: $productId
    ) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;

const SUPERSEDE_TICKET_WORKFLOW_MUTATION = gql`
  mutation SupersedeTicketWorkflowForTicketView(
    $ticketId: Int!
    $workflowId: Int!
    $productId: Int
  ) {
    supersedeTicketWorkflow(
      ticketId: $ticketId
      workflowId: $workflowId
      productId: $productId
    ) {
      id
      ...TicketViewFragment
    }
  }
  ${TicketView.fragments.TicketViewFragment}
`;
