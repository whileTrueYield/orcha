import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const updateTagMutation = `
mutation UpdateTag($tagId: Int!, $input:UpdateTagInput!) {
  updateTag(
    tagId: $tagId
    input: $input
  ) {
    id
    name
    color
    createdAt
    updatedAt
  }
}
`;

describe("updateTag", () => {
  it("changes the name of a tag", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const tag = await prisma.tag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const newName = `${faker.person.lastName()} LTD`;

    const response = await graphqlRequest({
      source: updateTagMutation,
      variableValues: {
        tagId: tag.id,
        input: { name: newName, color: "red" },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateTag: {
          id: tag.id,
          name: newName,
          color: "red",
          updatedAt: expect.any(String),
          createdAt: tag.createdAt.toISOString(),
        },
      },
    });
  });

  it("cannot take another tag name", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const tagA = await prisma.tag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const tagB = await prisma.tag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    // update TagA with TagB's name
    const response = await graphqlRequest({
      source: updateTagMutation,
      variableValues: {
        tagId: tagA.id,
        input: { name: tagB.name },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
