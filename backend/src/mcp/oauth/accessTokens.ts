/**
 * OAuth access-token module — the opaque, short-lived bearer Orcha issues at the
 * end of the OAuth flow, and the resolver the MCP seam calls for the OAuth branch.
 *
 * An OAuth access token is conceptually a short-lived, client-bound, browser-issued
 * Role token. It shares the PAT's storage discipline — only the SHA-256 hash is
 * persisted, the plaintext is unrecoverable after minting — but a distinct lifecycle
 * (client-bound, PKCE-derived, ~1h TTL, soon refreshable) earns its own model.
 *
 * Exports:
 *  - generateAccessToken(): a fresh `orcha_oat_…` plaintext.
 *  - mintAccessToken(grant): persist a token for a grant, return the plaintext.
 *  - verifyAndResolveOAuth(plaintext): resolve to { tokenId, role, readOnly, scopes,
 *    clientId, expiresAt } or throw InvalidTokenError — the same opaque refusal the
 *    PAT path uses, so a probe learns nothing from which branch rejected it.
 *  - isOAuthAccessToken(plaintext): prefix guard used by resolveRole to dispatch.
 */
import { randomBytes } from "crypto";
import { Role } from "@prisma/client";
import prisma from "../../prisma";
import { hashToken, InvalidTokenError } from "../../models/apiToken/token";

const TOKEN_PREFIX = "orcha_oat_";

// Default access-token lifetime: short, so a leaked token expires quickly.
const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 60; // 1h

export function generateAccessToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export function isOAuthAccessToken(plaintext: string): boolean {
  return plaintext.startsWith(TOKEN_PREFIX);
}

export interface AccessTokenGrant {
  clientId: number; // OAuthClient.id (FK)
  roleId: number;
  organizationId: number;
  scope: string;
  readOnly: boolean;
  familyId: string; // groups the rotation chain (shared with the paired refresh token)
}

// Returns the one-time plaintext; only the hash is stored.
export async function mintAccessToken(grant: AccessTokenGrant): Promise<string> {
  const plaintext = generateAccessToken();
  await prisma.oAuthAccessToken.create({
    data: {
      tokenHash: hashToken(plaintext),
      scope: grant.scope,
      readOnly: grant.readOnly,
      familyId: grant.familyId,
      expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
      clientId: grant.clientId,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
    },
  });
  return plaintext;
}

export interface ResolvedOAuthToken {
  tokenId: number;
  role: Role;
  readOnly: boolean;
  scopes: string[];
  clientId: string; // the public OAuthClient.clientId
  expiresAt: Date;
}

export async function verifyAndResolveOAuth(
  plaintext: string,
): Promise<ResolvedOAuthToken> {
  const token = await prisma.oAuthAccessToken.findUnique({
    where: { tokenHash: hashToken(plaintext) },
    include: { role: true, client: true },
  });

  if (!token) throw new InvalidTokenError("UNKNOWN");
  if (token.revokedAt) throw new InvalidTokenError("REVOKED");
  if (token.expiresAt.getTime() < Date.now()) {
    throw new InvalidTokenError("EXPIRED");
  }

  // Record the "last seen" the connected-apps view (#81) shows. Stamped only
  // after the token proves valid, so a refused probe leaves no trace.
  // IDEA: this is a write on every tool call; if it becomes hot, throttle to
  // "only update when lastUsedAt is older than ~1min" to coalesce bursts.
  await prisma.oAuthAccessToken.update({
    where: { id: token.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    tokenId: token.id,
    role: token.role,
    readOnly: token.readOnly,
    scopes: token.scope.split(" ").filter(Boolean),
    clientId: token.client.clientId,
    expiresAt: token.expiresAt,
  };
}
