import { ArchiveIcon } from "@heroicons/react/solid";
import { TicketIdTag } from "components/tags/TicketIdTag";
import React from "react";
import { Ticket } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const ArchivedFooter: React.FC<Props> = (props) => {
  const { ticket } = props;

  return (
    <>
      <div className="absolute inset-y-0 left-0 w-1 bg-gray-400"></div>

      <div className="flex flex-1 flex-row justify-between space-x-1 px-4 text-xs">
        <TicketIdTag
          localId={ticket.localId}
          productCode={ticket.product?.code}
          status={ticket.status}
          className="text-xs"
        />
        <div className="flex flex-row items-center truncate font-medium">
          <ArchiveIcon className="mr-1 h-4 w-4 shrink-0 text-gray-400" />
          <span
            title="Archived"
            className="truncate font-semibold tracking-wide text-gray-500"
          >
            Archived
          </span>
        </div>
      </div>
    </>
  );
};
