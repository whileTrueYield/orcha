import React from "react";
import { CheckboxFilter } from "components/ListFilter/CheckboxFilter";
import { ExplorerCalendarFilter } from "components/ListFilter/ExplorerCalendarFilter";
import { ExplorerProductFilter } from "components/ListFilter/ExplorerProductFilter";
import { ExplorerRoleFilter } from "components/ListFilter/ExplorerRoleFilter";
import { ExplorerTagFilter } from "components/ListFilter/ExplorerTagFilter";
import { ExplorerWorkflowFilter } from "components/ListFilter/ExplorerWorkflowFilter";
import { SelectAsCheckboxFilter } from "components/ListFilter/SelectAsCheckboxFilter";
import { useSelector } from "react-redux";
import { getSearchFilter, getMe } from "reducers/selector";
import { useAppDispatch } from "store";
import { DeepPartial, SearchFilter } from "types";
import { ModelStage, TicketStatus } from "types/graphql";
import { addDays, endOfDay, startOfDay } from "date-fns";
import { setSearchFilter } from "actions/filter/setSearchFilter";

interface Props {
  onClose: () => void;
}

export const SearchFilterSection: React.FC<Props> = (props) => {
  const me = useSelector(getMe);
  const searchFilter = useSelector(getSearchFilter);
  const dispatch = useAppDispatch();

  const onSearchFilterChange = (filter: SearchFilter) =>
    dispatch(setSearchFilter(filter));
  const onSearchFilterSet = (filter: DeepPartial<SearchFilter>) =>
    dispatch(setSearchFilter(filter));

  const renderClearDatesButton = (key: keyof SearchFilter["dates"]) => {
    if (searchFilter.dates[key]) {
      return (
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() =>
            onSearchFilterChange({
              ...searchFilter,
              dates: { ...searchFilter.dates, [key]: null },
            })
          }
        >
          clear
        </button>
      );
    }
  };

  const renderClearRecordButton = (key: keyof SearchFilter["recordSets"]) => {
    if (searchFilter.recordSets[key].length) {
      return (
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() =>
            onSearchFilterChange({
              ...searchFilter,
              recordSets: { ...searchFilter.recordSets, [key]: [] },
            })
          }
        >
          clear
        </button>
      );
    }
  };

  return (
    <div>
      <div className="w-48 shrink-0 px-2 xl:w-52 2xl:w-72">
        <div>
          <div className="pb-2 text-sm font-medium text-gray-800">
            Quick Filters
          </div>
          <div className="flex flex-col space-y-4 sm:space-y-3">
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  recordSets: {
                    assignees: [{ label: me!.role!.name, id: me!.role!.id }],
                  },
                  valueSets: {
                    statuses: [
                      { label: "Scheduled", value: TicketStatus.Scheduled },
                    ],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              My Scheduled Tickets
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  recordSets: {
                    authors: [{ label: me!.role!.name, id: me!.role!.id }],
                  },
                  valueSets: {
                    statuses: [{ label: "Draft", value: ModelStage.Draft }],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              My Drafts
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  dates: {
                    eta: {
                      afterDate: startOfDay(new Date()).toISOString(),
                      beforeDate: endOfDay(
                        addDays(new Date(), 7),
                      ).toISOString(),
                    },
                  },
                  valueSets: {
                    statuses: [
                      { label: "Scheduled", value: TicketStatus.Scheduled },
                    ],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              ETA within next 7 days
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  dates: {
                    eta: {
                      afterDate: startOfDay(new Date()).toISOString(),
                      beforeDate: endOfDay(
                        addDays(new Date(), 14),
                      ).toISOString(),
                    },
                  },
                  valueSets: {
                    statuses: [
                      { label: "Scheduled", value: TicketStatus.Scheduled },
                    ],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              ETA within next 14 days
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  dates: {
                    closedAt: {
                      afterDate: startOfDay(
                        addDays(new Date(), -1),
                      ).toISOString(),
                    },
                  },
                  valueSets: {
                    statuses: [{ label: "Done", value: TicketStatus.Done }],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              Delivered since yesterday
            </button>
            <button
              type="button"
              onClick={() => {
                onSearchFilterSet({
                  dates: {
                    closedAt: {
                      afterDate: startOfDay(
                        addDays(new Date(), -7),
                      ).toISOString(),
                    },
                  },
                  valueSets: {
                    statuses: [{ label: "Done", value: TicketStatus.Done }],
                  },
                });
              }}
              className="text-left text-sm text-gray-600 underline hover:text-brand-700 hover:no-underline"
            >
              Delivered past 7 days
            </button>
          </div>
        </div>
        <div>
          <div className="pt-6 pb-2 text-sm font-medium text-gray-800">
            Others
          </div>
          <div className="space-y-4 sm:space-y-3">
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Being worked on"
                domain="isActive"
              />
            </div>
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Ready to schedule"
                domain="readyToSchedule"
              />
            </div>
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Without tags"
                domain="untagged"
              />
            </div>
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Not fully assigned"
                domain="unassigned"
              />
            </div>
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Not fully estimated"
                domain="unestimated"
              />
            </div>
            <div className="flex items-center text-base sm:text-sm">
              <CheckboxFilter
                filter={searchFilter}
                onFilterChange={onSearchFilterChange}
                label="Hide completed"
                domain="hideCompleted"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="pt-6 pb-2 text-sm font-medium text-gray-800">
            State
          </div>
          <SelectAsCheckboxFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="statuses"
            options={[
              { label: "Draft", value: ModelStage.Draft },
              { label: "Unscheduled", value: TicketStatus.Unscheduled },
              { label: "Scheduled", value: TicketStatus.Scheduled },
              { label: "Done", value: TicketStatus.Done },
              { label: "Cancelled", value: TicketStatus.Cancelled },
              { label: "Archived", value: ModelStage.Archived },
            ]}
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Product</div>
            {renderClearRecordButton("products")}
          </div>
          <ExplorerProductFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            className="max-w-xs"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Workflow</div>
            {renderClearRecordButton("workflows")}
          </div>
          <ExplorerWorkflowFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            className="max-w-xs"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Assignee</div>
            {renderClearRecordButton("assignees")}
          </div>
          <ExplorerRoleFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="assignees"
            label="Assignee"
            className="max-w-xs"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Tags</div>
            {renderClearRecordButton("tags")}
          </div>
          <ExplorerTagFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            className="max-w-xs"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Owner</div>
            {renderClearRecordButton("owners")}
          </div>
          <ExplorerRoleFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="owners"
            className="max-w-xs"
            label="Owner"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Author</div>
            {renderClearRecordButton("authors")}
          </div>
          <ExplorerRoleFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="authors"
            label="Author"
            className="max-w-xs"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Projected Delivery by</div>
            {renderClearDatesButton("eta")}
          </div>
          <ExplorerCalendarFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="eta"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Close Date</div>
            {renderClearDatesButton("closedAt")}
          </div>
          <ExplorerCalendarFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="closedAt"
          />
        </div>
        <div>
          <div className="flex flex-row justify-between pt-6 pb-2 text-sm font-medium text-gray-800">
            <div>Creation Date</div>
            {renderClearDatesButton("createdAt")}
          </div>
          <ExplorerCalendarFilter
            filter={searchFilter}
            onFilterChange={onSearchFilterChange}
            domain="createdAt"
          />
        </div>
      </div>
    </div>
  );
};
