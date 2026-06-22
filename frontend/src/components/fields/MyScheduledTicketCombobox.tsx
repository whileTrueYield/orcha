import { useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
} from "@headlessui/react";
import { gql, useLazyQuery } from "@apollo/client";
import { QueryTicketsArgs, Ticket, TicketStatus } from "types/graphql";
import { SelectorIcon } from "@heroicons/react/solid";
import cn from "classnames";
import { useDebouncedState } from "hooks/useDebouncedState";
import { QueryReturnValue } from "types/queryTypes";
import { TicketIdTag } from "components/tags/TicketIdTag";

function classNames(...classes: Array<string | boolean>) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  value?: Ticket;
  onChange: (value: Ticket) => void;
  label?: string;
  labelClassname?: string;
  inputClassName?: string;
  className?: string;
  roleId: number;
}

export const MyScheduledTicketCombobox: React.FC<Props> = (props) => {
  const { value, onChange, label, labelClassname, roleId } = props;

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [getTickets, { loading }] = useLazyQuery<
    QueryReturnValue["ticketsForMyCalendar"],
    QueryTicketsArgs
  >(GET_TICKETS_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: ({ ticketsForMyCalendar }) => {
      setTickets(ticketsForMyCalendar);
    },
  });

  const [search, setSearch] = useDebouncedState("", 500, () => {
    getTickets({
      variables: {
        search,
        statuses: [
          TicketStatus.Scheduled,
          TicketStatus.Done,
          TicketStatus.Cancelled,
        ],
        assigneeIds: [roleId],
      },
    });
  });

  const inputClassName = cn(
    "w-full rounded-md border border-gray-300 bg-white py-2 pr-10 text-gray-600 shadow-sm focus:border-brand-500 focus:outline-none focus:ring focus:ring-brand-400 focus:ring-opacity-25 sm:text-sm",
    props.inputClassName,
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
            <ComboboxInput
              aria-label="Search and Select a ticket"
              className={inputClassName}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets... press &darr; to open"
              displayValue={(ticket?: Ticket | null) =>
                ticket ? ticket.title : ""
              }
              spellCheck={false}
              autoComplete="off"
            />

            <ComboboxButton
              aria-label="Open list of tickets"
              className="absolute inset-y-0 right-0 flex items-center px-2 focus:outline-none"
            >
              <SelectorIcon
                onClick={() =>
                  getTickets({
                    variables: {
                      statuses: [
                        TicketStatus.Scheduled,
                        TicketStatus.Done,
                        TicketStatus.Cancelled,
                      ],
                      assigneeIds: [roleId],
                    },
                  })
                }
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </ComboboxButton>

            <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                            : "text-gray-900",
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div
                            className={classNames(
                              "flex min-w-0 items-center justify-between space-x-1 truncate",
                              selected && "font-semibold",
                            )}
                          >
                            <div className="flex-1 truncate">
                              {ticket.title}
                            </div>
                            <TicketIdTag
                              className="shrink-0 text-xs"
                              localId={ticket.localId}
                              productCode={ticket.product?.code}
                            />
                          </div>
                        </>
                      )}
                    </Combobox.Option>
                  ))
                : renderNoMatch()}
            </ComboboxOptions>
          </div>
        </>
      )}
    </Combobox>
  );
};

export const GET_TICKETS_QUERY = gql`
  query GetTicketsForMyScheduledTicketCombo($search: String) {
    ticketsForMyCalendar(search: $search) {
      id
      title
      localId
      status
      stage
      product {
        id
        code
      }
    }
  }
`;
