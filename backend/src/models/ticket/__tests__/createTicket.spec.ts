import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
  createRandomWorkflow,
  createRandomProject,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const createTicketMutation = `
mutation CreateTicket($input:CreateTicketInput!) {
  createTicket(
    input: $input
  ) {
    title
    stage
    organization {
      id
    }
    product {
      id
    }
    project {
      id
    }
    workflow {
      id
    }
    author {
      id
    }
  }
}
`;

describe("create ticket", () => {
  it("creates a new ticket as PUBLISHED", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const workflow = await createRandomWorkflow(organization);
    const project = await createRandomProject(organization);
    const product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });

    const ticket = {
      title: `Take care of the ${faker.commerce.product()}`,
      productId: product.id,
      workflowId: workflow.id,
      projectId: project.id,
      stage: ModelStage.PUBLISHED,
    };

    const response = await graphqlRequest({
      source: createTicketMutation,
      variableValues: {
        input: ticket,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createTicket: {
          title: ticket.title,
          stage: ModelStage.PUBLISHED,
          author: {
            id: role.id,
          },
          organization: {
            id: organization.id,
          },
          workflow: {
            id: workflow.id,
          },
          product: {
            id: product.id,
          },
          project: {
            id: project.id,
          },
        },
      },
    });
  });

  it("does not accept a workflow that does not belong to the product", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const workflow = await createRandomWorkflow(organization, {
      isDefaultWorkflow: false,
    });
    const product = await createRandomProduct(organization);
    const project = await createRandomProject(organization);

    const ticket = {
      title: `Take care of the ${faker.commerce.product()}`,
      productId: product.id,
      projectId: project.id,
      workflowId: workflow.id,
    };

    const response = await graphqlRequest({
      source: createTicketMutation,
      variableValues: {
        input: ticket,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("does not accept a public workflow when product does not use them", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const workflow = await createRandomWorkflow(organization, {
      isDefaultWorkflow: true,
    });

    const product = await createRandomProduct(organization, {
      isUsingDefaultWorkflows: false,
    });
    const project = await createRandomProject(organization);

    const ticket = {
      title: `Take care of the ${faker.commerce.product()}`,
      productId: product.id,
      workflowId: workflow.id,
      projectId: project.id,
    };

    const response = await graphqlRequest({
      source: createTicketMutation,
      variableValues: {
        input: ticket,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("does accept a default workflow even if not included in product", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const workflow = await createRandomWorkflow(organization, {
      isDefaultWorkflow: true,
    });
    const product = await createRandomProduct(organization);
    const project = await createRandomProject(organization);

    const ticket = {
      title: `Take care of the ${faker.commerce.product()}`,
      productId: product.id,
      workflowId: workflow.id,
      projectId: project.id,
    };

    const response = await graphqlRequest({
      source: createTicketMutation,
      variableValues: {
        input: ticket,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createTicket: {
          title: ticket.title,
          stage: ModelStage.DRAFT,
          author: {
            id: role.id,
          },
          organization: {
            id: organization.id,
          },
          workflow: {
            id: workflow.id,
          },
          product: {
            id: product.id,
          },
          project: {
            id: project.id,
          },
        },
      },
    });
  });

  it("creates a ticket with a missing product ID as Draft", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);
    const ticket = {
      title: `Build ${faker.commerce.product()}`,
    };

    const response = await graphqlRequest({
      source: createTicketMutation,
      variableValues: {
        input: { ...ticket, projectId: project.id },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data?.createTicket).toMatchObject({
      ...ticket,
      project: {
        id: project.id,
      },
      stage: ModelStage.DRAFT,
    });
  });
});
