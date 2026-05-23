import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { TicketStageProgress, TicketStep } from "./TicketStageProgress";
import cn from "classnames";
import { SmartTime } from "components/views/Time";
import { useMemo } from "react";
import { filter, flatten, last, map, sortBy } from "lodash";
import { TicketWorkflowStateView } from "../TicketActivity/TicketWorkflowStateView";

interface Props {
  ticket: Ticket;
  steps: TicketStep[];
}

export const ScheduledTicketStage: FCWithFragments<Props> = (props) => {
  const { ticket, steps } = props;
  const className = cn(
    "rounded-xl shadow flex flex-col bg-gradient-to-br from-gray-900 to-brand-800"
  );

  const states = sortBy(ticket.ticketWorkflowStates, "position");
  const eta = last(states)?.estimate;

  // captures the very last schedule item recorded which will give us
  // insight on the current state of the ticket
  const lastScheduleItem = last(
    sortBy(flatten(map(ticket.ticketWorkflowStates, "scheduleItems")), [
      "stoppedAt", // push the items without a stoppedAt to the end of the set
      "startedAt",
    ])
  );

  const ticketWorkflowStates = useMemo(
    (): TicketWorkflowState[] =>
      sortBy(
        filter(ticket.ticketWorkflowStates, { isActive: true }),
        "position"
      ),
    [ticket.ticketWorkflowStates]
  );

  const showEta = (eta: any) => {
    return (
      <div>
        <div className="text-center text-sm text-gray-300">
          Projected Delivery
        </div>
        <div className="text-center text-lg font-medium text-white">
          {eta ? <SmartTime date={eta} /> : "..."}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4 pt-4">
        <div className="text-center text-lg font-medium text-gray-200">
          Scheduled Ticket
        </div>
        <TicketStageProgress steps={steps} />
        {showEta(eta)}
        <div className="flex flex-col divide-y divide-gray-400 divide-opacity-50">
          {ticketWorkflowStates.map((tws) => (
            <TicketWorkflowStateView
              ticketWorkflowStates={ticketWorkflowStates}
              ticketWorkflowState={tws}
              key={tws.id}
              lastScheduleItem={lastScheduleItem}
              ticket={ticket}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

ScheduledTicketStage.fragments = {
  scheduledTicketStageFragment: gql`
    fragment scheduledTicketStageFragment on Ticket {
      id
      ticketWorkflowStates {
        id
        name
        position
        estimate
        assigneeId
        isBlocked
        scheduleItems {
          id
          done
          stoppedAt
          startedAt
          ticketWorkflowStateId
          nextTicketWorkflowStateId
          roleId
          role {
            id
            title
            name
            avatarUrl
          }
        }
        workflowStateId
        assignee {
          id
          title
          name
          avatarUrl
        }
        ...TicketWorkflowStateViewFragment
      }
    }
    ${TicketWorkflowStateView.fragments.TicketWorkflowStateViewFragment}
  `,
};
