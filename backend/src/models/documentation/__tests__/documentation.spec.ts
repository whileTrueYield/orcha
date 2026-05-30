import {
  graphqlRequest,
  getTestSessionWithRole,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getDocumentationQuery = `
query getDocumentation($id: Int!) {
  documentation(id: $id) {
    id
    name
    stage
    description
    createdAt
    updatedAt
  }
}
`;

describe("get single documentation", () => {
  it("retrieves an existing documentation", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { documentation: true });

    const documentation = await prisma.documentation.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getDocumentationQuery,
      variableValues: {
        id: documentation.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        documentation: {
          id: documentation.id,
          name: documentation.name,
          stage: ModelStage.DRAFT,
          description: documentation.description,
          createdAt: documentation.createdAt.toISOString(),
          updatedAt: documentation.updatedAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    await prisma.documentation.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getDocumentationQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
