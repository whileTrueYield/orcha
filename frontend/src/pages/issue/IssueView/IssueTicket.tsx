import { useState } from "react";
import { gql } from "@apollo/client";
import { TicketSelect } from "components/fields/TicketSelect";
import { FCWithFragments } from "types";
import { MutationUpdateIssueArgs, Issue, Ticket } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { ChevronDownIcon, LinkIcon, PlusIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { PopMenu, PopMenuOption } from "components/modals/PopMenu";
import { Menu } from "@headlessui/react";
import { TicketCreateModal } from "pages/ticket/TicketCreate/TicketCreateModal";
import { useAppDispatch } from "store";
import { showTicketEditModal } from "actions";
import { TicketCard } from "pages/ticket/TicketCard/TicketCard";

interface Props {
  issue: Issue;
  className?: string;
}

export const IssueTicket: FCWithFragments<Props> = (props) => {
  const { issue } = props;
  const dispatch = useAppDispatch();
  const [showSelect, setShowSelect] = useState(false);
  const [createTicketModalVisibility, setCreateTicketModalVisibility] =
    useState(false);

  const setTicket = (ticketId?: number | null) => {
    if (ticketId) {
      updateIssue({
        variables: {
          issueId: issue.id,
          input: {
            ticketId: ticketId,
          },
        },
      });
    } else {
      updateIssue({
        variables: {
          issueId: issue.id,
          input: {
            ticketId: null,
          },
        },
      });
    }
  };

  const renderTicket = (ticket: Ticket) => {
    return (
      <TicketCard
        ticket={ticket}
        role="button"
        onClick={() => dispatch(showTicketEditModal(ticket.id))}
        className="hover:bg-gray-50"
        onDelete={() => setTicket(null)}
      />
    );
  };

  const [updateIssue] = useBlockingMutation<
    { updateIssue: Issue },
    MutationUpdateIssueArgs
  >(MUTATE_UPDATE_ISSUE, {
    onError: onGraphQLError({ title: "Could not set issue lead" }),
    onCompleted: onMutationComplete({
      title: "Issue Lead Updated",
    }),
  });

  const menuOptions: PopMenuOption[] = [
    {
      label: "Select existing ticket",
      onClick: () => setShowSelect(true),
      type: "button",
      icon: (className) => <LinkIcon className={className} />,
    },
  ];

  if (issue.ticket) {
    return (
      <div className={props.className}>
        <div className="text-lg text-gray-700">Ticket</div>
        {renderTicket(issue.ticket)}
      </div>
    );
  }

  if (showSelect) {
    return (
      <div className={props.className}>
        <div className="flex items-baseline justify-between">
          <span className="text-lg text-gray-700">Ticket</span>
          <button
            type="button"
            className="text-sm text-gray-700 underline hover:no-underline"
            onClick={() => setShowSelect(false)}
          >
            Cancel
          </button>
        </div>
        <TicketSelect
          onChange={(ticket) => setTicket(ticket ? ticket.id : null)}
          placeholder="Select Ticket..."
        />
      </div>
    );
  } else {
    return (
      <div className={props.className}>
        <TicketCreateModal
          visible={createTicketModalVisibility}
          onClose={() => setCreateTicketModalVisibility(false)}
          defaultProductId={issue.product.id}
          defaultDescription={issue.description}
          onCreate={(ticketId: number) => {
            setCreateTicketModalVisibility(false);
            setTicket(ticketId);
          }}
        />
        <div className="text-lg text-gray-700">Ticket</div>
        <div className="mt-6 flex flex-row sm:mt-0">
          <Button
            fullInMobile
            type="button"
            btnType="white"
            onClick={() => setCreateTicketModalVisibility(true)}
            btnGroup="start"
            block
          >
            <PlusIcon className="mr-1 -ml-1 h-5 w-5 text-green-50" />
            Create Ticket
          </Button>
          <PopMenu options={menuOptions} direction="bottom-left" size="large">
            <Button
              type="button"
              btnType="white"
              btnGroup="end"
              asElement={(className) => (
                <Menu.Button className={className}>
                  <ChevronDownIcon className="-mx-2 h-6 w-6 sm:h-5 sm:w-5" />
                </Menu.Button>
              )}
            ></Button>
          </PopMenu>
        </div>
      </div>
    );
  }
};

IssueTicket.fragments = {
  IssueTicketFragment: gql`
    fragment IssueTicketFragment on Issue {
      id
      ticket {
        id
        localId
        title
        status
        stage
        product {
          id
          code
        }
        ...TicketCardFragment
      }
      product {
        id
        name
        stage
      }
    }
    ${TicketCard.fragments.TicketCardFragment}
  `,
};

const MUTATE_UPDATE_ISSUE = gql`
  mutation UpdateIssueTicket($input: UpdateIssueInput!, $issueId: Int!) {
    updateIssue(input: $input, issueId: $issueId) {
      ...IssueTicketFragment
    }
  }
  ${IssueTicket.fragments.IssueTicketFragment}
`;
