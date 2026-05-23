import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const updateProjectNameMutation = `
mutation UpdateProjectName($projectId: Int!, $name:String!) {
  updateProjectName(
    projectId: $projectId
    name: $name
  ) {
    name
  }
}
`;

describe("updateProject", () => {
  it("changes the name of a project", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const project = await prisma.project.create({
      data: {
        name: Math.random() + "project name",
        organizationId: organization.id,
      },
    });

    const newName = project.name + " new";
    const response = await graphqlRequest({
      source: updateProjectNameMutation,
      variableValues: {
        projectId: project.id,
        name: newName,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateProjectName: { name: newName },
      },
    });
  });

  it("append 'copy' when using an existing project name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const organizationId = organization.id;

    const projectA = await prisma.project.create({
      data: {
        name: Math.random() + faker.person.jobTitle(),
        organizationId,
      },
    });

    const projectB = await prisma.project.create({
      data: {
        name: Math.random() + faker.person.jobTitle(),
        organizationId,
      },
    });

    // update ProjectA with ProjectB's path
    const response = await graphqlRequest({
      source: updateProjectNameMutation,
      variableValues: {
        projectId: projectA.id,
        name: projectB.name,
      },
      session,
    });

    expect(response.data).toBeDefined();

    expect(response).toEqual({
      data: {
        updateProjectName: { name: projectB.name + " copy" },
      },
    });
  });
});
