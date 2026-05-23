import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { uniqBy } from "lodash";
import { Tag } from "types/graphql";
import { TagSelect } from "components/fields/TagSelect";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function TagFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (tag?: Tag) => {
    if (tag) {
      const filterElt: RecordFilterElement = {
        id: tag.id,
        label: tag.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          tags: uniqBy([...filter.recordSets.tags, filterElt], "id"),
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
                Tag
                <ShowCount arr={filter.recordSets.tags} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <TagSelect
                tabIndex={1}
                onChange={(tag) => onAddFilter(tag)}
                placeholder="Filter by tag..."
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
