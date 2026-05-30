import {
  graphqlRequest,
  createRandomUser,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { UserStatus, RoleStatus, RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import { get } from "lodash";
import expect from "expect";
import sinon, { SinonSpy } from "sinon";
import * as email from "../../../emails/email";

const inviteMutation = `
mutation Invite($input:InviteInput!) {
  invite(
    input: $input
  ) {
    user {
      email
      status
    }
    organization {
      name
    }
    name
    type
    status
  }
}
`;

describe("invite a user", () => {
  const sandbox = sinon.createSandbox();
  let sendEmail: SinonSpy<any>;

  beforeEach(function () {
    sendEmail = sandbox.spy(email, "sendEmail");
  });

  afterEach(function () {
    sandbox.restore();
  });

  it("invites users by creating a new role as invited", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const user = await createRandomUser();

    const role = {
      roleType: RoleType.ADMIN,
      userEmail: user.email,
      userName: faker.person.firstName(),
    };

    const response = await graphqlRequest({
      source: inviteMutation,
      variableValues: {
        input: role,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        invite: {
          type: RoleType.ADMIN,
          user: {
            email: user.email,
            status: user.status,
          },
          organization: {
            name: organization.name,
          },
          status: RoleStatus.INVITED,
          name: role.userName,
        },
      },
    });

    sandbox.assert.calledOnce(sendEmail);
  });

  it("creates a users with a status invited if does not exists", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const userEmail =
      Math.round(Math.random() * 10e10) + faker.internet.email();

    const role = {
      roleType: RoleType.ADMIN,
      userEmail,
      userName: faker.person.firstName(),
    };

    const response = await graphqlRequest({
      source: inviteMutation,
      variableValues: {
        input: role,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        invite: {
          type: RoleType.ADMIN,
          user: {
            email: role.userEmail.toLowerCase(),
            status: UserStatus.INVITED,
          },
          organization: {
            name: organization.name,
          },
          name: role.userName,
          status: RoleStatus.INVITED,
        },
      },
    });

    sandbox.assert.calledOnce(sendEmail);
  });

  it("invite a user does not create a role if one already exists", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const user = await createRandomUser();

    await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.ACCEPTED,
      },
    });

    const duplicateRole = {
      roleType: RoleType.ADMIN,
      userEmail: user.email,
      userName: faker.person.firstName(),
    };

    const response = await graphqlRequest({
      source: inviteMutation,
      variableValues: {
        input: duplicateRole,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual(
      "This person already accepted your invitation",
    );

    sandbox.assert.notCalled(sendEmail);
  });

  it("does not allow for an invitation if it was previously rejected", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const user = await createRandomUser();

    await prisma.role.create({
      data: {
        userId: user.id,
        name: faker.person.firstName(),
        organizationId: organization.id,
        type: RoleType.MEMBER,
        status: RoleStatus.REJECTED,
      },
    });

    const duplicateRole = {
      roleType: RoleType.ADMIN,
      userEmail: user.email,
      userName: faker.person.firstName(),
    };

    const response = await graphqlRequest({
      source: inviteMutation,
      variableValues: {
        input: duplicateRole,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toEqual(
      "Sorry, this person rejected your previous invitation.",
    );

    sandbox.assert.notCalled(sendEmail);
  });
});
