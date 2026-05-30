import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getProjectQuery = `
query getProject($id: Int!) {
  project(id: $id) {
    id
    name
    createdAt
    updatedAt
  }
}
`;

describe("get single project", () => {
  it("retrieves an existing project", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const project = await prisma.project.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getProjectQuery,
      variableValues: {
        id: project.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        project: {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
        },
      },
    });
  });

  it("throws an error when not found", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    await prisma.project.create({
      data: {
        name: faker.person.jobTitle(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getProjectQuery,
      variableValues: {
        path: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
