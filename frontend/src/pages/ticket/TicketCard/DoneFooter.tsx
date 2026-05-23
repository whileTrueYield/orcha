import { CheckCircleIcon } from "@heroicons/react/solid";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const DoneFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  const getClosedAt = () => {
    if (ticket.closedAt) {
      return (
        <>
          Closed
          <span className="ml-1 font-semibold">
            {formatDistanceToNow(new Date(ticket.closedAt), {
              addSuffix: true,
            })}
          </span>
        </>
      );
    } else {
      return "";
    }
  };

  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1 bg-green-500"></div>
      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <TicketIdTag
          localId={ticket.localId}
          productCode={ticket.product?.code}
          status={ticket.status}
          className="text-xs"
        />
        <div className="truncate">{getClosedAt()}</div>
        <div className="flex flex-row items-center font-medium">
          <CheckCircleIcon className="mr-1 h-4 w-4 shrink-0 text-green-400" />
          <span
            title="Done"
            className="truncate font-semibold tracking-wide text-green-600"
          >
            Done
          </span>
        </div>
      </div>
    </>
  );
};
