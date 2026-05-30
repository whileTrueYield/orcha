/**
 * Personal Access Token (PAT) module.
 *
 * A PAT is a long-lived credential bound to a single Role. This module is the
 * deep core behind both the GraphQL token-management resolvers and (later) the
 * REST bearer middleware, so it deliberately knows nothing about GraphQL or
 * HTTP — it speaks only in plaintext tokens and Roles.
 *
 * Exports:
 *  - generateToken(): mint a new token — returns the one-time plaintext plus the
 *    hash + display prefix to persist.
 *  - hashToken(plaintext): the SHA-256 hex used for storage and lookup.
 *  - verifyAndResolve(plaintext): resolve a presented token to its Role.
 *
 * Only the hash and prefix are ever stored; the plaintext is unrecoverable once
 * generateToken returns it.
 */

import { createHash, randomBytes } from "crypto";
import { Role } from "@prisma/client";
import prisma from "../../prisma";

const TOKEN_PREFIX = "orcha_pat_";

// Why a typed error rather than a GraphQLError: this module is shared by the
// GraphQL resolvers and the REST bearer middleware, so it must stay ignorant of
// either transport. Each layer maps the reason to its own response (a GraphQL
// error, or a 401 with a clear message).
export type InvalidTokenReason = "UNKNOWN" | "REVOKED" | "EXPIRED";

export class InvalidTokenError extends Error {
  constructor(public readonly reason: InvalidTokenReason) {
    super(`Personal access token rejected: ${reason}`);
    this.name = "InvalidTokenError";
  }
}

// The visible prefix kept for display in the UI — the marker plus a few bytes,
// enough to recognise a token without revealing anything that aids guessing.
const DISPLAY_PREFIX_LENGTH = TOKEN_PREFIX.length + 6;

export interface GeneratedToken {
  plaintext: string;
  hash: string;
  prefix: string;
}

export function generateToken(): GeneratedToken {
  const plaintext = `${TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
  return {
    plaintext,
    hash: hashToken(plaintext),
    prefix: plaintext.slice(0, DISPLAY_PREFIX_LENGTH),
  };
}

export function hashToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export async function verifyAndResolve(plaintext: string): Promise<Role> {
  const token = await prisma.personalAccessToken.findUnique({
    where: { tokenHash: hashToken(plaintext) },
    include: { role: true },
  });

  if (!token) {
    throw new InvalidTokenError("UNKNOWN");
  }

  if (token.revokedAt) {
    throw new InvalidTokenError("REVOKED");
  }

  if (token.expiresAt && token.expiresAt.getTime() < Date.now()) {
    throw new InvalidTokenError("EXPIRED");
  }

  return token.role;
}
