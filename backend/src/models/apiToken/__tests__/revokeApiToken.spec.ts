/**
 * Behavior tests for revokeApiToken and the organizationApiTokens admin list.
 *
 * Revoking a token must actually stop it resolving (proven through the token
 * module), and the permission rules must hold: a Role revokes its own tokens,
 * an ADMIN/OWNER may revoke any token in their Organization, a plain MEMBER may
 * not revoke someone else's. Tokens never leak across Organizations.
 */

import {
  createRandomOrgAndUser,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { generateToken, InvalidTokenError, verifyAndResolve } from "../token";

const revokeMutation = `
  mutation Revoke($id: Int!) {
    revokeApiToken(id: $id) {
      id
      revokedAt
    }
  }
`;

const organizationApiTokensQuery = `
  query OrganizationApiTokens {
    organizationApiTokens {
      id
      name
    }
  }
`;

// Seed a token for a given Role and return its plaintext + row.
const seedToken = async (
  roleId: number,
  organizationId: number,
  name: string,
) => {
  const { plaintext, hash, prefix } = generateToken();
  const row = await prisma.personalAccessToken.create({
    data: { name, tokenHash: hash, tokenPrefix: prefix, roleId, organizationId },
  });
  return { plaintext, row };
};

const reasonOf = async (plaintext: string): Promise<string | undefined> => {
  try {
    await verifyAndResolve(plaintext);
    return undefined;
  } catch (caught) {
    return caught instanceof InvalidTokenError ? caught.reason : "OTHER";
  }
};

describe("revokeApiToken", () => {
  it("lets a Role revoke its own token, after which it no longer resolves", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const { plaintext, row } = await seedToken(role.id, organization.id, "mine");

    const response = await graphqlRequest({
      source: revokeMutation,
      variableValues: { id: row.id },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(await reasonOf(plaintext)).toBe("REVOKED");
  });

  it("forbids a MEMBER from revoking another Role's token", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const other = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {},
      organization,
    );
    const { plaintext, row } = await seedToken(
      other.role.id,
      organization.id,
      "not mine",
    );

    const response = await graphqlRequest({
      source: revokeMutation,
      variableValues: { id: row.id },
      session,
    });

    expect(response.errors).toBeDefined();
    // The token still works — the failed revoke had no effect.
    const resolved = await verifyAndResolve(plaintext);
    expect(resolved.id).toBe(other.role.id);
  });

  it("lets an ADMIN revoke another Role's token in the same organization", async () => {
    const { session, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const member = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {},
      organization,
    );
    const { plaintext, row } = await seedToken(
      member.role.id,
      organization.id,
      "member token",
    );

    const response = await graphqlRequest({
      source: revokeMutation,
      variableValues: { id: row.id },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(await reasonOf(plaintext)).toBe("REVOKED");
  });
});

describe("organizationApiTokens", () => {
  it("returns every token in the organization for an ADMIN", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.ADMIN,
    );
    const member = await createRandomOrgAndUser(
      RoleType.MEMBER,
      false,
      {},
      organization,
    );
    await seedToken(role.id, organization.id, "admin token");
    await seedToken(member.role.id, organization.id, "member token");

    const response = await graphqlRequest({
      source: organizationApiTokensQuery,
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.organizationApiTokens.length).toBe(2);
  });

  it("denies a plain MEMBER access to the organization-wide list", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: organizationApiTokensQuery,
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
