import {
  graphqlRequest,
  createRandomUser,
  createRandomOrganization,
  getTestSession,
} from "../../../utils/testing";
import { RoleStatus, RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";
import { faker } from "@faker-js/faker";

const rejectRoleMutation = `
mutation RejectRole($roleId: Int!) {
  rejectRole(roleId: $roleId) {
    organization {
      name
    }
    user {
      email
      status
    }
    type
    status
  }
}
`;

describe("reject a role", () => {
  it("should change the status from invited to reject", async () => {
    const { session, user } = await getTestSession();
    const organization = await createRandomOrganization();

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
      source: rejectRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        rejectRole: {
          type: role.type,
          user: {
            email: user.email,
            status: user.status,
          },
          organization: {
            name: organization.name,
          },
          status: RoleStatus.REJECTED,
        },
      },
    });
  });

  it("cannot reject a role that is not an invite", async () => {
    const organization = await createRandomOrganization();
    const user = await createRandomUser();

    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.REJECTED,
      },
    });

    const response = await graphqlRequest({
      source: rejectRoleMutation,
      variableValues: {
        roleId: role.id,
      },
    });

    expect(get(response, "errors.0.message")).toEqual(
      "You need to be authenticated",
    );
  });

  it("cannot reject an invite for another user", async () => {
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
      source: rejectRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual("No Role found");
  });
});
