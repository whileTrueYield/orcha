import { WeeklyCalendarItem } from "components/WeeklySchedule";
import { Role } from "types/graphql";

export const getWeeklyCalendarHours = (
  workTimes: WeeklyCalendarItem[]
): number => {
  let hours = 0;
  for (const { startEpoch, stopEpoch } of workTimes) {
    const msDelta = stopEpoch - startEpoch;
    hours += msDelta / 3600;
  }

  return hours;
};

export const getRoleWorkWeekHours = (role: Role): number => {
  let hours = 0;

  for (const workWeekTime of role.workWeek.monday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.tuesday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.wednesday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.thursday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.friday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.saturday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  for (const workWeekTime of role.workWeek.sunday) {
    const msDelta =
      new Date("1970-01-01T" + workWeekTime.stopTime).getTime() -
      new Date("1970-01-01T" + workWeekTime.startTime).getTime();
    hours += msDelta / (3600 * 1000);
  }

  return hours;
};
