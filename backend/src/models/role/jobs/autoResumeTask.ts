import {
  ModelStage,
  OrganizationStatus,
  RoleStatus,
  TicketStatus,
} from "@prisma/client";
import prisma from "../../../prisma";
import { getNextReminderStartDate } from "./startReminder";
import { logger } from "../../../logger";
import { pick } from "lodash";
import { subMinutes } from "date-fns";
import { isWorkWeekEmpty } from "../../schedule/jobs/autoClockOut";

/**
 * This task auto resume the last paused task, as long as it was
 * auto-stopped
 */
export const autoResumeTask = async () => {
  await createMissingAutoResume();

  const now = new Date();

  // FIXME: This query needs to be optimized to speed up its resolution
  const roleAutoResumes = await prisma.roleAutoResume.findMany({
    where: {
      nextStartNotificationDate: { lt: now },
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
          scheduleItems: {
            orderBy: { startedAt: "desc" },
            take: 1,
            include: {
              ticketWorkflowState: true,
              ticket: {
                select: {
                  stage: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
    take: 100,
    orderBy: {
      nextStartNotificationDate: "asc",
    },
  });

  logger.info(`Found ${roleAutoResumes.length} role to auto resume task`);

  for (const roleAutoResume of roleAutoResumes) {
    const lastScheduleItem = roleAutoResume.role.scheduleItems[0];

    try {
      if (
        lastScheduleItem &&
        // last schedule item should have been auto stopped
        lastScheduleItem.autoStopped &&
        lastScheduleItem.stoppedAt &&
        // ticket should still be published
        lastScheduleItem.ticket.status === TicketStatus.SCHEDULED &&
        lastScheduleItem.ticket.stage === ModelStage.PUBLISHED &&
        // cannot point to a new stage
        !lastScheduleItem.nextTicketWorkflowStateId &&
        // the workflow state cannot be blocked
        !lastScheduleItem.ticketWorkflowState.isBlocked
      ) {
        // we can compute what should be the start time
        const startTime = await getNextReminderStartDate(
          roleAutoResume.role,
          // going back 15 mins in the past in case the autostart job
          // got delayed by a few minutes
          subMinutes(now, 15),
          0
        );

        // if the startTime is in the future we'll just update the next resume
        // to this date. This can happen if the role updated their work hours
        // after we schedule the next auto-resume
        if (startTime > now) {
          await prisma.roleAutoResume.update({
            where: { id: roleAutoResume.id },
            data: { nextStartNotificationDate: startTime },
          });
        } else {
          await prisma.scheduleItem.create({
            data: {
              ...pick(lastScheduleItem, [
                "roleId",
                "organizationId",
                "ticketWorkflowStateId",
                "ticketId",
              ]),
              startedAt: startTime,
              autoStarted: true,
            },
          });

          const nextStartNotificationDate = await getNextReminderStartDate(
            roleAutoResume.role,
            now,
            0
          );

          await prisma.roleAutoResume.update({
            where: { id: roleAutoResume.id },
            data: { nextStartNotificationDate },
          });
        }
      } else {
        const nextStartNotificationDate = await getNextReminderStartDate(
          roleAutoResume.role,
          now,
          0
        );

        await prisma.roleAutoResume.update({
          where: { id: roleAutoResume.id },
          data: { nextStartNotificationDate },
        });
      }
    } catch (error) {
      logger.error(error);
    }
  }
};

export const createMissingAutoResume = async () => {
  const roles = await prisma.role.findMany({
    where: { roleAutoResume: null },
  });

  const now = new Date();

  for (const role of roles) {
    if (isWorkWeekEmpty(role.workWeek)) {
      continue;
    }

    const nextStartNotificationDate = await getNextReminderStartDate(
      role,
      now,
      0
    );

    await prisma.roleAutoResume.create({
      data: {
        roleId: role.id,
        nextStartNotificationDate,
      },
    });
  }
};
