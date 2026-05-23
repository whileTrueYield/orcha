import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { WorkflowSelect } from "components/fields/WorkflowSelect";
import { uniqBy } from "lodash";
import { MiniWorkflow } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function WorkflowFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (workflow?: MiniWorkflow) => {
    if (workflow) {
      const filterElt: RecordFilterElement = {
        id: workflow.id,
        label: workflow.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          workflows: uniqBy([...filter.recordSets.workflows, filterElt], "id"),
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
                Workflow
                <ShowCount arr={filter.recordSets.workflows} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <WorkflowSelect
                tabIndex={1}
                onChange={(workflow) => onAddFilter(workflow)}
                placeholder="Filter by workflow..."
              />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
