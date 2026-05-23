import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { Project } from "types/graphql";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";
import { DocumentTextIcon } from "@heroicons/react/outline";
import { HoverTooltip } from "components/help/Tooltip";

interface Props {
  className?: string;
  project: Project;
}

export const ExplorerRowToProjectEdit: FCWithFragments<Props> = (props) => {
  const { project } = props;

  return (
    <tr className="hover:bg-brand-50">
      <td className="w-6 px-3"></td>
      <td
        colSpan={4}
        className="max-w-[12rem] truncate text-sm text-gray-500 xl:max-w-[16rem] 2xl:max-w-[32rem]"
      >
        <Link
          to={urlResolver.explorer.editor(project.organizationId, project.id)}
          className="group flex cursor-pointer flex-row px-3 py-2 text-gray-700 hover:text-brand-700 hover:underline"
        >
          <HoverTooltip tooltip="View/Edit Readme">
            <div className="flex flex-row">
              <DocumentTextIcon className="mr-2 h-5 w-5 shrink-0 text-indigo-400 group-hover:text-indigo-500" />
              <span className="truncate">Readme.txt</span>
            </div>
          </HoverTooltip>
        </Link>
      </td>
    </tr>
  );
};

ExplorerRowToProjectEdit.fragments = {
  ExplorerRowToProjectEditFragment: gql`
    fragment ExplorerRowToProjectEditFragment on Project {
      id
      name
    }
  `,
};
