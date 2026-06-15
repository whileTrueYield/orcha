/**
 * Authorization-code store for the OAuth flow.
 *
 * An authorization code is a single-use, ~60s bearer of intent: it binds the
 * user/Role/client/scope/redirect and the PKCE-S256 challenge proven at /authorize,
 * so /token can verify the client holds the matching verifier before issuing an
 * access token. Only the SHA-256 hash of the code is stored. Consumption is atomic
 * (a conditional update) so a replayed code cannot mint a second token.
 *
 * Exports:
 *  - mintCode(grant): persist a code, return the one-time plaintext code.
 *  - lookupChallenge(clientId, code): the stored S256 challenge (for the SDK's
 *    PKCE check) or throw if the code is unknown/expired.
 *  - consumeCode(clientId, code): atomically mark consumed and return the grant,
 *    or throw if unknown / expired / already consumed / wrong client.
 */
import { randomBytes } from "crypto";
import prisma from "../../prisma";
import { hashToken } from "../../models/apiToken/token";

const CODE_TTL_MS = 1000 * 60; // 60s

export class InvalidAuthorizationCodeError extends Error {
  constructor(reason: string) {
    super(`Authorization code rejected: ${reason}`);
    this.name = "InvalidAuthorizationCodeError";
  }
}

export interface CodeGrantInput {
  clientPk: number; // OAuthClient.id
  roleId: number;
  organizationId: number;
  scope: string;
  codeChallenge: string;
  redirectUri: string;
  expiresAt?: Date; // test seam; defaults to now + 60s
}

export async function mintCode(input: CodeGrantInput): Promise<string> {
  const code = randomBytes(32).toString("hex");
  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: hashToken(code),
      codeChallenge: input.codeChallenge,
      redirectUri: input.redirectUri,
      scope: input.scope,
      expiresAt: input.expiresAt ?? new Date(Date.now() + CODE_TTL_MS),
      clientId: input.clientPk,
      roleId: input.roleId,
      organizationId: input.organizationId,
    },
  });
  return code;
}

async function findLive(clientId: string, code: string) {
  const row = await prisma.oAuthAuthorizationCode.findUnique({
    where: { codeHash: hashToken(code) },
    include: { client: true },
  });
  if (!row) throw new InvalidAuthorizationCodeError("UNKNOWN");
  if (row.client.clientId !== clientId) {
    throw new InvalidAuthorizationCodeError("CLIENT_MISMATCH");
  }
  if (row.consumedAt) throw new InvalidAuthorizationCodeError("CONSUMED");
  if (row.expiresAt.getTime() < Date.now()) {
    throw new InvalidAuthorizationCodeError("EXPIRED");
  }
  return row;
}

export async function lookupChallenge(
  clientId: string,
  code: string,
): Promise<string> {
  const row = await findLive(clientId, code);
  return row.codeChallenge;
}

export interface ConsumedGrant {
  clientPk: number;
  roleId: number;
  organizationId: number;
  scope: string;
}

export async function consumeCode(
  clientId: string,
  code: string,
): Promise<ConsumedGrant> {
  const row = await findLive(clientId, code);
  // Atomic single-use: the update only matches while consumedAt is still null,
  // so two concurrent exchanges cannot both succeed.
  const consumed = await prisma.oAuthAuthorizationCode.updateMany({
    where: { id: row.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) {
    throw new InvalidAuthorizationCodeError("CONSUMED");
  }
  return {
    clientPk: row.clientId,
    roleId: row.roleId,
    organizationId: row.organizationId,
    scope: row.scope,
  };
}
