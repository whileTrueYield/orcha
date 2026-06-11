/**
 * Behavior tests for the createApiToken mutation.
 *
 * Exercises the mutation through the GraphQL interface as an authenticated
 * Role, then confirms the minted token actually works via the token module —
 * proving the end-to-end "mint a usable credential" path.
 */

import { getTestSessionWithRole, graphqlRequest } from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import prisma from "../../../prisma";
import expect from "expect";
import { verifyAndResolve } from "../token";

const createApiTokenMutation = `
  mutation CreateApiToken($input: CreateApiTokenInput!) {
    createApiToken(input: $input) {
      plaintext
      token {
        id
        name
        tokenPrefix
        readOnly
      }
    }
  }
`;

describe("createApiToken", () => {
  it("mints a token, returns the plaintext once, and scopes it to the caller's Role", async () => {
    const { session, role } = await getTestSessionWithRole(RoleType.MEMBER);

    const response = await graphqlRequest({
      source: createApiTokenMutation,
      variableValues: { input: { name: "ci server" } },
      session,
    });

    expect(response.errors).not.toBeDefined();

    const result = response.data!.createApiToken;
    expect(result.plaintext.startsWith("orcha_pat_")).toBe(true);
    expect(result.token.name).toBe("ci server");
    expect(result.token.readOnly).toBe(false);

    // The returned plaintext is a working credential that resolves to this Role.
    const resolved = await verifyAndResolve(result.plaintext);
    expect(resolved.role.id).toBe(role.id);

    // It is persisted under the caller's Role, not floating free.
    const persisted = await prisma.personalAccessToken.findFirstOrThrow({
      where: { roleId: role.id },
    });
    expect(persisted.name).toBe("ci server");
  });
});
