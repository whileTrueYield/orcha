import React from "react";
import cn from "classnames";
import { ListFilter, RecordFilterElement } from "types/filter";
import { uniqBy } from "lodash";
import { ProjectSelect } from "components/fields/ProjectSelect";
import { Disclosure } from "@headlessui/react";
import { ShowCount } from "./ShowCount";
import { ChevronRightIcon } from "@heroicons/react/outline";
import { MiniProject } from "types/graphql";

interface Props<T extends ListFilter> extends React.HTMLProps<HTMLDivElement> {
  onFilterChange: (filter: T) => void;
  filter: T;
}

export function ProjectFilter<T extends ListFilter>(
  props: React.PropsWithChildren<Props<T>>
) {
  const { onFilterChange, filter, ...divProps } = props;

  divProps.className = cn(divProps.className);

  const onAddFilter = (project?: MiniProject) => {
    if (project) {
      const filterElt: RecordFilterElement = {
        id: project.id,
        label: project.name,
      };

      onFilterChange({
        ...filter,
        recordSets: {
          ...filter.recordSets,
          projects: uniqBy([...filter.recordSets.projects, filterElt], "id"),
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
                Project
                <ShowCount arr={filter.valueSets.paths} />
              </div>

              <ChevronRightIcon
                className={`${
                  open ? "rotate-90 transform " : ""
                } h-5 w-5 text-gray-400 transition-transform duration-150`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="flex-1 rounded-md bg-gray-100 p-2">
              <ProjectSelect onChange={(project) => onAddFilter(project)} />
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  );
}
