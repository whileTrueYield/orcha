import { ReportQuery } from "types/graphql";
import { ResponsiveBar } from "@nivo/bar";
import { formatForBarChart } from "../../formater";
import { DatumGranularity, formatEnum } from "pages/report/formater/helpers";
import { ChartColorTheme } from "./config";

interface Props {
  reportQuery: ReportQuery;
}

export const ValuesBrokenDownNowWidget: React.FC<Props> = (props) => {
  const { values, chartBy, groupBy, noUnknowns } = props.reportQuery;

  const { data, keys } = formatForBarChart(values.primary, {
    main: chartBy,
    secondary: groupBy,
    granularity: DatumGranularity.day,
    noUnknowns,
  });

  return (
    <ResponsiveBar
      data={data}
      keys={keys.length ? keys : undefined}
      indexBy="__main"
      margin={{ top: 20, right: 120, bottom: 60, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      valueFormat=",.3~r" // at least 3 digit but trim any 0000...
      indexScale={{ type: "band", round: true }}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      borderWidth={0.5}
      borderRadius={2}
      innerPadding={1}
      colors={ChartColorTheme}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 20,
        legend: formatEnum(props.reportQuery.chartBy),
        legendPosition: "middle",
        legendOffset: 47,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: formatEnum(props.reportQuery.aggregateField),
        legendPosition: "middle",
        legendOffset: -40,
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      theme={{
        labels: {
          text: {
            fontSize: 14,
            fontWeight: 600,
            fill: "white",
          },
        },
      }}
      legends={[
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      ariaLabel={props.reportQuery.title}
      barAriaLabel={(e: any) =>
        e.id + ": " + e.formattedValue + ": " + e.indexValue
      }
    />
  );
};
