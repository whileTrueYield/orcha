import { ArrowUpIcon } from "@heroicons/react/outline";
import React from "react";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import cn from "classnames";
import { Project } from "types/graphql";

interface Props {
  project: Project;
  className?: string;
}

export const UpProjectButton: React.FC<Props> = (props) => {
  const { project } = props;

  if (project.parentId) {
    const className = cn(
      "flex h-9 w-9 items-center justify-center rounded text-gray-400 transition hover:bg-gray-200 hover:text-brand-600",
      props.className
    );

    return (
      <Link
        to={urlResolver.explorer.listing(
          project.organizationId.toString(),
          project.parentId
        )}
        className={className}
      >
        <ArrowUpIcon className="h-5 w-5" />
      </Link>
    );
  }

  const className = cn(
    "flex h-9 w-9 items-center justify-center text-gray-300",
    props.className
  );
  return (
    <span className={className}>
      <ArrowUpIcon className="h-5 w-5" />
    </span>
  );
};
