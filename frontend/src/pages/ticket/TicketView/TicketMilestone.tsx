import React, { useState } from "react";
import { gql } from "@apollo/client";
import { BookmarkIcon, StarIcon } from "@heroicons/react/solid";
import { BookmarkIcon as OutlineBookmarkIcon } from "@heroicons/react/outline";
import { FCWithFragments } from "types";
import {
  MutationUnwatchTicketArgs,
  MutationUpdateTicketArgs,
  MutationWatchTicketArgs,
  Ticket,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import cn from "classnames";
import { ConfirmModal } from "components/modals/ConfirmModal";

interface Props {
  ticket: Ticket;
  className?: string;
}

export const TicketMilestone: FCWithFragments<Props> = (props) => {
  const [isConfirmVisible, setConfirmVisible] = useState(false);
  const { ticket } = props;

  const [updateTicket] = useBlockingMutation<
    { addTicketFeatures: Ticket },
    MutationUpdateTicketArgs
  >(MUTATE_UPDATE_TICKET, {
    onError: onGraphQLError({ title: "Could not convert ticket to milestone" }),
    onCompleted: onMutationComplete({
      title: "Ticket milestone status updated",
    }),
  });

  const [watchTicket] = useBlockingMutation<
    { watchTicket: Ticket },
    MutationWatchTicketArgs
  >(MUTATE_WATCH_TICKET, {
    onError: onGraphQLError({
      title: "Could not add ticket to your favorites",
    }),
    onCompleted: onMutationComplete({
      title: "Ticket added to your favorites",
    }),
  });

  const [unwatchTicket] = useBlockingMutation<
    { unwatchTicket: Ticket },
    MutationUnwatchTicketArgs
  >(MUTATE_UNWATCH_TICKET, {
    onError: onGraphQLError({
      title: "Could not remove ticket from your favorites",
    }),
    onCompleted: onMutationComplete({
      title: "Ticket removed from your favorites",
    }),
  });

  const className = cn(
    "border bg-white rounded-md overflow-hidden flex flex-row divide-x shadow-sm",
    props.className
  );

  const milestoneClassName = cn(
    "px-3 py-2 flex flex-1 flex-row items-center text-sm justify-center space-x-1",
    {
      "text-yellow-50 bg-gradient-to-br from-yellow-900 to-yellow-500 font-semibold":
        ticket.milestone,
      "bg-white text-gray-600 hover:text-gray-800 font-medium":
        !ticket.milestone,
    }
  );
  const milestoneIconClassName = cn("mr-1 h-5 w-5", {
    "text-yellow-100": ticket.milestone,
    "text-gray-300": !ticket.milestone,
  });

  const watchClassName = cn(
    "px-3 py-2 flex flex-1 flex-row items-center justify-center text-sm space-x-1",
    {
      "text-pink-50 bg-gradient-to-br from-pink-900 to-pink-500 font-semibold":
        ticket.isWatching,
      "bg-white text-gray-600 hover:text-gray-800 font-medium ":
        !ticket.isWatching,
    }
  );
  const watchIconClassName = cn("mr-1 h-5 w-5", {
    "text-pink-100": ticket.isWatching,
    "text-gray-300": !ticket.isWatching,
  });

  return (
    <div className={className}>
      <ConfirmModal
        title="Confirm Milestone Change"
        cta={
          ticket.milestone
            ? "Convert to Regular Ticket"
            : "Convert to Milestone"
        }
        description="Please confirm the milestone status change for this ticket"
        onClose={() => setConfirmVisible(false)}
        visible={isConfirmVisible}
        onConfirm={() =>
          updateTicket({
            variables: {
              ticketId: ticket.id,
              input: { milestone: !ticket.milestone },
            },
          })
        }
      />
      <div
        role="button"
        onClick={() => setConfirmVisible(true)}
        className={milestoneClassName}
      >
        <StarIcon className={milestoneIconClassName} />
        {ticket.milestone ? (
          <div className="tracking-wide">Milestone</div>
        ) : (
          <div className="tracking-wide">
            <span className="hidden lg:inline">Set as</span> Milestone
          </div>
        )}
      </div>
      <div
        role="button"
        onClick={() =>
          ticket.isWatching
            ? unwatchTicket({ variables: { ticketId: ticket.id } })
            : watchTicket({ variables: { ticketId: ticket.id } })
        }
        className={watchClassName}
      >
        {ticket.isWatching ? (
          <>
            <BookmarkIcon className={watchIconClassName} />
            <div>Favorited</div>
          </>
        ) : (
          <>
            <OutlineBookmarkIcon className={watchIconClassName} />
            <div>
              <span className="hidden lg:inline">Add to</span> Favorite
            </div>
          </>
        )}
      </div>
    </div>
  );
};

TicketMilestone.fragments = {
  TicketMilestoneFragment: gql`
    fragment TicketMilestoneFragment on Ticket {
      id
      milestone
      isWatching
    }
  `,
};

const MUTATE_UPDATE_TICKET = gql`
  mutation UpdateTicketMilestone($ticketId: Int!, $input: UpdateTicketInput!) {
    updateTicket(ticketId: $ticketId, input: $input) {
      id
      ...TicketMilestoneFragment
    }
  }
  ${TicketMilestone.fragments.TicketMilestoneFragment}
`;

const MUTATE_WATCH_TICKET = gql`
  mutation WatchTickdet($ticketId: Int!) {
    watchTicket(ticketId: $ticketId) {
      id
      ...TicketMilestoneFragment
    }
  }
  ${TicketMilestone.fragments.TicketMilestoneFragment}
`;

const MUTATE_UNWATCH_TICKET = gql`
  mutation UnwatchTickdet($ticketId: Int!) {
    unwatchTicket(ticketId: $ticketId) {
      id
      ...TicketMilestoneFragment
    }
  }
  ${TicketMilestone.fragments.TicketMilestoneFragment}
`;
