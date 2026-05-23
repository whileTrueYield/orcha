import { Button } from "components/fields/Button";
import { some, sortBy } from "lodash";
import React, { useState } from "react";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { TicketWorkflowStateAssigneeModal } from "./TicketWorkflowStateAssigneeModal";
import { TicketStateAssignee } from "./TicketStateAssignee";

interface Props {
  ticket: Ticket;
}

export const TicketAssignees: React.FunctionComponent<Props> = (props) => {
  const [isAssignmentVisible, setAssignmentVisible] = useState(false);
  const { ticket } = props;
  const { ticketWorkflowStates } = ticket;

  const hasAssignees = some(ticketWorkflowStates, (state) => !!state.assignee);

  const renderState = (ticketWorkflowState: TicketWorkflowState) => {
    if (ticketWorkflowState.isActive) {
      return (
        <TicketStateAssignee
          key={ticketWorkflowState.id}
          ticket={ticket}
          ticketWorkflowState={ticketWorkflowState}
        />
      );
    }
  };

  const renderAssignees = () => {
    return (
      <div>{sortBy(ticketWorkflowStates, "position").map(renderState)}</div>
    );
  };

  const renderNoAssignees = () => {
    return <div className="text-gray-500">No Assignees</div>;
  };

  return (
    <div className="mt-6">
      <TicketWorkflowStateAssigneeModal
        visible={isAssignmentVisible}
        ticket={ticket}
        ticketWorkflowStates={ticket.ticketWorkflowStates}
        onClose={() => setAssignmentVisible(false)}
      />

      <div className="text-lg text-gray-700">Assignments</div>
      {hasAssignees ? renderAssignees() : renderNoAssignees()}
      <Button
        btnType="primary"
        onClick={() => setAssignmentVisible(true)}
        block
        className="mt-2"
      >
        Pick Assignees
      </Button>
    </div>
  );
};
