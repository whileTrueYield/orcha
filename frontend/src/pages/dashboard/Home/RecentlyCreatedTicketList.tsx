import { gql, useQuery } from "@apollo/client";
import { useRefetchOnVisible } from "components/taskManager/hooks";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import { useAppDispatch } from "store";
import { QueryReturnValue } from "types/queryTypes";
import { showTicketEditModal } from "actions";
import { QueryMyRecentlyCreatedTicketsArgs, Ticket } from "types/graphql";
import { PopoverTips } from "components/help/HelpBlock";
import { Paginator } from "components/views/Paginator";
import { useLocalPagination } from "hooks/useLocalPagination";
import { useState } from "react";

interface Props {
  className?: string;
}

export const RecentlyCreatedTicketList: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const pagination = useLocalPagination({
    pageSize: 5,
    sortDirection: "DESC",
  });
  const { setPage } = pagination;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);

  const ticketQueryVariables: QueryMyRecentlyCreatedTicketsArgs = {
    sort: pagination.sortBy,
    offset: pagination.pageSize * pagination.page,
  };

  if (pagination.sortDirection === "ASC") {
    ticketQueryVariables.first = pagination.pageSize;
  } else {
    ticketQueryVariables.last = pagination.pageSize;
  }

  const { loading } = useQuery<
    QueryReturnValue["myRecentlyCreatedTickets"],
    QueryMyRecentlyCreatedTicketsArgs
  >(GET_TICKETS_I_OWN, {
    fetchPolicy: "cache-and-network",
    variables: ticketQueryVariables,
    onCompleted: ({ myRecentlyCreatedTickets }) => {
      setTickets(myRecentlyCreatedTickets.nodes);
      setTotal(myRecentlyCreatedTickets.totalCount);
    },
  });

  useRefetchOnVisible([GET_TICKETS_I_OWN]);

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
            No recently created tickets
          </h3>
        </div>
      </div>
    );
  };

  return (
    <div className={props.className}>
      <div className="flex flex-col items-center justify-center rounded-t-lg bg-white bg-opacity-50 p-4 text-center text-base font-medium text-gray-700 backdrop-blur sm:text-left md:flex-row lg:justify-between">
        <div>
          Tickets you created in the past 30 days
          <PopoverTips
            title="Your recently created tickets"
            className="relative top-1 inline-block px-1"
          >
            <p>
              This shows you all tickets that you have created in the past 30
              days.
            </p>
            <p>Archived tickets will not appear here.</p>
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

const GET_TICKETS_I_OWN = gql`
  query OwnedTicketList($first: Int, $last: Int, $sort: String, $offset: Int) {
    myRecentlyCreatedTickets(
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
