import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  createRandomProduct,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";
import { map } from "lodash";
import { ModelStage, TicketStatus } from "@prisma/client";

const archiveProjectMutation = `
mutation archiveProject($projectId: Int!) {
  archiveProject(projectId: $projectId) {
    id
    stage
  }
}
`;

describe("archive project", () => {
  it("archive all sub projects", async () => {
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
        stage: ModelStage.PUBLISHED,
      },
    });

    let grandChild = await prisma.project.create({
      data: {
        name: "three",
        organizationId: organization.id,
        parentId: child.id,
        stage: ModelStage.DRAFT,
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

    // this should archive the child project and its tickets
    const response = await graphqlRequest({
      source: archiveProjectMutation,
      variableValues: {
        projectId: child.id,
      },
      session,
    });

    expect(response.errors).not.toBeDefined();

    expect(response.data?.archiveProject.stage).toBe(ModelStage.ARCHIVED);

    parent = await prisma.project.findUniqueOrThrow({
      where: {
        id: parent.id,
      },
    });

    expect(parent.stage).toBe(ModelStage.PUBLISHED);

    child = await prisma.project.findUniqueOrThrow({
      where: {
        id: child.id,
      },
    });

    expect(child.stage).toBe(ModelStage.ARCHIVED);
    expect(child.ancestorIsArchived).toBe(false);

    grandChild = await prisma.project.findUniqueOrThrow({
      where: {
        id: grandChild.id,
      },
    });

    expect(grandChild.stage).toBe(ModelStage.DRAFT);

    // this test will fail if the database was initialized with
    // a push of the schema instead of a migration. This is because
    // the migration includes trigger function in Postgres that will
    // not be deployed when applying the schema (aka. prisma push)
    expect(grandChild.ancestorIsArchived).toBe(true);

    // tickets stage should not be impacted
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: [grandChildTicket.id, parentTicket.id] } },
    });
    expect(tickets.length).toBe(2);
    expect(map(tickets, "stage")).toEqual([ModelStage.DRAFT, ModelStage.DRAFT]);
  });

  it("cannot archive a project with scheduled ticket", async () => {
    const { role, organization, session } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let parent = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    await createRandomTicket(organization, role, undefined, {
      project: { connect: { id: parent.id } },
      status: TicketStatus.SCHEDULED,
    });

    // this should archive the child project and its tickets
    const response = await graphqlRequest({
      source: archiveProjectMutation,
      variableValues: {
        projectId: parent.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();

    const dbParent = await prisma.project.findUniqueOrThrow({
      where: {
        id: parent.id,
      },
    });

    expect(dbParent.stage).toEqual(ModelStage.PUBLISHED);
  });

  it("cannot archive a project with child project containing scheduled ticket", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    let parent = await prisma.project.create({
      data: {
        name: "one",
        organizationId: organization.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    let childProject = await prisma.project.create({
      data: {
        name: "two",
        organizationId: organization.id,
        parentId: parent.id,
        stage: ModelStage.PUBLISHED,
      },
    });

    // child ticket in a scheduled state
    await createRandomTicket(organization, role, undefined, {
      project: { connect: { id: childProject.id } },
      status: TicketStatus.SCHEDULED,
    });

    // this should archive the child project and its tickets
    const response = await graphqlRequest({
      source: archiveProjectMutation,
      variableValues: {
        projectId: childProject.id,
      },
      session,
    });

    expect(response.errors).toBeDefined();

    const dbChildProject = await prisma.project.findUniqueOrThrow({
      where: {
        id: childProject.id,
      },
    });

    expect(dbChildProject.stage).toEqual(ModelStage.PUBLISHED);
  });
});
