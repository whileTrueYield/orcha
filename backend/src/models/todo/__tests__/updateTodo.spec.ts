import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const updateTodoMutation = `
mutation UpdateTodo($todoId: Int!, $input:UpdateTodoInput!) {
  updateTodo(
    todoId: $todoId
    input: $input
  ) {
    id
    body
    createdAt
  }
}
`;

const checTodoMutation = `
mutation CheckTodo($todoId: Int!, $checked: Boolean!) {
  checkTodo(
    todoId: $todoId
    checked: $checked
  ) {
    id
    body
    checked
  }
}
`;

describe("updateTodo", () => {
  it("changes the body of a todo", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const todo = await prisma.todo.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const newBody = `${todo.body} edit`;
    const response = await graphqlRequest({
      source: updateTodoMutation,
      variableValues: {
        todoId: todo.id,
        input: { body: newBody },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateTodo: {
          body: newBody,
          id: todo.id,
          createdAt: todo.createdAt.toISOString(),
        },
      },
    });
  });

  it("check a todo", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const todo = await prisma.todo.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: checTodoMutation,
      variableValues: {
        todoId: todo.id,
        checked: true,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        checkTodo: {
          body: todo.body,
          id: todo.id,
          checked: true,
        },
      },
    });
  });

  it("uncheck a todo", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const todo = await prisma.todo.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
        checked: true,
      },
    });

    const response = await graphqlRequest({
      source: checTodoMutation,
      variableValues: {
        todoId: todo.id,
        checked: false,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        checkTodo: {
          body: todo.body,
          id: todo.id,
          checked: false,
        },
      },
    });
  });
});
