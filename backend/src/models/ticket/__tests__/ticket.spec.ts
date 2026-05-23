import {
  graphqlRequest,
  createRandomProduct,
  getTestSessionWithRole,
  createRandomWorkflow,
  createRandomTicket,
  createRandomFeature,
  createRandomProject,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType, TicketStatus } from "@generated/type-graphql";
import prisma from "../../../prisma";
import { get } from "lodash";
import { ModelStage } from "@prisma/client";
import expect from "expect";

const getTicketQuery = `
query getTicket($id: Int!) {
  ticket(id: $id) {
    id
    title
    status
    createdAt
    updatedAt
    author {
      id
    }
    product {
      id
      name
    }
    organization {
      id
      name
    }
    state {
      id
    }
    scheduleItems {
      id
    }
    workflow {
      id
      name
    }
    features {
      id
      name
    }
  }
}
`;

const addTicketFeaturesMutation = `
mutation AddTicketFeatures($ticketId: Int!, $featureIds: [Int]!) {
  addTicketFeatures(ticketId: $ticketId, featureIds: $featureIds) {
    id
    title
    features {
      id
      name
    }
  }
}
`;

const removeTicketFeaturesMutation = `
mutation RemoveTicketFeatures($ticketId: Int!, $featureIds: [Int]!) {
  removeTicketFeatures(ticketId: $ticketId, featureIds: $featureIds) {
    id
    title
    features {
      id
      name
    }
  }
}
`;

describe("ticket features", () => {
  it("add/remove features to a ticket", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const { ticket, product } = await createRandomTicket(organization, role);
    const { feature: featureA, featureGroup } = await createRandomFeature(
      organization,
      product,
    );
    const { feature: featureB } = await createRandomFeature(
      organization,
      product,
      featureGroup,
    );

    const addResponse = await graphqlRequest({
      source: addTicketFeaturesMutation,
      variableValues: {
        ticketId: ticket.id,
        featureIds: [featureA.id, featureB.id],
      },
      session,
    });

    expect(addResponse).toEqual({
      data: {
        addTicketFeatures: {
          id: ticket.id,
          title: ticket.title,
          features: [
            {
              id: featureA.id,
              name: featureA.name,
            },
            {
              id: featureB.id,
              name: featureB.name,
            },
          ],
        },
      },
    });

    const removeResponse = await graphqlRequest({
      source: removeTicketFeaturesMutation,
      variableValues: {
        ticketId: ticket.id,
        featureIds: [featureA.id],
      },
      session,
    });

    expect(removeResponse).toEqual({
      data: {
        removeTicketFeatures: {
          id: ticket.id,
          title: ticket.title,
          features: [
            {
              id: featureB.id,
              name: featureB.name,
            },
          ],
        },
      },
    });
  });
});

describe("get single ticket", () => {
  it("retrieves an existing ticket", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );

    const project = await createRandomProject(organization);
    const workflow = await createRandomWorkflow(organization);
    const product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });
    const { feature } = await createRandomFeature(organization, product);

    const ticket = await prisma.ticket.create({
      data: {
        title: `Take care of the ${faker.commerce.product()}`,
        status: TicketStatus.UNSCHEDULED,
        product: { connect: { id: product.id } },
        author: { connect: { id: role.id } },
        organization: { connect: { id: organization.id } },
        workflow: { connect: { id: workflow.id } },
        features: { connect: [{ id: feature.id }] },
        project: { connect: { id: project.id } },
      },
    });

    const response = await graphqlRequest({
      source: getTicketQuery,
      variableValues: {
        id: ticket.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        ticket: {
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          updatedAt: ticket.updatedAt.toISOString(),
          createdAt: ticket.createdAt.toISOString(),
          author: {
            id: role.id,
          },
          organization: {
            id: organization.id,
            name: organization.name,
          },
          product: {
            id: product.id,
            name: product.name,
          },
          state: null,
          scheduleItems: [],
          features: [{ id: feature.id, name: feature.name }],
          workflow: {
            id: workflow.id,
            name: workflow.name,
          },
        },
      },
    });
  });

  it("returns error when not found", async () => {
    const { organization, session, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);
    const workflow = await createRandomWorkflow(organization);
    const product = await createRandomProduct(organization, {
      workflows: { connect: [{ id: workflow.id }] },
    });

    const ticket = await prisma.ticket.create({
      data: {
        title: `Take care of the ${faker.commerce.product()}`,
        productId: product.id,
        authorId: role.id,
        stage: ModelStage.DELETED,
        organizationId: organization.id,
        workflowId: workflow.id,
        projectId: project.id,
      },
    });

    const response = await graphqlRequest({
      source: getTicketQuery,
      variableValues: {
        id: ticket.id,
      },
      session,
    });

    expect(get(response, "errors.0.message")).toBe("No Ticket found");
  });
});
