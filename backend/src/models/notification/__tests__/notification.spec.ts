import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { NotificationCategory, NotificationTarget } from "@prisma/client";

const getNotificationQuery = `
query getNotification($id: Int!) {
  notification(id: $id) {
    id
    title
    isRead
    createdAt
    role {
      id
    }
    organization {
      id
    }
  }
}
`;

describe("get single notification", () => {
  it("retrieves an existing notification", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
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
      source: getNotificationQuery,
      variableValues: {
        id: notification.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        notification: {
          id: notification.id,
          title: notification.title,
          isRead: false,
          organization: {
            id: organization.id,
          },
          role: {
            id: role.id,
          },
          createdAt: notification.createdAt.toISOString(),
        },
      },
    });
  });

  it("throws an exception when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: getNotificationQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
