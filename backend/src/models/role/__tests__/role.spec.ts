import {
  graphqlRequest,
  createRandomUser,
  getTestSessionWithRole,
  createRandomOrganization,
} from "../../../utils/testing";
import { RoleStatus, RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { faker } from "@faker-js/faker";

const getRoleQuery = `
query getRole($id: Int!) {
  role(id: $id) {
    user {
      email
      status
    }
    organization {
      name
    }
    type
    name
    status
    createdAt
    updatedAt
  }
}
`;

describe("get a single user's role within an organization", () => {
  it("retrieves an existing role", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const user = await createRandomUser();

    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.ACCEPTED,
      },
    });

    const response = await graphqlRequest({
      source: getRoleQuery,
      variableValues: {
        id: role.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        role: {
          type: role.type,
          name: role.name,
          user: {
            email: user.email,
            status: user.status,
          },
          organization: {
            name: organization.name,
          },
          status: role.status,
          createdAt: role.createdAt.toISOString(),
          updatedAt: role.updatedAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);

    // create a different org and user, this should prevent
    // the current session from accessing it
    const organization = await createRandomOrganization();
    const user = await createRandomUser();
    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.ACCEPTED,
      },
    });

    const response = await graphqlRequest({
      source: getRoleQuery,
      variableValues: {
        id: role.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
