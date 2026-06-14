/**
 * The MCP auth seam: turn a bearer token into a resolved role context.
 *
 * This is the single point the MCP transport depends on for identity, and the
 * one seam OAuth (PRD B) will later swap. Today it resolves a Personal Access
 * Token via the transport-agnostic token module; tomorrow an OAuth access
 * token could resolve the same shape. The MCP tools depend only on the returned
 * `{ role, readOnly, tokenId }` — never on how the token was proven.
 *
 * Exports:
 *  - ResolvedRole: the resolved identity + capabilities an MCP connection runs as.
 *  - resolveRole(bearerToken) → ResolvedRole. Throws InvalidTokenError (from the
 *    token module) for any token that fails to resolve — the caller turns that
 *    into a refused connection.
 *
 * Mirrors the `/v1` bearer middleware (rest/bearerAuth.ts), which builds the
 * same role context from the same `verifyAndResolve` + `buildRoleContext` pair —
 * so a PAT grants identical authority over both transports.
 */

import { AuthRoleContext } from "../types";
import { buildRoleContext } from "../middlewares/isAuthenticated";
import { verifyAndResolve } from "../models/apiToken/token";

export interface ResolvedRole {
  // The resolved identity the operation runs as — the same context the GraphQL
  // and `/v1` paths build, so resolvers enforce the same tenant scoping.
  role: AuthRoleContext;
  // The presented token's capability flag: a read-only token may read but never
  // write. The transport refuses write tools when this is set.
  readOnly: boolean;
  // The token's own id, so the connection can be rate-limited per token (a Role
  // may hold several tokens — keying on the Role would not do).
  tokenId: number;
}

export async function resolveRole(bearerToken: string): Promise<ResolvedRole> {
  const { tokenId, role, readOnly } = await verifyAndResolve(bearerToken);

  return {
    role: buildRoleContext({
      userId: role.userId,
      roleId: role.id,
      organizationId: role.organizationId,
      roleType: role.type,
    }),
    readOnly,
    tokenId,
  };
}
