import { ReportQuery } from "types/graphql";
import { ResponsiveCalendar } from "@nivo/calendar";
import { formatForCalendarChart } from "pages/report/formater/formatForCalendarChart";
import { parse, endOfMonth, startOfMonth, format } from "date-fns";
import { formatEnum } from "pages/report/formater/helpers";
import { round } from "lodash";

interface Props {
  reportQuery: ReportQuery;
}

export const CalendarWidget: React.FC<Props> = (props) => {
  const { values, aggregateField } = props.reportQuery;

  const data = formatForCalendarChart(values.primary);
  let dateFrom = format(startOfMonth(new Date()), "y-MM-dd");
  let dateTo = format(endOfMonth(new Date()), "y-MM-dd");

  if (data.length) {
    dateFrom = format(
      startOfMonth(parse(data[0].day, "y-MM-dd", new Date())),
      "y-MM-dd"
    );
    dateTo = format(
      endOfMonth(parse(data[data.length - 1].day, "y-MM-dd", new Date())),
      "y-MM-dd"
    );
  }

  const formatValue = (v: { date: Date; value: number }) => {
    return (
      <div className="flex flex-col space-y-1 rounded bg-gray-900 px-3 py-2 text-center text-sm text-white shadow-lg">
        <span className="text-gray-100">{formatEnum(aggregateField)}</span>
        <span>
          {format(v.date, "E LLL do")}
          <span className="ml-2 font-semibold">{round(v.value, 1)}</span>
        </span>
      </div>
    );
  };

  return (
    <ResponsiveCalendar
      data={data}
      from={dateFrom}
      to={dateTo}
      emptyColor="#f1f5f9"
      colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
      margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
      yearSpacing={40}
      monthBorderColor="#334155"
      dayBorderWidth={1}
      dayBorderColor="#64748b"
      monthSpacing={10}
      tooltip={formatValue as any}
      legends={[
        {
          anchor: "bottom-right",
          direction: "row",
          translateY: 36,
          itemCount: 4,
          itemWidth: 42,
          itemHeight: 36,
          itemsSpacing: 14,
          itemDirection: "right-to-left",
        },
      ]}
    />
  );
};
