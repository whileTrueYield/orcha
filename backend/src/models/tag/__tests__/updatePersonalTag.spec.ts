import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const updatePersonalTagMutation = `
mutation UpdatePersonalTag($tagId: Int!, $input:UpdatePersonalTagInput!) {
  updatePersonalTag(
    tagId: $tagId
    input: $input
  ) {
    id
    name
    owner {
      id
      name
    }
    createdAt
    updatedAt
  }
}
`;

describe("updatePersonalTag", () => {
  it("changes the name of a personalTag", async () => {
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

    const newName = `${faker.person.lastName()} LTD`;
    const response = await graphqlRequest({
      source: updatePersonalTagMutation,
      variableValues: {
        tagId: personalTag.id,
        input: { name: newName },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updatePersonalTag: {
          id: personalTag.id,
          name: newName,
          updatedAt: expect.any(String),
          createdAt: personalTag.createdAt.toISOString(),
          owner: {
            id: role.id,
            name: role.name,
          },
        },
      },
    });
  });

  it("cannot take another personalTag name", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const personalTagA = await prisma.personalTag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const personalTagB = await prisma.personalTag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    // update PersonalTagA with PersonalTagB's name
    const response = await graphqlRequest({
      source: updatePersonalTagMutation,
      variableValues: {
        personalTagId: personalTagA.id,
        input: { name: personalTagB.name },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
