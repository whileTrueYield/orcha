import { XCircleIcon } from "@heroicons/react/solid";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const CancelledFooter: React.FC<Props> = (props) => {
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
      <div className="absolute inset-y-0 left-0 w-1 bg-pink-500"></div>

      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <TicketIdTag
          localId={ticket.localId}
          productCode={ticket.product?.code}
          status={ticket.status}
          className="text-xs"
        />
        <div className="whitespace-nowrap">{getClosedAt()}</div>
        <div className="flex flex-row items-center truncate font-medium">
          <XCircleIcon className="mr-1 h-4 w-4 shrink-0 text-pink-400" />
          <span
            title="Cancelled"
            className="truncate font-semibold tracking-wide text-pink-500"
          >
            Cancelled
          </span>
        </div>
      </div>
    </>
  );
};
