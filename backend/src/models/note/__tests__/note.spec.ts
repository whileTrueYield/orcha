import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const getNoteQuery = `
query getNote($id: Int!) {
  note(id: $id) {
    id
    body
    createdAt
    updatedAt
    owner {
      id
    }
    organization {
      id
    }
  }
}
`;

describe("get single note", () => {
  it("retrieves an existing note", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER
    );

    const note = await prisma.note.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const response = await graphqlRequest({
      source: getNoteQuery,
      variableValues: {
        id: note.id,
      },
      session,
    });

    expect(response).toEqual({
      data: {
        note: {
          id: note.id,
          body: note.body,
          organization: {
            id: organization.id,
          },
          owner: {
            id: role.id,
          },
          createdAt: note.createdAt.toISOString(),
          updatedAt: note.updatedAt.toISOString(),
        },
      },
    });
  });

  it("throws an exception when not found", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: getNoteQuery,
      variableValues: {
        id: 987987987,
      },
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
