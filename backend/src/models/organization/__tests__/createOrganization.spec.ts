import { graphqlRequest, getTestSession } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { OrganizationStatus, RoleType } from "@generated/type-graphql";
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
