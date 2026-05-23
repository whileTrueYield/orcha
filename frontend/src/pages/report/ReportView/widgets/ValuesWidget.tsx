import { ReportQuery } from "types/graphql";
import { ResponsivePie } from "@nivo/pie";
import { formatForPieChart } from "../../formater";
import { DatumGranularity } from "pages/report/formater/helpers";
import { ChartColorTheme } from "./config";

interface Props {
  reportQuery: ReportQuery;
}

export const ValuesWidget: React.FC<Props> = (props) => {
  const { values, chartBy, groupBy, noUnknowns } = props.reportQuery;

  const data = formatForPieChart(values.primary, {
    main: chartBy,
    secondary: groupBy,
    granularity: DatumGranularity.day,
    noUnknowns,
  });

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 25, right: 40, bottom: 25, left: 40 }}
      value="value"
      valueFormat=",.3~r" // at least 3 digit but trim any 0000...
      cornerRadius={10}
      borderColor="#fff"
      innerRadius={0.5}
      activeOuterRadiusOffset={8}
      borderWidth={2}
      colors={ChartColorTheme}
      enableArcLabels={true}
      arcLinkLabelsTextColor="#475569"
      arcLinkLabelsThickness={2}
      arcLabelsSkipAngle={10}
      arcLinkLabelsSkipAngle={10}
      theme={{
        labels: {
          text: {
            fontSize: 14,
            fontWeight: 600,
            fill: "white",
          },
        },
      }}
    />
  );
};
