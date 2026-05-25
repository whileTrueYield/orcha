/**
 * BlackoutTime and RecurringBlackoutTime Pothos type definitions,
 * plus pure utility functions for generating and merging time-off intervals.
 *
 * Exports:
 *  - BlackoutTimeRef: prismaObject for BlackoutTime
 *  - RecurringBlackoutTimeRef: prismaObject for RecurringBlackoutTime
 *  - PaginatedBlackoutTimes / PaginatedRecurringBlackoutTimes
 *  - generateTimeOffsFromRecurringBlackoutTime / mergeTimeOffs: pure logic
 */

import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import { addDays } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { get, sortBy } from "lodash";

// ---------------------------------------------------------------------------
// BlackoutTime prismaObject
// ---------------------------------------------------------------------------

export const BlackoutTimeRef = builder.prismaObject("BlackoutTime", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    startAt: t.expose("startAt", { type: "DateTime" }),
    stopAt: t.expose("stopAt", { type: "DateTime" }),
    disabled: t.exposeBoolean("disabled"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    roles: t.relation("roles"),
  }),
});

// ---------------------------------------------------------------------------
// RecurringBlackoutTime prismaObject
// ---------------------------------------------------------------------------

export const RecurringBlackoutTimeRef = builder.prismaObject("RecurringBlackoutTime", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    startTime: t.exposeString("startTime"),
    stopTime: t.exposeString("stopTime"),
    timeZone: t.exposeString("timeZone"),
    disabled: t.exposeBoolean("disabled"),
    name: t.exposeString("name"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    monday: t.exposeBoolean("monday"),
    tuesday: t.exposeBoolean("tuesday"),
    wednesday: t.exposeBoolean("wednesday"),
    thursday: t.exposeBoolean("thursday"),
    friday: t.exposeBoolean("friday"),
    saturday: t.exposeBoolean("saturday"),
    sunday: t.exposeBoolean("sunday"),
    organizationId: t.exposeInt("organizationId"),
    organization: t.relation("organization"),
    roles: t.relation("roles"),
  }),
});

// ---------------------------------------------------------------------------
// Paginated types
// ---------------------------------------------------------------------------

export const PaginatedBlackoutTimes = createPaginatedType("BlackoutTimes", BlackoutTimeRef);
export const PaginatedRecurringBlackoutTimes = createPaginatedType(
  "RecurringBlackoutTimes",
  RecurringBlackoutTimeRef,
);

// ---------------------------------------------------------------------------
// Pure utility: generate time-off intervals from recurring blackout times
// ---------------------------------------------------------------------------

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function generateTimeOffsFromRecurringBlackoutTime(
  rbots: any[],
  fromDate: Date,
  untilDate: Date,
): Array<[number, number]> {
  const blackoutTimes: [number, number][] = [];

  for (const rbot of rbots) {
    let cursor = new Date(fromDate);
    while (cursor < untilDate) {
      const dayPart = cursor.toISOString().split("T")[0];
      cursor = addDays(cursor, 1);

      const dayOfWeek = new Date(`${dayPart}T${rbot.startTime}`).getDay();
      if (!get(rbot, daysOfWeek[dayOfWeek - 1])) {
        continue;
      }

      const zonedStart = zonedTimeToUtc(
        `${dayPart}T${rbot.startTime}`,
        rbot.timeZone,
      );
      const zonedStop = zonedTimeToUtc(
        `${dayPart}T${rbot.stopTime}`,
        rbot.timeZone,
      );

      blackoutTimes.push([
        Math.round(zonedStart.getTime() / 1000),
        Math.round(zonedStop.getTime() / 1000),
      ]);
    }
  }

  return blackoutTimes;
}

// ---------------------------------------------------------------------------
// Pure utility: merge overlapping time-off intervals
// ---------------------------------------------------------------------------

export function mergeTimeOffs(
  timeOffs: Array<[number, number]>,
): Array<[number, number]> {
  const mergedTimeOffs: Array<[number, number]> = [];
  const sortedTimeOffs = sortBy(timeOffs, ([start]) => start);
  for (const timeOff of sortedTimeOffs) {
    const [start, stop] = timeOff;

    if (mergedTimeOffs.length) {
      const last = mergedTimeOffs[mergedTimeOffs.length - 1];
      const [lastStart, lastStop] = last;
      if (start <= lastStop && stop >= lastStart) {
        last[0] = lastStart < start ? lastStart : start;
        last[1] = lastStop > stop ? lastStop : stop;
      } else {
        mergedTimeOffs.push(timeOff);
      }
    } else {
      mergedTimeOffs.push(timeOff);
    }
  }

  return mergedTimeOffs;
}
