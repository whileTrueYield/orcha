import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { RoleSelect } from "components/fields/RoleSelect";
import { uniqBy } from "lodash";
import { MiniRole } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
  label: string;
  domain: keyof T["recordSets"];
}

export function RoleFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, domain, label, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (role: MiniRole | null) => {
    if (role) {
      const filterElt: RecordFilterElement = {
        id: role.id,
        label: role.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          [domain]: uniqBy(
            [...filter.recordSets[domain as string], filterElt],
            "id"
          ),
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
                {label}
                <ShowCount arr={filter.recordSets[domain as string]} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <RoleSelect
                tabIndex={1}
                onChange={(role) => onAddFilter(role)}
                placeholder={`Filter by ${label.toLowerCase()}...`}
                includeMe
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
