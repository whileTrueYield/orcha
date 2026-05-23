import { PencilIcon } from "@heroicons/react/solid";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const DraftFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  const getCreatedAt = () => {
    if (ticket.createdAt) {
      return (
        <>
          Created
          <span className="ml-1 font-semibold">
            {formatDistanceToNow(new Date(ticket.createdAt), {
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
      <div className="absolute inset-y-0 left-0 w-1 bg-gray-400"></div>
      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <div>{ticket.author?.name}</div>
        <div className="whitespace-nowrap">{getCreatedAt()}</div>
        <div className="flex flex-row items-center truncate font-medium">
          <PencilIcon className="mr-1 h-4 w-4 shrink-0 text-gray-400" />
          <span
            title="Draft"
            className="truncate font-semibold tracking-wide text-gray-500"
          >
            Draft
          </span>
        </div>
      </div>
    </>
  );
};
