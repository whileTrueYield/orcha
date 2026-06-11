/**
 * The lightweight ticket embed for read-only Markdown viewers (PRD #36,
 * post-#42 read-surfaces slice).
 *
 * Renders a `::ticket{id}` reference as a compact one-liner — `TicketIdTag`
 * plus the ticket title — instead of the full `TicketCard`. Comment threads
 * mount one Crepe viewer per comment, so the light preset trades the card's
 * richness for cheap mounts. Clicking opens the ticket edit modal via Redux
 * (embeds have no router context — see `reactNodeView.tsx`).
 *
 * Public API:
 *   - TicketInlineEmbed({ id })
 */
import { gql, useQuery } from "@apollo/client";
import { showTicketEditModal } from "actions";

import { TicketIdTag } from "components/tags/TicketIdTag";
import { type Ticket } from "types/graphql";
import { useAppDispatch } from "store";

interface Props {
  id: number;
}

const GET_TICKET_INLINE_EMBED = gql`
  query GetTicketInlineEmbed($id: Int!) {
    ticket(id: $id) {
      id
      localId
      title
      status
      milestone
      product {
        id
        code
      }
    }
  }
`;

export function TicketInlineEmbed({ id }: Props) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useQuery<{ ticket: Ticket | null }>(
    GET_TICKET_INLINE_EMBED,
    { variables: { id } },
  );

  const ticket = data?.ticket;

  if (error || (!loading && !ticket)) {
    return (
      <span className="text-sm text-red-600">Ticket #{id} is unavailable</span>
    );
  }

  if (!ticket) {
    return <span className="text-sm text-gray-400">Loading ticket…</span>;
  }

  return (
    <button
      type="button"
      onClick={() => dispatch(showTicketEditModal(ticket.id))}
      className="group inline-flex max-w-full items-center gap-x-1.5 rounded text-left text-sm"
    >
      <TicketIdTag
        productCode={ticket.product?.code}
        localId={ticket.localId}
        status={ticket.status}
        milestone={ticket.milestone}
        className="text-xs"
      />
      <span className="truncate text-gray-700 group-hover:underline">
        {ticket.title}
      </span>
    </button>
  );
}
