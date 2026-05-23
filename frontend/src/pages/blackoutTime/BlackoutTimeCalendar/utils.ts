import { WeeklyCalendarEvent } from "components/WeekCalendar";
import {
  addDays,
  addSeconds,
  differenceInMinutes,
  endOfDay,
  startOfDay,
} from "date-fns";
import { utcToZonedTime, zonedTimeToUtc, format } from "date-fns-tz";
import { get } from "lodash";
import { RecurringBlackoutTime } from "types/graphql";
import { militaryTimeToEpoch } from "utils/time";

const dayOfTheWeek: { [id: string]: string } = {
  "1": "monday",
  "2": "tuesday",
  "3": "wednesday",
  "4": "thursday",
  "5": "friday",
  "6": "saturday",
  "7": "sunday",
};

/**
 * Extrapolate events from a recurring blackout time
 *
 * This one is tricky as it needs to take in consideration the
 * viewer's timezone and the blackout time timezone, and split
 * events when they cross the end or the beginning of a day.
 *
 * @param blackoutTime
 * @param date
 * @param timeZone
 * @returns
 */
export const recurringBlackoutTimeToCalendarEvents = (
  blackoutTime: RecurringBlackoutTime,
  fromDate: Date,
  toDate: Date,
  className?: string,
): WeeklyCalendarEvent[] => {
  const events: WeeklyCalendarEvent[] = [];

  let cursor = addDays(fromDate, -1);

  while (cursor < addDays(toDate, 1)) {
    const dow =
      dayOfTheWeek[format(utcToZonedTime(cursor, blackoutTime.timeZone), "i")];

    if (get(blackoutTime, dow)) {
      const zonedStart = calcZonedDate(
        cursor,
        blackoutTime.timeZone,
        startOfDay,
      );

      // Compute the start time within the blackout time timezone
      const startTime = new Date(
        zonedStart.getTime() +
          militaryTimeToEpoch(blackoutTime.startTime) * 1000,
      );

      // Compute the stop time within the blackout time timezone
      const stopTime = new Date(
        zonedStart.getTime() +
          militaryTimeToEpoch(blackoutTime.stopTime) * 1000,
      );

      events.push(
        ...divideEvent(
          {
            id: blackoutTime.id,
            type: "RecurringBlackoutTime",
            startDate: startTime,
            stopDate: stopTime,
            name: blackoutTime.name,
            className,
          },
          {
            min: startOfDay(cursor),
            max: endOfDay(cursor),
          },
        ),
      );
    }

    cursor = addDays(cursor, 1);
  }

  // return the events that only match our upper and lower boundaries and
  // where the difference between the start and stop date is greater than 5 minutes
  return events.filter((event) => {
    return (
      event.startDate >= fromDate &&
      event.stopDate <= toDate &&
      differenceInMinutes(event.stopDate, event.startDate) > 5
    );
  });
};

/** recursive method that divides event in smaller event when it crosses the given boundaries */
export const divideEvent = (
  event: WeeklyCalendarEvent,
  boundaries: { min: Date; max: Date },
): WeeklyCalendarEvent[] => {
  // the whole event is within the boundaries, we can return it as is
  if (event.startDate >= boundaries.min && event.startDate <= boundaries.max) {
    return [event];
  }
  // the whole event is after the boundaries, we can return it as is
  if (event.startDate > boundaries.max) {
    return [event];
  }
  // the whole event is before the boundaries, we can return it as is
  if (event.stopDate < boundaries.min) {
    return [event];
  }

  // the event is crossing the boundaries, we need to split it
  if (event.startDate < boundaries.min) {
    return [
      { ...event, stopDate: addSeconds(boundaries.min, -1) },
      { ...event, startDate: boundaries.min },
    ];
  }

  if (event.stopDate > boundaries.max) {
    return [
      { ...event, stopDate: boundaries.max },
      { ...event, startDate: addSeconds(boundaries.max, 1) },
    ];
  }

  throw new Error("This should never happen");
};

const calcZonedDate = (
  date: Date,
  timeZone: string,
  fn: (date: Date, option?: any) => any,
  options = null,
) => {
  const inputZoned = utcToZonedTime(date, timeZone);
  const fnZoned = options ? fn(inputZoned, options) : fn(inputZoned);
  return zonedTimeToUtc(fnZoned, timeZone);
};
