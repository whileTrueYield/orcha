import {
  graphqlRequest,
  getTestSessionWithRole,
  getTestSession,
} from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import { AuthStatus } from "../../../types";
import prisma from "../../../prisma";
import expect from "expect";

const meQuery = `
query Me {
  me {
    status
    user {
      id
    }
    organization {
      id
      name
    }
    role {
      id
      name
      type
    }
  }
}
`;

describe("me", () => {
  it("returns a guest status when not authenticateed", async () => {
    const response = await graphqlRequest({ source: meQuery });

    expect(response.errors).not.toBeDefined();
    expect(response).toEqual({
      data: {
        me: {
          status: AuthStatus.GUEST,
          user: null,
          organization: null,
          role: null,
        },
      },
    });
  });

  it("returns a user status when authenticateed", async () => {
    const { session, user } = await getTestSession();
    const response = await graphqlRequest({ source: meQuery, session });

    expect(response.errors).not.toBeDefined();
    expect(response).toEqual({
      data: {
        me: {
          status: AuthStatus.USER,
          user: {
            id: user.id,
          },
          organization: null,
          role: null,
        },
      },
    });
  });

  it("returns a complete me when authenticated and use a role", async () => {
    const { session, user, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const response = await graphqlRequest({
      source: meQuery,
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response).toEqual({
      data: {
        me: {
          status: AuthStatus.LINKED,
          user: {
            id: user.id,
          },
          organization: {
            id: organization.id,
            name: organization.name,
          },
          role: {
            id: role.id,
            type: RoleType.ADMIN,
            name: role.name,
          },
        },
      },
    });
  });

  it("flushes the me cache upon user update", async () => {
    const { session, user, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const responseA = await graphqlRequest({ source: meQuery, session });

    expect(responseA.errors).not.toBeDefined();
    expect(responseA.data!.me.role.name).toBe(role.name);

    await prisma.role.update({
      where: { id: role.id },
      data: { name: "a new name" },
    });

    const responseB = await graphqlRequest({ source: meQuery, session });
    expect(responseB.errors).not.toBeDefined();
    expect(responseB.data!.me.role.name).toBe("a new name");
  });
});
