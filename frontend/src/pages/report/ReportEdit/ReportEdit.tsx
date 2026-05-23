import { gql, useQuery } from "@apollo/client";
import { PlusIcon } from "@heroicons/react/outline";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { Button } from "components/fields/Button";
import { NoAccess } from "components/views/NoAccess";
import { usePageTitle } from "hooks/usePageTitle";
import { sortBy } from "lodash";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FCWithFragments } from "types";
import { MutationDeleteReportQueryArgs, Report } from "types/graphql";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { useBlockingMutation } from "utils/graphql";
import { urlResolver } from "utils/navigation";
import { ReportQuerySelectWidgetModal } from "../ReportQueryCreate/ReportQuerySelectWidgetModal";
import { ReportEditQueryView } from "./ReportEditQueryView";
import { QueryReturnValue } from "types/queryTypes";

interface UrlParams {
  reportId: string;
  orgId: string;
  pageId?: string;
}

export const ReportEdit: FCWithFragments = (props) => {
  usePageTitle("Report Edit");
  const params = useParams<UrlParams>();
  const reportId = parseInt(params.reportId || "0");
  const [showNewQuery, setShowNewQuery] = useState(false);

  const { data, loading, error } = useQuery<QueryReturnValue["report"]>(
    GET_REPORT_QUERY,
    {
      fetchPolicy: "cache-first",
      variables: { id: reportId },
      onError: onGraphQLError({ title: "Could not access report" }),
    }
  );

  const [deleteReportQuery] = useBlockingMutation<
    { deleteReportQuery: Report },
    MutationDeleteReportQueryArgs
  >(MUTATION_DELETE_REPORT_QUERY, {
    onError: onGraphQLError({ title: "Could not delete query" }),
    onCompleted: onMutationComplete({ title: "Query deleted" }),
  });

  const report = data?.report;

  if (error) {
    return <NoAccess className="h-full" />;
  }

  if (loading || !report) {
    return null;
  }

  const onDelete = (reportQueryId: number) => {
    deleteReportQuery({ variables: { reportQueryId } });
  };

  // we sort the queries in the frontend such as when a couple
  // querie's position changes, we can update their location.
  // we can't use the sorting on the report.queries array as
  // it wouldn't be changed when the query.position is updated
  const sortedQueries = sortBy(report.queries, "position");

  return (
    <div className="mx-auto flex max-w-7xl flex-col py-8 px-2 sm:px-0">
      <ReportQuerySelectWidgetModal
        report={report}
        visible={showNewQuery}
        onClose={() => setShowNewQuery(false)}
      />

      <div className="mb-6 flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
        <div>
          <h1 className="text-2xl">
            <span className="ml-1 font-semibold text-gray-700">
              {report.name}
            </span>
          </h1>
        </div>
        <Button
          type="button"
          asElement={(className) => (
            <Link
              className={className}
              to={urlResolver.report.view(params.orgId, reportId)}
            >
              <ArrowLeftIcon className="mr-1 -ml-0.5 h-4 w-4 text-gray-500" />
              Back to Report View
            </Link>
          )}
        ></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sortedQueries.map((reportQuery) => (
          <ReportEditQueryView
            onDelete={() => onDelete(reportQuery.id)}
            key={reportQuery.id}
            reportQuery={reportQuery}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowNewQuery(true)}
          className="flex h-80 flex-col items-center justify-center rounded-lg border-4 border-dashed border-gray-300 py-6 text-xl font-semibold text-gray-300 transition hover:border-gray-400 hover:text-gray-400"
        >
          <PlusIcon className="mb-2 h-12 w-12" />
          <span>New Widget</span>
        </button>
      </div>
    </div>
  );
};

ReportEdit.fragments = {
  ReportEditFragment: gql`
    fragment ReportEditFragment on Report {
      id
      name
      stage
      queries {
        ...ReportEditQueryViewFragment
      }
    }
    ${ReportEditQueryView.fragments.ReportEditQueryViewFragment}
  `,
};

// this is exported so it can be refreshed
// when we create a new widget
export const GET_REPORT_QUERY = gql`
  query GetReportForEdit($id: Int!) {
    report(id: $id) {
      id
      ...ReportEditFragment
    }
  }
  ${ReportEdit.fragments.ReportEditFragment}
`;

const MUTATION_DELETE_REPORT_QUERY = gql`
  mutation deleteReportQuery($reportQueryId: Int!) {
    deleteReportQuery(reportQueryId: $reportQueryId) {
      id
      ...ReportEditFragment
    }
  }
  ${ReportEdit.fragments.ReportEditFragment}
`;
