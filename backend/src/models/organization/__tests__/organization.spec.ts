import {
  graphqlRequest,
  getTestSessionWithRole,
  getTestSession,
} from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import expect from "expect";

const getOrganizationQuery = `
query getOrganization {
  organization {
    id
    name
    status
    about
    coverUrl
    createdAt
    updatedAt
  }
}
`;

describe("get single organization", () => {
  it("retrieves an existing organization", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const response = await graphqlRequest({
      source: getOrganizationQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        organization: {
          id: organization.id,
          name: organization.name,
          status: organization.status,
          about: organization.about,
          coverUrl: organization.coverUrl,
          updatedAt: organization.updatedAt.toISOString(),
          createdAt: organization.createdAt.toISOString(),
        },
      },
    });
  });

  it("cannot retrieve organization if not using a role", async () => {
    const { session } = await getTestSession();

    const response = await graphqlRequest({
      source: getOrganizationQuery,
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
