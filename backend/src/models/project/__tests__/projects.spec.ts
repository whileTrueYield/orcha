import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getProjectsQuery = `
query getProjects {
  projects (first: 2, sort: "name") {
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

describe("get many projects", () => {
  it("returns pagination and an array of projects", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const projectPromises = map(range(5), (counter) =>
      prisma.project.create({
        data: {
          name: faker.person.jobTitle() + counter,
          organizationId: organization.id,
        },
      }),
    );

    const projects = await Promise.all(projectPromises);

    const response = await graphqlRequest({
      source: getProjectsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        projects: {
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

    const sortedProjects = sortBy(projects, "name");
    expect(response.data!.projects.nodes.length).toBe(2);
    expect(sortedProjects[0]).toMatchObject(response.data!.projects.nodes[0]);
    expect(sortedProjects[1]).toMatchObject(response.data!.projects.nodes[1]);
  });
});
