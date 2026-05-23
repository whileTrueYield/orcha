import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { WorkflowStateStatus } from "@generated/type-graphql";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { ModelStage } from "@prisma/client";
import expect from "expect";
import { pick } from "lodash";

const addWorkflowStateMutation = `
mutation AddWorkflowState($workflowId: Int!, $input: CreateWorkflowStateInput!) {
  addWorkflowState(workflowId: $workflowId, input: $input) {
    id
    name
    createdAt
    updatedAt
    organization {
      id
    }
    states {
      id
      name
    }
  }
}
`;

const deleteWorkflowStateMutation = `
mutation DeleteWorkflowState($workflowStateId: Int!) {
  deleteWorkflowState(workflowStateId: $workflowStateId) {
    id
    name
    createdAt
    updatedAt
    states {
      id
      name
    }
  }
}
`;

const deleteWorkflowMutation = `
mutation DeleteWorkflow($workflowId: Int!) {
  deleteWorkflow(workflowId: $workflowId) {
    id
    stage
  }
}
`;

describe("workflow states", () => {
  it("should add a state", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const workflowName = faker.lorem.word();
    const workflow = await prisma.workflow.create({
      data: {
        name: workflowName,
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    const stateName = faker.lorem.word();
    const response = await graphqlRequest({
      source: addWorkflowStateMutation,
      variableValues: {
        workflowId: workflow.id,
        input: { name: stateName },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        addWorkflowState: {
          name: workflowName,
          id: workflow.id,
          updatedAt: expect.any(String),
          createdAt: workflow.createdAt.toISOString(),
          organization: {
            id: organization.id,
          },
          states: [
            {
              id: expect.any(Number),
              name: stateName,
            },
          ],
        },
      },
    });
  });

  it("should delete a state", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const workflowName = faker.lorem.word();
    const workflow = await prisma.workflow.create({
      data: {
        name: workflowName,
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    const stateNames = [faker.lorem.word(), faker.lorem.word()];
    const states = await Promise.all(
      stateNames.map((stateName) =>
        prisma.workflowState.create({
          data: {
            name: stateName,
            organizationId: organization.id,
            workflowId: workflow.id,
          },
        })
      )
    );

    const response = await graphqlRequest({
      source: deleteWorkflowStateMutation,
      variableValues: {
        workflowStateId: states[0].id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteWorkflowState: {
          name: workflowName,
          id: workflow.id,
          updatedAt: expect.any(String),
          createdAt: workflow.createdAt.toISOString(),
          states: [pick(states[1], ["id", "status", "name"])],
        },
      },
    });
  });

  it("cannot delete all states from a workflow", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const workflowName = faker.lorem.word();
    const workflow = await prisma.workflow.create({
      data: {
        name: workflowName,
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    const state = await prisma.workflowState.create({
      data: {
        name: faker.lorem.word(),
        organizationId: organization.id,
        workflowId: workflow.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteWorkflowStateMutation,
      variableValues: {
        workflowStateId: state.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();
    expect(String(response.errors)).toContain(
      "A workflow requires at least one state"
    );
  });

  it("deletes states when deleting a workflow", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const workflowName = faker.lorem.word();
    const workflow = await prisma.workflow.create({
      data: {
        name: workflowName,
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    const stateName = faker.lorem.word();

    const state = await prisma.workflowState.create({
      data: {
        name: stateName,
        organizationId: organization.id,
        workflowId: workflow.id,
      },
    });

    const response = await graphqlRequest({
      source: deleteWorkflowMutation,
      variableValues: {
        workflowId: workflow.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        deleteWorkflow: {
          id: workflow.id,
          stage: ModelStage.DELETED,
        },
      },
    });

    const deletedState = await prisma.workflowState.findUnique({
      where: { id: state.id },
    });

    expect(deletedState).toBeDefined();
  });
});
