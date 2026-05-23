import { gql } from "@apollo/client";
import { Tag } from "components/tags/Tag";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { Ticket } from "types/graphql";
import { urlResolver } from "utils/navigation";

interface Props {
  ticket: Ticket;
}

export const EstimatedTicketRow: FCWithFragments<Props> = (props) => {
  const { ticket } = props;
  const { orgId } = useParams<{ orgId: string }>();

  return (
    <div className="w-full">
      <Link
        to={urlResolver.ticket.view(orgId, ticket.id)}
        className="group flex w-full flex-col space-y-2 truncate rounded-md bg-gray-100 px-4 py-2 text-left hover:bg-gray-200 focus:outline-none focus:ring"
      >
        <div className="truncate text-sm text-gray-700">{ticket.title}</div>
        <div className="flex flex-row space-x-2">
          <Tag className="inline space-x-1 bg-gray-200 text-xs group-hover:bg-gray-300">
            <span className="text-gray-500">{ticket.product?.code}</span>
            <span className="text-gray-700">{ticket.localId}</span>
          </Tag>
        </div>
      </Link>
    </div>
  );
};

EstimatedTicketRow.fragments = {
  EstimateTicketRowFragment: gql`
    fragment EstimateTicketRowFragment on Ticket {
      id
      localId
      title
      product {
        id
        code
      }
    }
  `,
};
