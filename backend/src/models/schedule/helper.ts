import prisma from "../../prisma";
import { clamp, max, min } from "lodash";
import { ScheduleItem } from "@prisma/client";
import { GetPageArgsFor, paginateNodes } from "../../utils/pagination";
import { Prisma, ModelStage, TicketStatus } from ".prisma/client";
import { WorkWeekTime } from "../entities";
import { TzCalendar } from "../../utils/calendar";
import { zonedTimeToUtc } from "date-fns-tz";

interface GetPageArgs extends GetPageArgsFor<ScheduleItem> {
  ticketId?: number;
  roleId?: number;
  organizationId: number;
}

/**
 * Return a paginated set of schduleItems where the format
 * is normalized to maintain familiarity and functionality
 * when working with pages
 */
export async function getPaginatedScheduleItems(
  args: GetPageArgs
) {
  const { first, last, ticketId, organizationId, roleId } = args;

  // default offset to be at the start (or the end
  // depending on direction)
  const offset = args.offset ? args.offset : 0;

  // by default sort on createdAt
  const sort: keyof ScheduleItem = args.sort ? args.sort : "createdAt";

  // by default sort direction should be ascending
  const direction: Prisma.SortOrder = args.last
    ? Prisma.SortOrder.desc
    : Prisma.SortOrder.asc;

  // first (or last) X defines the number of item per page
  // the fallback is 10 if not provided
  const requestedPageSize = first || last || 10;
  const pageSize = clamp(requestedPageSize, 1, 50);

  const scheduleItemQuery: Prisma.ScheduleItemWhereInput = {
    organizationId,
  };

  if (roleId) {
    scheduleItemQuery.roleId = roleId;
  }

  if (ticketId) {
    scheduleItemQuery.ticketId = ticketId;
  }

  const scheduleItems = await prisma.scheduleItem.findMany({
    where: scheduleItemQuery,
    skip: offset,
    take: pageSize,
    orderBy: { [sort]: direction },
  });
  const count = await prisma.scheduleItem.count({ where: scheduleItemQuery });

  return paginateNodes({ nodes: scheduleItems, offset, pageSize, count });
}

export async function getMinStartDateForScheduleItem(
  scheduleItem: ScheduleItem
): Promise<Date | null> {
  // the last schedule item the current task owner did
  const myPreviousScheduleItem = await prisma.scheduleItem.findFirst({
    where: {
      roleId: scheduleItem.roleId,
      OR: [{ stoppedAt: { lte: scheduleItem.startedAt } }, { stoppedAt: null }],
      startedAt: { lt: scheduleItem.startedAt },
    },
    orderBy: {
      stoppedAt: "desc",
    },
  });

  // the last schedule item related to the same ticket but on a different workflow state
  const previousScheduleItem = await prisma.scheduleItem.findFirst({
    where: {
      ticketId: scheduleItem.ticketId,
      ticketWorkflowStateId: { not: scheduleItem.ticketWorkflowStateId },
      OR: [{ stoppedAt: { lte: scheduleItem.startedAt } }, { stoppedAt: null }],
      startedAt: { lt: scheduleItem.startedAt },
    },
    orderBy: {
      stoppedAt: "desc",
    },
  });

  // valid dates
  const dates: Date[] = [];

  if (myPreviousScheduleItem && myPreviousScheduleItem.stoppedAt) {
    // console.log(myPreviousScheduleItem.stoppedAt, scheduleItem.startedAt);
    dates.push(myPreviousScheduleItem.stoppedAt);
  }

  if (previousScheduleItem && previousScheduleItem.stoppedAt) {
    // console.log(previousScheduleItem.stoppedAt, scheduleItem.startedAt);
    dates.push(previousScheduleItem.stoppedAt);
  }

  if (dates.length) {
    // console.log(dates, max(dates));
    return max(dates) as Date;
  } else {
    return null;
  }
}

export async function getMaxStopDateForScheduleItem(
  scheduleItem: ScheduleItem
): Promise<Date> {
  if (!scheduleItem.stoppedAt) {
    return new Date();
  }

  // the next schedule item the current task owner did
  const myNextScheduleItem = await prisma.scheduleItem.findFirst({
    where: {
      roleId: scheduleItem.roleId,
      startedAt: { gte: scheduleItem.stoppedAt },
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  // the next schedule item related to the same ticket but on a different workflow state
  const nextScheduleItem = await prisma.scheduleItem.findFirst({
    where: {
      ticketId: scheduleItem.ticketId,
      ticketWorkflowStateId: { not: scheduleItem.ticketWorkflowStateId },
      startedAt: { gte: scheduleItem.stoppedAt },
    },
    orderBy: {
      startedAt: "asc",
    },
  });

  // valid dates
  const dates: Date[] = [new Date()];

  if (myNextScheduleItem) {
    dates.push(myNextScheduleItem.startedAt);
  }

  if (nextScheduleItem) {
    dates.push(nextScheduleItem.startedAt);
  }

  return min(dates) as Date;
}

interface GetMyUnfinishedScheduleItemsArgs {
  organizationId: number;
  roleId: number;
}

export const getMyUnfinishedScheduleItems = async ({
  organizationId,
  roleId,
}: GetMyUnfinishedScheduleItemsArgs) => {
  // Capture the last schedule item on every open task
  // of the organization
  const items = await prisma.scheduleItem.findMany({
    where: {
      organizationId: organizationId,
      ticket: {
        status: TicketStatus.SCHEDULED,
        stage: ModelStage.PUBLISHED,
        ticketWorkflowStates: {
          some: { assigneeId: roleId },
        },
      },
    },
    include: {
      ticket: {
        include: {
          product: true,
          workflow: true,
          ticketWorkflowStates: true,
        },
      },
      ticketWorkflowState: true,
    },
    orderBy: { stoppedAt: "desc" },
    distinct: ["ticketId"],
  });

  // only return the last item if the stoppedAt has been set on it
  // and it is not done
  return items.filter(
    (item) =>
      roleId === item.ticketWorkflowState.assigneeId &&
      item.stoppedAt &&
      !item.done
  );
};

/**
 * Given a point in time, return the work block boundaries if any.
 *
 * For example if you're scheduled to work from 8:00 to 11:00 and
 * we submit 10:13, the [8:00, 11:00] work block will be return
 * as two exact dates
 * @param workWeek
 * @param timeZone
 * @param date
 * @returns
 */
export const getWorkPeriodAt = (
  workWeek: WorkWeekTime,
  timeZone: string,
  date: Date
): [Date, Date] | null => {
  const calendar = new TzCalendar(date.toISOString(), timeZone);
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

      // job was started within this work block
      if (date >= startDate && date <= stopDate) {
        return [startDate, stopDate];
      }
    }
  }

  return null;
};

/**
 * Given a work week schedule and boundaries dates, return the number
 * of work hours available for that period
 */
/**
 *
 * @param workWeek The work schedule
 * @param timeZone The timezone of the role
 * @param fromUtcDate The start of the period, as a UTC datetime
 * @param toUtcDate The end of the period, as a UTC datetime
 * @returns
 */
export const getAvailableWorkHoursAt = (
  workWeek: WorkWeekTime,
  timeZone: string,
  fromUtcDate: Date,
  toUtcDate: Date
): number => {
  const calendar = new TzCalendar(fromUtcDate.toISOString(), timeZone);

  const maxLoops = 1000;
  let n = 0;
  let hours = 0;

  while (n < maxLoops) {
    const dayName = calendar.getWeekDayName();

    for (const { startTime, stopTime } of workWeek[dayName]) {
      const startDate = zonedTimeToUtc(
        `${calendar.getDate()}T${startTime}`,
        timeZone
      );
      const stopDate = zonedTimeToUtc(
        `${calendar.getDate()}T${stopTime}`,
        timeZone
      );

      if (startDate > toUtcDate) {
        return hours;
      }

      if (stopDate < fromUtcDate) {
        continue;
      }

      // job was started within this work block
      hours =
        hours +
        (Math.min(stopDate.getTime(), toUtcDate.getTime()) -
          Math.max(startDate.getTime(), fromUtcDate.getTime())) /
          3600_000;
    }

    n = n + 1;
    calendar.addDays(1);
  }

  console.warn("getAvailableWorkHoursAt(): Maximum loop exceeded");

  return 0;
};
