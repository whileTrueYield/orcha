import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const createWorkflowMutation = `
mutation CreateWorkflow($input:CreateWorkflowInput!) {
  createWorkflow(
    input: $input
  ) {
    name
    description
    stage
    organization {
      id
    }
  }
}
`;

describe("create workflow", () => {
  it("creates a new workflow as PUBLISHED", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const workflow = {
      name: faker.person.jobTitle(),
      description: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createWorkflowMutation,
      variableValues: {
        input: workflow,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createWorkflow: {
          organization: {
            id: organization.id,
          },
          name: workflow.name,
          description: workflow.description,
          stage: ModelStage.PUBLISHED,
        },
      },
    });
  });

  it("does not create a workflow without a name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const workflow = {
      name: "",
      description: faker.lorem.paragraph(),
      organizationId: organization.id,
    };

    const response = await graphqlRequest({
      source: createWorkflowMutation,
      variableValues: {
        input: workflow,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
