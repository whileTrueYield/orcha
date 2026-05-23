import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, FeatureGroupStatus } from "@generated/type-graphql";
import expect from "expect";

const createFeatureGroupMutation = `
mutation CreateFeatureGroup($input:CreateFeatureGroupInput!) {
  createFeatureGroup(
    input: $input
  ) {
    name
    description
    status
    organization {
      id
    }
  }
}
`;

describe("create feature group", () => {
  it("creates a new feature group", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );
    const product = await createRandomProduct(organization);

    const feature = {
      name: `Take care of the ${faker.commerce.product()}`,
      description: faker.lorem.paragraph(),
      productId: product.id,
    };

    const response = await graphqlRequest({
      source: createFeatureGroupMutation,
      variableValues: {
        input: feature,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createFeatureGroup: {
          name: feature.name,
          description: feature.description,
          status: FeatureGroupStatus.ACTIVE,
          organization: {
            id: organization.id,
          },
        },
      },
    });
  });

  it("does not create a feature with a missing product ID", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);
    const feature = {
      name: `Build ${faker.commerce.product()}`,
      description: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createFeatureGroupMutation,
      variableValues: {
        input: feature,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
