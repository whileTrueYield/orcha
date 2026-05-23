import React, { useState } from "react";
import { ListFilter, DateFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { CheckIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { Calendar } from "components/fields/Calendar";
import { format } from "date-fns";

interface Props<T extends ListFilter> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["dates"];
  label: string;
  className?: string;
  dateOnly?: boolean;
}

export function CalendarFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { className, filter, label, domain, onFilterChange, dateOnly } = props;

  const elt = filter.dates[domain as string];

  const [startDate, setStartDate] = useState<Date | null>(
    elt?.afterDate ? new Date(elt.afterDate) : null
  );

  const [stopDate, setStopDate] = useState<Date | null>(
    elt?.beforeDate ? new Date(elt.beforeDate) : null
  );

  const formatDate = (date: Date | null): string | undefined => {
    if (date) {
      return dateOnly ? format(date, "yyyy-MM-dd") : date.toISOString();
    }
  };

  const onAddFilter = () => {
    if (startDate || stopDate) {
      const filterElt: DateFilterElement = {
        afterDate: formatDate(startDate),
        beforeDate: formatDate(stopDate),
      };

      onFilterChange({
        ...filter,
        dates: {
          ...filter.dates,
          [domain]: filterElt,
        },
      });
    }
  };

  return (
    <div className={className}>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className=" my-1 flex w-full justify-between rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring">
              <div className="flex flex-row leading-5">
                {label}
                {elt ? (
                  <CheckIcon className="ml-2 h-5 w-5 rounded-full bg-brand-200 p-1 text-brand-900" />
                ) : null}
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <div className="flex flex-col sm:flex-row sm:space-x-2">
                <div>
                  <div className="py-2 text-center font-medium text-gray-500">
                    After Date
                  </div>
                  <Calendar
                    value={startDate}
                    onChange={setStartDate}
                    secondaryDate={stopDate}
                    showFooterButtons
                    className="p-4"
                    maxDate={stopDate}
                  />
                </div>
                <div>
                  <div className="py-2 text-center font-medium text-gray-500">
                    Before Date
                  </div>
                  <Calendar
                    value={stopDate}
                    onChange={setStopDate}
                    secondaryDate={startDate}
                    showFooterButtons
                    className="p-4"
                    minDate={startDate}
                  />
                </div>
              </div>
              <div className="mt-2 flex">
                <Button
                  btnSize="xsmall"
                  type="button"
                  btnType="primary"
                  className="flex-none"
                  block
                  disabled={!startDate && !stopDate}
                  onClick={onAddFilter}
                >
                  <PlusIcon className="mr-2 -ml-0.5 h-4 w-4 text-white" />
                  Add filter
                </Button>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
