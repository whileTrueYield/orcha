import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import expect from "expect";

const createTagMutation = `
mutation CreateTag($input:CreateTagInput!) {
  createTag(
    input: $input
  ) {
    name
    color
    organization {
      id
    }
  }
}
`;

describe("create tag", () => {
  it("can create a new tag with lowercase name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const tag = {
      name: faker.person.jobTitle(),
      color: "blue",
    };

    const response = await graphqlRequest({
      source: createTagMutation,
      variableValues: {
        input: tag,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createTag: {
          organization: {
            id: organization.id,
          },
          name: tag.name,
          color: tag.color,
        },
      },
    });
  });

  it("does not create a tag without a name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const tag = {
      name: "",
      organizationId: organization.id,
    };

    const response = await graphqlRequest({
      source: createTagMutation,
      variableValues: {
        input: tag,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
