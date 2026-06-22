/**
 * Behavior tests for the Repository link resolvers: create (one-time secret,
 * encrypted at rest), list (org-scoped), delete, and ADMIN/OWNER authority.
 */

import expect from "expect";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import {
  createRandomOrgAndUser,
  createRandomRepositoryLink,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { decryptSecret } from "../../../utils/crypto";

const createMutation = `
  mutation Create($name: String) {
    createRepositoryLink(input: { name: $name }) {
      webhookUrl
      webhookSecret
      link { id name status repoFullName }
    }
  }
`;

const listQuery = `
  query Links {
    repositoryLinks { id name status }
  }
`;

const deleteMutation = `
  mutation Delete($id: Int!) {
    deleteRepositoryLink(id: $id) { id }
  }
`;

describe("createRepositoryLink", () => {
  it("creates a pending link and returns the webhook URL + one-time secret", async () => {
    const { session } = await getTestSessionWithRole(RoleType.OWNER);

    const response = await graphqlRequest({
      source: createMutation,
      variableValues: { name: "Main repo" },
      session,
    });

    const result = response.data?.createRepositoryLink;
    expect(result.webhookUrl).toContain("/github/webhook/");
    expect(result.webhookSecret.length).toBeGreaterThan(0);
    expect(result.link.status).toBe("PENDING");
    expect(result.link.name).toBe("Main repo");
    expect(result.link.repoFullName).toBeNull();
  });

  it("stores the secret encrypted, never in plaintext", async () => {
    const { session } = await getTestSessionWithRole(RoleType.ADMIN);

    const response = await graphqlRequest({ source: createMutation, session });
    const { webhookSecret, link } = response.data.createRepositoryLink;

    const stored = await prisma.repositoryLink.findUniqueOrThrow({
      where: { id: link.id },
    });
    expect(stored.webhookSecretEnc).not.toBe(webhookSecret);
    expect(decryptSecret(stored.webhookSecretEnc)).toBe(webhookSecret);
  });

  it("forbids a MEMBER from creating a link", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({ source: createMutation, session });

    expect(response.errors).toBeDefined();
    expect(response.data?.createRepositoryLink ?? null).toBeNull();
  });
});

describe("repositoryLinks", () => {
  it("returns only the caller organization's links", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.OWNER,
    );
    await createRandomRepositoryLink(organization, { name: "ours" });

    const other = await createRandomOrgAndUser(RoleType.OWNER);
    await createRandomRepositoryLink(other.organization, { name: "theirs" });

    const response = await graphqlRequest({ source: listQuery, session });

    const names = response.data.repositoryLinks.map((l: any) => l.name);
    expect(names).toContain("ours");
    expect(names).not.toContain("theirs");
  });

  it("forbids a MEMBER from listing links", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);
    const response = await graphqlRequest({ source: listQuery, session });
    expect(response.errors).toBeDefined();
  });
});

describe("deleteRepositoryLink", () => {
  it("deletes a link in the caller's organization", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const { link } = await createRandomRepositoryLink(organization);

    await graphqlRequest({
      source: deleteMutation,
      variableValues: { id: link.id },
      session,
    });

    const gone = await prisma.repositoryLink.findUnique({
      where: { id: link.id },
    });
    expect(gone).toBeNull();
  });

  it("cannot delete a link belonging to another organization", async () => {
    const { session } = await getTestSessionWithRole(RoleType.OWNER);
    const other = await createRandomOrgAndUser(RoleType.OWNER);
    const { link } = await createRandomRepositoryLink(other.organization);

    const response = await graphqlRequest({
      source: deleteMutation,
      variableValues: { id: link.id },
      session,
    });

    expect(response.errors).toBeDefined();
    const survives = await prisma.repositoryLink.findUnique({
      where: { id: link.id },
    });
    expect(survives).not.toBeNull();
  });
});
