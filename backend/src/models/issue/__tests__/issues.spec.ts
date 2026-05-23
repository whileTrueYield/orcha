import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getIssuesQuery = `
query getIssues {
  issues (first: 2, sort: "description") {
    totalCount
    nodes {
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

describe("get many issues", () => {
  it("returns pagination and an array of issues", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { support: true });

    const product = await createRandomProduct(organization);

    const issuePromises = map(range(5), async (counter) => {
      return prisma.issue.create({
        data: {
          localId: counter,
          description: counter.toString() + faker.lorem.paragraph(),
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
    });

    const issues = await Promise.all(issuePromises);

    const response = await graphqlRequest({
      source: getIssuesQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        issues: {
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

    const sortedIssues = sortBy(issues, "description");
    expect(response.data!.issues.nodes.length).toBe(2);
    expect(sortedIssues[0]).toMatchObject(response.data!.issues.nodes[0]);
    expect(sortedIssues[1]).toMatchObject(response.data!.issues.nodes[1]);
  });
});
