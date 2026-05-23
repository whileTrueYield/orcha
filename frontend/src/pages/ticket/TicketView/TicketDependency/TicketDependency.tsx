import { useState } from "react";
import { gql } from "@apollo/client";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationAddTicketAncestorArgs,
  MutationRemoveTicketAncestorArgs,
  Ticket,
  TicketStatus,
} from "types/graphql";
import cn from "classnames";
import { GroupTag } from "components/tags/GroupTag";
import { useHistory, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { TicketSelect } from "components/fields/TicketSelect";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { reject, truncate } from "lodash";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { HoverTooltip } from "components/help/Tooltip";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";

interface Props {
  ticket: Ticket;
  className?: string;
}

export const TicketDependency: FCWithFragments<Props> = (props) => {
  const { ticket } = props;
  const [dependencyToDelete, setDependencyToDelete] = useState<
    null | [Ticket, Ticket]
  >(null);
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  const [addTicketAncestor] = useBlockingMutation<
    { addTicketAncestor: Ticket },
    MutationAddTicketAncestorArgs
  >(ADD_TICKET_ANCESTOR_MUTATION, {
    onError: onGraphQLError({ title: "Could not add ticket" }),
    onCompleted: onMutationComplete({
      title: "Dependency Added",
    }),
  });

  const [removeTicketAncestor] = useBlockingMutation<
    { removeTicketAncestor: Ticket },
    MutationRemoveTicketAncestorArgs
  >(REMOVE_TICKET_ANCESTOR_MUTATION, {
    onError: onGraphQLError({ title: "Could not remove ticket" }),
    onCompleted: onMutationComplete({
      title: "Dependency Removed",
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      const ancestorId = data.removeTicketAncestor.id;

      // when we delete a successor, we receive the successor
      // which forces us to manually update the cache of the
      // current ticket
      if (ancestorId !== ticket.id) {
        cache.updateFragment(
          {
            id: "Ticket:" + ticket.id,
            fragment: TicketDependency.fragments.TicketDependencyDetails,
            fragmentName: "TicketDependencyDetails",
          },
          (data) => {
            return {
              ...data,
              successors: reject(data.successors, { id: ancestorId }),
            };
          }
        );
      }
    },
  });

  const onAddTicketAncestor = (ticket?: Ticket, ancestor?: Ticket) => {
    if (ancestor && ticket) {
      addTicketAncestor({
        variables: { ticketId: ticket.id, ancestorId: ancestor.id },
      });
    }
  };

  const onRemoveTicketAncestor = (ticket?: Ticket, ancestor?: Ticket) => {
    if (ancestor && ticket) {
      removeTicketAncestor({
        variables: { ticketId: ticket.id, ancestorId: ancestor.id },
      });
    }
  };

  const renderTicket = (isAncestor: boolean) => (depTicket: Ticket) => {
    const isDraft = depTicket.stage === ModelStage.Draft;
    const isCancelled = !isDraft && depTicket.status === TicketStatus.Cancelled;
    const isDone = !isDraft && depTicket.status === TicketStatus.Done;
    const isScheduled = !isDraft && depTicket.status === TicketStatus.Scheduled;
    const isUnscheduled =
      isDraft || depTicket.status === TicketStatus.Unscheduled;

    const bgColor = cn("truncate", {
      "bg-orange-200 text-orange-800": isCancelled,
      "bg-green-200 text-green-800": isDone,
      "bg-brand-200 text-brand-800": isScheduled,
      "bg-gray-200 text-gray-800": isUnscheduled,
    });

    const groupBgColor = cn("text-white", {
      "bg-orange-700": isCancelled,
      "bg-green-700": isDone,
      "bg-brand-700": isScheduled,
      "bg-gray-700": isUnscheduled,
    });

    const actionBgColor = cn("text-white", {
      "bg-orange-700 hover:bg-orange-800": isCancelled,
      "bg-green-700 hover:bg-green-800": isDone,
      "bg-brand-700 hover:bg-brand-800": isScheduled,
      "bg-gray-700 hover:bg-gray-800": isUnscheduled,
    });

    let icon = null;
    let status = "N/A";
    if (isDraft) {
      icon = <PencilIcon className="mr-1 h-4 w-4 text-gray-100" />;
      status = "Draft";
    } else {
      if (isCancelled) {
        icon = <XCircleIcon className="mr-1 h-4 w-4 text-orange-100" />;
        status = "Cancelled";
      } else if (isDone) {
        icon = <CheckCircleIcon className="mr-1 h-4 w-4 text-green-100" />;
        status = "Done";
      } else if (isScheduled) {
        icon = <CalendarIcon className="mr-1 h-4 w-4 text-brand-100" />;
        status = "Scheduled";
      } else if (isUnscheduled) {
        icon = <ClockIcon className="mr-1 h-4 w-4 text-gray-100" />;
        status = "Unscheduled";
      }
    }

    return (
      <HoverTooltip
        backgroundColor="bg-gray-400/30 backdrop-blur"
        key={depTicket.id}
        tooltip={<TicketCard fullTitle ticket={depTicket} />}
      >
        <GroupTag
          label={truncate(depTicket.title, { length: 40 })}
          groupLabel={
            depTicket.product ? (
              <span title={status} className="flex flex-row items-center">
                {icon}
                {depTicket.product.code} {depTicket.localId}
              </span>
            ) : (
              `N/A`
            )
          }
          onDelete={() =>
            isAncestor
              ? setDependencyToDelete([ticket, depTicket])
              : setDependencyToDelete([depTicket, ticket])
          }
          onClick={() =>
            history.push(urlResolver.ticket.view(orgId, depTicket.id))
          }
          className="mr-2 mt-2"
          bgColor={bgColor}
          groupBgColor={groupBgColor}
          actionBgColor={actionBgColor}
          large
        />
      </HoverTooltip>
    );
  };

  const className = cn(
    "mx-4 sm:mx-0 grid grid-cols-2 space-y-4 space-x-0 lg:space-x-4 lg:space-y-0",
    props.className
  );

  return (
    <div className={className}>
      <WarningConfirm
        title="Delete Dependency?"
        description="Please confirm you want to delete this dependency. Once deleted, your schedule will be rebuild to reflect this change."
        onClose={() => setDependencyToDelete(null)}
        cta="Delete Dependency"
        onConfirm={() =>
          dependencyToDelete && onRemoveTicketAncestor(...dependencyToDelete)
        }
        visible={!!dependencyToDelete}
      />

      <div className="col-span-2 space-y-1 lg:col-span-1">
        <div className="text-sm font-medium text-gray-800">
          Before the ticket
        </div>
        <TicketSelect
          tabIndex={1}
          onChange={(ancestor) => onAddTicketAncestor(ticket, ancestor)}
          placeholder="Add an ancestor..."
          scheduledOnly
        />
        <div className="min-h-[44px] w-full overflow-auto rounded-md border border-gray-300 bg-white p-2 pt-0 shadow-sm">
          {ticket.ancestors.map(renderTicket(true))}
        </div>
      </div>
      <div className="col-span-2 space-y-1 lg:col-span-1">
        <div className="text-sm font-medium text-gray-800">
          After the ticket
        </div>
        <TicketSelect
          tabIndex={1}
          onChange={(successor) => onAddTicketAncestor(successor, ticket)}
          placeholder="Add a successor..."
          scheduledOnly
        />
        <div className="min-h-[44px] w-full overflow-auto rounded-md border border-gray-300 bg-white p-2 pt-0 shadow-sm">
          {ticket.successors.map(renderTicket(false))}
        </div>
      </div>
    </div>
  );
};

TicketDependency.fragments = {
  TicketDependencyDetails: gql`
    fragment TicketDependencyDetails on Ticket {
      id
      ancestors {
        id
        stage
        status
        localId
        title
        product {
          id
          code
        }
        ...TicketCardFragment
      }
      successors {
        id
        stage
        status
        localId
        title
        product {
          id
          code
        }
        ...TicketCardFragment
      }
    }
    ${TicketCard.fragments.TicketCardFragment}
  `,
};

const ADD_TICKET_ANCESTOR_MUTATION = gql`
  mutation AddTicketAncestor($ticketId: Int!, $ancestorId: Int!) {
    addTicketAncestor(ticketId: $ticketId, ancestorId: $ancestorId) {
      id
      ...TicketDependencyDetails
      ancestors {
        id
        ...TicketDependencyDetails
      }
    }
  }
  ${TicketDependency.fragments.TicketDependencyDetails}
`;

const REMOVE_TICKET_ANCESTOR_MUTATION = gql`
  mutation RemoveTicketAncestor($ticketId: Int!, $ancestorId: Int!) {
    removeTicketAncestor(ticketId: $ticketId, ancestorId: $ancestorId) {
      id
      ...TicketDependencyDetails
      successors {
        id
        ...TicketDependencyDetails
      }
    }
  }
  ${TicketDependency.fragments.TicketDependencyDetails}
`;
