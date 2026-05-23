import React, { useState } from "react";
import { Ticket, TicketStatus } from "types/graphql";
import cn from "classnames";
import { ConfirmModal } from "components/modals/ConfirmModal";
import { WarningConfirm } from "components/modals/WarningConfirm";

import {
  PencilIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/outline";

interface TicketStatusSelectProps {
  onStatusSelect: (status: TicketStatus) => void;
  ticket: Ticket;
  className?: string;
}

export const TicketStatusSelect: React.FC<TicketStatusSelectProps> = (
  props
) => {
  const { ticket, className } = props;
  const [hoveredState, setHoveredState] = useState("");
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isWarningModalVisible, setIsWarningModalVisible] = useState(false);
  const [newTicketStatus, setNewTicketStatus] = useState<TicketStatus>(
    ticket.status
  );

  const onStatusSelect = (status: TicketStatus) => {
    // don't do anything if we don't change the status
    if (status === ticket.status) {
      return;
    }

    setNewTicketStatus(status);
    if (status === TicketStatus.Cancelled) {
      setIsWarningModalVisible(true);
    } else {
      setIsConfirmModalVisible(true);
    }
  };

  const getClassForState = (status?: TicketStatus, activeClassName?: string) =>
    cn(
      {
        "flex flex-row items-center shadow p-1 px-2 flex-none rounded-full focus:ring focus:outline-none focus:ring-brand-500 focus:ring-opacity-50 transition duration-300":
          ticket.status === status,
        "p-1 text-gray-400 hover:text-gray-600 flex-none rounded-full hover:bg-gray-100 focus:ring focus:outline-none focus:ring-brand-500 focus:ring-opacity-50 transition duration-300":
          ticket.status !== status,
      },
      ticket.status === status ? activeClassName : ""
    );

  return (
    <div className={className}>
      <ConfirmModal
        cta={`Set ticket to ${newTicketStatus.toUpperCase()}`}
        description={`Are you sure you want to change the ticket status to ${newTicketStatus.toUpperCase()}`}
        onConfirm={() => props.onStatusSelect(newTicketStatus)}
        onClose={() => setIsConfirmModalVisible(false)}
        title={`Confirm status change`}
        visible={isConfirmModalVisible}
      />
      <WarningConfirm
        cta={`Yes, Cancel Ticket`}
        description={`Are you sure you want to cancel this ticket?`}
        onConfirm={() => props.onStatusSelect(newTicketStatus)}
        onClose={() => setIsWarningModalVisible(false)}
        title={`Cancel ticket?`}
        visible={isWarningModalVisible}
      />
      <div className="mb-2 flex flex-row items-center justify-between">
        <div className="text-lg text-gray-700">Status</div>
      </div>
      <div className="mx-auto flex max-w-xs flex-row items-center justify-between rounded-full bg-gray-200 p-1 shadow-inner">
        <button
          type="button"
          onClick={() => onStatusSelect(TicketStatus.Unscheduled)}
          className={getClassForState(
            TicketStatus.Unscheduled,
            "bg-gray-500 text-gray-100"
          )}
          onMouseEnter={() => setHoveredState("back to unscheduled mode")}
          onMouseLeave={() => setHoveredState("")}
          onFocus={() => setHoveredState("back to unscheduled mode")}
          onBlur={() => setHoveredState("")}
        >
          <PencilIcon className="h-6 w-6" />
          {ticket.status === TicketStatus.Unscheduled && (
            <div className="mx-2 text-sm font-medium">Unscheduled</div>
          )}
        </button>
        <button
          type="button"
          onClick={() => onStatusSelect(TicketStatus.Scheduled)}
          className={getClassForState(
            TicketStatus.Scheduled,
            "bg-brand-600 text-brand-100"
          )}
          onMouseEnter={() => setHoveredState("schedule ticket")}
          onMouseLeave={() => setHoveredState("")}
          onFocus={() => setHoveredState("schedule ticket")}
          onBlur={() => setHoveredState("")}
        >
          <ClockIcon className="h-6 w-6" />
          {ticket.status === TicketStatus.Scheduled && (
            <div className="mx-2 text-sm font-medium">Scheduled</div>
          )}
        </button>

        <button
          type="button"
          onClick={() => onStatusSelect(TicketStatus.Done)}
          className={getClassForState(
            TicketStatus.Done,
            "bg-green-600 text-green-100"
          )}
          onMouseEnter={() => setHoveredState("close ticket")}
          onMouseLeave={() => setHoveredState("")}
          onFocus={() => setHoveredState("close ticket")}
          onBlur={() => setHoveredState("")}
        >
          <CheckCircleIcon className="h-6 w-6" />
          {ticket.status === TicketStatus.Done && (
            <div className="mx-2 text-sm font-medium">Closed</div>
          )}
        </button>
        <button
          type="button"
          onClick={() => onStatusSelect(TicketStatus.Cancelled)}
          className={getClassForState(
            TicketStatus.Cancelled,
            "bg-orange-600 text-orange-100"
          )}
          onMouseEnter={() => setHoveredState("cancel ticket")}
          onMouseLeave={() => setHoveredState("")}
          onFocus={() => setHoveredState("cancel ticket")}
          onBlur={() => setHoveredState("")}
        >
          <XCircleIcon className="h-6 w-6" />
          {ticket.status === TicketStatus.Cancelled && (
            <div className="mx-2 text-sm font-medium">Cancelled</div>
          )}
        </button>
      </div>

      <div className="mt-1 h-2 text-center text-sm text-gray-500">
        {hoveredState}
      </div>
    </div>
  );
};
