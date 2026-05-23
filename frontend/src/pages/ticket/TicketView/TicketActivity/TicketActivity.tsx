import React, { useMemo } from "react";
import { SmartTime } from "components/views/Time";
import gql from "graphql-tag";
import { flatten, last, map, max, sortBy } from "lodash";
import { FCWithFragments } from "types";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { TicketWorkflowStateView } from "./TicketWorkflowStateView";

interface Props {
  ticket: Ticket;
  className?: string;
}

// DEPRECATED
export const TicketActivity: FCWithFragments<Props> = (props) => {
  const { ticket, className } = props;

  const ticketWorkflowStates = useMemo(
    (): TicketWorkflowState[] =>
      sortBy(ticket.ticketWorkflowStates, "position"),
    [ticket.ticketWorkflowStates]
  );

  const eta = max(map(ticketWorkflowStates, "estimate"));

  // captures the very last schedule item recorded which will give us
  // insight on the current state of the ticket
  const lastScheduleItem = last(
    sortBy(flatten(map(ticket.ticketWorkflowStates, "scheduleItems")), [
      "stoppedAt", // push the items without a stoppedAt to the end of the set
      "startedAt",
    ])
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
      <div className="flex flex-col space-y-4 rounded-xl bg-gradient-to-br from-gray-900 to-brand-800 p-4 shadow">
        {showEta(eta)}
        <div className="flex flex-col space-y-2">
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

TicketActivity.fragments = {
  TicketActivityFragment: gql`
    fragment TicketActivityFragment on Ticket {
      id
      ticketWorkflowStates {
        id
        name
        position
        estimate
        ticketId
        assigneeId
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
