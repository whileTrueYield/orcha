import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { FeatureGroupStatus, RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const addFeatureMutation = `
mutation AddFeature($featureGroupId: Int!, $name: String!) {
  addFeature(featureGroupId: $featureGroupId, name: $name) {
    id
    name
    createdAt
    updatedAt
    product {
      id
    }
    organization {
      id
    }
    features {
      nodes {
        name
      }
    }
  }
}
`;

const deleteFeatureMutation = `
mutation DeleteFeature($featureId: Int!) {
  deleteFeature(featureId: $featureId) {
    id
    name
    createdAt
    updatedAt
    features {
      nodes {
        name
      }
    }
  }
}
`;

const deleteFeatureGroupMutation = `
mutation DeleteFeatureGroup($featureGroupId: Int!) {
  deleteFeatureGroup(featureGroupId: $featureGroupId) {
    id
  }
}
`;

describe("features within feature group", () => {
  it("should add a feature", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const product = await createRandomProduct(organization);

    const featureGroupName = faker.commerce.productName();
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: featureGroupName,
        productId: product.id,
        organizationId: organization.id,
        status: FeatureGroupStatus.ACTIVE,
      },
    });

    const featureName = faker.commerce.productName();
    const response = await graphqlRequest({
      source: addFeatureMutation,
      variableValues: {
        featureGroupId: featureGroup.id,
        name: featureName,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        addFeature: {
          name: featureGroupName,
          id: featureGroup.id,
          updatedAt: expect.any(String),
          createdAt: featureGroup.createdAt.toISOString(),
          product: {
            id: product.id,
          },
          organization: {
            id: organization.id,
          },
          features: {
            nodes: [
              {
                name: featureName,
              },
            ],
          },
        },
      },
    });
  });

  it("should delete a feature", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const product = await createRandomProduct(organization);

    const featureGroupName = faker.commerce.productName();
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: featureGroupName,
        productId: product.id,
        organizationId: organization.id,
        status: FeatureGroupStatus.ACTIVE,
      },
    });

    const featureName = faker.commerce.productName();
    const feature = await prisma.feature.create({
      data: {
        name: featureName,
        featureGroupId: featureGroup.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteFeatureMutation,
      variableValues: {
        featureId: feature.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteFeature: {
          name: featureGroupName,
          id: featureGroup.id,
          updatedAt: expect.any(String),
          createdAt: featureGroup.createdAt.toISOString(),
          features: { nodes: [] },
        },
      },
    });
  });

  it("deletes a feature when deleting a feature group", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const product = await createRandomProduct(organization);

    const featureGroupName = faker.commerce.productName();
    const featureGroup = await prisma.featureGroup.create({
      data: {
        name: featureGroupName,
        productId: product.id,
        organizationId: organization.id,
        status: FeatureGroupStatus.ACTIVE,
      },
    });

    const featureName = faker.commerce.productName();
    const feature = await prisma.feature.create({
      data: {
        name: featureName,
        featureGroupId: featureGroup.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteFeatureGroupMutation,
      variableValues: {
        featureGroupId: featureGroup.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteFeatureGroup: { id: product.id },
      },
    });

    const deletedSubFeature = await prisma.feature.findUnique({
      where: { id: feature.id },
    });
    expect(deletedSubFeature).toBe(null);
  });
});
