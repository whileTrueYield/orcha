import {
  graphqlRequest,
  createRandomUser,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { RoleStatus, RoleType } from "@generated/type-graphql";
import { map, range } from "lodash";
import prisma from "../../../prisma";
import expect from "expect";
import { faker } from "@faker-js/faker";

const getRolesQuery = `
query getRoles {
  roles (last: 2, sort: "userId") {
    totalCount
    nodes {
      organization {
        name
      }
      user {
        email
      }
      name
      type
      status
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

describe("get many roles", () => {
  it("returns pagination and an array of roles", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const rolePromises = map(range(5), async () => {
      const user = await createRandomUser();
      return await prisma.role.create({
        data: {
          userId: user.id,
          name: faker.person.firstName(),
          organizationId: organization.id,
          type: RoleType.MEMBER,
          status: RoleStatus.ACCEPTED,
        },
      });
    });

    await Promise.all(rolePromises);

    const response = await graphqlRequest({
      source: getRolesQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        roles: {
          totalCount: 6, // 5 created + the one created with the session
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

    expect(response.data!.roles.nodes.length).toBe(2);
    expect(response.data!.roles.nodes[0].organization).toBeDefined();
    expect(response.data!.roles.nodes[1].organization).toBeDefined();
    expect(response.data!.roles.nodes[0].user).toBeDefined();
    expect(response.data!.roles.nodes[1].user).toBeDefined();
  });
});
