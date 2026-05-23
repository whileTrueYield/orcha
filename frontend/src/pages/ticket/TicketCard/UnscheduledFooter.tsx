import { HandIcon } from "@heroicons/react/solid";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { every, filter } from "lodash";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const UnscheduledFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  const isReady = every(
    filter(ticket.ticketWorkflowStates, { isActive: true }),
    (tws) =>
      Boolean(
        tws.estimateMaximum && tws.estimateMinimum && tws.estimateMostLikely
      )
  );

  const hasAssignees = every(
    filter(ticket.ticketWorkflowStates, { isActive: true }),
    (tws) => Boolean(tws.assigneeId)
  );

  const renderStatus = (): string => {
    if (isReady && hasAssignees) {
      return "Ready to schedule";
    } else if (hasAssignees) {
      if (ticket.estimating) {
        return "Awaiting estimates";
      } else {
        return "Ready for estimates";
      }
    } else {
      return "Not fully assigned";
    }
  };

  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1 bg-purple-400"></div>
      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <TicketIdTag
          localId={ticket.localId}
          productCode={ticket.product?.code}
          status={ticket.status}
          className="text-xs"
        />
        <div className="whitespace-nowrap">{renderStatus()}</div>
        <div className="flex flex-row items-center truncate font-medium">
          <HandIcon className="mr-1 h-4 w-4 shrink-0 text-purple-400" />
          <span
            title="Not Scheduled"
            className="truncate font-semibold tracking-wide text-purple-500"
          >
            Not scheduled
          </span>
        </div>
      </div>
    </>
  );
};
