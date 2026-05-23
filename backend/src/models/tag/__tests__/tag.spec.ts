import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getTagQuery = `
query getTag($id: Int!) {
  tag(id: $id) {
    id
    name
    createdAt
    updatedAt
    author {
      name
    }
  }
}
`;

describe("get single tag", () => {
  it("retrieves an existing tag", async () => {
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

    const response = await graphqlRequest({
      source: getTagQuery,
      variableValues: {
        id: tag.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        tag: {
          id: tag.id,
          name: tag.name,
          createdAt: tag.createdAt.toISOString(),
          updatedAt: tag.updatedAt.toISOString(),
          author: {
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
    await prisma.tag.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
        authorId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getTagQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
