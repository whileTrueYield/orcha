import { groupBy, sortBy, trim } from "lodash";
import { RoleWorkDay } from "types/graphql";
import { WeeklyCalendarItem } from "../components/WeeklySchedule/types";
import { format } from "date-fns";

export function converTimeToEpoch(time: string): number {
  const [hours, minutes] = parseTime(time);
  return hours * 3600 + minutes * 60;
}

export function formatTime(hour: number, minute: number): string {
  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");
  return `${hourStr}:${minuteStr}`;
}

export function mergeOverlapingCalenderItem(
  items: WeeklyCalendarItem[]
): WeeklyCalendarItem[] {
  const itemGroupByDays = groupBy(items, "dayOfTheWeek");
  const mergedItems: WeeklyCalendarItem[] = [];

  for (const day in itemGroupByDays) {
    const dailyItems = sortBy(itemGroupByDays[day], "startEpoch");

    mergedItems.push(dailyItems[0]);
    for (const dailyItem of dailyItems.slice(1)) {
      const lastItem = mergedItems[mergedItems.length - 1];
      if (dailyItem.startEpoch > lastItem.stopEpoch) {
        mergedItems.push(dailyItem);
      } else if (dailyItem.stopEpoch > lastItem.stopEpoch) {
        // otherwise merge the times
        lastItem.stopEpoch = dailyItem.stopEpoch;
        lastItem.stopTime = dailyItem.stopTime;
      }
    }
  }

  return mergedItems;
}

export const validateTimeString = (value: string = ""): boolean => {
  try {
    const [hours, minutes] = parseTime(value);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  } catch {
    return false;
  }
};

export const parseTime = (value: string): [number, number] => {
  value = trim(value).toLowerCase();

  const isAM = /(am)/.test(value);
  const isPM = /(pm)/.test(value);
  let isMilitary = !isAM && !isPM;

  value = value + ":00";
  let [hours, minutes] = value.split(":").map((x) => parseInt(x));

  if (isNaN(minutes)) {
    minutes = 0;
  }

  if (minutes > 59) {
    minutes = 0;
  }

  if (isNaN(hours)) {
    hours = 0;
  }

  // AM / PM does not go beyond 12, we'll assume we were given military time
  if (hours > 12) {
    isMilitary = true;
  }

  if (hours > 23) {
    hours = 0;
  }

  // the last check is for 12PM which means noon
  if (isMilitary || isAM || hours === 12) {
    return [hours, minutes];
  } else {
    return [hours + 12, minutes];
  }
};

export const formatToLocalTime = (value: string = ""): string => {
  const [hrs, mins] = parseTime(value);

  return format(
    new Date(
      `2020-01-02T${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:00`
    ),
    "p"
  );
};

/**
 * Convert a local time (e.g. 2am) to a string in the format of "HH:MM"
 */
export const parsedTimeToMilitaryTime = (value: string): string => {
  const [hrs, mins] = parseTime(value);
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
};

export const toCalendarItem = (
  day: string,
  time: RoleWorkDay
): WeeklyCalendarItem => {
  return {
    dayOfTheWeek: day,
    startTime: parsedTimeToMilitaryTime(time.startTime),
    stopTime: parsedTimeToMilitaryTime(time.stopTime),
    startEpoch: converTimeToEpoch(time.startTime),
    stopEpoch: converTimeToEpoch(time.stopTime),
  };
};

export const transformToDate = (hours: number, minutes: number): Date => {
  const hourStr = hours.toString().padStart(2, "0");
  const minStr = minutes.toString().padStart(2, "0");
  return new Date(`2020-01-02T${hourStr}:${minStr}:00`);
};

/**
 * Transforms a military time string to epoch time in seconds from midnight
 * @param value military time string like "12:00" or "23:59"
 * @returns
 */
export const militaryTimeToEpoch = (value: string): number => {
  const [hrs, mins] = parseTime(value);
  return hrs * 3600 + mins * 60;
};
