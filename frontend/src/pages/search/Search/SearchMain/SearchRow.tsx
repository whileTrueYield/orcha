import React from "react";
import cn from "classnames";
import { Checkbox } from "components/fields/Checkbox";
import { ExternalLinkIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { TruncatedProjectPath } from "components/TruncatedProjectPath";
import { Project } from "types/graphql";
import { TicketIdTag } from "components/tags/TicketIdTag";

export type SearchRowCategory = "project" | "ticket" | "project";

export interface SearchRow {
  id: string;
  localId?: number | null;
  productCode?: string;
  workflow?: string;
  title: string;
  createdAt: Date;
  eta?: Date | null;
  status: string;
  category: SearchRowCategory;
  url: string;
  project?: Project | null;
}

interface Props {
  row: SearchRow;
  selection: string[];
  onSelect: (id: string, shiftKey: boolean) => void;
  onDeselect: (id: string, shiftKey: boolean) => void;
  onInfoClick?: () => void;
}

export const SearchRowElement: React.FC<Props> = (props) => {
  const isSelected = props.selection.indexOf(props.row.id) > -1;

  const toggleSelect = (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    if (isSelected) {
      props.onDeselect(props.row.id, event.shiftKey);
    } else {
      props.onSelect(props.row.id, event.shiftKey);
    }
  };

  const trClass = cn("hover:bg-brand-50", {
    "bg-gray-50": isSelected,
    "bg-white": !isSelected,
    "highlight-when-dragging": props.row.category === "project",
  });

  const linkClass = cn("truncate hover:underline", {
    "text-brand-700": isSelected,
    "hover:text-brand-700 text-gray-700": !isSelected,
  });

  return (
    <tr data-id={props.row.id} className={trClass}>
      <td
        className={`w-6 border-l-2 px-3 ${
          isSelected ? "border-brand-400" : "border-transparent"
        }`}
      >
        <Checkbox
          aria-label="Select this ticket"
          readOnly
          checked={isSelected}
          onClick={toggleSelect}
        />
      </td>
      <td>
        {props.row.status === "Draft" ? (
          <span className="mr-2 items-center whitespace-nowrap rounded bg-gray-100 py-px px-1 text-xs font-semibold uppercase text-gray-600">
            draft
          </span>
        ) : (
          <TicketIdTag
            localId={props.row.localId}
            productCode={props.row.productCode}
            className="mr-2 text-xs"
          />
        )}
      </td>
      <td className="max-w-[12rem] truncate text-sm text-gray-500 xl:max-w-[16rem] 2xl:max-w-[22rem]">
        <div className="group relative flex min-w-0 flex-row items-center py-2 px-3">
          <button
            type="button"
            className={linkClass}
            onClick={props.onInfoClick}
            aria-label="open side view"
          >
            {props.row.title}
          </button>
          <Link
            to={props.row.url}
            aria-label="open detail page"
            className="px-2 text-brand-400 opacity-0 transition hover:text-brand-600 group-hover:opacity-100"
          >
            <ExternalLinkIcon className="h-5 w-5" />
          </Link>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 sm:table-cell">
        {props.row.status}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 sm:table-cell">
        {props.row.workflow}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 lg:table-cell">
        {props.row.eta &&
          formatDistanceToNow(new Date(props.row.eta), { addSuffix: true })}
      </td>
      <td className="hidden max-w-[12rem] whitespace-nowrap px-3 py-2 text-sm text-gray-500 lg:table-cell">
        {props.row.project ? (
          <TruncatedProjectPath project={props.row.project} />
        ) : null}
      </td>
    </tr>
  );
};
