import React from "react";
import { gql } from "@apollo/client";
import { Ticket, MutationUpdateTicketArgs } from "types/graphql";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { FCWithFragments } from "types";
import { map } from "lodash";
import { StarRating } from "components/deprecated/StarRating";
import { useBlockingMutation } from "utils/graphql";

interface TicketRatingProps {
  difficulty?: number | null;
  ticketId: number;
  description?: string;
  className?: string;
  readOnly?: boolean;
}

interface Difficulty {
  value: number;
  label: string;
  className: string;
}

const difficulties: Difficulty[] = [
  {
    value: 1,
    label: "Very Simple - 1pt",
    className: "text-green-400",
  },
  {
    value: 2,
    label: "Simple - 2pts",
    className: "text-blue-400",
  },
  {
    value: 3,
    label: "Medium - 3pts",
    className: "text-yellow-300",
  },
  {
    value: 5,
    label: "Complex - 5pts",
    className: "text-orange-500",
  },
  {
    value: 8,
    label: "Very Complex - 8pts",
    className: "text-red-600",
  },
  {
    value: 13,
    label: "Sooo Insane - 13pts",
    className: "text-red-800",
  },
];
export const TicketRating: FCWithFragments<TicketRatingProps> = (props) => {
  const { difficulty, description, className, ticketId, readOnly } = props;
  const [updateTicket] = useBlockingMutation<
    { updateTicket: Ticket },
    MutationUpdateTicketArgs
  >(MUTATE_UPDATE_TICKET, {
    onError: onGraphQLError({ title: "Could not update ticket" }),
    onCompleted: onMutationComplete({
      title: "Ticket Updated",
    }),
  });

  // On save we format markdown using prettier
  const onChange = (difficulty: number) => {
    updateTicket({
      variables: {
        input: { difficulty },
        ticketId,
      },
    });
  };

  const renderDescription = () => {
    if (description) {
      return <div className="text-sm text-gray-500">{description}</div>;
    }

    return null;
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-between text-lg text-gray-700 lg:flex-row">
        <label htmlFor="rating-difficulty" className="text-lg text-gray-700">
          Complexity
        </label>
        <select
          className="mt-1 flex-grow rounded border-0 bg-gray-200 py-0.5 text-sm focus:outline-none focus:ring focus:ring-brand-300 lg:mt-0 lg:flex-none"
          onChange={(event) => onChange(parseInt(event.target.value, 10))}
          id={`rating-difficulty`}
          value={difficulty || 0}
          style={{ backgroundSize: "1rem" }}
          disabled={readOnly}
        >
          <option value={0}>Unrated</option>
          {map(difficulties, (difficulty) => (
            <option key={difficulty.value} value={difficulty.value}>
              {difficulty.label}
            </option>
          ))}
        </select>
      </div>
      <StarRating
        onChange={onChange}
        options={difficulties}
        value={difficulty}
        className="hidden lg:flex"
        readOnly={readOnly}
      />
      {renderDescription()}
    </div>
  );
};

TicketRating.fragments = {
  TicketRatingFragment: gql`
    fragment TicketRatingFragment on Ticket {
      id
      difficulty
    }
  `,
};

const MUTATE_UPDATE_TICKET = gql`
  mutation UpdateTicketRating($input: UpdateTicketInput!, $ticketId: Int!) {
    updateTicket(input: $input, ticketId: $ticketId) {
      ...TicketRatingFragment
    }
  }
  ${TicketRating.fragments.TicketRatingFragment}
`;
