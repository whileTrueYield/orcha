import React, { useState } from "react";
import { gql } from "@apollo/client";
import { TicketEstimateModal } from "pages/ticket/TicketView/TicketWorkflowState/TicketEstimateModal";
import { FCWithFragments } from "types";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { EstimateStateModal } from "pages/ticket/TicketView/TicketWorkflowState/EstimateStateModal";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";

interface Props {
  ticket: Ticket;
  ticketWorkflowState: TicketWorkflowState;
}

export const TicketToEstimateRow: FCWithFragments<Props> = (props) => {
  const [showEstimate, setShowEstimate] = useState(false);
  const { ticket, ticketWorkflowState } = props;

  return (
    <>
      <EstimateStateModal
        ticket={ticket}
        ticketWorkflowState={ticketWorkflowState}
        visible={showEstimate}
        onClose={() => setShowEstimate(false)}
      />
      <TicketCard
        ticket={ticket}
        message={`Estimate ${ticketWorkflowState.name}`}
        role="button"
        onClick={() => setShowEstimate(true)}
        className="hover:bg-gray-50"
      />
    </>
  );
};

TicketToEstimateRow.fragments = {
  TicketToEstimateRowFragment: gql`
    fragment TicketToEstimateRowFragment on Ticket {
      id
      title
      localId
      product {
        id
        code
      }
      workflow {
        id
        name
      }
      ticketWorkflowStates {
        id
        name
        ...TicketEstimateFragment
      }
      ...TicketCardFragment
    }
    ${TicketEstimateModal.fragments.TicketEstimateFragment}
    ${TicketCard.fragments.TicketCardFragment}
  `,
};
