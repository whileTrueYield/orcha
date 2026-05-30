import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import { map, range, sortBy, take } from "lodash";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getProductsQuery = `
query getProducts {
  products (first: 10, sort: "code") {
    totalCount
    nodes {
      id
      code
      name
      stage
      description
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

describe("get many products", () => {
  it("returns pagination and an array of products", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const productPromises = map(range(20), (counter) => {
      return prisma.product.create({
        data: {
          name: faker.person.jobTitle(),
          code: `ABCD${String(counter).padStart(2, "0")}`,
          description: faker.lorem.paragraph(),
          stage: ModelStage.PUBLISHED,
          organizationId: organization.id,
        },
      });
    });

    const products = await Promise.all(productPromises);

    const response = await graphqlRequest({
      source: getProductsQuery,
      session,
    });

    const expectedProductObjs = map(
      products,
      ({ id, name, stage, description, code }) => ({
        id,
        name,
        stage,
        description,
        code,
      }),
    );

    expect(response).toEqual({
      data: {
        products: {
          totalCount: 20,
          nodes: take(sortBy(expectedProductObjs, "code"), 10),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 2,
            pageNumber: 0,
            pageSize: 10,
          },
        },
      },
    });
  });
});
