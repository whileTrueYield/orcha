import { graphqlRequest, getTestSession } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { OrganizationStatus, RoleType } from "@prisma/client";
import { v4 as uuid } from "uuid";
import prisma from "../../../prisma";
import expect from "expect";

const createOrganizationMutation = `
mutation CreateOrganization($input:CreateOrganizationInput!) {
  createOrganization(
    input: $input
  ) {
    organization {
      id
      name
      status
    }
    project {
      id
    }
  }
}
`;

describe("create organization", () => {
  it("creates a new organization as active with initial values", async () => {
    const organization = {
      name: `${faker.person.lastName()} co ${uuid()}`,
    };

    const { session, user } = await getTestSession();

    const response = await graphqlRequest({
      source: createOrganizationMutation,
      variableValues: {
        input: {
          ...organization,
          userName: faker.person.firstName(),
          timeZone: "America/Los_Angeles",
        },
      },
      session: session,
    });

    expect(response).toEqual({
      data: {
        createOrganization: {
          organization: {
            id: expect.any(Number),
            ...organization,
            status: OrganizationStatus.ACTIVE,
          },
          project: {
            id: expect.any(Number),
          },
        },
      },
    });

    // should create an owner role
    const organizationId = response.data!.createOrganization.id;
    const ownerRole = await prisma.role.findFirst({
      where: {
        userId: user.id,
        organizationId: response.data!.createOrganization.id,
      },
    });
    expect(ownerRole).toBeDefined();
    expect(ownerRole?.type).toBe(RoleType.OWNER);

    const workflows = await prisma.workflow.findMany({
      where: { organizationId },
    });
    expect(workflows.length).toBeGreaterThan(0);
  });

  it("seeds the Getting Started project with a Markdown body and search index", async () => {
    const { session } = await getTestSession();

    const response = await graphqlRequest({
      source: createOrganizationMutation,
      variableValues: {
        input: {
          name: `${faker.person.lastName()} co ${uuid()}`,
          userName: faker.person.firstName(),
          timeZone: "America/Los_Angeles",
        },
      },
      session,
    });

    const projectId = response.data!.createOrganization.project.id;

    // The body is Markdown (ADR 0007), stored in projectText, not Yjs bytes.
    const text = await prisma.projectText.findUnique({
      where: { projectId },
    });
    expect(text?.markdown).toContain("# Welcome to Orcha");
    expect(text?.version).toBe(1);

    // ...and search is populated from it, with Markdown syntax stripped.
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { indexableContent: true },
    });
    expect(project?.indexableContent).toContain("Welcome to Orcha");
    // The heading's `#` marker is stripped in the plain-text index.
    expect(project?.indexableContent).not.toContain("# Welcome");
  });

  it("does not create a organization with an incomplete address", async () => {
    const organization = {
      name: `${faker.person.lastName()} co ${uuid()}`,
      city: `${faker.location.city()}`,
      zipcode: `${faker.location.zipCode()}`,
      state: `${faker.location.state()}`,
    };

    const response = await graphqlRequest({
      source: createOrganizationMutation,
      variableValues: {
        input: organization,
      },
    });

    expect(response.errors).toBeDefined();
  });
});
