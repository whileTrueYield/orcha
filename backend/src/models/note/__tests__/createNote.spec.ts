import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import expect from "expect";

const createNoteMutation = `
mutation CreateNote($input:CreateNoteInput!) {
  createNote(
    input: $input
  ) {
    body
    owner {
      id
    }
    organization {
      id
    }
  }
}
`;

describe("create note", () => {
  it("creates a new note", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const note = {
      body: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createNoteMutation,
      variableValues: {
        input: note,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createNote: {
          organization: {
            id: organization.id,
          },
          owner: {
            id: role.id,
          },
          body: note.body,
        },
      },
    });
  });

  it("does not create a note without a body", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);

    const note = {
      body: "",
    };

    const response = await graphqlRequest({
      source: createNoteMutation,
      variableValues: {
        input: note,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
