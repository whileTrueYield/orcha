import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import expect from "expect";

const createPersonalTagMutation = `
mutation CreatePersonalTag($input:CreatePersonalTagInput!) {
  createPersonalTag(
    input: $input
  ) {
    name
    organization {
      id
    }
  }
}
`;

describe("create personalTag", () => {
  it("can create a new personalTag with lowercase name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );

    const personalTag = {
      name: faker.person.jobTitle(),
    };

    const response = await graphqlRequest({
      source: createPersonalTagMutation,
      variableValues: {
        input: personalTag,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createPersonalTag: {
          organization: {
            id: organization.id,
          },
          name: personalTag.name,
        },
      },
    });
  });

  it("does not create a personalTag without a name", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const personalTag = {
      name: "",
      organizationId: organization.id,
    };

    const response = await graphqlRequest({
      source: createPersonalTagMutation,
      variableValues: {
        input: personalTag,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
