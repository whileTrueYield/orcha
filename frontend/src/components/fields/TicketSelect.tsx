import React, { useMemo, useState } from "react";
import { gql, OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { ModelStage, Ticket } from "types/graphql";
import { ObjectSelect } from "components/fields/ObjectSelect";
import { get } from "lodash";
import { ObjectSelectSearch } from "components/fields/ObjectSelectSearch";
import { QueryReturnValue } from "types/queryTypes";

const GET_TICKETS = gql`
  query GetTicketsForTicketSelect(
    $first: Int!
    $search: String
    $offset: Int
    $stages: [ModelStage!]
    $unfinished: Boolean
  ) {
    tickets(
      first: $first
      search: $search
      offset: $offset
      stages: $stages
      unfinished: $unfinished
    ) {
      totalCount
      pageInfo {
        pageNumber
        hasNextPage
        hasPreviousPage
        pageSize
      }
      nodes {
        id
        localId
        title
        status
        product {
          id
          code
        }
      }
    }
  }
`;

interface Props {
  value?: Ticket | null;
  onChange: (ticket?: Ticket) => void;
  label?: string;
  tabIndex?: number;
  placeholder?: string;
  scheduledOnly?: boolean;
  unfinished?: boolean;
}

export const TicketSelect: React.FC<Props> = (props) => {
  const { scheduledOnly, unfinished } = props;
  const [filter, setFilter] = useState("");

  const queryVariables = useMemo((): OperationVariables => {
    if (scheduledOnly) {
      return {
        first: 20,
        search: filter,
        offset: 0,
        stages: [ModelStage.Published],
      };
    } else if (unfinished) {
      return {
        first: 20,
        search: filter,
        offset: 0,
        unfinished: true,
      };
    }

    return {
      first: 20,
      search: filter,
      offset: 0,
    };
  }, [scheduledOnly, unfinished, filter]);

  const { data, error } = useQuery<QueryReturnValue["tickets"]>(GET_TICKETS, {
    variables: queryVariables,
  });

  if (error) {
    return null;
  }

  const tickets = get(data, "tickets.nodes", []);
  const ticketCount = get(data, "tickets.totalCount", 0);

  const searchHeader = () => {
    if (filter || ticketCount > 4) {
      return <ObjectSelectSearch onChange={setFilter} />;
    }
  };

  const renderOption = (ticket?: Ticket) => {
    if (ticket) {
      return (
        <div className="flex min-w-0 flex-1 flex-row">
          <div className="flex-1 truncate">{ticket.title}</div>
          <div className="shrink-0">
            <span className="ml-0.5 flex-none rounded bg-brand-100 py-0.5 px-2 font-sans text-xs font-medium text-brand-800 group-hover:bg-brand-300 group-hover:text-brand-900">
              {ticket.product?.code || "n/a"}
              <span className="ml-0.5 font-semibold text-brand-900">
                {ticket.localId}
              </span>
            </span>
          </div>
        </div>
      );
    }

    return "";
  };

  return (
    <ObjectSelect<Ticket>
      tabIndex={props.tabIndex}
      label={props.label}
      header={searchHeader()}
      items={tickets}
      value={props.value}
      onChange={props.onChange}
      identityMethod={(ticket) => (ticket ? ticket.id : null)}
      renderOptionLabel={renderOption}
      placeholder={props.placeholder}
    />
  );
};
