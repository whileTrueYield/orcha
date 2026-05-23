import { useState } from "react";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { FCWithFragments } from "types";
import { Ticket } from "types/graphql";
import { EstimatedTicketRow } from "./EstimatedTicketRow";
import { EmptyState } from "components/views/EmtpyState";
import { ToggleButton } from "components/fields/ToggleButton";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  className?: string;
}

export const EstimatedTickets: FCWithFragments<Props> = (props) => {
  const [showUnestimated, _setShowEstimated] = useState(false);
  const [unestimatedTickets, setUnestimatedTicket] = useState<Ticket[]>([]);

  const { data: estimatedData } = useQuery<
    QueryReturnValue["myEstimatedTickets"]
  >(GET_ESTIMATED_TICKETS, {
    fetchPolicy: "cache-and-network",
  });

  const [getUnestimatedTickets] = useLazyQuery<
    QueryReturnValue["myUnestimatedTickets"]
  >(GET_UNESTIMATED_TICKETS, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ myUnestimatedTickets }) => {
      setUnestimatedTicket(myUnestimatedTickets);
    },
  });

  const setShowEstimated = (showUnestimated: boolean) => {
    _setShowEstimated(showUnestimated);
    if (showUnestimated) {
      getUnestimatedTickets();
    }
  };

  if (!estimatedData || !estimatedData.myEstimatedTickets) {
    return null;
  }

  const tickets = showUnestimated
    ? unestimatedTickets
    : estimatedData.myEstimatedTickets;

  if (tickets.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="text-base font-medium text-gray-700">
            {showUnestimated ? "Unestimated" : "Estimated"} Tickets
          </div>
          <div>
            <ToggleButton
              className="mb-4 sm:mb-0"
              checked={showUnestimated}
              onChange={() => setShowEstimated(!showUnestimated)}
              label="Unestimated"
              leftLabel="Estimated"
              checkedColor="bg-gray-200"
              uncheckedColor="bg-gray-200"
            />
          </div>
        </div>
        <EmptyState
          src="/img/svg/undraw_not_found_-60-pq.svg"
          title="No Tickets"
          subTitle={
            showUnestimated ? "No unestimated tickets" : "No estimated tickets"
          }
        />
      </>
    );
  }

  return (
    <div className={props.className}>
      <div className="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <div className="text-base font-medium text-gray-700">
          {showUnestimated ? "Unestimated" : "Estimated"} Tickets
        </div>
        <div>
          <ToggleButton
            checked={showUnestimated}
            onChange={() => setShowEstimated(!showUnestimated)}
            label="Unestimated"
            leftLabel="Estimated"
            checkedColor="bg-gray-200"
            uncheckedColor="bg-gray-200"
          />
        </div>
      </div>
      <div className="mt-4">
        <ul className="space-y-2">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <EstimatedTicketRow ticket={ticket} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

EstimatedTickets.fragments = {
  EstimatedTicketsFragment: gql`
    fragment EstimatedTicketsFragment on Ticket {
      id
      ...EstimateTicketRowFragment
    }
    ${EstimatedTicketRow.fragments.EstimateTicketRowFragment}
  `,
};

const GET_ESTIMATED_TICKETS = gql`
  query MyEstimatedTickets {
    myEstimatedTickets {
      id
      ...EstimatedTicketsFragment
    }
  }
  ${EstimatedTickets.fragments.EstimatedTicketsFragment}
`;

const GET_UNESTIMATED_TICKETS = gql`
  query MyUnestimatedTickets {
    myUnestimatedTickets {
      id
      ...EstimatedTicketsFragment
    }
  }
  ${EstimatedTickets.fragments.EstimatedTicketsFragment}
`;
