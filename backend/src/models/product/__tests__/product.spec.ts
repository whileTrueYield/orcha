import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getProductQuery = `
query getProduct($id: Int!) {
  product(id: $id) {
    id
    name
    code
    stage
    description
    coverUrl
    createdAt
    updatedAt
  }
}
`;

describe("get single product", () => {
  it("retrieves an existing product", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const product = await prisma.product.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getProductQuery,
      variableValues: {
        id: product.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        product: {
          id: product.id,
          name: product.name,
          code: product.code,
          stage: ModelStage.PUBLISHED,
          description: product.description,
          coverUrl: product.coverUrl,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    await prisma.product.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getProductQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
