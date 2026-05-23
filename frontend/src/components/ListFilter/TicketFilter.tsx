import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { uniqBy } from "lodash";
import { Ticket } from "types/graphql";
import { TicketSelect } from "components/fields/TicketSelect";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
  unfinished?: boolean;
}

export function TicketFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, unfinished, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (ticket?: Ticket) => {
    if (ticket) {
      const filterElt: RecordFilterElement = {
        id: ticket.id,
        label: ticket.title,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          tickets: uniqBy([...filter.recordSets.tickets, filterElt], "id"),
        },
      });
    }
  };

  return (
    <div {...divProps}>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className=" my-1 flex w-full justify-between rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring">
              <div className="leading-5">
                Ticket
                <ShowCount arr={filter.recordSets.tickets} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <TicketSelect
                tabIndex={1}
                onChange={(ticket) => onAddFilter(ticket)}
                placeholder="Filter by ticket..."
                unfinished={unfinished}
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
