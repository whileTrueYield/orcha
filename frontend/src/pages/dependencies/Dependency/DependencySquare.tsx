import React, { useState } from "react";
import { TicketDependency, TicketStatus } from "types/graphql";
import cn from "classnames";
import "./DependencySquare.css";
import { Popover } from "components/Popover/Popover";

interface Props {
  ticket: TicketDependency;
}

export const DependencySquare: React.FC<Props> = (props) => {
  const { ticket } = props;

  const [referenceElement, setReferenceElement] =
    useState<HTMLDivElement | null>(null);

  const [isVisible, setVisible] = useState(false);

  return (
    <>
      <div
        className="absolute inset-0 z-10 flex items-center justify-center text-xs font-semibold text-white"
        onMouseOut={() => setVisible(false)}
        onMouseOver={() => setVisible(true)}
        ref={setReferenceElement}
      >
        {ticket.ancestors.length}
        {isVisible && referenceElement ? (
          <Popover
            referenceElement={referenceElement}
            className="z-20 max-w-xs"
          >
            <TicketDetails ticket={ticket} />
          </Popover>
        ) : null}
      </div>
    </>
  );
};

interface PopProps {
  ticket: TicketDependency;
}

const TicketDetails: React.FC<PopProps> = (props) => {
  const { ticket } = props;

  const className = cn(
    "max-w-64 shadow rounded-lg bg-gray-700 text-sm text-gray-100 font-medium py-2 px-4"
  );

  const isScheduled = ticket.status === TicketStatus.Scheduled;
  const isUnscheduled = ticket.status === TicketStatus.Unscheduled;
  const isCancelled = ticket.status === TicketStatus.Cancelled;
  const isDone = ticket.status === TicketStatus.Done;

  const statusClassName = cn(
    "rounded py-0.5 px-2 text-xs font-bold capitalize",
    {
      "text-orange-50 bg-orange-600": isCancelled,
      "text-green-50 bg-green-600": isDone,
      "text-brand-50 bg-brand-600": isScheduled,
      "text-gray-50 bg-gray-600": isUnscheduled,
    }
  );

  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-100">{ticket.title}</div>
      <div className="mt-1 flex flex-row items-center space-x-2">
        <span className="mr-1 flex-none rounded bg-brand-200 py-px px-1 text-xs font-medium text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900 xl:block">
          {ticket.productCode}
          <span className="ml-0.5 font-semibold text-brand-900">
            {ticket.localId}
          </span>
        </span>
        <span className={statusClassName}>{ticket.status.toLowerCase()}</span>
      </div>
    </div>
  );
};
