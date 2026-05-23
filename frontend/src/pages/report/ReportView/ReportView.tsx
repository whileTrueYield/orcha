import { gql, useQuery } from "@apollo/client";
import { DuplicateIcon, PencilIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { Tag } from "components/tags/Tag";
import { NoAccess } from "components/views/NoAccess";
import { usePageTitle } from "hooks/usePageTitle";
import { sortBy } from "lodash";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { onGraphQLError } from "utils/GQLClient";
import { urlResolver } from "utils/navigation";
import { ReportDuplicateModal } from "../ReportDuplicate/ReportDuplicateModal";
import { ReportQueryView } from "./ReportQueryView";
import { QueryReturnValue } from "types/queryTypes";

interface UrlParams {
  reportId: string;
  orgId: string;
  pageId?: string;
}

const ReportView: FCWithFragments = (props) => {
  usePageTitle("Report View");
  const params = useParams<UrlParams>();
  const [duplicateReportModalVisible, setDuplicateReportModalVisible] =
    useState(false);
  const reportId = parseInt(params.reportId || "0");

  const { data, loading, error } = useQuery<QueryReturnValue["report"]>(
    GET_REPORT_QUERY,
    {
      fetchPolicy: "cache-and-network",
      variables: { id: reportId },
      onError: onGraphQLError({ title: "Could not access report" }),
    }
  );

  const report = data?.report;

  if (error) {
    return <NoAccess className="h-full" />;
  }

  if (loading || !report) {
    return null;
  }

  // we sort the queries in the frontend such as when a couple
  // querie's position changes, we can update their location.
  // we can't use the sorting on the report.queries array as
  // it wouldn't be changed when the query.position is updated
  const sortedQueries = sortBy(report.queries, "position");

  return (
    <div className="mx-auto flex max-w-7xl flex-col py-8 px-2 sm:px-0">
      <ReportDuplicateModal
        reportId={report.id}
        reportName={report.name}
        visible={duplicateReportModalVisible}
        onClose={() => setDuplicateReportModalVisible(false)}
      />

      <div className="mb-6 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="flex flex-row items-center text-2xl md:flex-row">
            <span className="hidden text-gray-600 md:block">Report:</span>
            <span className="ml-1 font-semibold text-gray-700">
              {report.name}
            </span>
            <Tag className="ml-2 bg-gray-700 text-white">{report.stage}</Tag>
          </h1>
        </div>

        <div className="flex flex-row space-x-2">
          <Button
            type="button"
            btnType="white"
            btnSize="small"
            asElement={(className) => (
              <Link
                className={className}
                to={urlResolver.report.edit(params.orgId, reportId)}
              >
                <PencilIcon className="mr-1 -ml-0.5 h-4 w-4 text-gray-500" />
                Edit
              </Link>
            )}
          />
          <Button
            type="button"
            btnSize="small"
            btnType="white"
            onClick={() => setDuplicateReportModalVisible(true)}
          >
            <DuplicateIcon className="mr-1 -ml-0.5 h-4 w-4 text-gray-500" />
            Duplicate
          </Button>
        </div>
      </div>
      <div className="grid-rows-8 grid gap-4 md:grid-cols-2">
        {sortedQueries.map((reportQuery) => (
          <ReportQueryView key={reportQuery.id} reportQuery={reportQuery} />
        ))}
      </div>
    </div>
  );
};

ReportView.fragments = {
  ReportViewFragment: gql`
    fragment ReportViewFragment on Report {
      id
      name
      stage
      queries {
        ...ReportQueryViewFragment
      }
    }
    ${ReportQueryView.fragments.ReportQueryViewFragment}
  `,
};

const GET_REPORT_QUERY = gql`
  query GetReport($id: Int!) {
    report(id: $id) {
      id
      ...ReportViewFragment
    }
  }
  ${ReportView.fragments.ReportViewFragment}
`;

export default ReportView;
