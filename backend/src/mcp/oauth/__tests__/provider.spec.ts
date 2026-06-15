/**
 * Behavior tests for OrchaOAuthProvider's token-side contract: verifyAccessToken
 * returns AuthInfo for a live token and rejects a dead one; exchangeAuthorizationCode
 * issues an orcha_oat_ token once and refuses replay; refresh/revoke are unsupported
 * in this slice and throw clearly.
 */
import expect from "expect";
import { orchaOAuthProvider } from "../provider";
import { mintCode } from "../codes";
import { verifyAndResolveOAuth } from "../accessTokens";
import {
  getTestOAuthToken,
  createRandomOrgAndUser,
  pkceChallengeFor,
  getRandomCode,
} from "../../../utils/testing";
import prisma from "../../../prisma";

const client = (clientId: string, redirect = "http://localhost/cb") =>
  ({ client_id: clientId, redirect_uris: [redirect] } as any);

describe("OrchaOAuthProvider", () => {
  it("verifyAccessToken returns AuthInfo for a live token", async () => {
    const t = await getTestOAuthToken();
    const info = await orchaOAuthProvider.verifyAccessToken(t.plaintext);
    expect(info.token).toBe(t.plaintext);
    expect(info.clientId).toBe(t.client.clientId);
    expect(info.scopes).toEqual(["read", "write"]);
  });

  it("verifyAccessToken rejects an unknown token", async () => {
    await expect(
      orchaOAuthProvider.verifyAccessToken("orcha_oat_nope"),
    ).rejects.toThrow();
  });

  it("exchangeAuthorizationCode issues a token once and refuses replay", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    // Use a unique clientId per run to avoid unique-constraint violations on re-runs
    // against the persistent test DB.
    const clientId = `exch-${getRandomCode(12)}`;
    const row = await prisma.oAuthClient.create({
      data: { clientId, redirectUris: ["http://localhost/cb"] },
    });
    const code = await mintCode({
      clientPk: row.id,
      roleId: role.id,
      organizationId: organization.id,
      scope: "read write",
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
    });

    const tokens = await orchaOAuthProvider.exchangeAuthorizationCode(
      client(clientId),
      code,
    );
    expect(tokens.access_token.startsWith("orcha_oat_")).toBe(true);
    expect(tokens.token_type.toLowerCase()).toBe("bearer");

    await expect(
      orchaOAuthProvider.exchangeAuthorizationCode(client(clientId), code),
    ).rejects.toThrow();
  });

  // The granted scope is the source of truth: exchangeAuthorizationCode derives
  // the access token's readOnly flag from it, so the scope a user approved is the
  // capability the resource server enforces — no separate readOnly input to drift.
  const exchangeWithScope = async (scope: string) => {
    const { role, organization } = await createRandomOrgAndUser();
    const clientId = `scope-${getRandomCode(12)}`;
    const row = await prisma.oAuthClient.create({
      data: { clientId, redirectUris: ["http://localhost/cb"] },
    });
    const code = await mintCode({
      clientPk: row.id,
      roleId: role.id,
      organizationId: organization.id,
      scope,
      codeChallenge: pkceChallengeFor("v"),
      redirectUri: "http://localhost/cb",
    });
    const tokens = await orchaOAuthProvider.exchangeAuthorizationCode(
      client(clientId),
      code,
    );
    return verifyAndResolveOAuth(tokens.access_token);
  };

  it("resolves a read-only access token from a read-only grant's scope", async () => {
    const resolved = await exchangeWithScope("read");
    expect(resolved.scopes).toEqual(["read"]);
    expect(resolved.readOnly).toBe(true);
  });

  it("resolves a read+write access token from a write grant's scope", async () => {
    const resolved = await exchangeWithScope("read write");
    expect(resolved.scopes).toEqual(["read", "write"]);
    expect(resolved.readOnly).toBe(false);
  });

  it("refresh and revoke are unsupported in this slice", async () => {
    await expect(
      orchaOAuthProvider.exchangeRefreshToken(client("x"), "rt"),
    ).rejects.toThrow();
  });
});
