import React from "react";
import { gql } from "@apollo/client";
import { SmartTime } from "components/views/Time";
import { formatDistanceToNow } from "date-fns";
import { FCWithFragments } from "types";
import { Ticket, TicketStatus } from "types/graphql";
import { TicketInferStatus } from "../TicketInferStatus";
import { TicketStatusBadge } from "pages/ticket/TicketList/TicketStatusBadge";
import { TicketIdTag } from "components/tags/TicketIdTag";

interface Props {
  ticket: Ticket;
  onEditTicket: (ticketId: number) => void;
}

export const WorkedTicketListRow: FCWithFragments<Props> = (props) => {
  const { ticket } = props;

  const tdClass = "px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500";

  return (
    <tr key={ticket.id}>
      <td className={`${tdClass} pr-0`}>
        <TicketIdTag
          localId={ticket.localId}
          milestone={ticket.milestone}
          productCode={ticket.product?.code}
          className="text-xs"
        />
      </td>
      <td className={`${tdClass} max-w-sm`}>
        <div className="flex min-w-0 flex-row items-center space-x-1">
          <button
            type="button"
            onClick={() => props.onEditTicket(ticket.id)}
            title={ticket.title}
            className="truncate font-medium text-gray-700 hover:text-brand-600 hover:underline"
          >
            {ticket.title}
          </button>
        </div>
      </td>
      <td className={tdClass}>
        {ticket.status === TicketStatus.Scheduled ? (
          <div className="min-w-[10rem]">
            <TicketInferStatus ticket={ticket} />
          </div>
        ) : (
          <TicketStatusBadge status={ticket.status} stage={ticket.stage} />
        )}
      </td>
      <td className={tdClass}>
        {ticket.closedAt ? (
          <div>
            <div className="font-medium text-gray-700">
              {formatDistanceToNow(new Date(ticket.closedAt), {
                addSuffix: true,
              })}
            </div>
            <SmartTime date={ticket.closedAt} />
          </div>
        ) : (
          <div>
            <div className="font-medium text-gray-700">
              {formatDistanceToNow(new Date(ticket.eta), {
                addSuffix: true,
              })}
            </div>
            <SmartTime date={ticket.eta} />
          </div>
        )}
      </td>
    </tr>
  );
};

WorkedTicketListRow.fragments = {
  WorkedTicketListRowFragment: gql`
    fragment WorkedTicketListRowFragment on Ticket {
      id
      title
      localId
      status
      eta
      closedAt
      product {
        id
        code
      }
      ...TicketInferStatusFragment
    }
    ${TicketInferStatus.fragments.TicketInferStatusFragment}
  `,
};
