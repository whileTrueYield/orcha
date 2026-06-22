/**
 * Exposure test: a Ticket surfaces its mirrored GitHub pull requests over
 * GraphQL (the read side of #121). The mirror logic itself is covered in
 * github/__tests__/mirror.spec.ts; this pins the field on the Ticket type.
 */

import expect from "expect";
import { RoleType } from "@prisma/client";
import {
  createRandomLinkedPullRequest,
  createRandomRepositoryLink,
  createRandomTicket,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";

const ticketQuery = `
  query Ticket($id: Int!) {
    ticket(id: $id) {
      id
      linkedPullRequests {
        number
        title
        state
        isDraft
        authorLogin
        htmlUrl
      }
    }
  }
`;

describe("Ticket.linkedPullRequests", () => {
  it("returns the pull requests mirrored onto the ticket", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket } = await createRandomTicket(organization, role);
    const { link } = await createRandomRepositoryLink(organization, {
      status: "ACTIVE",
      repoFullName: `octo/${organization.id}-repo`,
      activatedAt: new Date(),
    });
    await createRandomLinkedPullRequest(organization, link, [ticket], {
      number: 99,
      title: "Wire it up",
      state: "MERGED",
      authorLogin: "octocat",
    });

    const response = await graphqlRequest({
      source: ticketQuery,
      variableValues: { id: ticket.id },
      session,
    });

    expect(response.data.ticket.linkedPullRequests).toEqual([
      expect.objectContaining({
        number: 99,
        title: "Wire it up",
        state: "MERGED",
        isDraft: false,
        authorLogin: "octocat",
      }),
    ]);
  });
});
