import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";
import cn from "classnames";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { partition } from "lodash";
import { ScheduledFooter } from "pages/ticket/TicketCard/ScheduledFooter";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import React from "react";
import { useAppDispatch } from "store";
import { MyUpcomingAssignedTicket } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
}

export const UpcomingTicketList: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const { data, loading } = useQuery<QueryReturnValue["myUpcomingTickets"]>(
    GET_UPCOMING_TICKETS_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useRefetchOnVisible([GET_UPCOMING_TICKETS_QUERY]);

  if (!data || loading) {
    return null;
  }

  const upcomingTickets = data.myUpcomingTickets;

  if (upcomingTickets.length === 0) {
    return (
      <div className="mb-4 px-4">
        <div className="flex h-20 flex-1 flex-col items-center justify-center rounded-lg bg-gray-50">
          <h2 className="text-base font-medium text-gray-500">No Tickets</h2>
          <h3 className="mt-1 text-sm text-gray-500">
            No upcoming tickets yet
          </h3>
        </div>
      </div>
    );
  }

  const [nextUpcomingTickets, otherTickets] = partition(
    upcomingTickets,
    "isNext"
  );

  const [startedTickets, unstartedTickets] = partition(
    otherTickets,
    "isStarted"
  );

  const className = cn("space-y-2 pb-2", props.className);

  const renderWhatNext = (assignedTicket: MyUpcomingAssignedTicket) => {
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

  const renderMessage = (assignedTicket: MyUpcomingAssignedTicket) => {
    if (assignedTicket.lastState) {
      return (
        <div className="hidden sm:block">
          {assignedTicket.lastState.assignee?.name}
          {assignedTicket.isStarted
            ? assignedTicket.isPaused
              ? " has paused "
              : assignedTicket.isDone
              ? " is done with "
              : " is active on "
            : " has not started on "}
          <span className="font-medium text-gray-700">
            {assignedTicket.lastState.name}
          </span>
          {renderWhatNext(assignedTicket)}
        </div>
      );
    } else {
      return (
        <div className="hidden sm:block">This ticket has not been started</div>
      );
    }
  };

  const renderTicket = (assignedTicket: MyUpcomingAssignedTicket) => {
    const { ticket, currentState } = assignedTicket;

    return (
      <li
        key={`${ticket.id}-${currentState.id}`}
        className="flex flex-row items-center px-2 sm:space-x-4 sm:px-4"
      >
        <TicketCard
          ticket={ticket}
          onClick={() => dispatch(showTicketEditModal(ticket.id))}
          role="button"
          className="flex-1 hover:bg-gray-50"
          footer={<ScheduledFooter ticket={ticket} />}
          message={renderMessage(assignedTicket)}
        />
      </li>
    );
  };

  const renderNextUpcomingTickets = () => {
    if (nextUpcomingTickets.length) {
      return (
        <ul className="space-y-2">{nextUpcomingTickets.map(renderTicket)}</ul>
      );
    } else return null;
  };

  const renderUnstartUpcomingTickets = () => {
    if (unstartedTickets.length) {
      return (
        <ul className="space-y-2">{unstartedTickets.map(renderTicket)}</ul>
      );
    } else return null;
  };

  const renderStartedUpcomingTickets = () => {
    if (startedTickets.length) {
      return <ul className="space-y-2">{startedTickets.map(renderTicket)}</ul>;
    } else return null;
  };

  return (
    <div className={className}>
      {renderNextUpcomingTickets()}
      {renderStartedUpcomingTickets()}
      {renderUnstartUpcomingTickets()}
    </div>
  );
};

const GET_UPCOMING_TICKETS_QUERY = gql`
  query GetUpcomingTicketForDashboard {
    myUpcomingTickets {
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
