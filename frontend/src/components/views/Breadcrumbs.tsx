import React from "react";
import { Link } from "react-router-dom";
import { truncate, map } from "lodash";
import cn from "classnames";
import { ChevronRightIcon } from "@heroicons/react/solid";

export interface Breadcrumb {
  label: string;
  url: string;
}

interface Props {
  crumbs: Breadcrumb[];
  className?: string;
}

export const Breadcrumbs: React.FC<Props> = (props) => {
  const { className, crumbs } = props;

  if (crumbs.length > 1) {
    const classnames = cn(
      "bg-gray-200 mx-2 sm:mx-0 p-1 rounded-md font-sans",
      className
    );

    return (
      <nav className={classnames}>
        <ol className="list-reset text-grey-dark overflow-x flex truncate p-1">
          {map(crumbs, ({ label, url }, index) => (
            <li key={`${url}:${label}`}>
              {index > 0 ? (
                <ChevronRightIcon className="inline-block h-4 w-4 text-gray-400" />
              ) : null}
              {index === crumbs.length - 1 && url ? (
                <span className="text-gray-600" title={label}>
                  {label}
                </span>
              ) : (
                <Link
                  to={url}
                  className="rounded-full px-2 text-blue-500 hover:underline focus:outline-none focus:ring"
                  title={label}
                >
                  {truncate(label, { length: 16 })}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  } else {
    return null;
  }
};
