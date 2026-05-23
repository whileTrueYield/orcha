import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { ModelStage, RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getWorkflowQuery = `
query getWorkflow($id: Int!) {
  workflow(id: $id) {
    id
    name
    stage
    description
    createdAt
    updatedAt
  }
}
`;

describe("get single workflow", () => {
  it("retrieves an existing workflow", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const workflow = await prisma.workflow.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        stage: ModelStage.PUBLISHED,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getWorkflowQuery,
      variableValues: {
        id: workflow.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          stage: workflow.stage,
          description: workflow.description,
          createdAt: workflow.createdAt.toISOString(),
          updatedAt: workflow.updatedAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    await prisma.workflow.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        stage: ModelStage.PUBLISHED,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getWorkflowQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
