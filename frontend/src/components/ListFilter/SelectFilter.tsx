import React from "react";
import { ListFilter, ValueFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { uniqBy } from "lodash";
import { ObjectSelect } from "components/fields/ObjectSelect";

interface Props<T extends ListFilter> {
  onFilterChange: (filter: T) => void;
  filter: T;
  domain: keyof T["valueSets"];
  label: string;
  options: ValueFilterElement[];
  className?: string;
  placeholder?: string;
}

export function SelectFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const {
    className,
    filter,
    label,
    domain,
    onFilterChange,
    options,
    placeholder,
  } = props;

  const onAddFilter = (value?: ValueFilterElement) => {
    if (value) {
      const filterElt: ValueFilterElement = {
        value: value.value,
        label: value.label,
      };

      onFilterChange({
        ...filter,
        valueSets: {
          ...filter.valueSets,
          [domain]: uniqBy(
            [...filter.valueSets[domain as string], filterElt],
            "value"
          ),
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
              <div className="leading-5">
                {label}
                <ShowCount arr={filter.valueSets[domain as string]} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <ObjectSelect<ValueFilterElement>
                name={`select-${domain.toString()}`}
                renderOptionLabel={(element) => (element ? element.label : "")}
                onChange={(value) => onAddFilter(value)}
                items={options}
                placeholder={placeholder}
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
