import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import { map, range, sortBy } from "lodash";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getWorkflowsQuery = `
query getWorkflows {
  workflows (first: 2, sort: "name") {
    totalCount
    nodes {
      name
      stage
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

describe("get many workflows", () => {
  it("returns pagination and an array of workflows", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const workflowPromises = map(range(5), (counter) =>
      prisma.workflow.create({
        data: {
          name: faker.person.jobTitle() + counter,
          description: faker.lorem.paragraph(),
          stage: ModelStage.PUBLISHED,
          organizationId: organization.id,
        },
      }),
    );

    const workflows = await Promise.all(workflowPromises);

    const response = await graphqlRequest({
      source: getWorkflowsQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        workflows: {
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

    const sortedWorkflows = sortBy(workflows, "name");
    expect(response.data!.workflows.nodes.length).toBe(2);
    expect(sortedWorkflows[0]).toMatchObject(response.data!.workflows.nodes[0]);
    expect(sortedWorkflows[1]).toMatchObject(response.data!.workflows.nodes[1]);
  });
});
