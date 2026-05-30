import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getTeamsQuery = `
query getTeams {
  teams (first: 2, sort: "name") {
    totalCount
    nodes {
      name
      description
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

describe("get many teams", () => {
  it("returns pagination and an array of teams", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const teamPromises = map(range(5), (counter) =>
      prisma.team.create({
        data: {
          name: faker.person.jobTitle(),
          code: `ABCD${counter}`,
          description: faker.lorem.paragraph(),
          organizationId: organization.id,
        },
      }),
    );

    const teams = await Promise.all(teamPromises);

    const response = await graphqlRequest({
      source: getTeamsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        teams: {
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

    const sortedTeams = sortBy(teams, "name");
    expect(response.data!.teams.nodes.length).toBe(2);
    expect(sortedTeams[0]).toMatchObject(response.data!.teams.nodes[0]);
    expect(sortedTeams[1]).toMatchObject(response.data!.teams.nodes[1]);
  });
});
