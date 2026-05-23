import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { OrganizationStatus, RoleType } from "@generated/type-graphql";
import { v4 as uuid } from "uuid";
import prisma from "../../../prisma";
import expect from "expect";

const updateOrganizationMutation = `
mutation UpdateOrganization($input:UpdateOrganizationInput!) {
  updateOrganization(
    input: $input
  ) {
    id
    name
    status
    about
    coverUrl
    showOnboarding
    createdAt
    updatedAt
    billingAddress {
      id
      organizationId
      address1
      address2
      zipcode
      city
      state
      country
    }
  }
}
`;

describe("updateOrganization", () => {
  it("changes the name of an organization", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.OWNER,
    );

    const newName = `${faker.person.lastName()} ${uuid()}`;
    const response = await graphqlRequest({
      source: updateOrganizationMutation,
      variableValues: {
        organizationId: organization.id,
        input: { name: newName },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect({
      ...organization,
      name: newName,
      id: organization.id,
      updatedAt: expect.any(String),
      createdAt: organization.createdAt.toISOString(),
    }).toMatchObject(response.data!.updateOrganization);
  });

  it("accepts a partial address update", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.OWNER,
    );

    const billingAddress = organization.billingAddress!;

    const newAddress = faker.location.streetAddress();
    const response = await graphqlRequest({
      source: updateOrganizationMutation,
      variableValues: {
        organizationId: organization.id,
        input: {
          billingAddress: {
            address1: newAddress,
            zipcode: billingAddress!.zipcode,
            city: billingAddress!.city,
            state: billingAddress!.state,
            country: billingAddress!.country,
          },
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateOrganization.billingAddress.address1).toBe(
      newAddress,
    );
    expect(response.data!.updateOrganization.billingAddress.state).toBe(
      billingAddress.state,
    );
  });

  it("can clear a field", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.OWNER,
    );

    const billingAddress = organization.billingAddress!;

    const response = await graphqlRequest({
      source: updateOrganizationMutation,
      variableValues: {
        organizationId: organization.id,
        input: {
          billingAddress: {
            address1: billingAddress.address1,
            address2: null,
            zipcode: billingAddress.zipcode,
            city: billingAddress.city,
            state: billingAddress.state,
            country: billingAddress.country,
          },
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateOrganization.billingAddress.address2).toBe(
      null,
    );
    expect(response.data!.updateOrganization.billingAddress.address1).toBe(
      billingAddress.address1,
    );
  });

  it("cannot change the status of a organization", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const response = await graphqlRequest({
      source: updateOrganizationMutation,
      variableValues: {
        organizationId: organization.id,
        input: { status: "active" },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("cannot take another organization name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const organizationB = await prisma.organization.create({
      data: {
        name: `${faker.person.lastName()} co ${uuid()}`,
        status: OrganizationStatus.ACTIVE,
      },
    });

    const response = await graphqlRequest({
      source: updateOrganizationMutation,
      variableValues: {
        organizationId: organization.id,
        input: { name: organizationB.name.toUpperCase() },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
