import React from "react";
import { RecordFilterAsTag } from "components/ListFilter/RecordFilterTag";
import { ListFilter, RecordFilterElement } from "types";
import { Popover } from "@headlessui/react";
import { WorkflowFilter } from "components/ListFilter/WorkflowFilter";
import { TagFilter } from "components/ListFilter/TagFilter";
import { ProductFilter } from "components/ListFilter/ProductFilter";
import { PlusIcon, XIcon } from "@heroicons/react/solid";
import { cloneDeep, map } from "lodash";
import { Label } from "components/fields/Label";
import { TicketFilter } from "components/ListFilter/TicketFilter";
import { ProjectFilter } from "components/ListFilter/ProjectFilter";
import { gql, useQuery } from "@apollo/client";
import { QueryTicketsCountArgs } from "types/graphql";
import { plural } from "utils/string";
import {
  getAddedTicketsToSchedule,
  getRemovedTicketsFromSchedule,
} from "reducers/selector";
import { useSelector } from "react-redux";
import { QueryReturnValue } from "types/queryTypes";

interface Props {
  filter: ScheduleFilter;
  onChange?: (filter: ScheduleFilter) => void;
  onDelete?: () => void;
}

export interface ScheduleFilter extends ListFilter {
  recordSets: {
    projects: RecordFilterElement[];
    products: RecordFilterElement[];
    workflows: RecordFilterElement[];
    tickets: RecordFilterElement[];
    tags: RecordFilterElement[];
  };
}

export const ScheduleConfigForm: React.FC<Props> = (props) => {
  const { filter, onChange } = props;
  const addedTicketsToSchedule = useSelector(getAddedTicketsToSchedule);
  const removedTicketsFromSchedule = useSelector(getRemovedTicketsFromSchedule);
  const isEditable = !!onChange;

  const onFilterChange = (filter: ScheduleFilter) => {
    isEditable && onChange(cloneDeep(filter));
  };

  const { data } = useQuery<
    QueryReturnValue["ticketsCount"],
    QueryTicketsCountArgs
  >(GET_SCHEDULE_CONFIG_TICKET_COUNT, {
    fetchPolicy: "network-only",
    variables: {
      removedTicketIds: map(removedTicketsFromSchedule, "id"),
      addedTicketIds: map(addedTicketsToSchedule, "id"),
      filter: {
        projectIds: filter.recordSets.projects.map(({ id }) => id),
        productIds: filter.recordSets.products.map(({ id }) => id),
        workflowIds: filter.recordSets.workflows.map(({ id }) => id),
        tagIds: filter.recordSets.tags.map(({ id }) => id),
        ticketIds: filter.recordSets.tickets.map(({ id }) => id),
        priority: 0,
      },
    },
  });

  const renderInfo = (count: number = 0) => {
    if (count) {
      return plural(
        "applies to {} ticket in your schedule",
        "applies to {} tickets in your schedule",
        count
      );
    } else {
      return (
        <span className="font-medium text-red-500">
          Selection does not match any ticket
        </span>
      );
    }
  };

  return (
    <div className="relative flex-1">
      <div className="mr-6 flex flex-1 flex-col">
        <Label
          className="mb-1"
          htmlFor="add-filter"
          additionalInfo={renderInfo(data?.ticketsCount)}
        >
          <span className="flex-1">Filter</span>
        </Label>
        <div
          className={`rounded-md border bg-white px-2 pb-2 ${
            isEditable ? "" : "pointer-events-none"
          }`}
        >
          <RecordFilterAsTag<ScheduleFilter>
            filter={filter}
            onChange={onFilterChange}
            domain="products"
            label="Product"
          />
          <RecordFilterAsTag<ScheduleFilter>
            filter={filter}
            onChange={onFilterChange}
            domain="workflows"
            label="Workflow"
          />
          <RecordFilterAsTag<ScheduleFilter>
            filter={filter}
            onChange={onFilterChange}
            domain="tickets"
            label="Tickets"
          />
          <RecordFilterAsTag<ScheduleFilter>
            filter={filter}
            onChange={onFilterChange}
            domain="tags"
            label="Tag"
          />
          <RecordFilterAsTag<ScheduleFilter>
            filter={filter}
            onChange={onFilterChange}
            domain="projects"
            label="Project"
          />

          {isEditable && (
            <Popover className="relative inline-flex align-bottom">
              <Popover.Button
                id="add-filter"
                className="border-1 group mt-2 flex flex-row items-center rounded-md border-dashed bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-600 transition-colors hover:border-solid hover:bg-gray-700 hover:text-gray-100"
              >
                <PlusIcon className="mr-1 h-4 w-4 text-gray-500 group-hover:text-gray-200" />
                Add filter
              </Popover.Button>

              <Popover.Panel className="absolute z-10 mt-6">
                <div className="mt-1 w-72 rounded-lg bg-white p-2 shadow-lg">
                  <WorkflowFilter
                    filter={filter}
                    onFilterChange={onFilterChange}
                  />
                  <TagFilter filter={filter} onFilterChange={onFilterChange} />
                  <ProductFilter
                    filter={filter}
                    onFilterChange={onFilterChange}
                  />
                  <TicketFilter
                    filter={filter}
                    onFilterChange={onFilterChange}
                    unfinished={true}
                  />
                  <ProjectFilter
                    filter={filter}
                    onFilterChange={onFilterChange}
                  />
                </div>

                <img src="/solutions.jpg" alt="" />
              </Popover.Panel>
            </Popover>
          )}
        </div>
      </div>
      {props.onDelete && (
        <button
          className="absolute -right-2 -top-2 rounded p-1 text-gray-600 hover:bg-gray-300  hover:text-gray-800"
          type="button"
          onClick={props.onDelete}
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

const GET_SCHEDULE_CONFIG_TICKET_COUNT = gql`
  query GetScheduleConfigTicketCountForSchedule(
    $filter: UpdateScheduleConfig!
    $removedTicketIds: [Int]!
    $addedTicketIds: [Int]!
  ) {
    ticketsCount(
      filter: $filter
      removedTicketIds: $removedTicketIds
      addedTicketIds: $addedTicketIds
    )
  }
`;
