import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getIssueQuery = `
query getIssue($id: Int!) {
  issue(id: $id) {
    id
    description
    createdAt
    email
    name
    organization {
      id
    }
  }
}
`;

describe("get single issue", () => {
  it("retrieves an existing issue", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { support: true });

    const product = await createRandomProduct(organization);

    const issue = await prisma.issue.create({
      data: {
        localId: 1,
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
        email: "foo@example.com",
        name: "john doe",
        productId: product.id,
        url: "foo/bar",
        metaData: "",
        userAgent: "",
        token: Math.random().toString(),
      },
    });

    const response = await graphqlRequest({
      source: getIssueQuery,
      variableValues: {
        id: issue.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        issue: {
          id: issue.id,
          description: issue.description,
          name: issue.name,
          email: issue.email,
          organization: {
            id: organization.id,
          },
          createdAt: issue.createdAt.toISOString(),
        },
      },
    });
  });

  it("throws an exception when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: getIssueQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
