import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const updateProductMutation = `
mutation UpdateProduct($productId: Int!, $input:UpdateProductInput!) {
  updateProduct(
    productId: $productId
    input: $input
  ) {
    id
    name
    code
    stage
    description
    coverUrl
    createdAt
    updatedAt
    isUsingDefaultWorkflows
  }
}
`;

describe("updateProduct", () => {
  it("changes the name of a product", async () => {
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

    const newName = `${faker.person.lastName()} LTD`;
    const response = await graphqlRequest({
      source: updateProductMutation,
      variableValues: {
        productId: product.id,
        input: { name: newName },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateProduct: {
          code: product.code,
          stage: ModelStage.PUBLISHED,
          description: product.description,
          coverUrl: product.coverUrl,
          name: newName,
          id: product.id,
          updatedAt: expect.any(String),
          createdAt: product.createdAt.toISOString(),
          isUsingDefaultWorkflows: true,
        },
      },
    });
  });

  it("can clear a field", async () => {
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
      source: updateProductMutation,
      variableValues: {
        productId: product.id,
        input: {
          description: null,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateProduct.description).toBe(null);
  });

  it("cannot take another product code", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const productA = await prisma.product.create({
      data: {
        name: faker.person.jobTitle(),
        code: "PRDA",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const productB = await prisma.product.create({
      data: {
        name: faker.person.jobTitle(),
        code: "PRDB",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateProductMutation,
      variableValues: {
        productId: productA.id,
        input: { code: productB.code },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
