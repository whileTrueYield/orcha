import { OrganizationStatus, Role, RoleStatus } from "@prisma/client";
import prisma from "../../../prisma";
import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { addDays, addMinutes } from "date-fns";
import { EMPTY_WORK_WEEK, WorkWeekTime } from "../entity";
import { logger } from "../../../logger";
import { pushNotifyRole } from "../../../notifications/endpoints";
import { map } from "lodash";
import { config } from "../../../config";

/**
 * Sends a notification to every role when it's time to check-in
 *
 * TODO: make sure we only notify people who aren't already working
 */
export const startReminder = async () => {
  await createMissingStartReminders();

  const now = new Date();
  const workStartRoles = await prisma.roleStartReminder.findMany({
    where: {
      nextStartNotificationDate: { lte: now },
      nextStartNotificationOptOut: false,
      role: {
        status: RoleStatus.ACCEPTED,
        organization: {
          status: OrganizationStatus.ACTIVE,
        },
      },
    },
    include: {
      role: {
        include: {
          organization: true,
          user: true,
        },
      },
    },
    take: 2,
    orderBy: {
      nextStartNotificationDate: "asc",
    },
  });

  logger.info(`Found ${workStartRoles.length} role to notify`);

  // capture all the current work matching the roles we are planning
  // on notifying. We do not want to notify already working peeps
  const workingRoles = await prisma.scheduleItem.findMany({
    where: {
      roleId: { in: map(workStartRoles, "roleId") },
      stoppedAt: null,
    },
  });
  const workingRolesIds = map(workingRoles, "roleId");

  // email that need to be sent
  for (const workStartRole of workStartRoles) {
    // verify that this role is not already working
    if (workingRolesIds.indexOf(workStartRole.role.id) === -1) {
      await pushNotifyRole(
        workStartRole.role.id,
        workStartRole.role.organizationId,
        "WORK_START",
        "It's time to start or resume a task"
      );
    } else {
      logger.info(`Not notifying role ${workStartRole.role.id}, it's at work`);
    }

    const nextStartNotificationDate = await getNextReminderStartDate(
      workStartRole.role,
      now,
      workStartRole.nextStartNotificationOffset
    );

    await prisma.roleStartReminder.update({
      where: { id: workStartRole.id },
      data: {
        nextStartNotificationDate,
      },
    });
  }
};

export const createMissingStartReminders = async () => {
  const roles = await prisma.role.findMany({
    where: { roleStartReminder: null },
  });
  const now = new Date();

  for (const role of roles) {
    const nextStartNotificationDate = await getNextReminderStartDate(
      role,
      now,
      config.workReminderOffset
    );
    await prisma.roleStartReminder.create({
      data: {
        roleId: role.id,
        nextStartNotificationDate,
      },
    });
  }
};

const computeStartTime = (
  date: Date,
  timeZone: string,
  time: string,
  offset: number
): Date => {
  const zonedDateStr = format(date, "yyyy-MM-dd", { timeZone });
  const zonedDateTime = zonedTimeToUtc(`${zonedDateStr}T${time}:00`, timeZone);
  // send the notification {offset} minutes after start work of day
  const result = addMinutes(zonedDateTime, offset);
  // logger.info(
  //   `Next date is ${result.toISOString()} from time ${time} and date ${date.toISOString()}`
  // );
  return result;
};

export const getNextReminderStartDate = async (
  role: Role,
  date: Date,
  offset: number
): Promise<Date> => {
  const { timeZone } = role;
  const workWeek: WorkWeekTime = {
    ...EMPTY_WORK_WEEK,
    ...JSON.parse(role.workWeek),
  };

  let zonedDate = utcToZonedTime(new Date(date), timeZone);
  let counter = 0;

  // logger.info(`Starting at date ${zonedDate.toISOString()}`);

  while (true) {
    if (counter++ > 365) {
      logger.warn(
        `getNextReminderStartDate(): Role id ${role.id} seems to have no WorkWeek defined!`
      );
      return zonedDate;
    }

    // what day of the week is it within this user's timezone
    // monday 1, tuesday 2... sunday 7
    const dayOfTheWeek = format(zonedDate, "i");

    // logger.info(
    //   `dayOfTheWeek is ${dayOfTheWeek} for date ${zonedDate.toISOString()} - ${zonedTimeToUtc(
    //     zonedDate,
    //     timeZone
    //   ).toISOString()}`
    // );

    switch (dayOfTheWeek) {
      case "1":
        for (const timeBlock of workWeek.monday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "2":
        for (const timeBlock of workWeek.tuesday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "3":
        for (const timeBlock of workWeek.wednesday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "4":
        for (const timeBlock of workWeek.thursday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "5":
        for (const timeBlock of workWeek.friday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "6":
        for (const timeBlock of workWeek.saturday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "7":
        for (const timeBlock of workWeek.sunday) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            timeBlock.startTime,
            offset
          );

          if (nextDate > date) {
            return nextDate;
          }
        }

        break;
    }

    zonedDate = addDays(zonedDate, 1);
  }
};
