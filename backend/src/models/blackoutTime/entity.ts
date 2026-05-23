import { Field, ObjectType } from "type-graphql";
import { PaginatedNodes } from "../../utils/pagination";
import { BlackoutTime, RecurringBlackoutTime } from "@generated/type-graphql";
import { addDays } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { get, sortBy } from "lodash";

@ObjectType()
export class PaginatedBlackoutTimes extends PaginatedNodes {
  @Field(() => [BlackoutTime])
  nodes: BlackoutTime[];
}

@ObjectType()
export class PaginatedRecurringBlackoutTimes extends PaginatedNodes {
  @Field(() => [RecurringBlackoutTime])
  nodes: RecurringBlackoutTime[];
}

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// function generating scheduled off time based on a recurring blackout time
// for the next 2 years
export function generateTimeOffsFromRecurringBlackoutTime(
  rbots: RecurringBlackoutTime[],
  fromDate: Date,
  untilDate: Date
): Array<[number, number]> {
  const blackoutTimes: [number, number][] = [];

  for (const rbot of rbots) {
    let cursor = new Date(fromDate);
    while (cursor < untilDate) {
      const dayPart = cursor.toISOString().split("T")[0];
      cursor = addDays(cursor, 1);

      // only account for days of week that are enabled
      const dayOfWeek = new Date(`${dayPart}T${rbot.startTime}`).getDay();
      if (!get(rbot, daysOfWeek[dayOfWeek - 1])) {
        continue;
      }

      // compute start and stop time into UTC using the recurring blackout time's timezone
      const zonedStart = zonedTimeToUtc(
        `${dayPart}T${rbot.startTime}`,
        rbot.timeZone
      );
      const zonedStop = zonedTimeToUtc(
        `${dayPart}T${rbot.stopTime}`,
        rbot.timeZone
      );

      blackoutTimes.push([
        Math.round(zonedStart.getTime() / 1000),
        Math.round(zonedStop.getTime() / 1000),
      ]);
    }
  }

  return blackoutTimes;
}

/**
 * Merge overlapping time offs into one
 * @param timeOffs
 * @returns
 */
export function mergeTimeOffs(
  timeOffs: Array<[number, number]>
): Array<[number, number]> {
  const mergedTimeOffs: Array<[number, number]> = [];
  const sortedTimeOffs = sortBy(timeOffs, ([start]) => start);
  for (const timeOff of sortedTimeOffs) {
    const [start, stop] = timeOff;

    if (mergedTimeOffs.length) {
      const last = mergedTimeOffs[mergedTimeOffs.length - 1];
      const [lastStart, lastStop] = last;
      // is there an overlap with the previous recorded time off
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
