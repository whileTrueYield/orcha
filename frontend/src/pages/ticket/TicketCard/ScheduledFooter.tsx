import { CalendarIcon } from "@heroicons/react/solid";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const ScheduledFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  const getEta = () => {
    if (ticket.eta) {
      return (
        <>
          ETA{" "}
          <span className="font-medium">
            {formatDistanceToNow(new Date(ticket.eta), {
              addSuffix: true,
            })}
          </span>
        </>
      );
    } else {
      return "Unknown";
    }
  };

  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1 bg-brand-500"></div>
      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <TicketIdTag
          localId={ticket.localId}
          productCode={ticket.product?.code}
          status={ticket.status}
          className="text-xs"
        />
        <div className="whitespace-nowrap">{getEta()}</div>
        <div className="flex flex-row items-center truncate font-medium">
          <CalendarIcon className="mr-1 h-4 w-4 shrink-0 text-brand-400" />
          <span
            title="Scheduled"
            className="truncate font-semibold tracking-wide text-brand-600"
          >
            Scheduled
          </span>
        </div>
      </div>
    </>
  );
};
