import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import expect from "expect";

const createTeamMutation = `
mutation CreateTeam($input:CreateTeamInput!) {
  createTeam(
    input: $input
  ) {
    name
    description
    code
    organization {
      id
    }
  }
}
`;

describe("create team", () => {
  it("creates a new team as draft", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const team = {
      name: faker.person.jobTitle(),
      code: "ABCDE",
      description: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createTeamMutation,
      variableValues: {
        input: team,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createTeam: {
          organization: {
            id: organization.id,
          },
          name: team.name,
          description: team.description,
          code: team.code,
        },
      },
    });
  });

  it("does not create a team without a code", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const team = {
      name: faker.person.jobTitle(),
      code: "",
      description: faker.lorem.paragraph(),
      organizationId: organization.id,
    };

    const response = await graphqlRequest({
      source: createTeamMutation,
      variableValues: {
        input: team,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
