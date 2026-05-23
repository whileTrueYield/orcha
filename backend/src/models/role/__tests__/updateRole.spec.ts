import {
  createRandomOrganization,
  createRandomUserInOrg,
  getTestSession,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import prisma from "../../../prisma";
import { RoleStatus, RoleType } from "@generated/type-graphql";
import expect from "expect";

const updateRoleMutation = `
mutation updateRole($roleId: Int!, $input: UpdateRoleInput!) {
  updateRole(roleId: $roleId, input: $input) {
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
describe("update role", () => {
  it("should only allow admin level to promote a member to admin", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const { role } = await createRandomUserInOrg(organization, RoleType.MEMBER);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.ADMIN,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const updatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(updatedRole?.type).toBe(RoleType.ADMIN);
  });

  it("should not allow you to change your own role", async () => {
    const { session, role } = await getTestSessionWithRole(RoleType.OWNER);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.ADMIN,
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();

    const notUpdatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(notUpdatedRole?.type).toBe(RoleType.OWNER);
  });

  it("admin cannot change an owner", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const { role } = await createRandomUserInOrg(organization, RoleType.OWNER);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.ADMIN,
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();

    const notUpdatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(notUpdatedRole?.type).toBe(RoleType.OWNER);
  });

  it("should not allow you to change your own role", async () => {
    const { session, role } = await getTestSessionWithRole(RoleType.OWNER);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.ADMIN,
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();

    const notUpdatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(notUpdatedRole?.type).toBe(RoleType.OWNER);
  });

  it("owner can update another owner", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.OWNER
    );

    const { role } = await createRandomUserInOrg(organization, RoleType.OWNER);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.ADMIN,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const updatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(updatedRole?.type).toBe(RoleType.ADMIN);
  });

  it("admin can update another admin", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const { role } = await createRandomUserInOrg(organization, RoleType.ADMIN);

    const response = await graphqlRequest({
      source: updateRoleMutation,
      variableValues: {
        roleId: role.id,
        input: {
          type: RoleType.MEMBER,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const updatedRole = await prisma.role.findUnique({
      where: { id: role.id },
    });

    expect(updatedRole?.type).toBe(RoleType.MEMBER);
  });
});
