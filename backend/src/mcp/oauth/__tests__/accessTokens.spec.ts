/**
 * Behavior tests for the OAuth access-token module: minting produces an
 * orcha_oat_ token stored only as a hash, and resolution returns the bound
 * Role + capability flags or refuses (the same opaque InvalidTokenError the PAT
 * path uses) for unknown / expired / revoked tokens.
 */
import expect from "expect";
import {
  generateAccessToken,
  verifyAndResolveOAuth,
} from "../accessTokens";
import { getTestOAuthToken } from "../../../utils/testing";
import { InvalidTokenError } from "../../../models/apiToken/token";
import { fromNow } from "../../../utils/testing";
import prisma from "../../../prisma";

describe("oauth accessTokens", () => {
  it("generateAccessToken returns an orcha_oat_ prefixed token", () => {
    expect(generateAccessToken().startsWith("orcha_oat_")).toBe(true);
  });

  it("resolves a valid OAuth token to its role, scope, client, and readOnly", async () => {
    const t = await getTestOAuthToken();
    const resolved = await verifyAndResolveOAuth(t.plaintext);
    expect(resolved.tokenId).toBe(t.token.id);
    expect(resolved.role.id).toBe(t.role.id);
    expect(resolved.readOnly).toBe(false);
    expect(resolved.clientId).toBe(t.client.clientId);
    expect(resolved.scopes).toEqual(["read", "write"]);
  });

  it("stamps lastUsedAt on a successful resolve (the connected-apps 'last seen')", async () => {
    const t = await getTestOAuthToken();
    expect(t.token.lastUsedAt).toBeNull();

    await verifyAndResolveOAuth(t.plaintext);

    const after = await prisma.oAuthAccessToken.findUniqueOrThrow({
      where: { id: t.token.id },
    });
    expect(after.lastUsedAt).toBeInstanceOf(Date);
  });

  it("refuses an unknown OAuth token", async () => {
    await expect(verifyAndResolveOAuth("orcha_oat_nope")).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("refuses an expired OAuth token", async () => {
    const t = await getTestOAuthToken({ expiresAt: fromNow(-1) });
    await expect(verifyAndResolveOAuth(t.plaintext)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });

  it("refuses a revoked OAuth token", async () => {
    const t = await getTestOAuthToken({ revokedAt: new Date() });
    await expect(verifyAndResolveOAuth(t.plaintext)).rejects.toBeInstanceOf(
      InvalidTokenError,
    );
  });
});
