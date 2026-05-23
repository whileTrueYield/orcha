import {
  Notification,
  NotificationTarget,
  RoleStatus,
  User,
} from "@prisma/client";
import { format } from "date-fns-tz";
import { config } from "../../../config";
import { loadTemplate } from "../../../emails/email";
import prisma from "../../../prisma";
import { Organization, Role } from "../../entities";
import { getMyUnfinishedScheduleItems } from "../../schedule/helper";
import {
  getMyNextTickets,
  getMyTicketsToEstimate,
  getMyUpcomingTickets,
} from "../../ticket/helper";

export const getWorkEmailForRole = async (
  role: Role & { user: User; organization: Organization }
) => {
  // retrieve the role's notifications
  const notifications = await prisma.notification.findMany({
    where: {
      isRead: false,
      role: {
        id: role.id,
        status: RoleStatus.ACCEPTED,
      },
    },
    include: {
      actor: true,
    },
  });

  // convert notifications to text / url
  const templateNotifications = notifications.reduce(
    (
      acc: Array<{ title: string; url: string; avatarUrl: string }>,
      notification
    ) => {
      const url = GetUrlForNotification(notification);

      if (url) {
        return [
          ...acc,
          {
            title: notification.title.replace("{}", notification.actor.name),
            url: url.toString(),
            avatarUrl:
              notification.actor.avatarUrl ||
              "https://app.beta-orcha.com/img/avatar/default-avatar.png",
          },
        ];
      }

      return acc;
    },
    []
  );

  // retrieve the tickets to estimate
  const ticketsToEstimate = await getMyTicketsToEstimate({
    roleId: role.id,
    organizationId: role.organizationId,
  });

  const templateTicketsToEstimate = ticketsToEstimate.reduce(
    (acc: Array<{ title: string; url: string }>, ticket) => {
      const url = getUrlForTicket(ticket.id, ticket.organizationId);

      if (url) {
        return [
          ...acc,
          {
            title: ticket.title,
            url: url.toString(),
          },
        ];
      }

      return acc;
    },
    []
  );

  // retrieve the role's next task
  const availableTickets = await getMyNextTickets({
    roleId: role.id,
    organizationId: role.organizationId,
  });

  const templateAvailableTickets = availableTickets.reduce(
    (acc: Array<{ title: string; url: string; state: string }>, nextTicket) => {
      const url = getUrlForTicket(
        nextTicket.ticket.id,
        nextTicket.ticket.organizationId
      );

      if (url) {
        return [
          ...acc,
          {
            title: nextTicket.ticket.title,
            url: url.toString(),
            state: nextTicket.nextState.name,
          },
        ];
      }

      return acc;
    },
    []
  );

  // retrieve the tickets almost ready but still actively worked on
  const upcomingTickets = await getMyUpcomingTickets({
    roleId: role.id,
    organizationId: role.organizationId,
  });

  const templateUpcomingTickets = upcomingTickets.reduce(
    (
      acc: Array<{ title: string; url: string; state: string }>,
      upcomingTicket
    ) => {
      const url = getUrlForTicket(
        upcomingTicket.ticket.id,
        upcomingTicket.ticket.organizationId
      );

      return [
        ...acc,
        {
          title: upcomingTicket.ticket.title,
          url: url.toString(),
          state: upcomingTicket.currentState.name,
        },
      ];
    },
    []
  );

  // retrieve the unfinished ticket
  const unfinishedTickets = await getMyUnfinishedScheduleItems({
    roleId: role.id,
    organizationId: role.organizationId,
  });

  const templateUnfinishedTickets = unfinishedTickets.reduce(
    (
      acc: Array<{ title: string; url: string; state: string }>,
      scheduleItem
    ) => {
      if (scheduleItem.ticket) {
        const url = getUrlForTicket(
          scheduleItem.ticket.id,
          scheduleItem.ticket.organizationId
        );

        return [
          ...acc,
          {
            title: scheduleItem.ticket.title,
            url: url.toString(),
            state: scheduleItem.ticketWorkflowState?.name || "unknown",
          },
        ];
      }
      return acc;
    },
    []
  );

  const today = format(new Date(), "PPPP", { timeZone: role.timeZone });

  return loadTemplate({
    template: "work_day",
    data: {
      email: role.user.email,
      name: role.name,
      avatarUrl:
        role.avatarUrl ||
        "https://app.beta-orcha.com/img/avatar/default-avatar.png",
      organizationName: role.organization.name,
      homeUrl: `${config.webAppUri}/org/${role.organizationId}/`,
      notifications: templateNotifications,
      upcomingTickets: templateUpcomingTickets,
      availableTickets: templateAvailableTickets,
      unfinishedTickets: templateUnfinishedTickets,
      ticketsToEstimate: templateTicketsToEstimate,
      today,
    },
  });
};

// Returns a URL with FQDN for any given notification
const GetUrlForNotification = (notification: Notification): URL | null => {
  const orgId = notification.organizationId;
  const urlSearchParams = new URLSearchParams(notification.ancestry || "");
  let url = new URL(config.webAppUri);

  switch (notification.target) {
    case NotificationTarget.TICKET:
      url.pathname = `/org/${orgId}/ticket/${notification.targetId}/view`;
      break;
    case NotificationTarget.COMMENT:
    case NotificationTarget.QUESTION:
    case NotificationTarget.REPLY:
      // notification.ancestry store ticket=123&question=51
      url.pathname = `/org/${orgId}/ticket/${urlSearchParams.get(
        "ticket"
      )}/view`;
      break;
    default:
      return null;
  }

  url.searchParams.append("notificationId", notification.id.toString());
  url.searchParams.append("target", notification.target.toString());
  url.searchParams.append("targetId", notification.targetId.toString());
  url.searchParams.append("isRead", notification.isRead.toString());

  return url;
};

// Returns a URL with FQDN for any given ticket
const getUrlForTicket = (ticketId: number, organizationId: number): URL => {
  let url = new URL(config.webAppUri);
  url.pathname = `/org/${organizationId}/ticket/${ticketId}/view`;

  return url;
};
