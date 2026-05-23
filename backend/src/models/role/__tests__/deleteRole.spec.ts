import {
  graphqlRequest,
  createRandomUser,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { RoleStatus, RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";
import { faker } from "@faker-js/faker";

const deleteRoleMutation = `
mutation DeleteRole($roleId: Int!) {
  deleteRole(roleId: $roleId) {
    id
    status
  }
}
`;

describe("delete a role", () => {
  it("should delete a role", async () => {
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
      source: deleteRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteRole: {
          id: role.id,
          status: RoleStatus.DEACTIVATED,
        },
      },
    });
  });

  it("cannot delete a role if not an admin", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
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
      source: deleteRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual(
      "Your role needs to be owner or admin",
    );
  });

  it("cannot delete an owner role if not an owner", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const user = await createRandomUser();

    const role = await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.OWNER,
        status: RoleStatus.ACCEPTED,
      },
    });

    const response = await graphqlRequest({
      source: deleteRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual(
      "Only an owner can deactivate another owner",
    );
  });

  it("cannot delete yourself", async () => {
    const { role, session } = await getTestSessionWithRole(RoleType.ADMIN);
    const user = await createRandomUser();

    const response = await graphqlRequest({
      source: deleteRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual(
      "You cannot deactivate yourself",
    );
  });

  it("can delete any role", async () => {
    const { organization, session } = await getTestSessionWithRole(
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
      source: deleteRoleMutation,
      variableValues: {
        roleId: role.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteRole: {
          id: role.id,
          status: RoleStatus.DEACTIVATED,
        },
      },
    });
  });
});
