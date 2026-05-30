import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { map } from "lodash";
import { ModelStage } from "@prisma/client";

const unarchiveProjectMutation = `
mutation unarchiveProject($projectId: Int!) {
  unarchiveProject(projectId: $projectId) {
    ancestorIsArchived
    stage
  }
}
`;

describe("unarchive project", () => {
  it("unarchive all sub projects", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let parent = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    let child = await prisma.project.create({
      data: {
        name: "two",
        organizationId: organization.id,
        parentId: parent.id,
        stage: ModelStage.ARCHIVED,
        ancestorIsArchived: false,
      },
    });

    let grandChild = await prisma.project.create({
      data: {
        name: "three",
        organizationId: organization.id,
        parentId: child.id,
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: true,
      },
    });

    const grandChildTicket = await prisma.ticket.create({
      data: {
        title: "grand child ticket",
        organizationId: organization.id,
        projectId: grandChild.id,
      },
    });

    const parentTicket = await prisma.ticket.create({
      data: {
        title: "parent ticket",
        organizationId: organization.id,
        projectId: parent.id,
      },
    });

    // this should unarchive the child project and its tickets
    const response = await graphqlRequest({
      source: unarchiveProjectMutation,
      variableValues: {
        projectId: child.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    parent = await prisma.project.findUniqueOrThrow({
      where: {
        id: parent.id,
      },
    });

    expect(parent.stage).toBe(ModelStage.PUBLISHED);
    expect(child.ancestorIsArchived).toBe(false);

    child = await prisma.project.findUniqueOrThrow({
      where: {
        id: child.id,
      },
    });

    expect(child.stage).toBe(ModelStage.PUBLISHED);
    expect(child.ancestorIsArchived).toBe(false);

    grandChild = await prisma.project.findUniqueOrThrow({
      where: {
        id: grandChild.id,
      },
    });

    expect(grandChild.stage).toBe(ModelStage.PUBLISHED);
    expect(child.ancestorIsArchived).toBe(false);

    // tickets stage should not be impacted
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: [grandChildTicket.id, parentTicket.id] } },
    });

    expect(tickets.length).toBe(2);
    expect(map(tickets, "stage")).toEqual([ModelStage.DRAFT, ModelStage.DRAFT]);
  });

  it("cannot unarchive project if parent is archived or deleted", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let parent = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
        stage: ModelStage.ARCHIVED,
      },
    });

    let child = await prisma.project.create({
      data: {
        name: "two",
        organizationId: organization.id,
        parentId: parent.id,
        stage: ModelStage.ARCHIVED,
        ancestorIsArchived: true,
      },
    });

    let grandChild = await prisma.project.create({
      data: {
        name: "three",
        organizationId: organization.id,
        parentId: child.id,
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: true,
      },
    });

    const grandChildTicket = await prisma.ticket.create({
      data: {
        title: "grand child ticket",
        organizationId: organization.id,
        projectId: grandChild.id,
      },
    });

    const parentTicket = await prisma.ticket.create({
      data: {
        title: "parent ticket",
        organizationId: organization.id,
        projectId: parent.id,
      },
    });

    // this should not unarchive the child project and its tickets
    const response = await graphqlRequest({
      source: unarchiveProjectMutation,
      variableValues: {
        projectId: child.id,
      },
      session,
    });

    expect(response.data?.unarchiveProject).toEqual({
      ancestorIsArchived: true,
      stage: ModelStage.PUBLISHED,
    });
  });
});
