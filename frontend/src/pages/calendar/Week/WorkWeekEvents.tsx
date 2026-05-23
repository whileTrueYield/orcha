import {
  addDays,
  addSeconds,
  differenceInMinutes,
  differenceInSeconds,
  format,
  startOfDay,
  subWeeks,
} from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { ceil, floor } from "lodash";
import React, { ReactNode } from "react";
import { WorkWeekTime, RoleWorkDay } from "types/graphql";
import { getColStart, splitDates } from "./utils";

interface Props {
  workweek: WorkWeekTime;
  timezone: string;
  onClick: (startAt: Date, boundaries: [Date, Date]) => void;
  period: { fromDate: Date; toDate: Date };
}

// convert the work hours "08:00", "12:00"... into date for the current calendar day
const workHoursToDates = (
  workHour: RoleWorkDay,
  timeZone: string,
  date: string
): [Date, Date] => {
  const { startTime, stopTime } = workHour;
  const startAt = zonedTimeToUtc(date + "T" + startTime, timeZone);
  const stopAt = zonedTimeToUtc(date + "T" + stopTime, timeZone);

  return [startAt, stopAt];
};

export const WorkWeekToEvent: React.FC<Props> = (props) => {
  const { timezone, workweek, period, onClick } = props;

  const renderWorkPeriod =
    (shift: number) =>
    (workHours: RoleWorkDay): ReactNode[] => {
      const nodes: ReactNode[] = [];
      const [startAt, stopAt] = workHoursToDates(
        workHours,
        timezone,
        format(addDays(period.fromDate, shift), "yyyy-MM-dd")
      );

      for (const [startTime, stopTime] of splitDates(startAt, stopAt)) {
        if (stopTime < period.fromDate) {
          continue;
        }

        if (startTime > period.toDate) {
          continue;
        }

        nodes.push(
          <WorkBlock
            key={startTime.toISOString()}
            period={period}
            startTime={startTime}
            stopTime={stopTime}
            onClick={(startAt) => onClick(startAt, [startTime, stopTime])}
          />
        );
      }

      return nodes;
    };

  // notice the additional Saturday and Sunday around the week,
  // (9 days) to ensure we'll display the work hours in all possible
  // timezones that would otherwise truncate the week when
  // a workday is defined during the weekend
  return (
    <>
      {workweek.saturday.map(renderWorkPeriod(-1))}
      {workweek.sunday.map(renderWorkPeriod(0))}
      {workweek.monday.map(renderWorkPeriod(1))}
      {workweek.tuesday.map(renderWorkPeriod(2))}
      {workweek.wednesday.map(renderWorkPeriod(3))}
      {workweek.thursday.map(renderWorkPeriod(4))}
      {workweek.friday.map(renderWorkPeriod(5))}
      {workweek.saturday.map(renderWorkPeriod(6))}
      {workweek.sunday.map(renderWorkPeriod(7))}
    </>
  );
};

interface WorkBlockProps {
  startTime: Date;
  stopTime: Date;
  onClick: (startAt: Date) => void;
  period: { fromDate: Date; toDate: Date };
}
const WorkBlock: React.FC<WorkBlockProps> = (props) => {
  const todayStartOfDay = startOfDay(props.startTime);

  // allow click to create event only up to 4 weeks in the past and
  // not in the future
  const canClickToCreateEvent =
    props.startTime < new Date() && props.stopTime > subWeeks(new Date(), 4);

  if (props.stopTime < props.period.fromDate) {
    return null;
  }

  if (props.startTime > props.period.toDate) {
    return null;
  }

  const gridStart = floor(
    differenceInMinutes(props.startTime, todayStartOfDay) / 5
  );
  const gridEnd = ceil(
    differenceInMinutes(props.stopTime, todayStartOfDay) / 5
  );

  const colStart = getColStart(format(props.startTime, "c"));

  // We transform the pixel position of the click into an absolute time value
  const onClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const { top, bottom } = event.currentTarget.getBoundingClientRect();
    const relativeValue = (event.clientY - top) / (bottom - top);
    const periodLength = differenceInSeconds(props.stopTime, props.startTime);

    const startTime = addSeconds(props.startTime, periodLength * relativeValue);
    props.onClick(startTime);
  };

  if (canClickToCreateEvent) {
    return (
      <li
        key={props.startTime.toISOString()}
        className={`relative mt-px hidden select-none ${colStart} sm:flex`}
        style={{
          gridRow: `${gridStart + 2} / span ${gridEnd - gridStart || 1}`,
        }}
        onClick={onClick}
      >
        <div className="group absolute inset-2 inset-y-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 bg-opacity-25 px-2 leading-5 hover:border-gray-300 hover:bg-gray-300 hover:bg-opacity-25">
          <span className="absolute top-1/2 left-2 right-2 -mt-2 h-4 text-center text-sm font-medium text-gray-500 opacity-0 group-hover:opacity-100">
            Click to add
          </span>
        </div>
      </li>
    );
  }

  return (
    <li
      key={props.startTime.toISOString()}
      className={`relative mt-px hidden select-none ${colStart} sm:flex`}
      style={{
        gridRow: `${gridStart + 2} / span ${gridEnd - gridStart || 1}`,
      }}
    >
      <div className="group absolute inset-2 inset-y-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-100 bg-opacity-25 px-2 leading-5"></div>
    </li>
  );
};
