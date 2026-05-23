import { ResponsiveLine } from "@nivo/line";
import { filter, map } from "lodash";
import { formatForLineChart } from "pages/report/formater";
import {
  boundaries,
  bucketDates,
  DatumGranularity,
  formatEnum,
} from "pages/report/formater/helpers";
import { ReportQuery } from "types/graphql";
import { ChartColorTheme } from "./config";

interface Props {
  reportQuery: ReportQuery;
}

export const CompareThroughTimeWidget: React.FC<Props> = (props) => {
  const {
    values,
    chartBy,
    secondaryChartBy,
    noUnknowns,
    granularity,
    cummulative,
    chartByLabel,
    secondaryChartByLabel,
  } = props.reportQuery;

  const dateBoundaries = boundaries(
    filter(map([...values.primary, ...values.secondary], "main"))
  );

  if (!dateBoundaries) {
    return null;
  }

  const primaryData = formatForLineChart(
    bucketDates(
      values.primary,
      chartBy,
      granularity,
      new Date(parseInt(dateBoundaries[0] as string)),
      new Date(parseInt(dateBoundaries[1] as string))
    ),
    {
      main: chartBy,
      granularity: DatumGranularity.day,
      noUnknowns,
      cummulative,
      label: chartByLabel,
    }
  );

  const secondaryData = secondaryChartBy
    ? formatForLineChart(
        bucketDates(
          values.secondary,
          secondaryChartBy,
          granularity,
          new Date(parseInt(dateBoundaries[0] as string)),
          new Date(parseInt(dateBoundaries[1] as string))
        ),
        {
          main: secondaryChartBy,
          granularity: DatumGranularity.day,
          noUnknowns,
          cummulative,
          label: secondaryChartByLabel,
        }
      )
    : [];

  return (
    <ResponsiveLine
      data={[...primaryData, ...secondaryData]}
      margin={{ top: 20, right: 120, bottom: 60, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="monotoneX"
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 20,
        // legend: formatEnum(props.reportQuery.chartBy),
        legendOffset: 47,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: formatEnum(props.reportQuery.aggregateField),
        legendOffset: -40,
        legendPosition: "middle",
        format: (e) => Math.floor(e) === e && e,
      }}
      pointSize={10}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      colors={ChartColorTheme}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};
