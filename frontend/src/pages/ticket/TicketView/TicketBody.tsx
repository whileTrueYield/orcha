/**
 * TicketBody — loads a ticket's Markdown body and hands it to the shared
 * DocumentBody editor (#40). Replaces the collaborative TipTap/hocuspocus
 * TicketDescription.
 *
 * Ticket-specific concern: a ticket is read-only once archived. Everything
 * else — the editor, save, conflict and warning handling — lives in
 * DocumentBody.
 *
 * Exports: TicketBody, GET_TICKET_BODY, SAVE_DOCUMENT_BODY (re-exported).
 */
import { gql, useQuery } from "@apollo/client";
import { onGraphQLError } from "utils/GQLClient";
import { DocumentBodyType, ModelStage, Query } from "types/graphql";
import { DocumentBody } from "components/Markdown/DocumentBody";

export { SAVE_DOCUMENT_BODY } from "components/Markdown/DocumentBody";

export const GET_TICKET_BODY = gql`
  query GetTicketBody($id: Int!) {
    ticket(id: $id) {
      id
      stage
      body {
        markdown
        version
      }
    }
  }
`;

interface Props {
  ticketId: number;
}

export const TicketBody: React.FC<Props> = ({ ticketId }) => {
  const { data } = useQuery<Pick<Query, "ticket">>(GET_TICKET_BODY, {
    variables: { id: ticketId },
    fetchPolicy: "network-only",
    onError: onGraphQLError({ title: "Could not load the ticket body" }),
  });

  if (!data?.ticket) return null;

  return (
    <DocumentBody
      key={ticketId}
      documentType={DocumentBodyType.Ticket}
      documentId={ticketId}
      initialMarkdown={data.ticket.body.markdown}
      initialVersion={data.ticket.body.version}
      readOnly={data.ticket.stage === ModelStage.Archived}
      saveErrorTitle="Could not save the ticket body"
    />
  );
};
