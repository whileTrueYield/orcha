import { graphqlRequest, getTestSessionWithRole } from "../../../utils/testing";
import { faker } from "@faker-js/faker";
import { map, range, sortBy } from "lodash";
import { RoleType } from "@generated/type-graphql";
import prisma from "../../../prisma";
import expect from "expect";

const getNotesQuery = `
query getNotes {
  notes (first: 2, sort: "body") {
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

describe("get many notes", () => {
  it("returns pagination and an array of notes", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.ADMIN
    );

    const notePromises = map(range(5), async (counter) => {
      return prisma.note.create({
        data: {
          body: counter.toString() + faker.lorem.paragraph(),
          organizationId: organization.id,
          ownerId: role.id,
        },
      });
    });

    const notes = await Promise.all(notePromises);

    const response = await graphqlRequest({
      source: getNotesQuery,
      session,
    });

    expect(response).toEqual({
      data: {
        notes: {
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

    const sortedNotes = sortBy(notes, "body");
    expect(response.data!.notes.nodes.length).toBe(2);
    expect(sortedNotes[0]).toMatchObject(response.data!.notes.nodes[0]);
    expect(sortedNotes[1]).toMatchObject(response.data!.notes.nodes[1]);
  });
});
