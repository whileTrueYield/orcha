import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getTodoQuery = `
query getTodo($id: Int!) {
  todo(id: $id) {
    id
    body
    createdAt
    owner {
      id
    }
    organization {
      id
    }
  }
}
`;

describe("get single todo", () => {
  it("retrieves an existing todo", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const todo = await prisma.todo.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getTodoQuery,
      variableValues: {
        id: todo.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        todo: {
          id: todo.id,
          body: todo.body,
          organization: {
            id: organization.id,
          },
          owner: {
            id: role.id,
          },
          createdAt: todo.createdAt.toISOString(),
        },
      },
    });
  });

  it("throws an exception when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: getTodoQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
