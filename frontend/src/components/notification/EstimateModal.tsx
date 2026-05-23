import { gql, useQuery } from "@apollo/client";
import { ModalProps } from "components/modals/Modal";
import { EstimateStateModal } from "pages/ticket/TicketView/TicketWorkflowState/EstimateStateModal";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { QueryTicketWorkflowStateArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

interface Props extends ModalProps {
  ticketWorkflowStateId: string;
}

export const EstimateModal: React.FC<Props> = (props) => {
  const me = useSelector(getMe);
  const ticketWorkflowStateId = parseInt(props.ticketWorkflowStateId);

  const { loading, data } = useQuery<
    QueryReturnValue["ticketWorkflowState"],
    QueryTicketWorkflowStateArgs
  >(GET_TICKET_WORKFLOW_STATE_QUERY, {
    variables: { id: ticketWorkflowStateId },
  });

  const ticketWorkflowState = data?.ticketWorkflowState;

  const isAssignedToMe = me?.role?.id === ticketWorkflowState?.assigneeId;
  if (!isAssignedToMe) {
    console.warn(
      "Looks like this workflow state was not assigned to you",
      ticketWorkflowState
    );
    return null;
  }

  if (loading || !ticketWorkflowState || !props.ticketWorkflowStateId) {
    return null;
  }

  if (!ticketWorkflowState) {
    return null;
  }

  return (
    <EstimateStateModal
      ticket={ticketWorkflowState.ticket}
      ticketWorkflowState={ticketWorkflowState}
      onClose={props.onClose}
      visible={props.visible}
    />
  );
};

const GET_TICKET_WORKFLOW_STATE_QUERY = gql`
  query GetTicketForEstimateModal($id: Int!) {
    ticketWorkflowState(id: $id) {
      id
      name
      assigneeId
      ...EstimateStateModalFragment
      ticket {
        id
        localId
        title
        description
        product {
          id
          code
        }
        ticketWorkflowStates {
          id
          ...EstimateStateModalFragment
        }
      }
    }
  }
  ${EstimateStateModal.fragments.EstimateStateModalFragment}
`;
