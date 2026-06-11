/**
 * Integration tests for the document-body GraphQL surface (#40), the web app's
 * path: the `body` field on Ticket/Project and the `saveDocumentBody` mutation.
 *
 * These exercise the same write service the /v1 REST endpoints execute, but
 * through the GraphQL transport a logged-in Role uses, so they focus on what the
 * web path adds: the body field read, the mutation's success/conflict result
 * shape, mention warnings, and tenant scoping. They use `graphqlRequest` with a
 * Role session (see [[feedback-use-test-helpers]]).
 */

import expect from "expect";
import { RoleType } from "@prisma/client";
import {
  graphqlRequest,
  getTestSessionWithRole,
  createRandomTicket,
  createRandomProject,
} from "../../../utils/testing";
import { saveBody, getBody } from "../../../markdown/bodyRepository";

const SAVE = /* GraphQL */ `
  mutation Save(
    $documentType: DocumentBodyType!
    $documentId: Int!
    $markdown: String!
    $baseVersion: Int!
  ) {
    saveDocumentBody(
      documentType: $documentType
      documentId: $documentId
      markdown: $markdown
      baseVersion: $baseVersion
    ) {
      body { markdown version }
      conflict {
        markdown
        version
        regions {
          kind
          lines
          ours
          theirs
        }
      }
      warnings { kind reference matches }
    }
  }
`;

describe("Ticket.body / Project.body GraphQL field", () => {
  it("reads a ticket body as Markdown + version", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket } = await createRandomTicket(organization, role);
    await saveBody("ticket", ticket.id, "# Body\n", 0);

    const res = await graphqlRequest({
      source: `query($id: Int!) { ticket(id: $id) { body { markdown version } } }`,
      variableValues: { id: ticket.id },
      session,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.ticket.body).toEqual({ markdown: "# Body\n", version: 1 });
  });

  it("reads a project body as Markdown + version", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);
    await saveBody("project", project.id, "project body\n", 0);

    const res = await graphqlRequest({
      source: `query($id: Int!) { project(id: $id) { body { markdown version } } }`,
      variableValues: { id: project.id },
      session,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.project.body).toEqual({
      markdown: "project body\n",
      version: 1,
    });
  });
});

describe("saveDocumentBody mutation", () => {
  it("persists a project body write from the matching base version", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const project = await createRandomProject(organization);

    const res = await graphqlRequest({
      source: SAVE,
      variableValues: {
        documentType: "PROJECT",
        documentId: project.id,
        markdown: "# Plan\n",
        baseVersion: 0,
      },
      session,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.saveDocumentBody.body).toEqual({
      markdown: "# Plan\n",
      version: 1,
    });
    expect(res.data.saveDocumentBody.conflict).toBeNull();
  });

  it("returns a conflict payload (not the body) when edits overlap", async () => {
    const { session, organization, role } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { ticket } = await createRandomTicket(organization, role);
    await saveBody("ticket", ticket.id, "shared\n", 0); // v1
    await saveBody("ticket", ticket.id, "theirs\n", 1); // v2

    const res = await graphqlRequest({
      source: SAVE,
      variableValues: {
        documentType: "TICKET",
        documentId: ticket.id,
        markdown: "ours\n",
        baseVersion: 1,
      },
      session,
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.saveDocumentBody.body).toBeNull();
    expect(res.data.saveDocumentBody.conflict.version).toBe(2);
    expect(res.data.saveDocumentBody.conflict.markdown).toContain("<<<<<<<");

    const regions = res.data.saveDocumentBody.conflict.regions;
    // The structured regions reassemble (stable lines + one chosen side per
    // conflict) without any markers — exactly what the picker renders.
    expect(regions.some((r: { kind: string }) => r.kind === "CONFLICT")).toBe(true);
    const conflictRegion = regions.find(
      (r: { kind: string }) => r.kind === "CONFLICT",
    );
    expect(Array.isArray(conflictRegion.ours)).toBe(true);
    expect(Array.isArray(conflictRegion.theirs)).toBe(true);
  });

  it("scopes writes to the caller's organization", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);
    const other = await getTestSessionWithRole(RoleType.MEMBER);
    const { ticket } = await createRandomTicket(
      other.organization,
      other.role,
    );

    const res = await graphqlRequest({
      source: SAVE,
      variableValues: {
        documentType: "TICKET",
        documentId: ticket.id,
        markdown: "intruder\n",
        baseVersion: 0,
      },
      session,
    });

    expect(res.errors?.[0].extensions?.code).toBe("NOT_FOUND");
    expect(await getBody("ticket", ticket.id)).toEqual({
      markdown: "",
      version: 0,
    });
  });
});
