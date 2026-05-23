import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { ModelStage, RoleType } from "@generated/type-graphql";
import expect from "expect";

const createProductMutation = `
mutation CreateProduct($input:CreateProductInput!) {
  createProduct(
    input: $input
  ) {
    name
    description
    code
    stage
    organization {
      id
    }
  }
}
`;

describe("create product", () => {
  it("creates a new product as draft", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const product = {
      name: faker.person.jobTitle(),
      code: "ABCDE",
      description: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createProductMutation,
      variableValues: {
        input: product,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createProduct: {
          organization: {
            id: organization.id,
          },
          name: product.name,
          description: product.description,
          code: product.code,
          stage: ModelStage.PUBLISHED,
        },
      },
    });
  });

  it("does not create a product without a code", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const product = {
      name: faker.person.jobTitle(),
      code: "",
      description: faker.lorem.paragraph(),
      organizationId: organization.id,
    };

    const response = await graphqlRequest({
      source: createProductMutation,
      variableValues: {
        input: product,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
