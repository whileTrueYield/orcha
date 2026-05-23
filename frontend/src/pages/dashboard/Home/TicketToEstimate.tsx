import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { Ticket, TicketWorkflowState } from "types/graphql";
import { TicketToEstimateRow } from "./TicketToEstimateRow";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { every } from "lodash";
import { EmptyState } from "components/views/EmtpyState";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { PopoverTips } from "components/help/HelpBlock";
import { QueryReturnValue } from "types/queryTypes";
import { ToggleButton } from "components/fields/ToggleButton";
import cn from "classnames";

interface Props {
  className?: string;
}

interface TicketAndState {
  ticket: Ticket;
  ticketWorkflowState: TicketWorkflowState;
}

export const TicketToEstimate: FCWithFragments<Props> = (props) => {
  const me = useSelector(getMe);
  const [showEstimated, setShowEstimated] = useState(false);
  const { data, loading } = useQuery<QueryReturnValue["myTicketsToEstimate"]>(
    GET_TICKET_TO_ESTIMATE_QUERY,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  useRefetchOnVisible([GET_TICKET_TO_ESTIMATE_QUERY]);

  if (!data || loading) {
    return null;
  }

  // we need to know the user's ID
  if (!me || !me.role) {
    return null;
  }

  const tickets = data.myTicketsToEstimate;

  const header = (
    <>
      {showEstimated ? "Estimated tickets" : "Tickets to estimate"}
      <PopoverTips
        title="Tickets to estimate"
        className="relative top-1 inline-block px-1"
      >
        <p>
          When you're assigned work Autopilot needs to know how long you think
          it will take to complete.
        </p>
        <p>
          We ask for a range of estimates to make it easier for you because
          trying to come up with a single accurate time estimate can be
          challenging.
        </p>
        <p>
          In this section you can also display previously estimated tickets that
          have not yet been scheduled. This allows you to correct estimates if
          needed.
        </p>
      </PopoverTips>
    </>
  );

  const states: Array<TicketAndState> = [];
  const estimatedStates: Array<TicketAndState> = [];

  for (const ticket of tickets) {
    for (const ticketWorkflowState of ticket.ticketWorkflowStates) {
      if (ticketWorkflowState.assigneeId === me.role.id) {
        if (
          !every([
            ticketWorkflowState.estimateMaximum,
            ticketWorkflowState.estimateMinimum,
            ticketWorkflowState.estimateMostLikely,
          ])
        ) {
          states.push({ ticket, ticketWorkflowState });
        } else {
          estimatedStates.push({ ticket, ticketWorkflowState });
        }
      }
    }
  }

  const renderTicketState = ({
    ticket,
    ticketWorkflowState,
  }: TicketAndState) => (
    <li key={`${ticket.id}-${ticketWorkflowState.id}`}>
      <TicketToEstimateRow
        ticket={ticket}
        ticketWorkflowState={ticketWorkflowState}
      />
    </li>
  );

  const renderTicketList = (ticketAndStates: TicketAndState[]) => {
    if (ticketAndStates.length === 0) {
      return (
        <EmptyState
          src="/img/svg/undraw_well_done_i2wr.svg"
          title="No Tickets"
          className="mt-4 flex-1 px-4"
        />
      );
    } else {
      return (
        <ul className="flex-1 space-y-2 px-4 pb-4 sm:overflow-auto">
          {ticketAndStates.map(renderTicketState)}
        </ul>
      );
    }
  };

  return (
    <div className={cn("flex h-full flex-col", props.className)}>
      <div className="flex flex-col items-center justify-between space-y-2 p-4 sm:flex-row sm:space-y-0">
        <div>{header}</div>
        <ToggleButton
          className="mb-4 sm:mb-0"
          checked={showEstimated}
          onChange={setShowEstimated}
          checkedColor="bg-green-300"
          uncheckedColor="bg-sky-300"
          label="Estimated"
          leftLabel="To estimate"
        />
      </div>
      {renderTicketList(showEstimated ? estimatedStates : states)}
      {showEstimated ? (
        <div className="py-2 text-center text-xs text-gray-600">
          Displaying only unscheduled tickets
        </div>
      ) : null}
    </div>
  );
};

TicketToEstimate.fragments = {
  ticketToEstimateFragment: gql`
    fragment ticketToEstimateFragment on Ticket {
      id
      ...TicketToEstimateRowFragment
      ticketWorkflowStates {
        id
        estimateMaximum
        estimateMinimum
        estimateMostLikely
        assigneeId
      }
    }
    ${TicketToEstimateRow.fragments.TicketToEstimateRowFragment}
  `,
};

const GET_TICKET_TO_ESTIMATE_QUERY = gql`
  query TicketsToEstimateForDashboard {
    myTicketsToEstimate {
      id
      ...ticketToEstimateFragment
    }
  }
  ${TicketToEstimate.fragments.ticketToEstimateFragment}
`;
