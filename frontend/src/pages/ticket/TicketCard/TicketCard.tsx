import { gql } from "@apollo/client";
import React, { Fragment, ReactNode } from "react";
import { Link } from "react-router-dom";
import { FCWithFragments } from "types";
import { ModelStage, Ticket, TicketStatus } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { ArchivedFooter } from "./ArchivedFooter";
import { CancelledFooter } from "./CancelledFooter";
import { DoneFooter } from "./DoneFooter";
import { DraftFooter } from "./DraftFooter";
import { ScheduledFooter } from "./ScheduledFooter";
import { UnscheduledFooter } from "./UnscheduledFooter";
import cn from "classnames";
import { XIcon } from "@heroicons/react/solid";

interface Props extends React.ComponentProps<"div"> {
  ticket: Ticket;
  onDelete?: () => void;
  message?: string | ReactNode;
  footer?: string | ReactNode;
  hot?: boolean;
  fullTitle?: boolean;
}

export const TicketCard: FCWithFragments<Props> = (props) => {
  const {
    ticket,
    onDelete,
    message,
    hot,
    className,
    onClick,
    footer,
    fullTitle,
    ...divProps
  } = props;

  const ticketStatus =
    ticket.stage === ModelStage.Published ? ticket.status : ticket.stage;

  const renderFooter = () => {
    if (footer) {
      return footer;
    }
    switch (ticketStatus) {
      case ModelStage.Draft:
        return <DraftFooter ticket={ticket} />;
      case ModelStage.Archived:
        return <ArchivedFooter ticket={ticket} />;
      case TicketStatus.Unscheduled:
        return <UnscheduledFooter ticket={ticket} />;
      case TicketStatus.Scheduled:
        return <ScheduledFooter ticket={ticket} />;
      case TicketStatus.Done:
        return <DoneFooter ticket={ticket} />;
      case TicketStatus.Cancelled:
        return <CancelledFooter ticket={ticket} />;
      default:
        return null;
    }
  };

  const containerClassName = cn(
    "relative group bg-white overflow-hidden rounded-md py-2 text-gray-600 shadow-sm border",
    className
  );

  const renderOnDelete = () => {
    if (onDelete) {
      return (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-1 top-1 rounded p-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100 sm:opacity-0"
        >
          <XIcon className="h-4 w-4" />
        </button>
      );
    } else {
      return null;
    }
  };

  const renderTitle = () => {
    if (hot) {
      return (
        <Link
          to={urlResolver.ticket.view(
            ticket.organizationId.toString(),
            ticket.id
          )}
          title={ticket.title}
          className={cn(
            "mb-1 inline-block w-full pl-4 pr-8 text-sm font-medium text-gray-800 hover:text-gray-600 hover:underline",
            {
              truncate: !fullTitle,
            }
          )}
        >
          {ticket.title}
        </Link>
      );
    } else {
      return (
        <div
          title={ticket.title}
          className={cn(
            "mb-1 inline-block w-full pl-4 pr-8 text-sm font-medium text-gray-800",
            {
              truncate: !fullTitle,
            }
          )}
        >
          {ticket.title}
        </div>
      );
    }
  };

  const renderOptionalMessage = () => {
    if (message) {
      return (
        <div className="-mt-0.5 mb-1.5 pl-4 pr-2 text-xs font-normal text-gray-500">
          {message}
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <Fragment>
      <div className={containerClassName} {...divProps}>
        {renderOnDelete()}
        <div onClick={onClick}>
          {renderTitle()}
          {renderOptionalMessage()}
          {renderFooter()}
        </div>
      </div>
    </Fragment>
  );
};

TicketCard.fragments = {
  TicketCardFragment: gql`
    fragment TicketCardFragment on Ticket {
      id
      organizationId
      localId
      title
      status
      stage
      eta
      closedAt
      scheduledAt
      createdAt
      estimating
      product {
        id
        code
      }
      ticketWorkflowStates {
        id
        isActive
        estimateMinimum
        estimateMostLikely
        estimateMaximum
        assigneeId
      }
    }
  `,
};
