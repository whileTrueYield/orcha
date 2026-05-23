import { OrganizationStatus, Role, RoleStatus } from "@prisma/client";
import prisma from "../../../prisma";
import { format, utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { addDays, subHours } from "date-fns";
import { EMPTY_WORK_WEEK, WorkWeekTime } from "../entity";
import { getWorkEmailForRole } from "./getWorkEmailForRole";
import { sendEmail } from "../../../emails/email";
import { logger } from "../../../logger";
import { isWorkWeekEmpty } from "../../schedule/jobs/autoClockOut";

export const workDayEmail = async () => {
  await createMissingRoleEmails();

  const now = new Date();
  const emailRoles = await prisma.roleEmail.findMany({
    where: {
      nextWorkDayNotificationDate: { lte: now },
      nextWorkDayNotificationOptOut: false,
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
      nextWorkDayNotificationDate: "asc",
    },
  });

  // email that need to be sent
  for (const emailRole of emailRoles) {
    const { html, text } = await getWorkEmailForRole(emailRole.role);

    await sendEmail({
      ToAddresses: [emailRole.role.user.email],
      html,
      text,
      subject: `Preview your ${format(now, "iiii", {
        timeZone: emailRole.role.timeZone,
      })} at ${emailRole.role.organization.name}`,
    });

    const nextWorkDayNotificationDate = await getNextWorkDayStartDate(
      emailRole.role,
      now,
      emailRole.nextWorkDayNotificationOffset
    );

    await prisma.roleEmail.update({
      where: { id: emailRole.id },
      data: {
        nextWorkDayNotificationDate,
      },
    });
  }
};

export const createMissingRoleEmails = async () => {
  const roles = await prisma.role.findMany({ where: { roleEmail: null } });
  const now = new Date();

  for (const role of roles) {
    const nextWorkDayNotificationDate = await getNextWorkDayStartDate(
      role,
      now
    );
    await prisma.roleEmail.create({
      data: {
        roleId: role.id,
        nextWorkDayNotificationDate,
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
  // send the notification one hour before start work of day
  return subHours(zonedDateTime, offset);
};

export const getNextWorkDayStartDate = async (
  role: Role,
  date: Date,
  offset: number = 3
): Promise<Date> => {
  const { timeZone } = role;
  const workWeek: WorkWeekTime = {
    ...EMPTY_WORK_WEEK,
    ...JSON.parse(role.workWeek),
  };

  let zonedDate = utcToZonedTime(date, timeZone);
  let counter = 0;

  if (isWorkWeekEmpty(workWeek)) {
    logger.warn(
      `getNextWorkDayStartDate(): Role id ${role.id} seems to have no WorkWeek defined!`
    );
    return zonedDate;
  }

  while (true) {
    if (counter++ > 365) {
      logger.warn(
        `getNextWorkDayStartDate(): Role id ${role.id} looped for a whole year!`
      );
      return zonedDate;
    }

    // what day of the week is it within this user's timezone
    // monday 1, tuesday 2... sunday 7
    const dayOfTheWeek = format(zonedDate, "i");
    switch (dayOfTheWeek) {
      case "1":
        if (workWeek.monday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.monday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "2":
        if (workWeek.tuesday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.tuesday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;

      case "3":
        if (workWeek.wednesday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.wednesday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "4":
        if (workWeek.thursday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.thursday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "5":
        if (workWeek.friday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.friday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "6":
        if (workWeek.saturday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.saturday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
      case "7":
        if (workWeek.sunday.length) {
          const nextDate = computeStartTime(
            zonedDate,
            timeZone,
            workWeek.sunday[0].startTime,
            offset
          );

          // only return next date if it's after provided datetime
          if (nextDate > date) {
            return nextDate;
          }
        }
        break;
    }

    zonedDate = addDays(zonedDate, 1);
  }
};

// // graphql can be used for prisma type
// const foo: RoleType = GqlRoleType.MEMBER;
// const foo2: RoleType = RoleType.MEMBER;

// // prisma type are incompatible with grapqhl types
// const bar: GqlRoleType = RoleType.MEMBER;
// const bar2: GqlRoleType = GqlRoleType.MEMBER;
