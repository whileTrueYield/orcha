import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { FeatureSelect } from "components/fields/FeatureSelect";
import { uniqBy } from "lodash";
import { MiniFeature } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function FeatureFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (feature?: MiniFeature) => {
    if (feature) {
      const filterElt: RecordFilterElement = {
        id: feature.id,
        label: `${feature.featureGroupName} / ${feature.name}`,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          features: uniqBy([...filter.recordSets.features, filterElt], "id"),
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
                Feature
                <ShowCount arr={filter.recordSets.features} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <FeatureSelect
                tabIndex={1}
                onChange={(feature) => onAddFilter(feature)}
                placeholder="Filter by feature..."
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
