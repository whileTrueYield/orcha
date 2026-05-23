import { gql } from "@apollo/client";
import { FolderIcon, PlusIcon, XIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { every, find } from "lodash";
import { FCWithFragments } from "types";
import { RoleStatus, Ticket } from "types/graphql";
import cn from "classnames";

interface Props {
  tickets: Ticket[];
  onAddTicket: (ticket: Ticket) => void;
  onRemoveTicket: (ticket: Ticket) => void;
  onTicketDetail: (ticketId: number) => void;
  addedTickets: Ticket[];
}

export const ScheduleUnscheduledTicketList: FCWithFragments<Props> = (
  props
) => {
  const { tickets, addedTickets } = props;

  const renderTicketButton = (
    ticket: Ticket,
    isAdded: boolean,
    isReady: boolean
  ) => {
    if (isReady) {
      if (isAdded) {
        return (
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
            <span
              onClick={() => props.onAddTicket(ticket)}
              className="block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-brand-800 group-hover:hidden"
            >
              Added
            </span>
          </>
        );
      } else {
        return (
          <Button
            type="button"
            btnType="white"
            onClick={() => props.onAddTicket(ticket)}
            className="hidden group-hover:block"
          >
            <PlusIcon className="-ml-0.5 mr-1 h-4 w-4 text-gray-500" />
            Schedule
          </Button>
        );
      }
    } else {
      return (
        <>
          <Button
            type="button"
            btnType="white"
            onClick={() => props.onTicketDetail(ticket.id)}
            className="hidden group-hover:block"
          >
            View Ticket
          </Button>
          <span
            onClick={() => props.onAddTicket(ticket)}
            className="block whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-orange-800 group-hover:hidden"
          >
            Incomplete
          </span>
        </>
      );
    }
  };

  const renderTicket = (ticket: Ticket) => {
    const isAdded = !!find(addedTickets, { id: ticket.id });

    const isReady = every(
      ticket.ticketWorkflowStates,
      (state) =>
        !state.isActive ||
        (state.estimateMaximum &&
          state.estimateMinimum &&
          state.estimateMostLikely &&
          state.assignee?.status === RoleStatus.Accepted)
    );

    return (
      <li
        key={ticket.id}
        className={cn("group block", {
          "hover:bg-gray-50": !isAdded && isReady,
          "bg-brand-50 hover:bg-brand-100": isAdded && isReady,
          "bg-yellow-50 text-yellow-800 hover:bg-yellow-100": !isReady,
        })}
      >
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="truncate">
              <div className="flex text-sm">
                <button
                  type="button"
                  className={cn("truncate font-medium hover:underline", {
                    "text-brand-600 hover:text-brand-700": isReady,
                    "text-orange-600 hover:text-orange-700": !isReady,
                  })}
                  onClick={() => props.onTicketDetail(ticket.id)}
                >
                  {ticket.title}
                </button>
                <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                  as {ticket.workflow?.name}
                </p>
              </div>
              <div className="mt-2 flex flex-row items-center space-x-4">
                <span className="mr-1 flex-none rounded bg-brand-200 px-1 py-px text-xs font-medium text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900">
                  {ticket.product ? ticket.product.code : "n/a"}
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
            {renderTicketButton(ticket, isAdded, isReady)}
          </div>
        </div>
      </li>
    );
  };

  if (tickets.length) {
    return (
      <ul className="divide-y divide-gray-200">{tickets.map(renderTicket)}</ul>
    );
  } else {
    return (
      <div className="flex min-h-[4rem] items-center justify-center bg-gray-200 text-lg text-gray-500 lg:bg-transparent">
        No Tickets
      </div>
    );
  }
};

ScheduleUnscheduledTicketList.fragments = {
  ScheduleUnscheduledTicketListFragment: gql`
    fragment ScheduleUnscheduledTicketListFragment on Ticket {
      id
      title
      localId
      status
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
      ticketWorkflowStates {
        isActive
        estimateMinimum
        estimateMostLikely
        estimateMaximum
        assignee {
          status
        }
      }
    }
  `,
};
