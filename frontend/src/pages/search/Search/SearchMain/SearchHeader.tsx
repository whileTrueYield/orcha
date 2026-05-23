import React, { Fragment } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { useAppDispatch } from "store";
import { useSelector } from "react-redux";
import { getSearchFilter } from "reducers/selector";
import { setSearchFilter } from "actions/filter/setSearchFilter";

export const SearchHead: React.FC = () => {
  const filter = useSelector(getSearchFilter);
  const dispatch = useAppDispatch();

  const toggleSort = (
    field:
      | "title"
      | "eta"
      | "status"
      | "createdAt"
      | "project"
      | "workflow"
      | "localId"
  ) => {
    let direction = filter.sort.direction;
    if (filter.sort.field === field) {
      direction = direction === "ASC" ? "DESC" : "ASC";
    }
    dispatch(setSearchFilter({ ...filter, sort: { field, direction } }));
  };

  const renderSorting = (field: string) => {
    if (field === filter.sort.field) {
      return filter.sort.direction === "ASC" ? (
        <ChevronDownIcon className="ml-1 inline h-5 w-5 text-gray-400" />
      ) : (
        <ChevronUpIcon className="ml-1 inline h-5 w-5 text-gray-400" />
      );
    }
  };

  return (
    <Fragment>
      <tr className="mb-px h-10 overflow-hidden bg-gray-50">
        <th scope="col" className="w-6 px-3"></th>
        <th
          className="whitespace-nowrap py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 sm:table-cell"
          role="button"
          scope="col"
          onClick={() => toggleSort("localId")}
        >
          ID
          {renderSorting("localId")}
        </th>
        <th
          scope="col"
          className="min-w-[12rem] px-3 text-left text-sm text-gray-700"
        >
          <div
            className="whitespace-nowrap py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500"
            role="button"
            onClick={() => toggleSort("title")}
          >
            Title
            {renderSorting("title")}
          </div>
        </th>
        <th
          scope="col"
          role="button"
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 sm:table-cell"
          onClick={() => toggleSort("status")}
        >
          Status
          {renderSorting("status")}
        </th>
        <th
          scope="col"
          role="button"
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 sm:table-cell"
          onClick={() => toggleSort("workflow")}
        >
          Workflow
          {renderSorting("workflow")}
        </th>
        <th
          scope="col"
          role="button"
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 lg:table-cell"
          onClick={() => toggleSort("eta")}
        >
          Completion
          {renderSorting("eta")}
        </th>
        <th
          scope="col"
          role="button"
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 lg:table-cell"
          onClick={() => toggleSort("project")}
        >
          Project
          {renderSorting("project")}
        </th>
      </tr>
      <tr>
        <th className="h-px bg-gray-200 p-0" colSpan={7}></th>
      </tr>
    </Fragment>
  );
};
