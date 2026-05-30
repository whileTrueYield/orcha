import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { NotificationCategory, NotificationTarget } from "@prisma/client";

const getMyNotificationsQuery = `
query MyNotifications {
  myNotifications (first: 2, sort: "title") {
    totalCount
    nodes {
      title
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      pageNumber
      pageSize
      pageCount
      endCursor
    }
  }
}
`;

describe("get many notifications", () => {
  it("returns pagination and an array of notifications", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const notificationPromises = map(range(5), async (counter) => {
      return prisma.notification.create({
        data: {
          title: counter.toString() + faker.lorem.paragraph(),
          organizationId: organization.id,
          roleId: role.id,
          actorId: role.id,
          category: NotificationCategory.MENTION,
          target: NotificationTarget.TICKET,
          targetId: 2,
        },
      });
    });

    const notifications = await Promise.all(notificationPromises);

    const response = await graphqlRequest({
      source: getMyNotificationsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        myNotifications: {
          totalCount: 5,
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 3,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    const sortedNotifications = sortBy(notifications, "title");
    expect(response.data!.myNotifications.nodes.length).toBe(2);
    expect(sortedNotifications[0]).toMatchObject(
      response.data!.myNotifications.nodes[0]
    );
    expect(sortedNotifications[1]).toMatchObject(
      response.data!.myNotifications.nodes[1]
    );
  });
});
