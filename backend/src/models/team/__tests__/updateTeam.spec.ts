import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const updateTeamMutation = `
mutation UpdateTeam($teamId: Int!, $input:UpdateTeamInput!) {
  updateTeam(
    teamId: $teamId
    input: $input
  ) {
    id
    name
    code
    description
    coverUrl
    createdAt
    updatedAt
  }
}
`;

describe("updateTeam", () => {
  it("changes the name of an team", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const team = await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const newName = `${faker.person.lastName()} LTD`;
    const response = await graphqlRequest({
      source: updateTeamMutation,
      variableValues: {
        teamId: team.id,
        input: { name: newName },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateTeam: {
          code: team.code,
          description: team.description,
          coverUrl: team.coverUrl,
          name: newName,
          id: team.id,
          updatedAt: expect.any(String),
          createdAt: team.createdAt.toISOString(),
        },
      },
    });
  });

  it("can clear a field", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const team = await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateTeamMutation,
      variableValues: {
        teamId: team.id,
        input: {
          description: null,
        },
      },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.updateTeam.description).toBe(null);
  });

  it("cannot change the status of a team", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const team = await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateTeamMutation,
      variableValues: {
        teamId: team.id,
        input: { status: "active" },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });

  it("cannot take another team code", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const teamA = await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "PRDA",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const teamB = await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "PRDB",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: updateTeamMutation,
      variableValues: {
        teamId: teamA.id,
        input: { code: teamB.code },
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
