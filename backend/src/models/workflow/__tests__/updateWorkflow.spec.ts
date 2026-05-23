import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { ModelStage } from "@prisma/client";

const updateWorkflowMutation = `
mutation UpdateWorkflow($workflowId: Int!, $input:UpdateWorkflowInput!) {
  updateWorkflow(
    workflowId: $workflowId
    input: $input
  ) {
    id
    color
    name
    stage
    description
    createdAt
    updatedAt
    isDefaultWorkflow
  }
}
`;

const updateWorkflowStageMutation = `
mutation UpdateWorkflowStage($workflowId: Int!, $stage:ModelStage!) {
  updateWorkflowStage(
    workflowId: $workflowId
    stage: $stage
  ) {
    id
    name
    stage
    description
    createdAt
    updatedAt
    isDefaultWorkflow
  }
}
`;

describe("updateWorkflow", () => {
  it("changes the name of a workflow", async () => {
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

    const newName = `${faker.person.lastName()} LTD`;
    const response = await graphqlRequest({
      source: updateWorkflowMutation,
      variableValues: {
        workflowId: workflow.id,
        input: { name: newName, color: "blue" },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateWorkflow: {
          stage: workflow.stage,
          description: workflow.description,
          name: newName,
          color: "blue",
          id: workflow.id,
          updatedAt: expect.any(String),
          createdAt: workflow.createdAt.toISOString(),
          isDefaultWorkflow: true,
        },
      },
    });
  });

  it("can change the stage of a workflow", async () => {
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
      source: updateWorkflowStageMutation,
      variableValues: {
        workflowId: workflow.id,
        stage: ModelStage.ARCHIVED,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateWorkflowStage: {
          id: workflow.id,
          name: workflow.name,
          stage: ModelStage.ARCHIVED,
          description: workflow.description,
          createdAt: workflow.createdAt.toISOString(),
          updatedAt: expect.any(String),
          isDefaultWorkflow: true,
        },
      },
    });
  });

  it("cannot take another workflow name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const workflowA = await prisma.workflow.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        stage: ModelStage.PUBLISHED,
        organizationId: organization.id,
      },
    });

    const workflowB = await prisma.workflow.create({
      data: {
        name: faker.person.jobTitle(),
        description: faker.lorem.paragraph(),
        stage: ModelStage.PUBLISHED,
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateWorkflowMutation,
      variableValues: {
        workflowId: workflowA.id,
        input: { name: workflowB.name },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
