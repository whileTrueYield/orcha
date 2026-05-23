import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { TicketStageProgress, TicketStep } from "./TicketStageProgress";
import cn from "classnames";
import { filter, flatten, last, map, sortBy } from "lodash";
import { useMemo } from "react";
import { TicketWorkflowStateView } from "../TicketActivity/TicketWorkflowStateView";

interface Props {
  ticket: Ticket;
  steps: TicketStep[];
}

export const DoneTicketStage: FCWithFragments<Props> = (props) => {
  const { ticket, steps } = props;

  const className = cn(
    "rounded-xl shadow flex flex-col bg-gradient-to-br from-gray-900 to-brand-800"
  );

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
  return (
    <div className={className}>
      <div className="flex flex-col space-y-4 pt-4">
        <div className="text-center text-lg font-medium text-gray-200">
          Done
        </div>
        <TicketStageProgress steps={steps} />
        <p className="text-center text-sm font-medium text-gray-100">
          This ticket is done.
        </p>
        <div className="flex flex-col">
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

DoneTicketStage.fragments = {
  doneTicketStageFragment: gql`
    fragment doneTicketStageFragment on Ticket {
      id
      ticketWorkflowStates {
        id
        name
        position
        estimate
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
