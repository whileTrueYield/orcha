/**
 * Behavior tests for the connected-apps GraphQL seam.
 *
 * These ride on the grant domain (covered in mcp/oauth/grants.spec); here we pin
 * the wiring the UI depends on: myOAuthGrants returns the caller's grants and
 * only theirs, and revokeOAuthGrant cuts the chain (a subsequent tool call AND a
 * subsequent refresh both fail) while refusing — as not-found — another tenant's.
 */

import expect from "expect";
import {
  getTestGrant,
  getTestSessionWithRole,
  graphqlRequest,
} from "../../../utils/testing";
import { RoleType } from "@prisma/client";
import { verifyAndResolveOAuth } from "../../../mcp/oauth/accessTokens";
import {
  rotateRefreshToken,
  InvalidRefreshTokenError,
} from "../../../mcp/oauth/refreshTokens";
import { InvalidTokenError } from "../../apiToken/token";

const myOAuthGrantsQuery = `
  query MyOAuthGrants {
    myOAuthGrants {
      familyId
      clientId
      clientName
      scope
      readOnly
      connectedAt
      lastUsedAt
    }
  }
`;

const revokeMutation = `
  mutation Revoke($familyId: String!) {
    revokeOAuthGrant(familyId: $familyId) {
      familyId
      clientName
    }
  }
`;

describe("myOAuthGrants", () => {
  it("returns the caller's connected clients, and only theirs", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const mine = await getTestGrant({
      role,
      organization,
      clientName: "Claude",
    });
    await getTestGrant({}); // another tenant's grant

    const response = await graphqlRequest({
      source: myOAuthGrantsQuery,
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.myOAuthGrants).toHaveLength(1);
    expect(response.data!.myOAuthGrants[0].familyId).toBe(mine.familyId);
    expect(response.data!.myOAuthGrants[0].clientName).toBe("Claude");
  });

  it("requires an authenticated Role", async () => {
    const response = await graphqlRequest({ source: myOAuthGrantsQuery });
    expect(response.errors).toBeDefined();
  });
});

describe("revokeOAuthGrant", () => {
  it("kills the chain: a later tool call and a later refresh both fail", async () => {
    const { session, role, organization } = await getTestSessionWithRole(
      RoleType.MEMBER,
    );
    const grant = await getTestGrant({ role, organization });

    const response = await graphqlRequest({
      source: revokeMutation,
      variableValues: { familyId: grant.familyId },
      session,
    });

    expect(response.errors).not.toBeDefined();
    expect(response.data!.revokeOAuthGrant.familyId).toBe(grant.familyId);

    // A subsequent tool call (access token) fails...
    await expect(
      verifyAndResolveOAuth(grant.accessPlaintext),
    ).rejects.toBeInstanceOf(InvalidTokenError);
    // ...and a subsequent refresh fails too.
    await expect(
      rotateRefreshToken(grant.client.clientId, grant.refreshPlaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("cannot revoke another tenant's grant (not-found), leaving it live", async () => {
    const { session } = await getTestSessionWithRole(RoleType.MEMBER);
    const theirs = await getTestGrant({});

    const response = await graphqlRequest({
      source: revokeMutation,
      variableValues: { familyId: theirs.familyId },
      session,
    });

    expect(response.errors).toBeDefined();
    // Their access token still resolves — the failed revoke had no effect.
    const resolved = await verifyAndResolveOAuth(theirs.accessPlaintext);
    expect(resolved.clientId).toBe(theirs.client.clientId);
  });
});
