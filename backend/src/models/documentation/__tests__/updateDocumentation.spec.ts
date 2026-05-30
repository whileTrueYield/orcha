import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const updateDocumentationMutation = `
mutation UpdateDocumentation($documentationId: Int!, $input:UpdateDocumentationInput!) {
  updateDocumentation(
    documentationId: $documentationId
    input: $input
  ) {
    id
    name
    stage
    description
    createdAt
    updatedAt
  }
}
`;

describe("updateDocumentation", () => {
  it("changes the name of a documentation", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const documentation = await prisma.documentation.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const newName = `${faker.person.lastName()} LTD`;
    const response = await graphqlRequest({
      source: updateDocumentationMutation,
      variableValues: {
        documentationId: documentation.id,
        input: { name: newName },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateDocumentation: {
          stage: ModelStage.DRAFT,
          description: documentation.description,
          name: newName,
          id: documentation.id,
          updatedAt: expect.any(String),
          createdAt: documentation.createdAt.toISOString(),
        },
      },
    });
  });

  it("can clear a field", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const documentation = await prisma.documentation.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateDocumentationMutation,
      variableValues: {
        documentationId: documentation.id,
        input: {
          description: null,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateDocumentation.description).toBe(null);
  });
});
