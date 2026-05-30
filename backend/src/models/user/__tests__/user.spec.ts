import { graphqlRequest } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { UserStatus } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getUserQuery = `
query getUser($id: Int!) {
  user(id: $id) {
    id
    status
    email
    createdAt
    updatedAt
  }
}
`;

describe("get single user", () => {
  it("retrieve an existing user", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = await prisma.user.create({
      data: {
        status: UserStatus.ACTIVE,
        email: `${faker.internet.email({firstName, lastName})}`,
        password: "password",
      },
    });

    const response = await graphqlRequest({
      source: getUserQuery,
      variableValues: {
        id: user.id,
      },
    });

    expect(response).toEqual({
      data: {
        user: {
          status: user.status,
          email: user.email,
          id: user.id,
          updatedAt: user.updatedAt.toISOString(),
          createdAt: user.createdAt.toISOString(),
        },
      },
    });
  });

  it("returns null when not found", async () => {
    await prisma.user.create({
      data: {
        status: UserStatus.ACTIVE,
        email: `${faker.internet.email()}`,
        password: "password",
      },
    });

    const response = await graphqlRequest({
      source: getUserQuery,
      variableValues: {
        id: 987987987,
      },
    });

    expect(response.errors).toBeDefined();
  });
});
