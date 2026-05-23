import React, { useState } from "react";

import {
  ModelStage,
  MutationUpdateTicketStageArgs,
  Ticket,
} from "types/graphql";

import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";

import { Button } from "components/fields/Button";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { TicketAssigneeForm } from "./TicketAssigneeForm";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { TicketActivity } from "pages/ticket/TicketView/TicketActivity";
import { TicketStageManager } from "pages/ticket/TicketView/TicketStageManager/TicketStageManager";
import { useBlockingMutation } from "utils/graphql";
import { DocumentNode } from "graphql";
import { TicketInfo } from "../TicketView/TicketInfo";
import { TicketMilestone } from "../TicketView/TicketMilestone";
import { TicketTagInput } from "../TicketView/TicketTagInput";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { useAppDispatch } from "store";
import { hideTicketEditModal } from "actions";
import Tiptap from "components/TipTap/TipTap";

interface Props {
  ticket: Ticket;
  refetchQueries?: DocumentNode[];
}

export const TicketEditForm: FCWithFragments<Props> = (props) => {
  const { ticket, refetchQueries } = props;
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();

  const [deleteTicketModalVisible, setDeleteTicketModalVisibility] =
    useState(false);

  const [updateTicketStage] = useBlockingMutation<
    { updateTicketStage: Ticket },
    MutationUpdateTicketStageArgs
  >(MUTATION_UPDATE_TICKET_STAGE, {
    refetchQueries,
    onError: onGraphQLError({ title: "Could not delete ticket" }),
    onCompleted: onMutationComplete({ title: "Ticket Deleted" }),
  });

  const onDeleteTicket = () => {
    updateTicketStage({
      variables: { ticketId: ticket.id, stage: ModelStage.Deleted },
    });
  };

  return (
    <div className="flex-1">
      <DangerConfirm
        cta="Delete Ticket"
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket? This action cannot
        be undone."
        visible={deleteTicketModalVisible}
        onClose={() => setDeleteTicketModalVisibility(false)}
        onConfirm={onDeleteTicket}
      />

      <div className="flex-1 px-4 sm:px-6">
        <div className="rounded-md bg-white shadow">
          <div className="space-y-4 pt-4 ">
            <h3 className="px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6">
              <TicketIdTag
                productCode={ticket.product?.code}
                localId={ticket.localId}
                className="mr-2 text-xs"
                milestone={ticket.milestone}
              />

              <span className="align-middle text-xl text-gray-700">
                {ticket.title}
              </span>
            </h3>

            <div className="max-h-96 overflow-y-auto px-4 sm:px-6">
              <Tiptap
                content={ticket.description}
                readonly
                className="mx-auto"
              />
            </div>
          </div>
          <div className="rounded-b-md px-4 py-3 sm:px-6">
            <div className="flex flex-col space-y-4 sm:flex-row-reverse sm:justify-between sm:space-y-0">
              <Button
                type="button"
                btnType="white"
                btnSize="medium"
                fullInMobile
                asElement={(className) => (
                  <Link
                    to={urlResolver.ticket.view(orgId, ticket.id)}
                    className={className}
                    onClick={() => dispatch(hideTicketEditModal())}
                  >
                    Open Ticket View
                  </Link>
                )}
              />
              <Button
                onClick={() => setDeleteTicketModalVisibility(true)}
                type="button"
                btnType="secondaryDanger"
                fullInMobile
                className="sm:mt-0"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <TicketStageManager ticket={ticket} />
          <TicketMilestone ticket={ticket} className="mt-6" />
          <div className="mt-4">
            <TicketTagInput ticket={ticket} />
          </div>
          <TicketInfo ticket={ticket} className="mt-8 border-t px-2" />
        </div>
      </div>
    </div>
  );
};

TicketEditForm.fragments = {
  TicketEditFormFragment: gql`
    fragment TicketEditFormFragment on Ticket {
      id
      localId
      title
      stage
      description
      difficulty
      status
      milestone
      product {
        id
        name
        code
        stage
      }
      project {
        id
        ancestorIsArchived
      }
      ticketWorkflowStates {
        id
        ...TicketAssigneeFormFragment
      }
      ...TicketActivityFragment
      ...ticketStageManagerFragment
      ...TicketInfoFragment
      ...TicketMilestoneFragment
      ...TicketTagInputFragment
    }
    ${TicketInfo.fragments.TicketInfoFragment}
    ${TicketAssigneeForm.fragments.TicketAssigneeFormFragment}
    ${TicketActivity.fragments.TicketActivityFragment}
    ${TicketStageManager.fragments.ticketStageManagerFragment}
    ${TicketMilestone.fragments.TicketMilestoneFragment}
    ${TicketTagInput.fragments.TicketTagInputFragment}
  `,
};

const MUTATION_UPDATE_TICKET_STAGE = gql`
  mutation UpdateTicketStageFromSideView($ticketId: Int!, $stage: ModelStage!) {
    updateTicketStage(ticketId: $ticketId, stage: $stage) {
      ...TicketEditFormFragment
    }
  }
  ${TicketEditForm.fragments.TicketEditFormFragment}
`;
