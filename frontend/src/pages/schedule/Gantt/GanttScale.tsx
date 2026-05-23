import { max, min, range } from "lodash";
import { GanttTimeScale } from "./types";
import {
  addDays,
  addMonths,
  differenceInDays,
  differenceInMonths,
  format,
  getDaysInMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

interface Props {
  timeScale: GanttTimeScale;
  startDate: Date;
  stopDate: Date;
  dayWidth: number;
}

export const GanttScale: React.FC<Props> = (props) => {
  const { timeScale, startDate, stopDate, dayWidth } = props;

  const days = differenceInDays(stopDate!, startDate!) + 1;
  const months = differenceInMonths(stopDate!, startDate!) + 1;
  const weeks = Math.ceil(days / 7);

  const monthScale = range(0, months).map((month) => {
    const monthDate = addMonths(startDate!, month);
    const monthStart = max([startDate, startOfMonth(monthDate!)]);
    const monthEnd = min([startOfMonth(addMonths(monthStart!, 1)), stopDate]);

    const displayedDays = min([
      getDaysInMonth(monthDate),
      differenceInDays(monthEnd!, monthStart!),
    ]);

    return (
      <div
        title={format(monthDate, "MMMM, y")}
        key={month}
        style={{ width: dayWidth * displayedDays! }}
        className="relative flex h-full flex-row items-center text-xs"
      >
        <div className="sticky left-36 truncate pl-2">
          {format(monthDate, "MMMM, y")}
        </div>
      </div>
    );
  });

  if (timeScale === "day") {
    return (
      <div className="flex flex-col">
        <div className="flex flex-1 flex-row justify-start divide-x border-b font-medium text-gray-600">
          {monthScale}
        </div>
        <div className="flex flex-1 flex-row items-center justify-start divide-x text-gray-500">
          {range(0, days).map((day) => (
            <div
              key={day}
              style={{ width: dayWidth }}
              className="flex h-full flex-row items-center justify-center text-xs"
            >
              {format(addDays(startDate!, day), "EEEEEE dd")}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (timeScale === "week") {
    return (
      <div className="flex flex-col">
        <div className="flex flex-1 flex-row justify-start divide-x border-b font-medium text-gray-600">
          {monthScale}
        </div>
        <div className="flex flex-1 flex-row items-center justify-start divide-x text-gray-500">
          {range(0, weeks).map((week) => {
            const start = max([
              startDate,
              startOfWeek(addDays(startDate, week * 7)),
            ]);
            const end = min([
              stopDate,
              startOfWeek(addDays(startDate, (week + 1) * 7)),
            ]);

            const period = differenceInDays(end!, start!);

            return (
              <div
                key={week}
                title={`from ${format(start!, "EEEE MMMM dd y")} to ${format(
                  addDays(end!, -1),
                  "EEEE MMMM dd y"
                )} (included)`}
                style={{ width: dayWidth * period }}
                className="flex h-full flex-row items-center justify-center truncate text-xs"
              >
                {format(start!, "EEE dd ")}-
                {format(addDays(end!, -1), " EEE dd")}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 flex-row justify-start divide-x border-b font-medium text-gray-600">
        {monthScale}
      </div>
      <div className="flex flex-1 flex-row items-center justify-start divide-x text-gray-500">
        {range(0, weeks).map((week) => {
          const start = max([
            startDate,
            startOfWeek(addDays(startDate, week * 7)),
          ]);
          const end = min([
            stopDate,
            startOfWeek(addDays(startDate, (week + 1) * 7)),
          ]);

          const period = differenceInDays(end!, start!);

          return (
            <div
              key={week}
              title={`from ${format(start!, "EEEE MMMM dd y")} to ${format(
                addDays(end!, -1),
                "EEEE MMMM dd y"
              )} (included)`}
              style={{ width: dayWidth * period }}
              className="flex h-full flex-row items-center justify-center truncate text-xs"
            >
              {format(start!, "'W-'w")}
            </div>
          );
        })}
      </div>
    </div>
  );
};
