import {
  graphqlRequest,
  getTestSessionWithRole,
  createFeatureFlagForOrg,
} from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { ModelStage, RoleType } from "@generated/type-graphql";
import expect from "expect";

const createDocumentationMutation = `
mutation CreateDocumentation($input:CreateDocumentationInput!) {
  createDocumentation(
    input: $input
  ) {
    name
    description
    stage
    organization {
      id
    }
  }
}
`;

describe("create documentation", () => {
  it("creates a new documentation as draft", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    // grant access to support
    await createFeatureFlagForOrg(organization, { documentation: true });

    const documentation = {
      name: faker.person.jobTitle(),
      description: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createDocumentationMutation,
      variableValues: {
        input: documentation,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createDocumentation: {
          organization: {
            id: organization.id,
          },
          name: documentation.name,
          description: documentation.description,
          stage: ModelStage.DRAFT,
        },
      },
    });
  });
});
