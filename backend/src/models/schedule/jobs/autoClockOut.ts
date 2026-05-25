import prisma from "../../../prisma";
import { Role } from "@prisma/client";
import { EMPTY_WORK_WEEK, WorkWeekTime } from "../../entities";
import { TzCalendar } from "../../../utils/calendar";
import { zonedTimeToUtc } from "date-fns-tz";
import { forEach } from "lodash";
import { addMilliseconds, subMilliseconds } from "date-fns";
import { pushNotifyRole } from "../../../notifications/endpoints";
import { logger } from "../../../logger";
import { getWorkPeriodAt } from "../helper";

const OFF_WORK_TIME_BLOCK = 3600 * 2 * 1000;

const getWorkWeek = (role: Role): WorkWeekTime => {
  if (role.workWeek) {
    return { ...EMPTY_WORK_WEEK, ...JSON.parse(role.workWeek) };
  } else {
    return EMPTY_WORK_WEEK;
  }
};

export const isWorkWeekEmpty = (workWeek: WorkWeekTime | string): boolean => {
  let isEmpty = true;

  const workWeekJSON: WorkWeekTime =
    typeof workWeek === "string"
      ? {
          ...EMPTY_WORK_WEEK,
          ...JSON.parse(workWeek),
        }
      : workWeek;

  forEach(workWeekJSON, (workWeekDay) => {
    if (workWeekDay.length > 0) {
      isEmpty = false;
    }
  });

  return isEmpty;
};

const getWorkPeriodAfter = (
  workWeek: WorkWeekTime,
  timeZone: string,
  date: Date
): [Date, Date] | null => {
  const calendar = new TzCalendar(date.toISOString(), timeZone);

  if (isWorkWeekEmpty(workWeek)) {
    return null;
  }

  while (true) {
    const dayName = calendar.getWeekDayName();
    const isWorkDay = dayName in workWeek && workWeek[dayName].length > 0;

    if (isWorkDay) {
      for (const { startTime, stopTime } of workWeek[dayName]) {
        const startDate = zonedTimeToUtc(
          `${calendar.getDate()}T${startTime}`,
          timeZone
        );
        const stopDate = zonedTimeToUtc(
          `${calendar.getDate()}T${stopTime}`,
          timeZone
        );

        if (date < startDate) {
          return [startDate, stopDate];
        }
      }
    }

    calendar.addDays(1);
  }
};

/**
 * Find all open schedule items and close them if necessary.
 *
 * If the schedule item was started OUTSIDE a work period we'll
 * close it if two hours (see the OFF_WORK_TIME_BLOCK constant)
 * after it's start it does not end on a work period.
 *
 * If the schedule item was started INSIDE a work period we'll
 * close it at the end of the work period (if this date is in the past)
 */
export async function autoClockOut() {
  const now = new Date();

  const openScheduleItems = await prisma.scheduleItem.findMany({
    where: {
      stoppedAt: null,
    },
    include: {
      role: true,
    },
  });

  // we won't process out of work period bigger than our lower limit
  const lowerLimit = subMilliseconds(now, OFF_WORK_TIME_BLOCK);

  for (const scheduleItem of openScheduleItems) {
    // if the user extended the work time, we'll use that as a start time
    // this will push back the next reminder to two hours
    const startedAt = scheduleItem.extendedAt
      ? scheduleItem.extendedAt
      : scheduleItem.startedAt;

    const workWeek = getWorkWeek(scheduleItem.role);
    const workPeriod = getWorkPeriodAt(
      workWeek,
      scheduleItem.role.timeZone,
      startedAt
    );

    // first case, work was started in period and the period end
    // is in the past: we are closing the item at the end of the period
    if (workPeriod) {
      if (workPeriod[1] < now) {
        logger.info("in period, closing work at period end", {
          startedAt: startedAt,
          endedAt: workPeriod[1],
        });

        await prisma.scheduleItem.update({
          where: {
            id: scheduleItem.id,
          },
          data: {
            stoppedAt: workPeriod[1],
            autoStopped: true,
          },
        });

        await pushNotifyRole(
          scheduleItem.roleId,
          scheduleItem.organizationId,
          "WORK_STOP",
          "Are you still working on that?"
        );
      }
    } else if (startedAt < lowerLimit) {
      const upperLimit = addMilliseconds(startedAt, OFF_WORK_TIME_BLOCK);
      const workPeriodAfter = getWorkPeriodAfter(
        workWeek,
        scheduleItem.role.timeZone,
        startedAt
      );

      if (workPeriodAfter) {
        if (workPeriodAfter[0] > upperLimit) {
          logger.info(
            "outside work period, next work period starts after upper limit, closing work at upper limit",
            {
              startedAt: startedAt,
              endedAt: workPeriodAfter[1],
              roleId: scheduleItem.roleId,
              nextWorkPeriod: workPeriodAfter,
              upperLimit,
            }
          );
          await prisma.scheduleItem.update({
            where: {
              id: scheduleItem.id,
            },
            data: {
              stoppedAt: upperLimit,
              autoStopped: true,
            },
          });

          await pushNotifyRole(
            scheduleItem.roleId,
            scheduleItem.organizationId,
            "WORK_STOP",
            "Are you still working on that?"
          );
        } else if (workPeriodAfter[1] < now) {
          logger.info(
            "outside work period, next work period stops in the past, closing work at period end",
            {
              startedAt: startedAt,
              endedAt: workPeriodAfter[1],
              roleId: scheduleItem.roleId,
              nextWorkPeriod: workPeriodAfter,
              upperLimit,
            }
          );
          await prisma.scheduleItem.update({
            where: {
              id: scheduleItem.id,
            },
            data: {
              stoppedAt: workPeriodAfter[1],
              autoStopped: true,
            },
          });

          await pushNotifyRole(
            scheduleItem.roleId,
            scheduleItem.organizationId,
            "WORK_STOP",
            "Are you still working on that?"
          );
        } else if (workPeriodAfter[0] <= upperLimit) {
          logger.info(
            "outside work period but next work period start is in range, nothing to do",
            {
              startedAt: startedAt,
              endedAt: workPeriodAfter[0],
              roleId: scheduleItem.roleId,
              nextWorkPeriod: workPeriodAfter,
              upperLimit,
            }
          );
        } else {
          logger.info(
            "outside work period, next work period too far, closing at limit",
            {
              startedAt: startedAt,
              endedAt: upperLimit,
              roleId: scheduleItem.roleId,
              nextWorkPeriod: workPeriodAfter,
              upperLimit,
            }
          );

          await prisma.scheduleItem.update({
            where: {
              id: scheduleItem.id,
            },
            data: {
              stoppedAt: upperLimit,
              autoStopped: true,
            },
          });

          await pushNotifyRole(
            scheduleItem.roleId,
            scheduleItem.organizationId,
            "WORK_STOP",
            "Are you still working on that?"
          );
        }
      } else {
        logger.info(
          "outside work period, no next work period found, closing at limit",
          {
            startedAt: startedAt,
            endedAt: upperLimit,
            roleId: scheduleItem.roleId,
            nextWorkPeriod: workPeriodAfter,
            upperLimit,
          }
        );

        await prisma.scheduleItem.update({
          where: {
            id: scheduleItem.id,
          },
          data: {
            stoppedAt: upperLimit,
            autoStopped: true,
          },
        });

        await pushNotifyRole(
          scheduleItem.roleId,
          scheduleItem.organizationId,
          "WORK_STOP",
          "Are you still working on that?"
        );
      }
    }
  }
}
