import React from "react";
import { Link } from "react-router-dom";
import { BlackoutTime } from "types/graphql";
import { format } from "date-fns";

interface Props {
  blackoutTime: BlackoutTime;
  index: number;
  url: string;
}

export const BlackoutTimeListRow: React.FC<Props> = (props) => {
  return (
    <tr
      key={`table-row-${props.blackoutTime.id}`}
      className={props.index % 2 ? "bg-gray-50" : "bg-white"}
    >
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium leading-5 text-gray-900">
        <Link
          to={props.url}
          className={`inline-block rounded border px-2 py-0.5 text-sm font-semibold`}
        >
          {props.blackoutTime.name}
        </Link>
      </td>

      <td className="max-w-xs truncate px-6 py-4 text-sm leading-5 text-gray-500">
        {format(new Date(props.blackoutTime.updatedAt), "PPpp")}
      </td>
    </tr>
  );
};
