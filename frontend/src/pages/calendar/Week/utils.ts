import { addSeconds, endOfDay } from "date-fns";
import { ScheduleItem } from "types/graphql";

/**
 * When a schedule item happens in widely different timezone, or if workfing
 * very late, the start and end date could be happening on different days.
 * This will split the event in two (or more) at the local midnight mark.
 * @param item
 * @returns
 */
export const splitScheduleItem = (item: ScheduleItem): ScheduleItem[] => {
  const midnight = endOfDay(new Date(item.startedAt));
  const stoppedAt = item.stoppedAt || new Date().toISOString();

  if (stoppedAt > midnight.toISOString()) {
    return [
      {
        ...item,
        stoppedAt: midnight.toISOString(),
      },
      ...splitScheduleItem({
        ...item,
        startedAt: addSeconds(midnight, 1).toISOString(),
      }),
    ];
  } else {
    return [item];
  }
};

export const splitDates = (startAt: Date, stopAt: Date): [Date, Date][] => {
  const midnight = endOfDay(new Date(startAt));

  if (stopAt > midnight) {
    return [
      [startAt, midnight],
      ...splitDates(addSeconds(midnight, 1), stopAt),
    ];
  } else {
    return [[startAt, stopAt]];
  }
};

export const getColStart = (dayOfTheWeek: string): string => {
  switch (dayOfTheWeek) {
    case "1":
      return "sm:col-start-1";
    case "2":
      return "sm:col-start-2";
    case "3":
      return "sm:col-start-3";
    case "4":
      return "sm:col-start-4";
    case "5":
      return "sm:col-start-5";
    case "6":
      return "sm:col-start-6";
    case "7":
      return "sm:col-start-7";
    default:
      return "";
  }
};

export const getColStartFromDayName = (dayOfTheWeek: string): string => {
  switch (dayOfTheWeek) {
    case "sunday":
      return "sm:col-start-1";
    case "monday":
      return "sm:col-start-2";
    case "tuesday":
      return "sm:col-start-3";
    case "wednesday":
      return "sm:col-start-4";
    case "thursday":
      return "sm:col-start-5";
    case "friday":
      return "sm:col-start-6";
    case "saturday":
      return "sm:col-start-7";
    default:
      return "";
  }
};
