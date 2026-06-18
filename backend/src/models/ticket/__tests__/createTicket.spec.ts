import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
  createRandomWorkflow,
  createRandomProject,
} from "../../../utils/testing";
import prisma from "../../../prisma";
import { getBody } from "../../../markdown/bodyRepository";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
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

// The two round-trip-saving extras (#3): seed the body and assign an owner in
// the same call that creates the ticket. ownerId is a plain ticket field; body
// funnels through the one ADR-0007 write path (writeDocumentBody) just as a
// later update_ticket_body would.
const createTicketIdMutation = `
mutation CreateTicket($input: CreateTicketInput!) {
  createTicket(input: $input) {
    id
    title
  }
}
`;

describe("create ticket with body and owner", () => {
  it("seeds the Markdown body on creation", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);

    const response = await graphqlRequest({
      source: createTicketIdMutation,
      variableValues: {
        input: {
          title: "With body",
          projectId: project.id,
          body: "## Heading\n\nSome initial content.",
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    const id = response.data?.createTicket.id as number;

    // The body went through the real write path, so it reads back at a version
    // past the empty-body baseline (0).
    const stored = await getBody("ticket", id);
    expect(stored.markdown).toContain("Some initial content.");
    expect(stored.version).toBeGreaterThan(0);
  });

  it("assigns a provided ownerId on creation", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    // A second role in the SAME org — a valid owner target.
    const otherOwner = await getTestSessionWithRole(
      RoleType.MEMBER,
      false,
      organization,
    );
    const project = await createRandomProject(organization);

    const response = await graphqlRequest({
      source: createTicketIdMutation,
      variableValues: {
        input: {
          title: "Owned by another",
          projectId: project.id,
          ownerId: otherOwner.role.id,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    const persisted = await prisma.ticket.findUnique({
      where: { id: response.data?.createTicket.id },
    });
    expect(persisted!.ownerId).toBe(otherOwner.role.id);
  });

  it("defaults the owner to the creator when ownerId is omitted", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);

    const response = await graphqlRequest({
      source: createTicketIdMutation,
      variableValues: {
        input: { title: "Owned by me", projectId: project.id },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    const persisted = await prisma.ticket.findUnique({
      where: { id: response.data?.createTicket.id },
    });
    expect(persisted!.ownerId).toBe(role.id);
  });

  it("rejects an ownerId outside the caller's organization", async () => {
    const { organization, session } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    // A role in a DIFFERENT org — must not be assignable as owner.
    const foreign = await getTestSessionWithRole(RoleType.MEMBER);
    const project = await createRandomProject(organization);

    const response = await graphqlRequest({
      source: createTicketIdMutation,
      variableValues: {
        input: {
          title: "Cross-tenant owner",
          projectId: project.id,
          ownerId: foreign.role.id,
        },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
