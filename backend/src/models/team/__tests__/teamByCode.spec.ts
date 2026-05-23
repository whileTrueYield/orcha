import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getTeamQuery = `
query getTeamByCode($code: String!) {
  teamByCode(code: $code) {
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

describe("get a team by code", () => {
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
        code: team.code,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        teamByCode: {
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
        code: "foo-bar",
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
