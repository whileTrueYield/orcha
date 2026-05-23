import { gql } from "@apollo/client";
import { FolderIcon, ReplyIcon, XIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { FCWithFragments } from "types";
import { Ticket } from "types/graphql";
import cn from "classnames";
import { filter, find } from "lodash";

interface Props {
  tickets: Ticket[];
  onRemoveTicket: (ticket: Ticket) => void;
  onAddTicket: (ticket: Ticket) => void;
  onTicketDetail: (ticketId: number) => void;
  addedTickets: Ticket[];
  removedTickets: Ticket[];
}

export const ScheduledTicketList: FCWithFragments<Props> = (props) => {
  const { tickets, addedTickets, removedTickets } = props;

  const keptTickets = filter(
    tickets,
    (ticket) => !find(removedTickets, { id: ticket.id })
  );

  const renderTicket = (
    ticket: Ticket,
    { added, removed, id }: { added?: boolean; removed?: boolean; id?: string }
  ) => {
    return (
      <li
        key={ticket.id}
        id={id}
        className={cn("group block", {
          "hover:bg-gray-50": !added && !removed,
          "bg-brand-50 hover:bg-brand-100": added,
          "bg-red-50 hover:bg-red-100": removed,
        })}
      >
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="truncate">
              <div className="flex text-sm">
                <button
                  type="button"
                  className="truncate font-medium text-brand-600 hover:text-brand-700 hover:underline"
                  onClick={() => props.onTicketDetail(ticket.id)}
                >
                  {ticket.title}
                </button>
                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                  as {ticket.workflow?.name}
                </p>
              </div>
              <div className="mt-2 flex flex-row items-center space-x-4">
                <span className="mr-1 flex-none rounded bg-brand-200 px-1 py-px text-xs font-medium text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900 xl:block">
                  {ticket.product?.code}
                  <span className="ml-0.5 font-semibold text-brand-900">
                    {ticket.localId}
                  </span>
                </span>

                <div className="flex items-center truncate text-sm text-gray-500">
                  <FolderIcon
                    className="mr-1 h-5 w-5 flex-shrink-0 text-yellow-400"
                    aria-hidden="true"
                  />
                  {ticket.project?.name}
                </div>
              </div>
            </div>
          </div>
          <div className="ml-5 flex-shrink-0">
            {removed ? (
              <>
                <Button
                  type="button"
                  btnType="white"
                  onClick={() => props.onAddTicket(ticket)}
                  className="hidden group-hover:block"
                >
                  <ReplyIcon className="-ml-0.5 mr-1 h-4 w-4 text-gray-500" />
                  Add Back
                </Button>
                <span
                  onClick={() => props.onAddTicket(ticket)}
                  className="block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-red-700 group-hover:hidden"
                >
                  Removed
                </span>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  btnType="white"
                  onClick={() => props.onRemoveTicket(ticket)}
                  className="hidden group-hover:block"
                >
                  <XIcon className="-ml-0.5 mr-1 h-4 w-4 text-gray-500" />
                  Remove
                </Button>
                {added && (
                  <span
                    onClick={() => props.onAddTicket(ticket)}
                    className="block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-brand-800 group-hover:hidden"
                  >
                    Added
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </li>
    );
  };

  if (addedTickets.length + keptTickets.length + removedTickets.length > 0) {
    return (
      <ul className="divide-y divide-gray-200">
        {addedTickets.map((ticket, index) =>
          renderTicket(ticket, {
            added: true,
            // id is to allow for an anchor scroll to the added tickets section
            id: index === 0 ? "added-tickets" : "",
          })
        )}
        {keptTickets.map((ticket) => renderTicket(ticket, {}))}
        {removedTickets.map((ticket, index) =>
          renderTicket(ticket, {
            removed: true,
            // id is to allow for an anchor scroll to the removed tickets section
            id: index === 0 ? "removed-tickets" : "",
          })
        )}
      </ul>
    );
  } else {
    return (
      <div className="flex min-h-[4rem] items-center justify-center bg-gray-200 text-lg text-gray-400 lg:bg-transparent">
        No Tickets
      </div>
    );
  }
};

ScheduledTicketList.fragments = {
  ScheduledTicketListFragment: gql`
    fragment ScheduledTicketListFragment on Ticket {
      id
      title
      localId
      product {
        id
        code
      }
      workflow {
        id
        name
      }
      project {
        id
        name
        parentId
      }
    }
  `,
};
