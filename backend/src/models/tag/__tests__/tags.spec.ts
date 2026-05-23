import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getTagsQuery = `
query getTags {
  tags (first: 2, sort: "name") {
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

describe("get many tags", () => {
  it("returns pagination and an array of tags", async () => {
    const { role, session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const tagPromises = map(range(5), (counter) =>
      prisma.tag.create({
        data: {
          name: faker.person.jobTitle() + counter,
          organizationId: organization.id,
          authorId: role.id,
        },
      }),
    );

    const tags = await Promise.all(tagPromises);

    const response = await graphqlRequest({
      source: getTagsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        tags: {
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

    const sortedTags = sortBy(tags, "name");
    expect(response.data!.tags.nodes.length).toBe(2);
    expect(sortedTags[0].name).toEqual(response.data!.tags.nodes[0].name);
    expect(sortedTags[1].name).toEqual(response.data!.tags.nodes[1].name);
  });
});
