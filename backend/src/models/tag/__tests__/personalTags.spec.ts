import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getPersonalTagsQuery = `
query getPersonalTags {
  personalTags (first: 2, sort: "name") {
    totalCount
    nodes {
      name
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

describe("get many personalTags", () => {
  it("returns pagination and an array of personalTags", async () => {
    const { role, session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const personalTagPromises = map(range(5), (counter) =>
      prisma.personalTag.create({
        data: {
          name: faker.person.jobTitle() + counter,
          organizationId: organization.id,
          ownerId: role.id,
        },
      }),
    );

    const personalTags = await Promise.all(personalTagPromises);

    const response = await graphqlRequest({
      source: getPersonalTagsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        personalTags: {
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

    const sortedPersonalTags = sortBy(personalTags, "name");
    expect(response.data!.personalTags.nodes.length).toBe(2);
    expect(sortedPersonalTags[0].name).toBe(
      response.data!.personalTags.nodes[0].name,
    );
    expect(sortedPersonalTags[1].name).toBe(
      response.data!.personalTags.nodes[1].name,
    );
  });
});
