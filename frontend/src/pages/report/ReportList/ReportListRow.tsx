import React from "react";
import { Link } from "react-router-dom";
import { Report } from "types/graphql";
import { SmartTime } from "components/views/Time";
import { ChevronRightIcon } from "@heroicons/react/solid";
import { FCWithFragments } from "types";
import { gql } from "@apollo/client";

interface Props {
  report: Report;
  index: number;
  url: string;
}

export const ReportListRow: FCWithFragments<Props> = (props) => {
  const { report } = props;

  return (
    <Link to={props.url} className="block hover:bg-gray-50">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
            <div>
              <p className="truncate text-sm font-medium text-indigo-600">
                {report.name}
              </p>
            </div>
            <div className="hidden md:block">
              <div>
                <p className="text-sm text-gray-900">
                  Updated on <SmartTime date={report.updatedAt} />
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ChevronRightIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
};

ReportListRow.fragments = {
  ReportListRowFragment: gql`
    fragment ReportListRowFragment on Report {
      id
      name
      stage
      updatedAt
    }
  `,
};
