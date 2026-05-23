import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const NoStatusFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  const getEta = () => {
    if (ticket.eta) {
      return (
        <>
          ETA
          <span className="ml-1 font-semibold">
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
      <div className="absolute inset-y-0 left-0 w-1 bg-sky-300"></div>
      <div className="grid grid-cols-4 gap-1 pl-4 text-xs">
        <div className="col-span-2 sm:col-span-1">
          <span className="rounded bg-brand-200 py-px px-1 text-xs font-medium text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900">
            {ticket.product?.code}
            <span className="ml-0.5 font-semibold text-brand-900">
              {ticket.localId}
            </span>
          </span>
        </div>
        <div className="col-span-4 font-medium sm:col-span-2">{getEta()}</div>
      </div>
    </>
  );
};
