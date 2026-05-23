import React from "react";
import { RecordFilterAsTag } from "components/ListFilter/RecordFilterTag";
import { ReportQueryListFilter } from "types";
import { Popover } from "@headlessui/react";
import { WorkflowFilter } from "components/ListFilter/WorkflowFilter";
import { TagFilter } from "components/ListFilter/TagFilter";
import { ProductFilter } from "components/ListFilter/ProductFilter";
import { PlusIcon } from "@heroicons/react/solid";
import { cloneDeep } from "lodash";
import { ProjectFilter } from "components/ListFilter/ProjectFilter";
import { ValueFilterAsTag } from "components/ListFilter/ValueFilterTag";
import { TicketFilter } from "components/ListFilter/TicketFilter";

interface Props {
  filter: ReportQueryListFilter;
  onChange: (filter: ReportQueryListFilter) => void;
  tabIndex?: number;
}

export const ReportQueryInput: React.FC<Props> = (props) => {
  const { filter } = props;

  const onFilterChange = (filter: ReportQueryListFilter) => {
    props.onChange(cloneDeep(filter));
  };

  return (
    <div>
      <div className="rounded-md border bg-white px-2 pb-2">
        <RecordFilterAsTag<ReportQueryListFilter>
          filter={filter}
          onChange={onFilterChange}
          domain="products"
          label="Product"
        />
        <RecordFilterAsTag<ReportQueryListFilter>
          filter={filter}
          onChange={onFilterChange}
          domain="workflows"
          label="Workflow"
        />
        <RecordFilterAsTag<ReportQueryListFilter>
          filter={filter}
          onChange={onFilterChange}
          domain="tickets"
          label="Tickets"
        />
        <RecordFilterAsTag<ReportQueryListFilter>
          filter={filter}
          onChange={onFilterChange}
          domain="tags"
          label="Tag"
        />
        <ValueFilterAsTag<ReportQueryListFilter>
          filter={filter}
          onChange={onFilterChange}
          domain="paths"
          label="Path"
        />

        <Popover className="relative inline-flex align-bottom">
          <Popover.Button
            id="add-filter"
            tabIndex={props.tabIndex}
            className="border-1 group mt-2 flex flex-row items-center rounded-md border-dashed bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-600 transition-colors hover:border-solid hover:bg-gray-700 hover:text-gray-100"
          >
            <PlusIcon className="mr-1 h-4 w-4 text-gray-500 group-hover:text-gray-200" />
            Add filter
          </Popover.Button>

          <Popover.Panel className="absolute z-10 mt-6">
            <div className="mt-1 min-w-[18rem] rounded-lg bg-white p-2 shadow-lg">
              <WorkflowFilter filter={filter} onFilterChange={onFilterChange} />
              <TagFilter filter={filter} onFilterChange={onFilterChange} />
              <ProductFilter filter={filter} onFilterChange={onFilterChange} />
              <TicketFilter filter={filter} onFilterChange={onFilterChange} />
              <ProjectFilter
                filter={filter}
                onFilterChange={onFilterChange}
                label="Paths"
              />
            </div>
          </Popover.Panel>
        </Popover>
      </div>
    </div>
  );
};
