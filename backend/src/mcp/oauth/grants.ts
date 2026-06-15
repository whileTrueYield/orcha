/**
 * OAuth grants — the "connected clients" a user can see and cut off.
 *
 * There is no Grant table: a grant IS a `familyId`. One /authorize→/token connect
 * mints a fresh familyId (see provider.ts) that rotation preserves across every
 * access/refresh token in the chain. So a connected client is the set of tokens
 * sharing a familyId, and revoking one is exactly `revokeFamily` — the same
 * atomic access-AND-refresh kill the reuse-detection path already relies on.
 *
 * This module is the read/owner-check seam over that idea, keeping the GraphQL
 * resolvers thin (mirrors accessTokens.ts / refreshTokens.ts owning their slice):
 *  - listGrants({ organizationId, roleId }): a Role's active grants, one row per
 *    live family, with the client/scope/timing the connected-apps UI shows.
 *  - revokeGrant({ familyId, organizationId, roleId }): tenant-checked revoke;
 *    returns the revoked grant, or throws GrantNotFoundError when the family is
 *    not the caller's (so other tenants' grants read as not-found, never forbidden).
 */

import prisma from "../../prisma";
import { revokeFamily } from "./refreshTokens";

// The owner of a grant: a Role within an Organization. Both are carried so a
// resolver can scope by exactly the boundary the issue requires — a user only
// ever sees and revokes the grants their own Role consented to.
export interface GrantOwner {
  organizationId: number;
  roleId: number;
}

// A connected client, derived from one familyId's tokens. No secret material:
// the client name/id, the granted scope, and the timing the UI shows. `roleId`
// is the consented Role; `connectedAt` is the family's origin (first refresh
// token, pre-rotation); `lastUsedAt` is the most recent access-token use, null
// until the token is exercised.
export interface Grant {
  familyId: string;
  clientId: string; // the public OAuthClient.clientId
  clientName: string | null;
  roleId: number;
  scope: string;
  readOnly: boolean;
  connectedAt: Date;
  lastUsedAt: Date | null;
}

export class GrantNotFoundError extends Error {
  constructor(public readonly familyId: string) {
    super(`Grant not found: ${familyId}`);
    this.name = "GrantNotFoundError";
  }
}

// A grant is "active" while it holds a live refresh token: not revoked, not
// already rotated (spent), not expired. Access tokens are short-lived and come
// and go within a live family, so the refresh token is the chain's heartbeat.
const liveRefreshTokenWhere = (owner: GrantOwner) => ({
  organizationId: owner.organizationId,
  roleId: owner.roleId,
  revokedAt: null,
  rotatedAt: null,
  expiresAt: { gt: new Date() },
});

type LiveRefreshToken = Awaited<
  ReturnType<typeof findLiveRefreshTokens>
>[number];

const findLiveRefreshTokens = (owner: GrantOwner) =>
  prisma.oAuthRefreshToken.findMany({
    where: liveRefreshTokenWhere(owner),
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

// Turn live refresh-token rows into grants. connectedAt and lastUsedAt are
// family-level aggregates, so they are fetched once per call (two grouped
// queries) rather than per row — no N+1 as a Role's connected-client count grows.
const buildGrants = async (rows: LiveRefreshToken[]): Promise<Grant[]> => {
  if (rows.length === 0) return [];

  // One live refresh token per family is the steady state, but a rotation race
  // can briefly leave two; collapse to the newest (rows are createdAt desc) so a
  // family always lists exactly once.
  const byFamily = new Map<string, LiveRefreshToken>();
  for (const row of rows) {
    if (!byFamily.has(row.familyId)) byFamily.set(row.familyId, row);
  }
  const familyIds = [...byFamily.keys()];

  // connectedAt = the connect itself: the earliest refresh token in the family,
  // before any rotation slid its createdAt forward.
  const origins = await prisma.oAuthRefreshToken.groupBy({
    by: ["familyId"],
    where: { familyId: { in: familyIds } },
    _min: { createdAt: true },
  });
  const connectedAtOf = new Map(
    origins.map((o) => [o.familyId, o._min.createdAt]),
  );

  // lastUsedAt = the family's most recent access-token use (verifyAndResolveOAuth
  // stamps it). Null across the family until the client first calls a tool.
  const used = await prisma.oAuthAccessToken.groupBy({
    by: ["familyId"],
    where: { familyId: { in: familyIds } },
    _max: { lastUsedAt: true },
  });
  const lastUsedAtOf = new Map(used.map((u) => [u.familyId, u._max.lastUsedAt]));

  return [...byFamily.values()].map((row) => ({
    familyId: row.familyId,
    clientId: row.client.clientId,
    clientName: row.client.name,
    roleId: row.roleId,
    scope: row.scope,
    readOnly: row.readOnly,
    // connectedAt always resolves (the family's own row is in the aggregate);
    // fall back to the representative's createdAt to keep the type non-null.
    connectedAt: connectedAtOf.get(row.familyId) ?? row.createdAt,
    lastUsedAt: lastUsedAtOf.get(row.familyId) ?? null,
  }));
};

// A Role's active connected clients, newest connection first.
export async function listGrants(owner: GrantOwner): Promise<Grant[]> {
  return buildGrants(await findLiveRefreshTokens(owner));
}

// Revoke a connected client: kill every live access AND refresh token in its
// family. Tenant-scoped — the family must hold a live token owned by the caller,
// else it is not theirs and reads as not-found. Returns the grant as it was just
// before revocation (so the caller can confirm what it cut off).
export async function revokeGrant(
  args: GrantOwner & { familyId: string },
): Promise<Grant> {
  const { familyId, organizationId, roleId } = args;

  const owned = await prisma.oAuthRefreshToken.findFirst({
    where: { ...liveRefreshTokenWhere({ organizationId, roleId }), familyId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });
  if (!owned) throw new GrantNotFoundError(familyId);

  // Build the grant from pre-revoke state (revokeFamily only flips revokedAt;
  // the client/scope/timing it returns are unaffected), then cut the chain.
  const [grant] = await buildGrants([owned]);
  await revokeFamily(familyId);
  return grant;
}
