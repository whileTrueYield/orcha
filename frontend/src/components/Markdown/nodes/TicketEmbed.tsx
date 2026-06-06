/**
 * The block ticket embed card (PRD #36, issue #42).
 *
 * Renders a `::ticket{id}` reference as the live `TicketCard`, fetched by id —
 * the same card used across the app, so the embed matches the product's ticket
 * presentation rather than a bespoke one. Clicking opens the ticket edit modal
 * via Redux (the modal lives in the app shell on the shared store), so the embed
 * needs no React Router — and `TicketCard` only renders a `<Link>` when `hot`,
 * which we deliberately omit. See `reactNodeView.tsx` for why router context is
 * intentionally absent from embeds.
 *
 * Public API:
 *   - TicketEmbed({ id })
 */
import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";

import { TicketCard } from "pages/ticket/TicketCard/TicketCard";
import { type Ticket } from "types/graphql";
import { useAppDispatch } from "store";

interface Props {
  id: number;
}

const GET_TICKET_EMBED = gql`
  query GetTicketEmbed($id: Int!) {
    ticket(id: $id) {
      id
      ...TicketCardFragment
    }
  }
  ${TicketCard.fragments.TicketCardFragment}
`;

export function TicketEmbed({ id }: Props) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useQuery<{ ticket: Ticket | null }>(
    GET_TICKET_EMBED,
    { variables: { id } },
  );

  const ticket = data?.ticket;

  if (error || (!loading && !ticket)) {
    return (
      <div className="max-w-lg rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
        Ticket #{id} is unavailable
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-lg rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-400">
        Loading ticket…
      </div>
    );
  }

  return (
    <TicketCard
      ticket={ticket}
      role="button"
      className="my-1 max-w-lg cursor-pointer hover:bg-gray-50"
      onClick={() => dispatch(showTicketEditModal(ticket.id))}
    />
  );
}
