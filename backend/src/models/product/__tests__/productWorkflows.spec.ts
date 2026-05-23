import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomProduct,
  createRandomWorkflow,
} from "../../../utils/testing";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { map, sortBy, take } from "lodash";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const addWorkflows = `
  mutation AddWorkflows($productId: Int!, $workflowIds:[Int!]!) {
    addWorkflows(
      productId: $productId
      workflowIds: $workflowIds
    ) {
      id
      name
      code
      stage
      workflows(sort: "name", first: 4) {
        totalCount
        nodes {
          id
          name
        }
      }
    }
  }
  `;

const removeWorkflows = `
mutation RemoveWorkflows($productId: Int!, $workflowIds:[Int!]!) {
  removeWorkflows(
    productId: $productId
    workflowIds: $workflowIds
  ) {
    id
    name
    code
    stage
    workflows {
      totalCount
      nodes {
        id
        name
      }
    }
  }
}
`;

describe("setWorkflows", () => {
  it("add many workflows", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const product = await createRandomProduct(organization);
    const workflows = [
      await createRandomWorkflow(organization),
      await createRandomWorkflow(organization),
      await createRandomWorkflow(organization),
      await createRandomWorkflow(organization),
      await createRandomWorkflow(organization),
      await createRandomWorkflow(organization),
    ];

    const response = await graphqlRequest({
      source: addWorkflows,
      variableValues: {
        productId: product.id,
        workflowIds: map(workflows, "id"),
      },
      session,
    });

    const expectedWorkflowObjs = map(workflows, ({ id, name }) => ({
      id,
      name,
    }));

    expect(response).toEqual({
      data: {
        addWorkflows: {
          id: product.id,
          name: product.name,
          code: product.code,
          stage: ModelStage.PUBLISHED,
          workflows: {
            totalCount: 6,
            nodes: take(sortBy(expectedWorkflowObjs, "name"), 4),
          },
        },
      },
    });
  });

  it("remove workflows", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const product = await createRandomProduct(organization);
    const workflow = await createRandomWorkflow(organization);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        workflows: {
          set: [{ id: workflow.id }],
        },
      },
    });

    const testProd = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
      include: { workflows: true },
    });

    const testWorkflows = testProd.workflows;

    expect(testWorkflows.length).toBeGreaterThan(0);

    const response = await graphqlRequest({
      source: removeWorkflows,
      variableValues: {
        productId: product.id,
        workflowIds: [workflow.id],
      },
      session,
    });

    expect(response).toEqual({
      data: {
        removeWorkflows: {
          id: product.id,
          name: product.name,
          code: product.code,
          stage: ModelStage.PUBLISHED,
          workflows: { nodes: [], totalCount: 0 },
        },
      },
    });
  });
});
