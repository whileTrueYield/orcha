import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { map } from "lodash";
import { ModelStage } from "@prisma/client";

const deleteProjectMutation = `
mutation deleteProject($projectId: Int!) {
  deleteProject(projectId: $projectId)
}
`;

describe("delete project", () => {
  it("can delete an empty project", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let project = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
      },
    });

    // this should delete the child project and its tickets
    const response = await graphqlRequest({
      source: deleteProjectMutation,
      variableValues: {
        projectId: project.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const deletedProject = await prisma.project.findUnique({
      where: { id: project.id },
    });

    expect(deletedProject).toBeNull();
  });

  it("cannot delete a project with sub projects", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let parent = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
      },
    });

    let child = await prisma.project.create({
      data: {
        name: "two",
        organizationId: organization.id,
        parentId: parent.id,
        stage: ModelStage.ARCHIVED,
      },
    });

    await prisma.project.create({
      data: {
        name: "three",
        organizationId: organization.id,
        parentId: child.id,
        stage: ModelStage.ARCHIVED,
      },
    });

    // this should delete the child project and its tickets
    const response = await graphqlRequest({
      source: deleteProjectMutation,
      variableValues: {
        projectId: child.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("cannot delete a project with tickets", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let project = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
      },
    });

    const ticket = await prisma.ticket.create({
      data: {
        title: "grand child ticket",
        organizationId: organization.id,
        projectId: project.id,
      },
    });

    // this should delete the child project and its tickets
    const response = await graphqlRequest({
      source: deleteProjectMutation,
      variableValues: {
        projectId: project.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
