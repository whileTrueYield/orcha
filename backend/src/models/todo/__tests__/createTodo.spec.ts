import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import expect from "expect";

const createTodoMutation = `
mutation CreateTodo($input:CreateTodoInput!) {
  createTodo(
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

describe("create todo", () => {
  it("creates a new todo", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const todo = {
      body: faker.lorem.paragraph(),
    };

    const response = await graphqlRequest({
      source: createTodoMutation,
      variableValues: {
        input: todo,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        createTodo: {
          organization: {
            id: organization.id,
          },
          owner: {
            id: role.id,
          },
          body: todo.body,
        },
      },
    });
  });

  it("does not create a todo without a body", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);

    const todo = {
      body: "",
    };

    const response = await graphqlRequest({
      source: createTodoMutation,
      variableValues: {
        input: todo,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
