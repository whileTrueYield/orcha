import { Avatar } from "components/views/Avatar";
import { every } from "lodash";
import React, { useState } from "react";
import { Role, Ticket, TicketWorkflowState } from "types/graphql";
import { TicketEstimateModal } from "./TicketEstimateModal";
import { CheckCircleIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticket: Ticket;
}

export const TicketStateAssignee: React.FC<Props> = (props) => {
  const { ticketWorkflowState, ticket } = props;
  const [isEstimateModalVisible, setEstimateModalVisible] = useState(false);

  const hasEstimates = every([
    ticketWorkflowState.estimateMinimum,
    ticketWorkflowState.estimateMostLikely,
    ticketWorkflowState.estimateMaximum,
  ]);

  const renderEstimateLabel = () => {
    if (hasEstimates) {
      return (
        <div className="flex items-center space-x-2">
          <span>Estimated</span>
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        </div>
      );
    }

    return "Estimate";
  };

  const renderAssignee = (role: Role) => (
    <div key={role.id} className="flex flex-row">
      <Avatar
        src={role.avatarUrl}
        className="h-10 w-10 rounded-md bg-gray-200"
        name={role.name}
      />
      <div className="ml-2 truncate text-sm leading-10">{role.name}</div>
    </div>
  );

  return (
    <div className="mb-2 flex flex-col" key={ticketWorkflowState.id}>
      <TicketEstimateModal
        ticket={ticket}
        visible={isEstimateModalVisible}
        ticketWorkflowState={ticketWorkflowState}
        onClose={() => setEstimateModalVisible(false)}
      />

      <div className="flex flex-1 flex-row items-center justify-between">
        <span className="text-base font-semibold text-gray-700">
          {ticketWorkflowState.name}
        </span>
      </div>
      <div className="group flex flex-row items-center justify-between py-1 pl-1 text-gray-700">
        <div className="flex flex-row">
          {ticketWorkflowState.assignee
            ? renderAssignee(ticketWorkflowState.assignee)
            : null}
        </div>
        <div className="">
          <Button
            type="button"
            btnSize="small"
            btnType={hasEstimates ? "secondaryWhite" : "primary"}
            onClick={() => setEstimateModalVisible(true)}
          >
            {renderEstimateLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
};
