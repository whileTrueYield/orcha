import React from "react";
import { gql } from "@apollo/client";
import {
  ArrowCircleRightIcon,
  ClockIcon,
  PauseIcon,
  PlayIcon,
} from "@heroicons/react/solid";
import { FCWithFragments } from "types";
import { ModelStage, ScheduleItem, Ticket, TicketStatus } from "types/graphql";

interface Props {
  ticket: Ticket;
}

export const TicketInferStatus: FCWithFragments<Props> = (props) => {
  const { ticket } = props;

  const nextState = ticket.lastScheduleItem?.nextTicketWorkflowState;

  if (
    ticket.lastScheduleItem &&
    ticket.stage === ModelStage.Published &&
    ticket.status === TicketStatus.Scheduled
  ) {
    if (nextState) {
      return (
        <div
          className="flex min-w-0 flex-row items-center space-x-1"
          title={`Ready to start on ${nextState.name}`}
        >
          <div className="inline-flex min-w-0 items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
            <ArrowCircleRightIcon className="mr-1 h-4 w-4 flex-none text-brand-400" />
            <div className="truncate font-medium">{nextState.name}</div>
          </div>
        </div>
      );
    } else {
      const getTicketWorkflowState = (scheduleItem: ScheduleItem) => {
        // is it active?
        if (scheduleItem.stoppedAt) {
          return (
            <div
              className="flex min-w-0 flex-row items-center space-x-1"
              title={`${scheduleItem.ticketWorkflowState.name} is paused`}
            >
              <div className="inline-flex min-w-0 items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                <PauseIcon className="mr-1 h-4 w-4 flex-none text-yellow-500" />
                <div className="truncate font-medium">
                  {scheduleItem.ticketWorkflowState.name}
                </div>
              </div>
            </div>
          );
        } else {
          return (
            <div
              className="flex min-w-0 flex-row items-center space-x-1"
              title={`${scheduleItem.ticketWorkflowState.name} is active`}
            >
              <div className="inline-flex min-w-0 items-center rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                <PlayIcon className="mr-1 h-4 w-4 flex-none text-brand-500" />
                <div className="truncate font-medium">
                  {scheduleItem.ticketWorkflowState.name}
                </div>
              </div>
            </div>
          );
        }
      };

      return (
        <div className="flex flex-row items-center space-x-1">
          {getTicketWorkflowState(ticket.lastScheduleItem)}
        </div>
      );
    }
  } else if (ticket.ticketWorkflowStates.length > 0) {
    return (
      <div className="inline-flex min-w-0 items-center bg-white px-2 py-0.5 text-xs font-medium">
        <ClockIcon className="mr-1 h-4 w-4 flex-none text-gray-400" />
        <div className="truncate font-medium text-gray-600">Not Started</div>
      </div>
    );
  }

  return null;
};

TicketInferStatus.fragments = {
  TicketInferStatusFragment: gql`
    fragment TicketInferStatusFragment on Ticket {
      id
      status
      stage
      lastScheduleItem {
        id
        startedAt
        stoppedAt
        nextTicketWorkflowState {
          id
          name
        }
        ticketWorkflowState {
          id
          position
          name
        }
      }
      ticketWorkflowStates {
        id
        position
        name
      }
    }
  `,
};
