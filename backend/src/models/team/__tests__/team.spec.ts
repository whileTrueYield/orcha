import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getTeamQuery = `
query getTeam($id: Int!) {
  team(id: $id) {
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

describe("get single team", () => {
  it("retrieves an existing team", async () => {
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
      source: getTeamQuery,
      variableValues: {
        id: team.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        team: {
          id: team.id,
          name: team.name,
          code: team.code,
          description: team.description,
          coverUrl: team.coverUrl,
          createdAt: team.createdAt.toISOString(),
          updatedAt: team.updatedAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    await prisma.team.create({
      data: {
        name: faker.person.jobTitle(),
        code: "ABCDE",
        description: faker.lorem.paragraph(),
        organizationId: organization.id,
      },
    });

    const response = await graphqlRequest({
      source: getTeamQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
