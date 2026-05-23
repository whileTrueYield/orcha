import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import { useAppDispatch } from "store";
import { QueryTicketArgs } from "types/graphql";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  onChange: (ticketId: number | null) => void;
  ticketId: number;
}

export const TicketView: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();

  const { data, loading, error } = useQuery<
    QueryReturnValue["ticket"],
    QueryTicketArgs
  >(GET_TICKET_QUERY, {
    fetchPolicy: "network-only",
    variables: {
      id: props.ticketId,
    },
  });

  const ticket = data?.ticket;

  if (error) {
    console.warn("EditorTicketView Error:", error);
    return (
      <div
        contentEditable={false}
        className="flex items-center justify-center bg-red-50 p-4 text-sm text-red-600"
      >
        Error...
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div
        contentEditable={false}
        className="flex items-center justify-center bg-white p-4 text-sm text-gray-400"
      >
        Loading...
      </div>
    );
  }

  return (
    <div contentEditable={false}>
      <TicketCard
        ticket={ticket}
        role="button"
        onDelete={() => props.onChange(null)}
        className="my-2 max-w-lg hover:bg-gray-50"
        onClick={() => dispatch(showTicketEditModal(ticket.id))}
      />
    </div>
  );
};

const GET_TICKET_QUERY = gql`
  query GetTicketForTipTapPlugin($id: Int!) {
    ticket(id: $id) {
      id
      ...TicketCardFragment
    }
  }
  ${TicketCard.fragments.TicketCardFragment}
`;
