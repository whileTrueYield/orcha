import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { UserStatus, RoleType, RoleStatus } from "@prisma/client";
import { map, range } from "lodash";
import prisma from "../../../prisma";
import expect from "expect";

const getUsersQuery = `
query getUsers {
  users (first: 2, sort: "email") {
    totalCount
    nodes {
      status
      email
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

describe("get many users", () => {
  it("returns pagination and an array of users if isStaff", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
      true,
    );
    const userPromises = map(range(5), async () => {
      const user = await prisma.user.create({
        data: {
          status: UserStatus.ACTIVE,
          email: `${faker.internet.email()}`,
          password: "password",
        },
      });

      return prisma.role.create({
        data: {
          userId: user.id,
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          organizationId: organization.id,
          status: RoleStatus.ACCEPTED,
          type: RoleType.ADMIN,
        },
      });
    });

    await Promise.all(userPromises);

    const response = await graphqlRequest({
      source: getUsersQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        users: {
          totalCount: expect.any(Number),
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: expect.any(Number),
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    expect(response.data!.users.nodes.length).toBe(2);
    expect(response.data!.users.nodes[0]).toBeDefined();
    expect(response.data!.users.nodes[1]).toBeDefined();
  });

  it("cannot access users if not staff", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
      false,
    );
    const userPromises = map(range(5), async () => {
      const user = await prisma.user.create({
        data: {
          status: UserStatus.ACTIVE,
          email: `${faker.internet.email()}`,
          password: "password",
        },
      });

      return prisma.role.create({
        data: {
          userId: user.id,
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          organizationId: organization.id,
          status: RoleStatus.ACCEPTED,
          type: RoleType.ADMIN,
        },
      });
    });

    await Promise.all(userPromises);

    const response = await graphqlRequest({
      source: getUsersQuery,
      session,
    });

    expect(response.errors).toBeDefined();
    expect(response.data).toBeNull();
  });
});
