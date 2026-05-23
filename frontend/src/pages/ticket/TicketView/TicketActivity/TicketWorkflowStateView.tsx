import { last, some, sortBy } from "lodash";
import {
  ScheduleItem,
  Ticket,
  TicketStatus,
  TicketWorkflowState,
} from "types/graphql";
import { ActiveTicketWorkflowState } from "./States/ActiveTicketWorkflowState";
import { DoneTicketWorkflowState } from "./States/DoneTicketWorkflowState";
import { NewTicketWorkflowState } from "./States/NewTicketWorkflowState";
import { PausedTicketWorkflowState } from "./States/PausedTicketWorkflowState";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStates: TicketWorkflowState[];
  lastScheduleItem?: ScheduleItem;
  ticket: Ticket;
}

export const TicketWorkflowStateView: FCWithFragments<Props> = (props) => {
  const {
    ticketWorkflowState,
    lastScheduleItem,
    ticketWorkflowStates,
    ticket,
  } = props;

  // We start by deciding if the current state is the focused state
  let isFocused = false;

  // if the ticket is not scheduled anymore, no state need to be in focus
  if (ticket.status !== TicketStatus.Scheduled) {
    isFocused = false;
  } else if (lastScheduleItem) {
    if (lastScheduleItem.nextTicketWorkflowStateId) {
      // the focused state is the the next state stored on the last schedule item
      isFocused =
        ticketWorkflowState.id === lastScheduleItem.nextTicketWorkflowStateId;
    } else {
      // the focused state is the the last schedule item
      isFocused =
        ticketWorkflowState.id === lastScheduleItem.ticketWorkflowStateId;
    }
  } else {
    // since there is no lastScheduleItem, this is a new ticket
    // and a new ticket always starts with the first states as active
    isFocused = ticketWorkflowState.id === ticketWorkflowStates[0].id;
  }

  // did we start working on this state?
  const isStartedState = ticketWorkflowState.scheduleItems.length > 0;
  if (isStartedState) {
    // if there is at least one schedule item that has no stoppedAt
    // the ticket is active (currently worked on)
    const isActive = some(
      ticketWorkflowState.scheduleItems,
      ({ stoppedAt }) => !stoppedAt
    );

    if (isActive) {
      return (
        <ActiveTicketWorkflowState
          ticketWorkflowState={ticketWorkflowState}
          ticketWorkflowStates={ticketWorkflowStates}
          lastScheduleItem={lastScheduleItem}
          ticket={ticket}
          isCurrent={isFocused}
        />
      );
    }

    const stateLastScheduleItem = last(
      sortBy(ticketWorkflowState.scheduleItems, "stoppedAt")
    );

    // the last schedule item of the state tells us if the
    // state has been finalized if it points toward another state
    if (stateLastScheduleItem?.nextTicketWorkflowStateId) {
      // if we are focus on this state, we will show it as new state
      // because even if the state was "done" the focus means
      // that is has been sent back here
      if (isFocused) {
        return (
          <NewTicketWorkflowState
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            ticket={ticket}
            isCurrent={isFocused}
          />
        );
      } else {
        return (
          <DoneTicketWorkflowState
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            ticket={ticket}
            isCurrent={isFocused}
          />
        );
      }
    } else {
      // if we are focus on this state, it means that we are currently
      // paused, otherwise we've been working on this ticket and are
      // not anymore (we could have been transitioned without an explicit
      // next state, like someone directly starting another state)
      if (isFocused) {
        return (
          <PausedTicketWorkflowState
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            ticket={ticket}
            isCurrent={isFocused}
          />
        );
      } else {
        // here we'll consider that some work has been done on the ticket,
        // even if the next step was not specified.
        return (
          <DoneTicketWorkflowState
            ticketWorkflowState={ticketWorkflowState}
            ticketWorkflowStates={ticketWorkflowStates}
            lastScheduleItem={lastScheduleItem}
            ticket={ticket}
            isCurrent={isFocused}
          />
        );
      }
    }
  } else {
    return (
      <NewTicketWorkflowState
        ticketWorkflowState={ticketWorkflowState}
        ticketWorkflowStates={ticketWorkflowStates}
        lastScheduleItem={lastScheduleItem}
        ticket={ticket}
        isCurrent={isFocused}
      />
    );
  }
};

TicketWorkflowStateView.fragments = {
  TicketWorkflowStateViewFragment: gql`
    fragment TicketWorkflowStateViewFragment on TicketWorkflowState {
      id
      ...ActiveTicketWorkflowStateFragment
      ...DoneTicketWorkflowStateFragment
      ...NewTicketWorkflowStateFragment
      ...PausedTicketWorkflowStateFragment
    }
    ${ActiveTicketWorkflowState.fragments.ActiveTicketWorkflowStateFragment}
    ${DoneTicketWorkflowState.fragments.DoneTicketWorkflowStateFragment}
    ${NewTicketWorkflowState.fragments.NewTicketWorkflowStateFragment}
    ${PausedTicketWorkflowState.fragments.PausedTicketWorkflowStateFragment}
  `,
};
