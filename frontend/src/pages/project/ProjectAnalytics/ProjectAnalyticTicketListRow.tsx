import React from "react";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { ModelStage, Ticket, TicketStatus } from "types/graphql";
import { formatDistanceToNow } from "date-fns";
import { orderBy } from "lodash";
import { SmartTime } from "components/views/Time";
import { TicketInferStatus } from "./TicketInferStatus";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { TicketStatusBadge } from "pages/ticket/TicketList/TicketStatusBadge";
import { TicketIdTag } from "components/tags/TicketIdTag";
import { ExternalLinkIcon } from "@heroicons/react/solid";

interface Props {
  ticket: Ticket;
  index: number;
  onEditTicket: (ticketId: number) => void;
}

export const ProjectAnalyticTicketListRow: FCWithFragments<Props> = (props) => {
  const { orgId } = useParams<{ orgId: string }>();
  const { ticket } = props;

  const regularCell =
    "px-6 py-4 whitespace-nowrap text-sm leading-5 text-gray-500";
  const nextState = ticket.lastScheduleItem?.nextTicketWorkflowState;

  const renderAssignee = () => {
    if (
      ticket.lastScheduleItem &&
      ticket.stage === ModelStage.Published &&
      ticket.status === TicketStatus.Scheduled
    ) {
      if (nextState && nextState.assignee) {
        return nextState.assignee.name;
      } else {
        return ticket.lastScheduleItem.role.name;
      }
    } else if (ticket.ticketWorkflowStates.length > 0) {
      const firstState = orderBy(ticket.ticketWorkflowStates, "position")[0];
      return firstState.assignee?.name;
    }
    return null;
  };

  return (
    <tr className="h-20">
      <td className={`${regularCell} pr-0`}>
        <TicketIdTag
          localId={ticket.localId}
          milestone={ticket.milestone}
          productCode={ticket.product?.code}
          className="text-xs"
        />
      </td>
      <td className={`${regularCell} max-w-xs md:max-w-sm lg:max-w-md`}>
        <div className="flex min-w-0 flex-row items-center space-x-1">
          <button
            type="button"
            onClick={() => props.onEditTicket(ticket.id)}
            title={ticket.title}
            className="truncate text-gray-700 hover:text-brand-600 hover:underline"
          >
            {ticket.title}
          </button>
          <Link
            to={urlResolver.ticket.view(orgId, ticket.id)}
            title="Open ticket view"
            className="text-brand-600 hover:text-brand-800"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
        </div>
      </td>
      <td className={regularCell}>
        {ticket.status === TicketStatus.Scheduled ? (
          <div className="min-w-[10rem]">{renderAssignee()}</div>
        ) : null}
      </td>
      <td className={regularCell}>
        {ticket.status === TicketStatus.Scheduled ? (
          <div className="min-w-[10rem]">
            <TicketInferStatus ticket={ticket} />
          </div>
        ) : (
          <TicketStatusBadge status={ticket.status} stage={ticket.stage} />
        )}
      </td>
      <td className={regularCell}>
        {ticket.closedAt ? (
          <div>
            <div className="font-medium text-gray-700">
              {formatDistanceToNow(new Date(ticket.closedAt), {
                addSuffix: true,
              })}
            </div>
            <SmartTime date={ticket.closedAt} />
          </div>
        ) : ticket.eta ? (
          <div>
            <div className="font-medium text-gray-700">
              {formatDistanceToNow(new Date(ticket.eta), {
                addSuffix: true,
              })}
            </div>
            <SmartTime date={ticket.eta} />
          </div>
        ) : null}
      </td>
    </tr>
  );
};

ProjectAnalyticTicketListRow.fragments = {
  ProjectAnalyticTicketListRowFragment: gql`
    fragment ProjectAnalyticTicketListRowFragment on Ticket {
      id
      eta
      closedAt
      localId
      stage
      status
      title
      ticketWorkflowStates {
        id
        position
        name
        assignee {
          id
          name
        }
      }
      lastScheduleItem {
        id
        done
        stoppedAt
        role {
          id
          name
          avatarUrl
        }
        nextTicketWorkflowState {
          id
          name
          assignee {
            id
            name
            avatarUrl
          }
        }
        ticketWorkflowState {
          id
          name
        }
      }
      workflow {
        id
        name
      }
      product {
        id
        name
        code
      }
      ...TicketInferStatusFragment
    }
    ${TicketInferStatus.fragments.TicketInferStatusFragment}
  `,
};
