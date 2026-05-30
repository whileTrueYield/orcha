import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, FeatureGroupStatus } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const updateFeatureGroupMutation = `
mutation UpdateFeatureGroup($featureGroupId: Int!, $input:UpdateFeatureGroupInput!) {
  updateFeatureGroup(
    featureGroupId: $featureGroupId
    input: $input
  ) {
    id
    name
    description
    status
    createdAt
    updatedAt
  }
}
`;

describe("update Feature Group", () => {
  it("changes the name of a feature group", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );
    const product = await createRandomProduct(organization);
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: `${faker.commerce.product()}`,
        description: faker.lorem.paragraph(),
        status: FeatureGroupStatus.ACTIVE,
        organizationId: organization.id,
        productId: product.id,
      },
    });

    const newTitle = `Updated ${faker.commerce.product()}`;
    const response = await graphqlRequest({
      source: updateFeatureGroupMutation,
      variableValues: {
        featureGroupId: featureGroup.id,
        input: { name: newTitle },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateFeatureGroup: {
          description: featureGroup.description,
          status: featureGroup.status,
          name: newTitle,
          id: featureGroup.id,
          updatedAt: expect.any(String),
          createdAt: featureGroup.createdAt.toISOString(),
        },
      },
    });
  });

  it("accepts a partial update", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );
    const product = await createRandomProduct(organization);
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: `Take care of the ${faker.commerce.product()}`,
        description: faker.lorem.paragraph(),
        status: FeatureGroupStatus.ACTIVE,
        organizationId: organization.id,
        productId: product.id,
      },
    });

    const newDescription = faker.lorem.paragraph();
    const response = await graphqlRequest({
      source: updateFeatureGroupMutation,
      variableValues: {
        featureGroupId: featureGroup.id,
        input: {
          description: newDescription,
        },
      },
      session,
    });

    expect(response.data!.updateFeatureGroup.description).toBe(newDescription);
    expect(response.data!.updateFeatureGroup.name).toBe(featureGroup.name);
  });

  it("cannot change the status of a featureGroup", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );
    const product = await createRandomProduct(organization);
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: `Take care of the ${faker.commerce.product()}`,
        description: faker.lorem.paragraph(),
        status: FeatureGroupStatus.ACTIVE,
        organization: { connect: { id: organization.id } },
        product: { connect: { id: product.id } },
      },
    });

    const response = await graphqlRequest({
      source: updateFeatureGroupMutation,
      variableValues: {
        featureGroupId: featureGroup.id,
        input: { status: "active" },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
