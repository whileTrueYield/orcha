/**
 * Behavior tests for the OAuth refresh-token store: minting produces an
 * orcha_ort_ token stored only as a hash; rotation issues a fresh binding and
 * marks the prior token spent; a reused (already-rotated) token is rejected and
 * its whole family — refresh AND access tokens — is revoked; an honestly expired
 * token is rejected without burning the family.
 */
import expect from "expect";
import {
  generateRefreshToken,
  mintRefreshToken,
  rotateRefreshToken,
  InvalidRefreshTokenError,
} from "../refreshTokens";
import {
  getTestRefreshToken,
  getTestOAuthToken,
  fromNow,
} from "../../../utils/testing";
import prisma from "../../../prisma";

describe("oauth refreshTokens", () => {
  it("generateRefreshToken returns an orcha_ort_ prefixed token", () => {
    expect(generateRefreshToken().startsWith("orcha_ort_")).toBe(true);
  });

  it("mintRefreshToken stores only the hash and binds the grant", async () => {
    const seed = await getTestRefreshToken();
    const plaintext = await mintRefreshToken({
      clientPk: seed.client.id,
      roleId: seed.role.id,
      organizationId: seed.organization.id,
      scope: "read write",
      readOnly: false,
      familyId: "fam-mint",
    });
    expect(plaintext.startsWith("orcha_ort_")).toBe(true);
    const row = await prisma.oAuthRefreshToken.findFirst({
      where: { familyId: "fam-mint" },
    });
    expect(row).not.toBeNull();
    expect(row!.tokenHash).not.toBe(plaintext);
  });

  it("rotate marks the prior token spent and returns its binding", async () => {
    const seed = await getTestRefreshToken({ familyId: "fam-rot" });
    const grant = await rotateRefreshToken(seed.client.clientId, seed.plaintext);
    expect(grant.familyId).toBe("fam-rot");
    expect(grant.roleId).toBe(seed.role.id);
    const after = await prisma.oAuthRefreshToken.findUnique({
      where: { id: seed.token.id },
    });
    expect(after!.rotatedAt).not.toBeNull();
  });

  it("rejects a reused (already-rotated) token and revokes the whole family", async () => {
    const familyId = "fam-reuse";
    const spent = await getTestRefreshToken({ familyId, rotatedAt: new Date() });
    // revokeFamily targets the familyId, not a client, so seeding an access
    // token with the same familyId is enough to prove it gets swept — the
    // helper's own client/role rows are irrelevant to the family match.
    const access = await getTestOAuthToken({ familyId });

    await expect(
      rotateRefreshToken(spent.client.clientId, spent.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    const rt = await prisma.oAuthRefreshToken.findUnique({
      where: { id: spent.token.id },
    });
    const at = await prisma.oAuthAccessToken.findUnique({
      where: { id: access.token.id },
    });
    expect(rt!.revokedAt).not.toBeNull();
    expect(at!.revokedAt).not.toBeNull();
  });

  it("rejects an already-revoked token", async () => {
    const revoked = await getTestRefreshToken({ revokedAt: new Date() });
    await expect(
      rotateRefreshToken(revoked.client.clientId, revoked.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("rejects an expired token WITHOUT revoking the family", async () => {
    const familyId = "fam-exp";
    const expired = await getTestRefreshToken({ familyId, expiresAt: fromNow(-1) });
    const access = await getTestOAuthToken({ familyId });

    await expect(
      rotateRefreshToken(expired.client.clientId, expired.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);

    const at = await prisma.oAuthAccessToken.findUnique({
      where: { id: access.token.id },
    });
    expect(at!.revokedAt).toBeNull();
  });

  it("rejects an unknown token", async () => {
    await expect(
      rotateRefreshToken("any-client", "orcha_ort_nope"),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it("rejects a token presented under the wrong client", async () => {
    const seed = await getTestRefreshToken();
    await expect(
      rotateRefreshToken("not-the-right-client", seed.plaintext),
    ).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });
});
