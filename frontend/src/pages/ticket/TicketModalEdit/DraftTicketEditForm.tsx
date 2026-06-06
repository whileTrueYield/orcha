import React, { useState } from "react";

import {
  ModelStage,
  MutationUpdateTicketStageArgs,
  Ticket,
} from "types/graphql";
import { DocumentNode } from "graphql";

import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { StageBadge } from "components/tags/StageBadge";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { TicketStageManager } from "pages/ticket/TicketView/TicketStageManager/TicketStageManager";
import { useBlockingMutation } from "utils/graphql";
import { TicketInfo } from "../TicketView/TicketInfo";
import { hideTicketEditModal } from "actions";
import { useAppDispatch } from "store";
import MarkdownView from "components/Markdown/MarkdownView";

interface Props {
  ticket: Ticket;
  refetchQueries?: DocumentNode[];
}

export const DraftTicketEditForm: FCWithFragments<Props> = (props) => {
  const { ticket, refetchQueries } = props;
  const { orgId } = useParams<{ orgId: string }>();
  const dispatch = useAppDispatch();

  const [deleteTicketModalVisible, setDeleteTicketModalVisibility] =
    useState(false);

  const [updateTicketStage] = useBlockingMutation<
    { updateTicketStage: Ticket },
    MutationUpdateTicketStageArgs
  >(MUTATION_UPDATE_TICKET_STAGE, {
    onError: onGraphQLError({ title: "Could not delete ticket" }),
    refetchQueries,
    onCompleted: onMutationComplete({
      title: "Ticket Deleted",
    }),
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
        description="Are you sure you want to delete this product? All tickets under
        this product will be permanantly destroyed. This action cannot
        be undone."
        visible={deleteTicketModalVisible}
        onClose={() => setDeleteTicketModalVisibility(false)}
        onConfirm={onDeleteTicket}
      />
      <div className="flex-1 px-4 sm:px-6">
        <div className="rounded-md bg-white shadow">
          <div className="space-y-4 py-4 ">
            <h3 className="px-4 text-lg font-medium leading-6 text-gray-900 sm:px-6">
              <StageBadge
                className="mr-2 inline align-text-bottom font-mono"
                stage={ticket.stage}
              />
              <span className="align-middle text-xl text-gray-700">
                {ticket.title}
              </span>
            </h3>

          </div>
          <MarkdownView
            variant="full"
            value={ticket.body.markdown}
            className="px-4 pb-4 text-gray-800 sm:px-6"
          />
          <div className="rounded-b-md border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
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

        <div>
          <TicketStageManager ticket={ticket} />
          <TicketInfo ticket={ticket} className="mt-4" />
        </div>
      </div>
    </div>
  );
};

DraftTicketEditForm.fragments = {
  DraftTicketEditFormFragment: gql`
    fragment DraftTicketEditFormFragment on Ticket {
      id
      title
      difficulty
      estimate
      stage
      milestone
      body {
        markdown
      }
      workflow {
        id
        name
        stage
      }
      product {
        id
        name
        code
        stage
      }
      ...TicketInfoFragment
    }
    ${TicketInfo.fragments.TicketInfoFragment}
  `,
};

const MUTATION_UPDATE_TICKET_STAGE = gql`
  mutation UpdateDraftTicketStageFromProjectSideView(
    $ticketId: Int!
    $stage: ModelStage!
  ) {
    updateTicketStage(ticketId: $ticketId, stage: $stage) {
      ...DraftTicketEditFormFragment
    }
  }
  ${DraftTicketEditForm.fragments.DraftTicketEditFormFragment}
`;
