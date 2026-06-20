import { useState } from "react";
import { Combobox } from "@headlessui/react";
import { gql, useLazyQuery } from "@apollo/client";
import { ModelStage, QueryTicketsArgs, Ticket } from "types/graphql";
import { SelectorIcon } from "@heroicons/react/solid";
import cn from "classnames";
import { useDebouncedState } from "hooks/useDebouncedState";
import { QueryReturnValue } from "types/queryTypes";

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  value?: Ticket;
  onChange: (value: Ticket) => void;
  label?: string;
  labelClassname?: string;
  inputClassName?: string;
  projectId: number;
  className?: string;
}

export const TicketCombobox: React.FC<Props> = (props) => {
  const { value, onChange, label, labelClassname, projectId } = props;

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [getTickets, { loading }] = useLazyQuery<
    QueryReturnValue["tickets"],
    QueryTicketsArgs
  >(GET_TICKETS_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ tickets }) => {
      setTickets(tickets.nodes);
    },
  });

  const [search, setSearch] = useDebouncedState("", 500, () => {
    getTickets({ variables: { search, projectId, recursive: true } });
  });

  const inputClassName = cn(
    "w-full rounded-md border border-gray-300 bg-white py-2 pr-10 text-gray-600 shadow-sm focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm",
    props.inputClassName
  );

  const className = cn("relative", props.className);

  const renderNoMatch = () => {
    return (
      <div className="flex h-12 items-center justify-center text-gray-400">
        {loading ? "Loading..." : "No Matching ticket found :("}
      </div>
    );
  };

  return (
    <Combobox value={value} onChange={(ticket) => ticket && onChange(ticket)}>
      {({ open }) => (
        <>
          {label ? (
            <Combobox.Label
              className={
                labelClassname || "mb-1 text-sm font-medium text-gray-700"
              }
            >
              {label}
            </Combobox.Label>
          ) : null}

          <div className={`${className} ${open && "z-30"}`}>
            <Combobox.Input
              aria-label="Search and Select a ticket"
              className={inputClassName}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets... press &darr; to open"
              displayValue={(ticket?: Ticket | null) =>
                ticket ? ticket.title : ""
              }
              spellCheck={false}
            />

            <Combobox.Button
              aria-label="Open list of tickets"
              className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
            >
              <SelectorIcon
                onClick={() => getTickets({ variables: { projectId } })}
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>

            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {tickets.length
                ? tickets.map((ticket, index) => (
                    <Combobox.Option
                      key={index}
                      value={ticket}
                      className={({ focus }) =>
                        classNames(
                          "relative cursor-default select-none py-2 px-3",
                          focus
                            ? "bg-brand-600 text-white focus:ring-opacity-25"
                            : "text-gray-900"
                        )
                      }
                    >
                      {({ focus, selected }) => (
                        <>
                          <div
                            className={classNames(
                              "flex min-w-0 justify-between truncate",
                              selected && "font-semibold"
                            )}
                          >
                            <div className="flex-1 truncate">
                              {ticket.title}
                            </div>
                            <div
                              className={classNames(
                                "shrink-0 rounded py-0.5 px-2 text-xs font-medium",
                                focus
                                  ? "bg-brand-700 text-brand-50"
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {ticket.stage === ModelStage.Published
                                ? ticket.status
                                : ticket.stage}
                            </div>
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))
                : renderNoMatch()}
            </Combobox.Options>
          </div>
        </>
      )}
    </Combobox>
  );
};

export const GET_TICKETS_QUERY = gql`
  query GetTicketsForCombo(
    $search: String
    $projectId: Int
    $recursive: Boolean
  ) {
    tickets(
      first: 20
      search: $search
      projectId: $projectId
      recursive: $recursive
    ) {
      nodes {
        id
        title
        localId
        status
        stage
      }
    }
  }
`;
