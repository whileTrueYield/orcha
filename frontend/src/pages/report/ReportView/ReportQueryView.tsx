import { gql } from "@apollo/client";
import {
  ArrowsExpandIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/outline";
import { useState } from "react";
import { FCWithFragments } from "types";
import { ReportQuery, ReportWidgetType } from "types/graphql";
import cn from "classnames";
import { CompareThroughTimeWidget } from "./widgets/CompareThroughTimeWidget";
import { ValuesThroughTimeWidget } from "./widgets/ValuesThroughTimeWidget";
import { CompareValuesNowWidget } from "./widgets/CompareValuesNowWidget";
import { ValuesBrokenDownNowWidget } from "./widgets/ValuesBrokenDownNowWidget";
import { ValuesWidget } from "./widgets/ValuesWidget";
import { CalendarWidget } from "./widgets/CalendarWidget";

interface Props {
  reportQuery: ReportQuery;
}

export const ReportQueryView: FCWithFragments<Props> = (props) => {
  const [flip, setFlip] = useState(false);
  const [enlarge, setEnlarge] = useState(false);
  const { reportQuery } = props;

  const canFlip = !!reportQuery.chartBy && !!reportQuery.groupBy;

  // const getReportQuery = (reportQuery: ReportQuery): ReportQuery => {
  //   if (flip && canFlip) {
  //     return {
  //       ...reportQuery,
  //       chartBy: reportQuery.groupBy as ReportGroupBy,
  //       groupBy: reportQuery.chartBy,
  //       granularity: reportQuery.granularity,
  //       values: {
  //         primary: map(reportQuery.values.primary, (v) => ({
  //           ...v,
  //           main: v.secondary,
  //           secondary: v.main,
  //         })),
  //         secondary: map(reportQuery.values.secondary, (v) => ({
  //           ...v,
  //           main: v.secondary,
  //           secondary: v.main,
  //         })),
  //       },
  //     };
  //   }

  //   return reportQuery;
  // };

  const className = cn("rounded-xl bg-white p-4 shadow transition-all", {
    "sm:col-span-2 row-span-2": enlarge,
    "row-span-2": reportQuery.rows === 2,
    "sm:col-span-2": reportQuery.cols === 2,
  });

  const rowClassName = cn({
    "h-[34rem]": reportQuery.rows === 2 || enlarge,
    "h-[18rem]": reportQuery.rows === 1 && !enlarge,
  });

  const buttonStyle = (isActive: boolean, visible: boolean = true) =>
    cn("rounded-lg p-1 hover:bg-gray-100 hover:text-gray-600", {
      hidden: !visible,
      "text-gray-400": !isActive,
      "text-brand-600 bg-brand-100": isActive,
    });

  const renderChart = () => {
    switch (reportQuery.widgetType) {
      case ReportWidgetType.CompareThroughTime:
        return <CompareThroughTimeWidget reportQuery={reportQuery} />;
      case ReportWidgetType.ValuesThroughTime:
        return <ValuesThroughTimeWidget reportQuery={reportQuery} />;
      case ReportWidgetType.CompareValuesNow:
        return <CompareValuesNowWidget reportQuery={reportQuery} />;
      case ReportWidgetType.ValuesBrokenDownNow:
        return <ValuesBrokenDownNowWidget reportQuery={reportQuery} />;
      case ReportWidgetType.ValuesNow:
        return <ValuesWidget reportQuery={reportQuery} />;
      case ReportWidgetType.Calendar:
        return <CalendarWidget reportQuery={reportQuery} />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-lg text-gray-400">
            <span>Unhandled Chart Type {reportQuery.widgetType}</span>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      <div className="row flex flex-row justify-between">
        <div className="text-lg font-semibold text-gray-700">
          {reportQuery.title}
        </div>
        <div className="flex-row space-x-2">
          <button
            type="button"
            onClick={() => setFlip(!flip)}
            className={buttonStyle(flip, canFlip)}
            title="flip grouping"
          >
            <SwitchHorizontalIcon className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => setEnlarge(!enlarge)}
            className={buttonStyle(enlarge)}
            title="enlarge"
          >
            <ArrowsExpandIcon className="h-6 w-6 " />
          </button>
        </div>
      </div>
      <div className={rowClassName}>{renderChart()}</div>
    </div>
  );
};

ReportQueryView.fragments = {
  ReportQueryViewFragment: gql`
    fragment ReportQueryViewFragment on ReportQuery {
      id
      cols
      rows
      title
      chartBy
      groupBy
      secondaryChartBy
      secondaryGroupBy

      chartByLabel
      groupByLabel
      secondaryChartByLabel
      secondaryGroupByLabel

      fromDate
      untilDate
      granularity
      aggregateField
      widgetType
      noUnknowns
      cummulative
      values {
        primary {
          value
          main
          secondary
        }
        secondary {
          value
          main
          secondary
        }
      }
    }
  `,
};
