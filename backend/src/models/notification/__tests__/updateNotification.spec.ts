import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { NotificationCategory, NotificationTarget } from "@prisma/client";

const readNotificationMutation = `
mutation ReadNotification($notificationId: Int!) {
  readNotification(notificationId: $notificationId) {
    id
    title
    isRead
    createdAt
  }
}
`;

const unreadNotificationMutation = `
mutation UnreadNotification($notificationId: Int!) {
  unreadNotification(notificationId: $notificationId) {
    id
    title
    isRead
    createdAt
  }
}
`;

describe("updateNotification", () => {
  it("reads a notification", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const notification = await prisma.notification.create({
      data: {
        title: faker.lorem.paragraph(),
        organizationId: organization.id,
        roleId: role.id,
        actorId: role.id,
        category: NotificationCategory.MENTION,
        target: NotificationTarget.TICKET,
        targetId: 2,
      },
    });

    const response = await graphqlRequest({
      source: readNotificationMutation,
      variableValues: {
        notificationId: notification.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        readNotification: {
          id: notification.id,
          title: notification.title,
          isRead: true,
          createdAt: notification.createdAt.toISOString(),
        },
      },
    });
  });

  it("unreads a notification", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const notification = await prisma.notification.create({
      data: {
        title: faker.lorem.paragraph(),
        organizationId: organization.id,
        roleId: role.id,
        actorId: role.id,
        category: NotificationCategory.MENTION,
        target: NotificationTarget.TICKET,
        targetId: 2,
        isRead: true,
      },
    });

    const response = await graphqlRequest({
      source: unreadNotificationMutation,
      variableValues: {
        notificationId: notification.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        unreadNotification: {
          id: notification.id,
          title: notification.title,
          isRead: false,
          createdAt: notification.createdAt.toISOString(),
        },
      },
    });
  });
});
