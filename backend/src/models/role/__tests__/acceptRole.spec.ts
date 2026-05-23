import {
  graphqlRequest,
  createRandomOrganization,
  getTestSession,
  createRandomUser,
} from "../../../utils/testing";
import { RoleStatus, RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";
import { faker } from "@faker-js/faker";

const acceptRoleMutation = `
mutation AcceptRole($input: AcceptRoleInput!) {
  acceptRole(input: $input) {
    organization {
      name
    }
    user {
      email
      status
    }
    name
    timeZone
    type
    status
  }
}
`;

describe("when invited", () => {
  it("should change the status from invited to accept", async () => {
    const organization = await createRandomOrganization();
    const { user, session } = await getTestSession();

    const roleName = `${faker.person.firstName()} ${faker.person.lastName()}`;

    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: roleName,
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.INVITED,
      },
    });

    const response = await graphqlRequest({
      source: acceptRoleMutation,
      variableValues: {
        input: {
          roleId: role.id,
          timeZone: "America/Los_Angeles",
        },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        acceptRole: {
          type: role.type,
          user: {
            email: user.email,
            status: user.status,
          },
          organization: {
            name: organization.name,
          },
          name: roleName,
          timeZone: "America/Los_Angeles",
          status: RoleStatus.ACCEPTED,
        },
      },
    });
  });

  it("cannot accept a role that is not an invite", async () => {
    const organization = await createRandomOrganization();
    const { user, session } = await getTestSession();

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
      source: acceptRoleMutation,
      variableValues: {
        input: {
          roleId: role.id,
          timeZone: "America/New_York",
        },
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual("No Role found");
  });

  it("cannot accept an invite for another user", async () => {
    const organization = await createRandomOrganization();
    const user = await createRandomUser();
    const { session } = await getTestSession();

    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.INVITED,
      },
    });

    const response = await graphqlRequest({
      source: acceptRoleMutation,
      variableValues: {
        input: {
          roleId: role.id,
          timeZone: "America/Los_Angeles",
        },
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual("No Role found");
  });
});
