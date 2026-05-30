import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getTodosQuery = `
query getTodos {
  todos (first: 2, sort: "body") {
    totalCount
    nodes {
      body
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      pageNumber
      pageSize
      pageCount
      endCursor
    }
  }
}
`;

describe("get many todos", () => {
  it("returns pagination and an array of todos", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const todoPromises = map(range(5), async (counter) => {
      return prisma.todo.create({
        data: {
          body: counter.toString() + faker.lorem.paragraph(),
          organizationId: organization.id,
          ownerId: role.id,
        },
      });
    });

    const todos = await Promise.all(todoPromises);

    const response = await graphqlRequest({
      source: getTodosQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        todos: {
          totalCount: 5,
          nodes: expect.any(Array),
          pageInfo: {
            endCursor: expect.any(Number),
            hasNextPage: true,
            hasPreviousPage: false,
            pageCount: 3,
            pageNumber: 0,
            pageSize: 2,
          },
        },
      },
    });

    const sortedTodos = sortBy(todos, "body");
    expect(response.data!.todos.nodes.length).toBe(2);
    expect(sortedTodos[0]).toMatchObject(response.data!.todos.nodes[0]);
    expect(sortedTodos[1]).toMatchObject(response.data!.todos.nodes[1]);
  });
});
