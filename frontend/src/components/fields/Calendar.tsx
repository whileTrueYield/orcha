import React, { useState } from "react";
import {
  startOfWeek,
  startOfMonth,
  format,
  addDays,
  addMonths,
  addYears,
  startOfDay,
  isEqual,
  isSameDay,
} from "date-fns";
import { flatten, map, range } from "lodash";
import cn from "classnames";
import {
  ChevronDoubleRightIcon,
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid";

interface Props {
  onChange: (value: Date | null) => void;
  value: Date | null;
  secondaryDate?: Date | null;
  className?: string;
  showFooterButtons?: boolean;
  maxDate?: Date | null;
  minDate?: Date | null;
  yearButtons?: boolean;
}

function isValidDate(d: any) {
  return d instanceof Date && !isNaN(d as any);
}

export const Calendar: React.FC<Props> = (props) => {
  const { secondaryDate, showFooterButtons, minDate, maxDate, yearButtons } =
    props;
  const value = isValidDate(props.value) ? props.value : null;
  const today = startOfDay(new Date());
  const [current, setCurrent] = useState(
    startOfMonth(value ? new Date(value) : new Date())
  );

  const [previousValue, setPreviousValue] = useState(props.value);
  if (previousValue !== props.value) {
    setPreviousValue(props.value);
    if (isValidDate(value)) {
      setCurrent(startOfMonth(value!));
    } else {
      setCurrent(startOfMonth(new Date()));
    }
  }

  const onChange = (date: Date | null) => {
    props.onChange(date);
    setCurrent(startOfMonth(date ? new Date(date) : new Date()));
  };

  const calendarFirstDay = startOfWeek(current);

  const isZoned = (date: Date): boolean => {
    if (secondaryDate && value) {
      return value > secondaryDate
        ? secondaryDate <= date && date < value
        : value < date && date <= secondaryDate;
    }
    return false;
  };

  const isDisabled = (date: Date): boolean => {
    if (maxDate) {
      return date > maxDate;
    }
    if (minDate) {
      return date < minDate;
    }
    return false;
  };

  const isToday = (date: Date): boolean => {
    return isEqual(today, date);
  };

  const renderDay = (cursor: Date): React.ReactElement => {
    const sameMonth = cursor.getMonth() === current.getMonth();
    const sameDay = value && isSameDay(cursor, value);
    const disabled = isDisabled(cursor);
    const className = cn(
      "h-8 w-8 text-sm flex justify-center items-center font-medium",
      {
        "hover:rounded-md hover:bg-brand-500 hover:text-white hover:border hover:border-brand-500":
          !disabled && !sameDay,
        "text-gray-400 bg-gray-100 rounded cursor-not-allowed": disabled,
        "text-gray-700": sameMonth && !sameDay,
        "text-gray-400": !sameMonth && !sameDay,
        "font-medium": !sameDay,
        "rounded-md bg-brand-500 text-white": sameDay,
        "rounded-md border-2 border-brand-200 bg-brand-100": isZoned(cursor),
        "rounded-full border-2 border-brand-200 text-brand-400":
          isToday(cursor) && !sameDay && !isZoned(cursor),
      }
    );

    return (
      <button
        type="button"
        key={cursor.toISOString()}
        className={className}
        onClick={() => onChange(cursor)}
        disabled={disabled}
      >
        {format(cursor, "d")}
      </button>
    );
  };

  const renderWeek = (cursor: Date): React.ReactElement[] => {
    return map(range(0, 7), (days) => renderDay(addDays(cursor, days)));
  };

  const renderWeeks = () => {
    let cursor = startOfWeek(current);

    const weeks = [renderWeek(cursor)];
    cursor = addDays(cursor, 7);

    while (cursor.getMonth() === current.getMonth()) {
      weeks.push(renderWeek(cursor));
      cursor = addDays(cursor, 7);
    }

    return flatten(weeks);
  };

  const className = cn(
    "bg-white grid gap-1 grid-cols-7 rounded-md",
    props.className
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={className}
      style={{ minWidth: "17rem" }}
    >
      <div className="col-span-7 flex items-center justify-between py-2 text-sm font-semibold text-gray-500">
        <div className="flex space-x-1">
          {yearButtons && (
            <button
              onClick={() => setCurrent(addYears(current, -1))}
              type="button"
              className="rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-brand-500 hover:bg-brand-400 hover:text-white"
            >
              <ChevronDoubleLeftIcon className="h-6 w-6 p-0.5" />
            </button>
          )}
          <button
            onClick={() => setCurrent(addMonths(current, -1))}
            type="button"
            className="rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-brand-500 hover:bg-brand-400 hover:text-white"
          >
            <ChevronLeftIcon className="h-6 w-6 p-0.5" />
          </button>
        </div>
        <div>{format(current, "LLLL, y")}</div>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrent(addMonths(current, 1))}
            type="button"
            className="rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-brand-500 hover:bg-brand-400 hover:text-white"
          >
            <ChevronRightIcon className="h-6 w-6 p-0.5" />
          </button>
          {yearButtons && (
            <button
              onClick={() => setCurrent(addYears(current, 1))}
              type="button"
              className="rounded-md border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-brand-500 hover:bg-brand-400 hover:text-white"
            >
              <ChevronDoubleRightIcon className="h-6 w-6 p-0.5" />
            </button>
          )}
        </div>
      </div>
      {map(range(0, 7), (days) => (
        <div
          key={days}
          className="text-center text-sm font-medium text-gray-400"
        >
          {format(addDays(calendarFirstDay, days), "eeeeee")}
        </div>
      ))}
      {renderWeeks()}
      {showFooterButtons ? (
        <div className="col-span-7 mt-2 flex items-center justify-between space-x-4 text-sm font-semibold text-gray-500">
          <button
            type="button"
            className="felx-row flex rounded-md bg-gray-100 py-1 px-2 text-sm font-medium text-gray-600 hover:bg-brand-500 hover:text-white"
            onClick={() => onChange(startOfDay(new Date()))}
          >
            today
          </button>
          <button
            type="button"
            className="felx-row flex rounded-md bg-red-100 py-1 px-2 text-sm font-medium text-gray-600 hover:bg-red-500 hover:text-white"
            onClick={() => onChange(null)}
          >
            clear
          </button>
        </div>
      ) : null}
    </div>
  );
};
