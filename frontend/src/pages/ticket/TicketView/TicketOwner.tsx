import React from "react";
import { gql } from "@apollo/client";
import { Avatar } from "components/views/Avatar";
import { RoleSelect } from "components/fields/RoleSelect";
import { FCWithFragments } from "types";
import {
  MutationUpdateTicketArgs,
  MiniRole,
  Ticket,
  Role,
} from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { XIcon } from "@heroicons/react/outline";
import { useBlockingMutation } from "utils/graphql";

interface TicketOwnerProps {
  ticket: Ticket;
  className?: string;
}

export const TicketOwner: FCWithFragments<TicketOwnerProps> = (props) => {
  const { ticket } = props;

  const clearOwner = () => {
    updateTicket({
      variables: {
        ticketId: ticket.id,
        input: {
          ownerId: null,
        },
      },
    });
  };

  const setOwner = (role: MiniRole | null) => {
    if (role) {
      updateTicket({
        variables: {
          ticketId: ticket.id,
          input: {
            ownerId: role.id,
          },
        },
      });
    }
  };

  const [updateTicket] = useBlockingMutation<
    { updateTicket: Ticket },
    MutationUpdateTicketArgs
  >(MUTATE_UPDATE_PROJECT, {
    onError: onGraphQLError({ title: "Could not set ticket lead" }),
    onCompleted: onMutationComplete({
      title: "Ticket Lead Updated",
    }),
  });

  const renderOwner = (owner: Role) => (
    <div
      key={owner.id}
      className="group my-1 flex flex-row items-center rounded-lg py-1 pr-2 pl-1 text-gray-700 transition duration-100 hover:bg-gray-200"
    >
      <Avatar
        src={owner.avatarUrl}
        className="flex-0 mr-2 h-10 w-10 rounded-md border-2 border-white bg-gray-200 shadow"
        name={owner.name}
      />
      <span className="block flex-1 truncate">{owner.name}</span>
      <button
        type="button"
        className="flex-0 inline-block rounded p-1 leading-4 text-gray-700 opacity-0 transition duration-100 hover:bg-gray-300 focus:outline-none focus:ring group-hover:opacity-100"
        onClick={() => clearOwner()}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );

  if (ticket.owner) {
    return (
      <div className={props.className}>
        <div className="text-lg text-gray-700">Owner</div>
        {renderOwner(ticket.owner)}
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className="text-lg text-gray-700">Owner</div>
      <RoleSelect onChange={setOwner} className="mt-1" includeMe />
    </div>
  );
};

TicketOwner.fragments = {
  TicketOwnerFragment: gql`
    fragment TicketOwnerFragment on Ticket {
      id
      owner {
        id
        type
        name
        avatarUrl
      }
    }
  `,
};

const MUTATE_UPDATE_PROJECT = gql`
  mutation UpdateTicketOwner($input: UpdateTicketInput!, $ticketId: Int!) {
    updateTicket(input: $input, ticketId: $ticketId) {
      ...TicketOwnerFragment
    }
  }
  ${TicketOwner.fragments.TicketOwnerFragment}
`;
