import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import expect from "expect";

const createProjectMutation = `
mutation CreateProject($input:CreateProjectInput!) {
  createProject(
    input: $input
  ) {
    name
    organization {
      id
    }
  }
}
`;

describe("create project", () => {
  it("can create a new project with lowercase name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const project = {
      name: faker.person.jobTitle(),
    };

    const response = await graphqlRequest({
      source: createProjectMutation,
      variableValues: {
        input: project,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createProject: {
          organization: {
            id: organization.id,
          },
          name: project.name,
        },
      },
    });
  });

  it("does not create a project without a name", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);
    const project = {
      name: "",
    };

    const response = await graphqlRequest({
      source: createProjectMutation,
      variableValues: {
        input: project,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
