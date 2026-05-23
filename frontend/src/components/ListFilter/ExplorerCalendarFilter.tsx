import React, { useState } from "react";
import { ListFilter, DateFilterElement } from "types/filter";
import { Popover } from "@headlessui/react";
import { Calendar } from "components/fields/Calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { isEqual } from "lodash";

interface Props<T extends ListFilter> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["dates"];
  className?: string;
}

export function ExplorerCalendarFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { className, filter, domain, onFilterChange } = props;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [stopDate, setStopDate] = useState<Date | null>(null);
  const [previousDomainValues, setPreviousDomainValues] =
    useState<DateFilterElement | null>(filter.dates[domain as string]);

  const newDomainValues = filter.dates[domain as string];
  if (!isEqual(newDomainValues, previousDomainValues)) {
    setPreviousDomainValues(newDomainValues);
    setStartDate(
      newDomainValues?.afterDate ? new Date(newDomainValues.afterDate) : null
    );
    setStopDate(
      newDomainValues?.beforeDate ? new Date(newDomainValues.beforeDate) : null
    );
  }

  const onAddFilter = (startDate: Date | null, stopDate: Date | null) => {
    const filterElt: DateFilterElement = {
      afterDate: startDate ? startDate.toISOString() : undefined,
      beforeDate: stopDate ? stopDate.toISOString() : undefined,
    };

    if (startDate || stopDate) {
      onFilterChange({
        ...filter,
        dates: {
          ...filter.dates,
          [domain]: filterElt,
        },
      });
    } else {
      onFilterChange({
        ...filter,
        dates: {
          ...filter.dates,
          [domain]: null,
        },
      });
    }
  };

  const renderDate = (date?: string) => {
    if (date) {
      return format(new Date(date), "PP");
    } else {
      return "--";
    }
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <Popover className="relative">
          <Popover.Button className="block w-full max-w-xs text-left">
            <div className="group relative flex flex-row items-center space-x-3 rounded-lg border border-gray-300 bg-white py-1 px-3">
              <CalendarIcon className="h-6 w-6 text-gray-300 group-hover:text-gray-400" />
              <div>
                <div className="-mb-0.5 text-xs font-medium tracking-wide text-gray-500">
                  after
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {renderDate(filter.dates[domain]?.afterDate)}
                </div>
              </div>
              <ChevronDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            </div>
          </Popover.Button>
          <Popover.Panel className="absolute z-10 mt-2">
            <div
              className="flex-1 rounded-md border bg-white p-4 shadow"
              ref={(elt) => {
                if (elt) {
                  elt.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                  });
                }
              }}
            >
              <Calendar
                value={startDate}
                onChange={(startDate) => {
                  onAddFilter(startDate, stopDate);
                }}
                secondaryDate={stopDate}
                showFooterButtons
                maxDate={stopDate}
              />
            </div>
          </Popover.Panel>
        </Popover>

        <Popover className="relative">
          <Popover.Button className="block w-full max-w-xs text-left">
            <div className="group  relative flex flex-row items-center space-x-3 rounded-lg border border-gray-300  bg-white py-1 px-3">
              <CalendarIcon className="h-6 w-6 text-gray-300 group-hover:text-gray-400" />
              <div>
                <div className="-mb-0.5 text-xs font-medium tracking-wide text-gray-500">
                  before
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {renderDate(filter.dates[domain]?.beforeDate)}
                </div>
              </div>
              <ChevronDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            </div>
          </Popover.Button>

          <Popover.Panel className="absolute z-10 mt-2">
            <div
              className="flex-1 rounded-md border bg-white p-4 shadow"
              ref={(elt) => {
                if (elt) {
                  elt.scrollIntoView({
                    block: "nearest",
                    behavior: "smooth",
                  });
                }
              }}
            >
              <Calendar
                value={stopDate}
                onChange={(stopDate) => {
                  onAddFilter(startDate, stopDate);
                }}
                secondaryDate={startDate}
                showFooterButtons
                minDate={startDate}
              />
            </div>
          </Popover.Panel>
        </Popover>
      </div>
    </div>
  );
}
