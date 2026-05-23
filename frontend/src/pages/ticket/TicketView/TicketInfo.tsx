import React from "react";
import { gql } from "@apollo/client";
import { SmartTime } from "components/views/Time";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { Ticket } from "types/graphql";
import { urlResolver } from "utils/navigation";

interface Props {
  ticket: Ticket;
  className?: string;
}

export const TicketInfo: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const { className, ticket } = props;

  return (
    <div className={className}>
      {ticket.product ? (
        <Link
          to={urlResolver.product.view(orgId, ticket.product.id)}
          className="mt-4 block text-base text-gray-700 hover:underline"
        >
          {ticket.product.name}
        </Link>
      ) : (
        <div className="mt-4 block text-base text-gray-700">N/A</div>
      )}
      <div className="text-sm text-gray-500">Product</div>

      {ticket.workflow ? (
        <Link
          to={urlResolver.workflow.edit(orgId, ticket.workflow.id)}
          className="mt-4 block text-base text-gray-700 hover:underline"
        >
          {ticket.workflow.name}
        </Link>
      ) : (
        <div className="mt-4 block text-base text-gray-700">N/A</div>
      )}
      <div className="text-sm text-gray-500">Workflow</div>

      {ticket.author ? (
        <div className="mt-4 block text-base text-gray-700">
          {ticket.author.name}
        </div>
      ) : (
        <span className="mt-4 block text-base text-gray-700">Unknown</span>
      )}
      <div className="text-sm text-gray-500">Author</div>

      <div className="mt-4 text-base text-gray-700">
        <SmartTime date={ticket.createdAt} />
      </div>
      <div className="text-sm text-gray-500">Creation date</div>

      {ticket.closedAt && (
        <>
          <div className="mt-4 text-base text-gray-700">
            <SmartTime date={ticket.closedAt} />
          </div>
          <div className="text-sm text-gray-500">Closed date</div>
        </>
      )}

      {ticket.scheduledAt && (
        <>
          <div className="mt-4 text-base text-gray-700">
            <SmartTime date={ticket.scheduledAt} />
          </div>
          <div className="text-sm text-gray-500">Scheduled date</div>
        </>
      )}

      {ticket.archivedAt && (
        <>
          <div className="mt-4 text-base text-gray-700">
            <SmartTime date={ticket.archivedAt} />
          </div>
          <div className="text-sm text-gray-500">Archived date</div>
        </>
      )}

      {ticket.foreignId && (
        <>
          <div className="mt-4 block font-mono text-base text-gray-700">
            {ticket.foreignId}
          </div>
          <div className="text-sm text-gray-500">Imported Identifier</div>
        </>
      )}
    </div>
  );
};

TicketInfo.fragments = {
  TicketInfoFragment: gql`
    fragment TicketInfoFragment on Ticket {
      id
      foreignId
      status
      createdAt
      updatedAt
      scheduledAt
      archivedAt
      closedAt
      eta
      workflow {
        id
        name
      }
      author {
        id
        name
        avatarUrl
      }
      product {
        id
        name
      }
    }
  `,
};
