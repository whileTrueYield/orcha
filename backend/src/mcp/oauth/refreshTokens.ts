/**
 * OAuth refresh-token store — the long-lived, rotating credential a connected
 * client exchanges for fresh access tokens past the ~1h access-token expiry.
 *
 * It shares the access-token module's storage discipline (only the SHA-256 hash
 * of the `orcha_ort_…` plaintext is persisted) but owns the security-critical
 * part of rotation: every exchange marks the presented token spent (`rotatedAt`)
 * and issues a new one on the same `familyId`. Presenting an already-spent token
 * is treated as theft — the entire family (refresh AND access tokens) is revoked
 * (`revokedAt`), so a stolen-then-rotated token burns the whole chain and forces
 * re-consent. This is the OAuth 2.1 reuse-detection behavior.
 *
 * Exports:
 *  - generateRefreshToken(): a fresh `orcha_ort_…` plaintext.
 *  - mintRefreshToken(grant): persist a refresh token for a grant, return plaintext.
 *  - rotateRefreshToken(clientId, plaintext): atomically spend the token and return
 *    its binding for re-minting, or throw InvalidRefreshTokenError (revoking the
 *    family first when the rejection is a reuse).
 *  - revokeFamily(familyId): revoke all live refresh + access tokens in a family.
 */
import { randomBytes } from "crypto";
import prisma from "../../prisma";
import { hashToken } from "../../models/apiToken/token";

const TOKEN_PREFIX = "orcha_ort_";

// Sliding 30-day window — each rotation mints a fresh token with a new 30 days,
// so a client used at least monthly never re-prompts.
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export class InvalidRefreshTokenError extends Error {
  constructor(public readonly reason: string) {
    super(`Refresh token rejected: ${reason}`);
    this.name = "InvalidRefreshTokenError";
  }
}

export function generateRefreshToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export interface RefreshTokenGrant {
  clientPk: number; // OAuthClient.id (FK)
  roleId: number;
  organizationId: number;
  scope: string;
  readOnly: boolean;
  familyId: string;
}

// Returns the one-time plaintext; only the hash is stored.
export async function mintRefreshToken(
  grant: RefreshTokenGrant,
  expiresAt?: Date, // test seam; defaults to now + 30 days
): Promise<string> {
  const plaintext = generateRefreshToken();
  await prisma.oAuthRefreshToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      familyId: grant.familyId,
      scope: grant.scope,
      readOnly: grant.readOnly,
      expiresAt: expiresAt ?? new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
    },
  });
  return plaintext;
}

// Revoke every live refresh and access token sharing a family. Called when a
// reuse is detected; idempotent (only flips rows whose revokedAt is still null).
export async function revokeFamily(familyId: string): Promise<void> {
  // Crash early (project rule): an empty familyId would silently match no rows
  // and mask a caller bug in a security-critical path.
  if (!familyId) {
    throw new Error("revokeFamily called with an empty familyId");
  }
  const now = new Date();
  // Atomic: revoking a family is the theft response — it must not half-apply
  // (refresh tokens revoked but access tokens left live), so both updates run
  // in one transaction.
  await prisma.$transaction([
    prisma.oAuthRefreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.oAuthAccessToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);
}

// Atomically spend the presented token and return its binding for re-minting.
// Throws InvalidRefreshTokenError on every rejection; a reuse (already-spent or
// lost the rotate race) revokes the family first.
export async function rotateRefreshToken(
  clientId: string,
  plaintext: string,
): Promise<RefreshTokenGrant> {
  const row = await prisma.oAuthRefreshToken.findUnique({
    where: { tokenHash: hashToken(plaintext) },
    include: { client: true },
  });

  if (!row) throw new InvalidRefreshTokenError("UNKNOWN");
  if (row.client.clientId !== clientId) {
    throw new InvalidRefreshTokenError("CLIENT_MISMATCH");
  }
  if (row.rotatedAt) {
    // Reuse of a spent token: burn the whole chain, then refuse. Checked BEFORE
    // revokedAt so a re-presented spent token always re-signals REUSE (the theft
    // alert the provider logs) instead of reading as a plain REVOKED. revokeFamily
    // is idempotent, so re-burning an already-revoked family is a harmless no-op.
    await revokeFamily(row.familyId);
    throw new InvalidRefreshTokenError("REUSE");
  }
  if (row.revokedAt) throw new InvalidRefreshTokenError("REVOKED");
  if (row.expiresAt.getTime() < Date.now()) {
    // Honest expiry is not theft — refuse without touching the family.
    throw new InvalidRefreshTokenError("EXPIRED");
  }

  // Atomic single-use: only matches while rotatedAt is still null, so two
  // concurrent exchanges cannot both win. Losing the race is treated as reuse.
  const spent = await prisma.oAuthRefreshToken.updateMany({
    where: { id: row.id, rotatedAt: null },
    data: { rotatedAt: new Date() },
  });
  if (spent.count !== 1) {
    await revokeFamily(row.familyId);
    throw new InvalidRefreshTokenError("REUSE");
  }

  return {
    clientPk: row.clientId,
    roleId: row.roleId,
    organizationId: row.organizationId,
    scope: row.scope,
    readOnly: row.readOnly,
    familyId: row.familyId,
  };
}
