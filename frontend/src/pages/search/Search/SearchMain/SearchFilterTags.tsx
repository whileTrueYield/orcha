import React, { useCallback } from "react";
import { SearchFilter } from "types";
import { ToggleFilterAsTag } from "components/ListFilter/ToggleFilterTag";
import { RecordFilterAsTag } from "components/ListFilter/RecordFilterTag";
import { ValueFilterAsTag } from "components/ListFilter/ValueFilterTag";
import { DateFilterAsTag } from "components/ListFilter/DateFilterTag";
import { useAppDispatch } from "store";
import { useSelector } from "react-redux";
import { searchFilterIsEmpty, getSearchFilter } from "reducers/selector";

interface Props {
  className?: string;
}

export const SearchFilterTags: React.FC<Props> = (props) => {
  const filter = useSelector(getSearchFilter);
  const isEmpty = useSelector(searchFilterIsEmpty);

  const dispatch = useAppDispatch();

  const setListFilter = useCallback(
    (filter: SearchFilter) => {
      dispatch({ type: "SET_SEARCH_FILTER", payload: filter });
    },
    [dispatch]
  );

  if (isEmpty) {
    return null;
  }

  return (
    <div className={props.className}>
      <div className="flex flex-row">
        <span className="mr-4 mt-2 inline-block shrink-0 border-r border-r-gray-300 px-4 py-1 text-xs font-medium text-gray-500 hover:text-gray-600">
          FILTERS
        </span>
        <div>
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="isActive"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="readyToSchedule"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="untagged"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="unassigned"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="unestimated"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="hideCompleted"
          />
          <ToggleFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="atRisk"
          />
          <DateFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="createdAt"
            label="Creation Date"
          />
          <DateFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="closedAt"
            label="Close Date"
          />
          <DateFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="eta"
            label="Delivery"
          />
          <ValueFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="statuses"
            label="Status"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="workflows"
            label="Workflow"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="owners"
            label="Owner"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="products"
            label="Product"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="assignees"
            label="Assignee"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="authors"
            label="Author"
          />
          <RecordFilterAsTag<SearchFilter>
            filter={filter}
            onChange={setListFilter}
            domain="tags"
            label="Tag"
          />
          <button
            type="button"
            onClick={() => dispatch({ type: "CLEAR_SEARCH_FILTER" })}
            className="py-1 px-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
};
