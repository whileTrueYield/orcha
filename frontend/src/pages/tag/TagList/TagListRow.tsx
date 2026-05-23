import React from "react";
import { Link } from "react-router-dom";
import { Tag } from "types/graphql";
import { getColor } from "config";
import { format } from "date-fns";

interface Props {
  tag: Tag;
  index: number;
  url: string;
}

export const TagListRow: React.FC<Props> = (props) => {
  const colorSet = getColor(props.tag.color);

  return (
    <tr
      key={`table-row-${props.tag.id}`}
      className={props.index % 2 ? "bg-gray-50" : "bg-white"}
    >
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
        <Link
          to={props.url}
          className={`inline-block rounded border px-2 py-0.5 text-sm font-semibold ${colorSet.borderColor} ${colorSet.textColor} ${colorSet.bgColor} `}
        >
          {props.tag.name}
        </Link>
      </td>
      <td className="hidden max-w-xs truncate px-6 py-4 text-sm leading-5 text-gray-500 lg:table-cell">
        {props.tag.author ? props.tag.author.name : "Unknown"}
      </td>
      <td className="max-w-xs truncate px-6 py-4 text-sm leading-5 text-gray-500">
        {format(new Date(props.tag.updatedAt), "PPpp")}
      </td>
    </tr>
  );
};
