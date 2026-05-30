/**
 * Behavior tests for the myApiTokens query.
 *
 * A Role sees its own tokens and only its own, and the query offers no way to
 * read the secret hash.
 */

import {
  createRandomOrgAndUser,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { generateToken } from "../token";

const myApiTokensQuery = `
  query MyApiTokens {
    myApiTokens {
      id
      name
      tokenPrefix
    }
  }
`;

const seedToken = async (
  roleId: number,
  organizationId: number,
  name: string,
) => {
  const { hash, prefix } = generateToken();
  return prisma.personalAccessToken.create({
    data: {
      name,
      tokenHash: hash,
      tokenPrefix: prefix,
      roleId,
      organizationId,
    },
  });
};

describe("myApiTokens", () => {
  it("returns only the caller's own tokens", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    await seedToken(role.id, organization.id, "mine one");
    await seedToken(role.id, organization.id, "mine two");

    // Another Role in another org with its own token — must not leak in.
    const other = await createRandomOrgAndUser();
    await seedToken(other.role.id, other.organization.id, "not mine");

    const response = await graphqlRequest({
      source: myApiTokensQuery,
      session,
    });

    expect(response.errors).not.toBeDefined();
    const names = response.data!.myApiTokens.map((t: { name: string }) => t.name);
    expect(names.sort()).toEqual(["mine one", "mine two"]);
  });

  it("offers no field to read the token hash", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: `query { myApiTokens { tokenHash } }`,
      session,
    });

    expect(response.errors).toBeDefined();
  });
});
