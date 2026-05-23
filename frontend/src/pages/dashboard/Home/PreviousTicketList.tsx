import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";
import cn from "classnames";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { orderBy, partition } from "lodash";
import { DoneFooter } from "pages/ticket/TicketCard/DoneFooter";
import { ScheduledFooter } from "pages/ticket/TicketCard/ScheduledFooter";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import React from "react";
import { useAppDispatch } from "store";
import { MyPreviousAssignedTicket, TicketStatus } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
}

export const PreviousTicketList: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<QueryReturnValue["myPreviousTickets"]>(
    GET_UPCOMING_TICKETS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useRefetchOnVisible([GET_UPCOMING_TICKETS_QUERY]);

  if (!data || loading) {
    return null;
  }

  // const myPreviousTickets = data.myPreviousTickets;

  const [myUnsortedDoneTickets, myUnsortedPreviousTickets] = partition(
    data.myPreviousTickets,
    (t) => t.ticket.status === TicketStatus.Done
  );

  const myDoneTickets = orderBy(
    myUnsortedDoneTickets,
    "ticket.closedOn",
    "desc"
  );

  const myPreviousTickets = orderBy(
    myUnsortedPreviousTickets,
    "ticket.eta",
    "asc"
  );

  if (myPreviousTickets.length === 0) {
    return (
      <div className="mb-4 px-4">
        <div className="flex h-20 flex-1 flex-col items-center justify-center rounded-lg bg-gray-50">
          <h2 className="text-base font-medium text-gray-500">No Tickets</h2>
          <h3 className="mt-1 text-sm text-gray-500">
            There are not tickets you have worked on still active
          </h3>
        </div>
      </div>
    );
  }

  const className = cn("pb-2 space-y-2", props.className);

  const renderWhatNext = (assignedTicket: MyPreviousAssignedTicket) => {
    const { currentState, isNext, isDone } = assignedTicket;

    if (currentState && isDone) {
      const whoNext = isNext
        ? "you are"
        : currentState.assignee
        ? `${currentState.assignee.name} is`
        : "someone is";

      // we're not the next person
      return (
        <>
          , {whoNext} next on <b>{currentState.name}</b>
        </>
      );
    }

    return null;
  };

  const renderMessage = (assignedTicket: MyPreviousAssignedTicket) => {
    const { lastState, isStarted, isPaused, isDone } = assignedTicket;
    if (lastState) {
      return (
        <div className="hidden sm:block">
          {lastState.assignee?.name}
          {isStarted
            ? isPaused
              ? " has paused "
              : isDone
              ? " is done with "
              : " is active on "
            : " has not started on "}
          <span className="font-medium text-gray-700">{lastState.name}</span>
          {renderWhatNext(assignedTicket)}
        </div>
      );
    } else {
      <div className="hidden sm:block">This ticket has not been started</div>;
    }
  };

  const renderTicket = (assignedTicket: MyPreviousAssignedTicket) => {
    const { ticket, currentState } = assignedTicket;

    return (
      <li
        key={`${ticket.id}-${currentState ? currentState.id : "done"}`}
        className="flex flex-row items-center px-2 sm:space-x-4 sm:px-4"
      >
        <TicketCard
          ticket={ticket}
          onClick={() => dispatch(showTicketEditModal(ticket.id))}
          role="button"
          className="flex-1 hover:bg-gray-50"
          footer={
            ticket.status === TicketStatus.Done ? (
              <DoneFooter ticket={ticket} />
            ) : (
              <ScheduledFooter ticket={ticket} />
            )
          }
          message={currentState ? renderMessage(assignedTicket) : null}
        />
      </li>
    );
  };

  const renderMyPreviousTickets = () => {
    if (myPreviousTickets.length) {
      return myPreviousTickets.map(renderTicket);
    } else return null;
  };

  const renderMyDoneTicket = () => {
    if (myDoneTickets.length) {
      return myDoneTickets.map(renderTicket);
    } else return null;
  };

  return (
    <ul className={className}>
      {renderMyPreviousTickets()}
      {renderMyDoneTicket()}
    </ul>
  );
};

const GET_UPCOMING_TICKETS_QUERY = gql`
  query GetMyPreviousTicketForDashboard {
    myPreviousTickets {
      isActive
      isStarted
      isPaused
      isDone
      isNext
      ticket {
        id
        ...TicketCardFragment
      }
      lastState {
        id
        name
        assignee {
          id
          name
          avatarUrl
        }
      }
      currentState {
        id
        name
        assignee {
          id
          name
          avatarUrl
        }
      }
    }
  }
  ${TicketCard.fragments.TicketCardFragment}
`;
