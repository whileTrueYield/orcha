import React from "react";
import { Ticket } from "types/graphql";
import cn from "classnames";
import { GroupTag } from "components/tags/GroupTag";

interface Props {
  ticket: Ticket;
  isActive: boolean;
}

export const RenderTicket: React.FC<Props> = (props) => {
  const { isActive, ticket } = props;

  const className = cn(
    "text-left flex flex-col text-white px-4 py-3 space-y-2 rounded-lg w-full",
    {
      "bg-gray-800": !isActive,
    }
  );

  const tagClass = cn("text-white flex-none", {
    "bg-gray-600": !isActive,
    "bg-gray-700": isActive,
  });

  let ticketWorkflowStateName = ticket.ticketWorkflowStates[0]?.name || "--";
  if (ticket.lastScheduleItem) {
    if (ticket.lastScheduleItem.nextTicketWorkflowState) {
      ticketWorkflowStateName =
        ticket.lastScheduleItem.nextTicketWorkflowState.name;
    } else {
      ticketWorkflowStateName =
        ticket.lastScheduleItem.ticketWorkflowState.name;
    }
  }

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-1 flex-row items-center justify-between space-x-2">
        <div className="truncate">{ticket.title}</div>
      </div>

      <div className="flex flex-1 flex-row items-center justify-between">
        <div>
          <GroupTag
            className="text-white"
            label={`#${ticket.localId}`}
            groupLabel={ticket.product ? ticket.product.code : "N/A"}
            groupBgColor={tagClass}
          />
        </div>
        <div>
          <GroupTag
            className="text-white"
            label={ticketWorkflowStateName}
            groupLabel={ticket.workflow ? ticket.workflow.name : "N/A"}
            groupBgColor={tagClass}
          />
        </div>
      </div>
    </div>
  );
};
