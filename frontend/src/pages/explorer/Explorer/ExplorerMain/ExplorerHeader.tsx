import React, { Fragment } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { useAppDispatch } from "store";
import { useSelector } from "react-redux";
import { getExplorerFilter } from "reducers/selector";
import { setExplorerFilter } from "actions";

export const ExplorerHead: React.FC = () => {
  const filter = useSelector(getExplorerFilter);
  const dispatch = useAppDispatch();

  const toggleSort = (field: "title" | "eta" | "status" | "workflow") => {
    let direction = filter.sort.direction;
    if (filter.sort.field === field) {
      direction = direction === "ASC" ? "DESC" : "ASC";
    }
    dispatch(setExplorerFilter({ ...filter, sort: { field, direction } }));
  };

  const renderSorting = (field: string) => {
    if (field === filter.sort.field) {
      return filter.sort.direction === "DESC" ? (
        <ChevronDownIcon className="ml-2 inline h-5 w-5 text-gray-500" />
      ) : (
        <ChevronUpIcon className="ml-2 inline h-5 w-5 text-gray-500" />
      );
    }
  };

  return (
    <Fragment>
      <tr className="mb-px h-10 overflow-hidden bg-gray-50">
        <th scope="col" className="w-6 px-3"></th>
        <th
          scope="col"
          className="min-w-[12rem] whitespace-nowrap px-3 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500"
        >
          <div
            className="py-2"
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
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 md:table-cell"
          onClick={() => toggleSort("workflow")}
        >
          Workflow
          {renderSorting("workflow")}
        </th>
        <th
          scope="col"
          role="button"
          className="hidden whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase leading-4 tracking-wider text-gray-500 xl:table-cell"
          onClick={() => toggleSort("eta")}
        >
          Completion
          {renderSorting("eta")}
        </th>
      </tr>
      <tr>
        <th className="h-px bg-gray-200 p-0" colSpan={5}></th>
      </tr>
    </Fragment>
  );
};
