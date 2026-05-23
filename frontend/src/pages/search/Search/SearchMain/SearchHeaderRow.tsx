import React from "react";
import { Link, useParams } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { TruncatedProjectPath } from "components/TruncatedProjectPath";
import { plural } from "utils/string";
import { FolderIcon } from "@heroicons/react/solid";
import { Project } from "types/graphql";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  project?: Project | null;
  className?: string;
  total: number;
}
interface Params {
  orgId: string;
}

export const SearchHeaderRow: FCWithFragments<Props> = (props) => {
  const params = useParams<Params>();
  const renderTotal = () => (
    <div className="text-sm text-gray-500">
      {plural("{} ticket", "{} tickets", props.total)} found
    </div>
  );

  if (props.project) {
    return (
      <tr className="bg-brand-50">
        <td colSpan={7} className="relative text-sm">
          <div className="flex min-w-0 flex-col items-center justify-center p-2">
            <div className="mb-2 hidden min-w-0 flex-row items-center space-x-1 text-gray-500 md:flex">
              <span>Search results limited to</span>
              <FolderIcon className="ml-1 h-4 w-4 text-yellow-400" />
              <TruncatedProjectPath
                project={props.project}
                className="text-medium mx-1 max-w-sm text-gray-700 underline"
              />
              <span>and its sub projects -</span>
              <Link
                to={urlResolver.search.search(params.orgId)}
                className="ml-1 whitespace-nowrap text-brand-600 underline hover:text-brand-700 hover:no-underline"
              >
                search all projects
              </Link>
            </div>
            <div className="mb-2 text-gray-500 md:hidden">
              Results limited to a project -
              <Link
                to={urlResolver.search.search(params.orgId)}
                className="ml-1 text-brand-600 underline hover:text-brand-700 hover:no-underline"
              >
                search all projects
              </Link>
            </div>
            {renderTotal()}
          </div>
        </td>
      </tr>
    );
  } else {
    return (
      <tr className="bg-brand-50">
        <td colSpan={7} className="relative text-sm">
          <div className="flex min-w-0 flex-col items-center justify-center space-y-2 p-2">
            {renderTotal()}
          </div>
        </td>
      </tr>
    );
  }
};

SearchHeaderRow.fragments = {
  SearchHeaderRowFragment: gql`
    fragment SearchHeaderRowFragment on Project {
      ...TruncatedPathFragmentForProject
    }
    ${TruncatedProjectPath.fragments.TruncatedPathFragmentForProject}
  `,
};
