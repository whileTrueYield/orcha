import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getPersonalTagQuery = `
query getPersonalTag($id: Int!) {
  personalTag(id: $id) {
    id
    name
    createdAt
    updatedAt
    owner {
      name
    }
  }
}
`;

describe("get single personalTag", () => {
  it("retrieves an existing personalTag", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const personalTag = await prisma.personalTag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getPersonalTagQuery,
      variableValues: {
        id: personalTag.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        personalTag: {
          id: personalTag.id,
          name: personalTag.name,
          createdAt: personalTag.createdAt.toISOString(),
          updatedAt: personalTag.updatedAt.toISOString(),
          owner: {
            name: role.name,
          },
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    await prisma.personalTag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getPersonalTagQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
