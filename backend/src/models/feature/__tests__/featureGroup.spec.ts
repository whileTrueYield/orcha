import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { FeatureGroupStatus, RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getFeatureGroupQuery = `
query getFeatureGroup($id: Int!) {
  featureGroup(id: $id) {
    id
    name
    status
    description
    createdAt
    updatedAt
  }
}
`;

describe("get single featureGroup", () => {
  it("retrieves an existing featureGroup", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER
    );
    const product = await createRandomProduct(organization);

    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: `Take care of the ${faker.commerce.product()}`,
        description: faker.lorem.paragraph(),
        productId: product.id,
        status: FeatureGroupStatus.ACTIVE,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getFeatureGroupQuery,
      variableValues: {
        id: featureGroup.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        featureGroup: {
          id: featureGroup.id,
          name: featureGroup.name,
          status: featureGroup.status,
          description: featureGroup.description,
          updatedAt: featureGroup.updatedAt.toISOString(),
          createdAt: featureGroup.createdAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER
    );
    const product = await createRandomProduct(organization);

    await prisma.featureGroup.create({
      data: {
        name: `Take care of the ${faker.commerce.product()}`,
        description: faker.lorem.paragraph(),
        productId: product.id,
        status: FeatureGroupStatus.ACTIVE,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getFeatureGroupQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
