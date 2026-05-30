import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, FeatureGroupStatus } from "@prisma/client";
import { map, range, sortBy } from "lodash";
import prisma from "../../../prisma";
import expect from "expect";

const getFeatureGroupsQuery = `
query getFeatureGroups {
  featureGroups (first: 2, sort: "name") {
    totalCount
    nodes {
      name
      status
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      pageNumber
      pageSize
      pageCount
      endCursor
    }
  }
}
`;

describe("get many feature groups", () => {
  it("returns pagination and an array of feature groups", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );
    const product = await createRandomProduct(organization);

    const featurePromises = map(range(5), (index) => {
      return prisma.featureGroup.create({
        data: {
          name: `${faker.commerce.product()} - ${index}`,
          status: FeatureGroupStatus.ACTIVE,
          productId: product.id,
          organizationId: organization.id,
        },
      });
    });

    const featureGroups = await Promise.all(featurePromises);

    const response = await graphqlRequest({
      source: getFeatureGroupsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        featureGroups: {
          totalCount: 5,
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 3,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    const sortedFeatures = sortBy(featureGroups, "name");
    expect(response.data!.featureGroups.nodes.length).toBe(2);
    expect(sortedFeatures[0]).toMatchObject(
      response.data!.featureGroups.nodes[0]
    );
    expect(sortedFeatures[1]).toMatchObject(
      response.data!.featureGroups.nodes[1]
    );
  });
});
