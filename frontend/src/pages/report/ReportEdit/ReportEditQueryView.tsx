import { gql } from "@apollo/client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
} from "@heroicons/react/outline";
import { useState } from "react";
import { FCWithFragments } from "types";
import {
  MutationUpdateReportQueryPlacementArgs,
  MutationUpdateReportQuerySizeArgs,
  ReportQuery,
  ReportWidgetType,
} from "types/graphql";
import { ReportQueryFilters } from "./ReportQueryFilters";
import { useBlockingMutation } from "utils/graphql";
import { onGraphQLError } from "utils/GQLClient";
import { WidgetSizeButton } from "./WidgetSizeButton";
import cn from "classnames";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { XIcon } from "@heroicons/react/solid";
import { ReportQueryEditCompareThroughTimeModal } from "../ReportQueryCreate/ReportQueryEditCompareThroughTimeModal";
import { ReportQueryEditValuesThroughTimeModal } from "../ReportQueryCreate/ReportQueryEditValuesThroughTimeModal";
import { ReportQueryEditCompareValuesModal } from "../ReportQueryCreate/ReportQueryEditCompareValuesModal";
import { ReportQueryEditValuesBrokenDownModal } from "../ReportQueryCreate/ReportQueryEditValuesBrokenDownModal";
import { ReportQueryEditRatioModal } from "../ReportQueryCreate/ReportQueryEditRatioModal";
import { ReportQueryEditCalendarModal } from "../ReportQueryCreate/ReportQueryEditCalendarModal";

interface Props {
  reportQuery: ReportQuery;
  onDelete: () => void;
}

export const ReportEditQueryView: FCWithFragments<Props> = (props) => {
  const { reportQuery } = props;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [updateReportQueryPlacement] = useBlockingMutation<
    { updateReportQueryPlacement: ReportQuery[] },
    MutationUpdateReportQueryPlacementArgs
  >(UPDATE_REPORT_QUERY_PLACEMENT_MUTATION, {
    onError: onGraphQLError({
      title: "Query move failed",
    }),
  });

  const [updateReportQuerySize] = useBlockingMutation<
    { updateReportQuerySize: ReportQuery },
    MutationUpdateReportQuerySizeArgs
  >(UPDATE_REPORT_QUERY_SIZE_MUTATION, {
    onError: onGraphQLError({
      title: "Query size failed",
    }),
  });

  const updatePosition = (rows: number, cols: number) => {
    updateReportQuerySize({
      variables: {
        reportQueryId: reportQuery.id,
        input: {
          cols,
          rows,
        },
      },
    });
  };

  const moveLeft = () => {
    updateReportQueryPlacement({
      variables: {
        reportQueryId: reportQuery.id,
        input: {
          direction: "left",
        },
      },
    });
  };

  const moveRight = () => {
    updateReportQueryPlacement({
      variables: {
        reportQueryId: reportQuery.id,
        input: {
          direction: "right",
        },
      },
    });
  };

  const className = cn({
    "row-span-2 h-[41rem]": reportQuery.rows === 2,
    "md:col-span-2": reportQuery.cols === 2,
    "h-[20rem]": reportQuery.rows === 1,
  });

  const rowClassName = cn(
    "border-3 relative h-full rounded-xl border-4 border-gray-300 bg-white p-4"
  );

  const renderEditModal = () => {
    switch (reportQuery.widgetType) {
      case ReportWidgetType.CompareThroughTime:
        return (
          <ReportQueryEditCompareThroughTimeModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );
      case ReportWidgetType.ValuesThroughTime:
        return (
          <ReportQueryEditValuesThroughTimeModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );

      case ReportWidgetType.CompareValuesNow:
        return (
          <ReportQueryEditCompareValuesModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );

      case ReportWidgetType.ValuesBrokenDownNow:
        return (
          <ReportQueryEditValuesBrokenDownModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );

      case ReportWidgetType.ValuesNow:
        return (
          <ReportQueryEditRatioModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );

      case ReportWidgetType.Calendar:
        return (
          <ReportQueryEditCalendarModal
            reportQuery={reportQuery}
            visible={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderEditModal()}
      <DangerConfirm
        cta={`Yes, Delete Query`}
        description={`Are you sure you want to delete this query? This action cannot be undone.`}
        onConfirm={props.onDelete}
        onClose={() => setShowDeleteModal(false)}
        title={`Delete Query?`}
        visible={showDeleteModal}
      />

      <div className={rowClassName}>
        <div className="mr-4 text-xl font-semibold text-gray-600">
          {reportQuery.title}
        </div>
        <div className="flex h-full flex-col items-center justify-center">
          <button
            className="absolute bottom-4 top-14 right-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            type="button"
            onClick={moveRight}
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>
          <button
            className="absolute bottom-4 top-14 left-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            type="button"
            onClick={moveLeft}
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            type="button"
            className="absolute -left-4 -top-4 rounded-full border-4 border-gray-300 bg-red-400 p-1 text-white hover:bg-red-500 hover:text-white"
          >
            <XIcon className="h-4 w-4" />
          </button>
          <label className="mb-2 text-lg font-semibold text-gray-400">
            Widget Size
          </label>
          <div className="grid grid-cols-2 gap-4">
            <WidgetSizeButton
              isActive={reportQuery.rows === 1 && reportQuery.cols === 1}
              rows={1}
              cols={1}
              onClick={updatePosition}
            />
            <WidgetSizeButton
              isActive={reportQuery.rows === 1 && reportQuery.cols === 2}
              rows={1}
              cols={2}
              onClick={updatePosition}
            />
            <WidgetSizeButton
              isActive={reportQuery.rows === 2 && reportQuery.cols === 1}
              rows={2}
              cols={1}
              onClick={updatePosition}
            />
            <WidgetSizeButton
              isActive={reportQuery.rows === 2 && reportQuery.cols === 2}
              rows={2}
              cols={2}
              onClick={updatePosition}
            />
          </div>
        </div>
        <div className="absolute right-2 top-2">
          <button
            onClick={() => setShowEditModal(true)}
            type="button"
            className=" group flex flex-row items-center space-x-1 rounded-lg px-3 py-1.5 hover:bg-gray-100"
          >
            <CogIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-600">
              Configure
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

ReportEditQueryView.fragments = {
  ReportEditQueryViewFragment: gql`
    fragment ReportEditQueryViewFragment on ReportQuery {
      id
      title
      widgetType
      rows
      cols
      position
      ...ReportQueryFiltersFragment
      ...ReportQueryEditCompareThroughTimeModalFragment
      ...ReportQueryEditValuesThroughTimeModalFragment
      ...ReportQueryEditCompareValuesModalFragment
      ...ReportQueryEditValuesBrokenDownModalFragment
    }
    ${ReportQueryFilters.fragments.ReportQueryFiltersFragment}
    ${ReportQueryEditCompareThroughTimeModal.fragments
      .ReportQueryEditCompareThroughTimeModalFragment}
    ${ReportQueryEditValuesThroughTimeModal.fragments
      .ReportQueryEditValuesThroughTimeModalFragment}
    ${ReportQueryEditCompareValuesModal.fragments
      .ReportQueryEditCompareValuesModalFragment}
    ${ReportQueryEditValuesBrokenDownModal.fragments
      .ReportQueryEditValuesBrokenDownModalFragment}
  `,
};

const UPDATE_REPORT_QUERY_PLACEMENT_MUTATION = gql`
  mutation updateReportQueryPlacement(
    $reportQueryId: Int!
    $input: UpdateReportQueryPlacementInput!
  ) {
    updateReportQueryPlacement(reportQueryId: $reportQueryId, input: $input) {
      id
      ...ReportEditQueryViewFragment
    }
  }
  ${ReportEditQueryView.fragments.ReportEditQueryViewFragment}
`;

const UPDATE_REPORT_QUERY_SIZE_MUTATION = gql`
  mutation updateReportQuerySize(
    $reportQueryId: Int!
    $input: UpdateReportQuerySizeInput!
  ) {
    updateReportQuerySize(reportQueryId: $reportQueryId, input: $input) {
      id
      ...ReportEditQueryViewFragment
    }
  }
  ${ReportEditQueryView.fragments.ReportEditQueryViewFragment}
`;
