import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";

const updateNoteMutation = `
mutation UpdateNote($noteId: Int!, $input:UpdateNoteInput!) {
  updateNote(
    noteId: $noteId
    input: $input
  ) {
    id
    body
    createdAt
    updatedAt
  }
}
`;

describe("updateNote", () => {
  it("changes the body of a note", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const note = await prisma.note.create({
      data: {
        body: faker.lorem.paragraph(),
        organizationId: organization.id,
        ownerId: role.id,
      },
    });

    const newBody = `${note.body} edit`;
    const response = await graphqlRequest({
      source: updateNoteMutation,
      variableValues: {
        noteId: note.id,
        input: { body: newBody },
      },
      session,
    });

    expect(response).toEqual({
      data: {
        updateNote: {
          body: newBody,
          id: note.id,
          updatedAt: expect.any(String),
          createdAt: note.createdAt.toISOString(),
        },
      },
    });
  });
});
