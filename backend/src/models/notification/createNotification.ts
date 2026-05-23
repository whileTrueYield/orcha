import { difference, map, without } from "lodash";
import { pushNotifyRole } from "../../notifications/endpoints";
import prisma from "../../prisma";
import { getMentions } from "../../utils/tiptap";
import { NotificationCategory, NotificationTarget } from "@prisma/client";
import { logger } from "../../logger";

type NotificationAncestry = { [objectType: string]: number };

/**
 * Create and Delete notifications for an object
 *
 * This method removes unecessary notifications by removing
 * notification where the role isn't included with the call.
 * This is helpful when @people mentions get added/removed from a content.
 */
export async function createNotificationsForTarget(
  organizationId: number,
  category: NotificationCategory,
  target: NotificationTarget,
  targetId: number,
  roleIds: number[],
  actorId: number,
  title: string,
  ancestry?: NotificationAncestry,
  doNotNotifyRoleIds: number[] = [],
): Promise<number[]> {
  // remove the actor if it is also a target for the notificaiton
  // ie. mentioning yourself shouldn't trigger a notification
  roleIds = without(roleIds, actorId);

  // remove any role we do not want to notify
  roleIds = difference(roleIds, doNotNotifyRoleIds);

  // ensure the roles are part of the current organization
  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      organizationId,
    },
  });
  // these role IDs are guarantee to be part of the organization
  const safeRoleIds = map(roles, "id");

  // capture all the old notifications we might have created
  // in case we edited a piece of content and just changed the
  // mentions on it (i.e. on a question, reply or description)
  const previousNotifications = await prisma.notification.findMany({
    where: {
      target,
      targetId,
      category,
      organizationId,
    },
  });

  // if some notification are not necessary anymore (roleId isn't part
  // of the list of destinations) we'll delete them
  for (const notification of previousNotifications) {
    if (safeRoleIds.indexOf(notification.roleId) === -1) {
      await prisma.notification.delete({ where: { id: notification.id } });
    }
  }

  // if we have no-one to notify, we just just return
  if (roleIds.length === 0) {
    return [];
  }

  // generate the URL linking to the target (the one that triggered
  // the notification)
  const urlSearchParams = new URLSearchParams();
  for (const objectType in ancestry) {
    urlSearchParams.append(objectType, ancestry[objectType].toString());
  }

  const notifiedRoleIds: number[] = [];
  // now we'll create the missing notifications
  const previousRoleIds = map(previousNotifications, "roleId");
  for (const roleId of safeRoleIds) {
    if (previousRoleIds.indexOf(roleId) === -1) {
      // create the database notification
      const notification = await prisma.notification.create({
        data: {
          target,
          targetId,
          category,
          organizationId,
          title,
          roleId,
          actorId,
          ancestry: urlSearchParams.toString(),
        },
      });

      // trigger a desktop push notificaiton
      await pushNotifyRole(roleId, organizationId, category, title, {
        notificationId: notification.id,
      });

      notifiedRoleIds.push(roleId);
    }
  }

  return notifiedRoleIds;
}

// notify users mentioned in the ticket's description
export async function notifyMentionedUsersInTicket(
  ticketId: number,
  organizationId: number,
  authorId: number,
  document: string | {},
) {
  const mentions = getMentions(document);
  logger.info(
    `mentions: ${JSON.stringify(mentions)} - ticket ${ticketId} ${JSON.stringify(document, null, 2)}`,
  );
  await createNotificationsForTarget(
    organizationId,
    NotificationCategory.MENTION,
    NotificationTarget.TICKET,
    ticketId,
    mentions,
    authorId,
    `{} mentioned you in a ticket`,
  );

  return [];
}

// notify users mentioned in the ticket's description
export async function notifyMentionedUsersInProject(
  projectId: number,
  organizationId: number,
  authorId: number,
  document: string | {},
) {
  const mentions = getMentions(document);
  logger.info(
    `mentions: ${JSON.stringify(mentions)} - project ${projectId} ${JSON.stringify(document, null, 2)}`,
  );
  await createNotificationsForTarget(
    organizationId,
    NotificationCategory.MENTION,
    NotificationTarget.PROJECT,
    projectId,
    mentions,
    authorId,
    `{} mentioned you in a project`,
  );

  return [];
}
