/**
 * Behavior tests for the Personal Access Token module.
 *
 * These exercise the module's public interface (generateToken / verifyAndResolve)
 * against a real test database — they describe what the credential does, not how
 * it is implemented.
 */

import { createRandomOrgAndUser } from "../../../utils/testing";
import prisma from "../../../prisma";
import expect from "expect";
import {
  generateToken,
  hashToken,
  InvalidTokenError,
  verifyAndResolve,
} from "../token";

describe("personal access token", () => {
  it("resolves a generated token's plaintext to its Role", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { plaintext, hash, prefix } = generateToken();

    await prisma.personalAccessToken.create({
      data: {
        name: "my laptop",
        tokenHash: hash,
        tokenPrefix: prefix,
        roleId: role.id,
        organizationId: organization.id,
      },
    });

    const resolved = await verifyAndResolve(plaintext);

    expect(resolved.id).toBe(role.id);
  });

  it("persists the hash and a non-secret prefix, never the plaintext", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { plaintext, hash, prefix } = generateToken();

    const created = await prisma.personalAccessToken.create({
      data: {
        name: "ci server",
        tokenHash: hash,
        tokenPrefix: prefix,
        roleId: role.id,
        organizationId: organization.id,
      },
    });

    const row = await prisma.personalAccessToken.findUniqueOrThrow({
      where: { id: created.id },
    });

    // The stored hash is the deterministic lookup key, distinct from the secret.
    expect(row.tokenHash).toBe(hashToken(plaintext));
    expect(row.tokenHash).not.toBe(plaintext);
    // The plaintext secret never appears anywhere in the persisted row.
    expect(JSON.stringify(row)).not.toContain(plaintext);
    // The prefix is a leading slice for display, not enough to reconstruct the token.
    expect(plaintext.startsWith(row.tokenPrefix)).toBe(true);
    expect(row.tokenPrefix.length).toBeLessThan(plaintext.length);
  });

  it("rejects an unknown token with reason UNKNOWN", async () => {
    // A well-formed token that was never persisted.
    const { plaintext } = generateToken();

    let error: unknown;
    try {
      await verifyAndResolve(plaintext);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(InvalidTokenError);
    expect((error as InvalidTokenError).reason).toBe("UNKNOWN");
  });

  it("rejects a revoked token with reason REVOKED", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { plaintext, hash, prefix } = generateToken();
    await prisma.personalAccessToken.create({
      data: {
        name: "revoked token",
        tokenHash: hash,
        tokenPrefix: prefix,
        roleId: role.id,
        organizationId: organization.id,
        revokedAt: new Date(),
      },
    });

    let error: unknown;
    try {
      await verifyAndResolve(plaintext);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(InvalidTokenError);
    expect((error as InvalidTokenError).reason).toBe("REVOKED");
  });

  it("rejects a token whose expiry has passed with reason EXPIRED", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { plaintext, hash, prefix } = generateToken();
    await prisma.personalAccessToken.create({
      data: {
        name: "expired token",
        tokenHash: hash,
        tokenPrefix: prefix,
        roleId: role.id,
        organizationId: organization.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    });

    let error: unknown;
    try {
      await verifyAndResolve(plaintext);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(InvalidTokenError);
    expect((error as InvalidTokenError).reason).toBe("EXPIRED");
  });

  it("resolves a token whose expiry is still in the future", async () => {
    const { role, organization } = await createRandomOrgAndUser();
    const { plaintext, hash, prefix } = generateToken();
    await prisma.personalAccessToken.create({
      data: {
        name: "not yet expired",
        tokenHash: hash,
        tokenPrefix: prefix,
        roleId: role.id,
        organizationId: organization.id,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const resolved = await verifyAndResolve(plaintext);

    expect(resolved.id).toBe(role.id);
  });
});
