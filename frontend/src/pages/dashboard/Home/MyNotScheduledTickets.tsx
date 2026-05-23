import { gql, useQuery } from "@apollo/client";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import { useAppDispatch } from "store";
import { QueryReturnValue } from "types/queryTypes";
import { showTicketEditModal } from "actions";
import { QueryTicketsArgs, Ticket } from "types/graphql";
import { useSelector } from "react-redux";
import { getMe } from "reducers/selector";
import { useLocalPagination } from "hooks/useLocalPagination";
import { useState } from "react";
import { PopoverTips } from "components/help/HelpBlock";
import { Paginator } from "components/views/Paginator";

interface Props {
  className?: string;
}

export const MyNotScheduledTickets: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const pagination = useLocalPagination({
    pageSize: 5,
    sortDirection: "DESC",
    sortBy: "createdAt",
  });
  const { setPage } = pagination;
  const me = useSelector(getMe);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);

  const ticketQueryVariables: QueryTicketsArgs = {
    sort: pagination.sortBy,
    offset: pagination.pageSize * pagination.page,
    unfinished: true,
  };

  // when in an authicated view we'll always get a role ID but because
  // this selector is available while logged-out and logged-in,
  // we need to ensure me and role have a value :(
  if (me?.role?.id) {
    ticketQueryVariables.assigneeIds = [me.role.id];
  }

  if (pagination.sortDirection === "ASC") {
    ticketQueryVariables.first = pagination.pageSize;
  } else {
    ticketQueryVariables.last = pagination.pageSize;
  }

  const { loading } = useQuery<
    QueryReturnValue["myNotScheduledTickets"],
    QueryTicketsArgs
  >(GET_TICKETS_ASSIGNED_TO_ME, {
    fetchPolicy: "cache-and-network",
    variables: ticketQueryVariables,
    onCompleted: ({ myNotScheduledTickets }) => {
      setTickets(myNotScheduledTickets.nodes);
      setTotal(myNotScheduledTickets.totalCount);
    },
  });

  useRefetchOnVisible([GET_TICKETS_ASSIGNED_TO_ME]);

  const renderTicketList = () => (
    <ul className="space-y-2 px-4 pb-4">
      {tickets.map((ticket) => (
        <TicketCard
          ticket={ticket}
          key={`${ticket.id}`}
          onClick={() => dispatch(showTicketEditModal(ticket.id))}
          role="button"
          className="hover:bg-gray-50"
        />
      ))}
    </ul>
  );

  const renderEmpty = () => {
    return (
      <div className="mb-4 px-4">
        <div className="flex h-20 flex-1 flex-col items-center justify-center rounded-lg bg-gray-50">
          <h2 className="text-base font-medium text-gray-500">No Tickets</h2>
          <h3 className="mt-1 text-sm text-gray-500">
            You own no unscheduled tickets
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className={props.className}>
      <div className="flex flex-col items-center justify-center rounded-t-lg bg-white bg-opacity-50 p-4 text-center text-base font-medium text-gray-700 backdrop-blur sm:text-left md:flex-row lg:justify-between">
        <div>
          Unscheduled tickets you own
          <PopoverTips
            title="Unscheduled tickets you own"
            className="relative top-1 inline-block px-1"
          >
            <p>These are tickets you own which have not been scheduled yet.</p>
            <ul className="list-disc space-y-2 pl-4">
              <li>
                <strong className="mr-1 font-bold text-white">
                  Ready to schedule:
                </strong>
                the ticket has been fully assigned and estimated, it is ready be
                added to your schedule
              </li>
              <li>
                <strong className="mr-1 font-bold text-white">
                  Awaiting estimates:
                </strong>
                a request for estimate have been sent to all its assignees
              </li>
              <li>
                <strong className="mr-1 font-bold text-white">
                  Ready for estimates:
                </strong>
                the ticket has been fully assigned and you may request assignees
                to enter their estimates
              </li>
              <li>
                <strong className="mr-1 font-bold text-white">
                  Not fully assigned:
                </strong>
                Some or all of the ticket workflow stages are missing assignees.
              </li>
            </ul>
          </PopoverTips>
        </div>
        <Paginator
          small
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={setPage}
          itemCount={tickets.length}
          itemName="ticket"
          className="hidden sm:block"
        />
      </div>
      {total > 0 ? renderTicketList() : renderEmpty()}

      <div className="flex flex-row justify-end px-4 pb-4 sm:hidden">
        <Paginator
          small
          total={total}
          {...pagination}
          isLoading={loading}
          setPage={setPage}
          itemCount={tickets.length}
          itemName="ticket"
        />
      </div>
    </div>
  );
};

const GET_TICKETS_ASSIGNED_TO_ME = gql`
  query myNotScheduledTickets(
    $first: Int
    $last: Int
    $sort: String
    $offset: Int
  ) {
    myNotScheduledTickets(
      first: $first
      last: $last
      sort: $sort
      offset: $offset
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        ...TicketCardFragment
      }
    }
  }
  ${TicketCard.fragments.TicketCardFragment}
`;
