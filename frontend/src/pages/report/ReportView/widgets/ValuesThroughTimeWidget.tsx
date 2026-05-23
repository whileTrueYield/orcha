import { ResponsiveLine } from "@nivo/line";
import { formatForLineChart } from "pages/report/formater";
import {
  bucketDates,
  DatumGranularity,
  formatEnum,
} from "pages/report/formater/helpers";
import { ReportQuery } from "types/graphql";
import { ChartColorTheme } from "./config";

interface Props {
  reportQuery: ReportQuery;
}

export const ValuesThroughTimeWidget: React.FC<Props> = (props) => {
  const { values, chartBy, groupBy, noUnknowns, granularity, cummulative } =
    props.reportQuery;

  const data = formatForLineChart(
    bucketDates(values.primary, chartBy, granularity),
    {
      main: chartBy,
      secondary: groupBy,
      granularity: DatumGranularity.day,
      noUnknowns,
      cummulative,
    }
  );

  return (
    <ResponsiveLine
      data={data}
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
