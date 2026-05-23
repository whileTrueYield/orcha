import { gql, useQuery } from "@apollo/client";
import { onGraphQLError } from "utils/GQLClient";
import TiptapCollab from "components/TipTap/TipTapCollab";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  description?: string;
  ticketId: number;
}

export const TicketDescription: React.FC<Props> = (props) => {
  const { ticketId } = props;

  const { data: tokenData } = useQuery<
    QueryReturnValue["ticketTextAccessToken"]
  >(GET_TICKET_ACCESS_TOKEN, {
    pollInterval: 14 * 60 * 1000, // every 14 mins, token lasts 15mins
    fetchPolicy: "no-cache", // we want the data reloaded && but NEVER stored cache
    onError: onGraphQLError({ title: "Access to ticket details rejected" }),
    variables: { id: ticketId },
  });

  const accessToken = tokenData?.ticketTextAccessToken;
  const isReadOnly = false;

  return (
    <div className="text-gray-800">
      {accessToken && (
        <TiptapCollab
          documentId={ticketId}
          documentType="ticketText"
          accessToken={accessToken}
          readonly={isReadOnly}
          placeholder="Describe the task, use :emoji, mention @people and link #ticket"
        />
      )}
    </div>
  );
};

const GET_TICKET_ACCESS_TOKEN = gql`
  query getTicketTextAccessToken($id: Int!) {
    ticketTextAccessToken(id: $id)
  }
`;
