import React, { useState } from "react";
import { ReplyIcon } from "@heroicons/react/solid";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import cn from "classnames";
import { Project } from "types/graphql";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  className?: string;
  onDrop: (source: string, projectId: number) => void;
  project: Project;
}

export const ExplorerRowProjectUp: FCWithFragments<Props> = (props) => {
  const { project } = props;
  const [isHovered, setHovered] = useState(false);
  const { parentId } = project;

  if (parentId) {
    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
      props.onDrop(event.dataTransfer.getData("record/ids"), parentId);
      event.preventDefault();
    };

    const trClass = cn("hover:bg-brand-50", {
      "bg-white": !isHovered,
      "bg-yellow-100": isHovered,
    });

    return (
      <tr className={trClass}>
        <td className="w-6 px-3"></td>
        <td
          colSpan={4}
          className="max-w-[16rem] truncate text-sm text-gray-500 xl:max-w-[32rem] "
          onDragLeave={() => isHovered && setHovered(false)}
          onDragOver={(event) => {
            !isHovered && setHovered(true);
            event.preventDefault();
          }}
          onDrop={onDrop}
        >
          <Link
            to={urlResolver.explorer.listing(project.organizationId, parentId)}
            className="group flex min-w-0 flex-row items-center py-2 px-3 text-gray-600 hover:font-bold hover:text-gray-900"
          >
            <ReplyIcon className="mr-2 h-4 w-4 shrink-0 -rotate-90 -scale-x-100 !transform text-brand-400 group-hover:text-brand-600" />
            ..
          </Link>
        </td>
      </tr>
    );
  }

  return null;
};

ExplorerRowProjectUp.fragments = {
  ExplorerRowProjectUpFragment: gql`
    fragment ExplorerRowProjectUp on Project {
      id
      name
      parentId
    }
  `,
};
