import React from "react";
import cn from "classnames";
import { Checkbox } from "components/fields/Checkbox";
import { FolderIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export type ExplorerRowCategory = "project" | "ticket";

export interface ExplorerRow {
  id: string;
  title: string;
  createdAt: Date;
  eta?: Date | null;
  status: string;
  url: string;
}

interface Props {
  row: ExplorerRow;
  selection: string[];
  onSelect: (id: string, shiftKey: boolean) => void;
  onDeselect: (id: string, shiftKey: boolean) => void;
  onDrop: (source: string, projectId: number) => void;
  onInfoClick?: () => void;
}

export const ExplorerProjectRow: React.FC<Props> = (props) => {
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

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const projectIdStr = props.row.id.split(":")[1];
    props.onDrop(
      event.dataTransfer.getData("record/ids"),
      parseInt(projectIdStr)
    );
    event.preventDefault();
  };

  const trClass = cn("hover:bg-brand-50 highlight-when-dragging", {
    "bg-gray-50": isSelected,
    "bg-white": !isSelected,
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
      <td className="max-w-[12rem] truncate text-sm text-gray-500 xl:max-w-[16rem] 2xl:max-w-[32rem] ">
        <div
          className="group relative flex min-w-0 flex-row items-center px-3 py-2"
          onDragStart={(event) => {
            event.dataTransfer.setData("record/ids", props.row.id);
            event.dataTransfer.effectAllowed = "copy";
          }}
          draggable
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
        >
          <FolderIcon className="mr-2 h-5 w-5 shrink-0 text-yellow-400 group-hover:text-yellow-500" />
          <Link
            type="button"
            to={props.row.url}
            className={linkClass}
            onClick={props.onInfoClick}
            aria-label="open side view"
          >
            {props.row.title}
          </Link>
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 sm:table-cell">
        {props.row.eta &&
          formatDistanceToNow(new Date(props.row.eta), { addSuffix: true })}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 sm:table-cell">
        {props.row.status}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2 text-sm text-gray-500 2xl:table-cell"></td>
    </tr>
  );
};
