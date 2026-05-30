import { graphqlRequest, getTestSession } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { OrganizationStatus } from "@prisma/client";
import { map, range } from "lodash";
import { v4 as uuid } from "uuid";
import prisma from "../../../prisma";
import expect from "expect";

const getOrganizationsQuery = `
query getOrganizations {
  organizations (first: 2, sort: "id") {
    totalCount
    nodes {
      name
      about
      coverUrl
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

describe("get many organizations", () => {
  it("returns pagination and an array of organizations", async () => {
    const { session } = await getTestSession(true);

    const organizationPromises = map(range(5), () => {
      return prisma.organization.create({
        data: {
          name: `${faker.person.lastName()} co -${uuid()}`,
          status: OrganizationStatus.ACTIVE,
        },
      });
    });

    await Promise.all(organizationPromises);

    const response = await graphqlRequest({
      source: getOrganizationsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        organizations: {
          totalCount: expect.any(Number),
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: expect.any(Number),
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    expect(response.data!.organizations.nodes.length).toBe(2);
    expect(response.data!.organizations.nodes[0]).toBeDefined();
    expect(response.data!.organizations.nodes[1]).toBeDefined();
  });
});
