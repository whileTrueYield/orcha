/**
 * The MCP auth seam: turn a bearer token into a resolved role context.
 *
 * This is the single point the MCP transport depends on for identity. It
 * resolves two token families, both to the same `{ role, readOnly, tokenId }`
 * shape so the transport never needs to care which family proved the identity:
 *
 *  - `orcha_oat_` — an OAuth 2.1 access token (short-lived, client-bound,
 *    PKCE-derived). Resolved via `verifyAndResolveOAuth` from oauth/accessTokens.
 *  - `orcha_pat_` — a Personal Access Token (long-lived, user-scoped).
 *    Resolved via `verifyAndResolve` from models/apiToken/token.
 *
 * The PAT path is byte-for-byte behaviorally unchanged; the branch is purely
 * additive. Either path throws `InvalidTokenError` on refusal — the caller
 * turns that into a refused connection. The error gives the caller no hint
 * about which branch rejected the token (same opaque message either way).
 *
 * Exports:
 *  - ResolvedRole: the resolved identity + capabilities an MCP connection runs as.
 *  - resolveRole(bearerToken) → ResolvedRole.
 *
 * Mirrors the `/v1` bearer middleware (rest/bearerAuth.ts), which builds the
 * same role context from the same `verifyAndResolve` + `buildRoleContext` pair —
 * so a PAT grants identical authority over both transports.
 */

import { AuthRoleContext } from "../types";
import { buildRoleContext } from "../middlewares/isAuthenticated";
import { verifyAndResolve } from "../models/apiToken/token";
import {
  isOAuthAccessToken,
  verifyAndResolveOAuth,
} from "./oauth/accessTokens";

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
  // Dispatch by token family: an OAuth access token (orcha_oat_) and a PAT
  // (orcha_pat_) prove identity differently but both resolve to the same
  // { role, readOnly, tokenId } the MCP tools depend on. The PAT path is unchanged.
  const { tokenId, role, readOnly } = isOAuthAccessToken(bearerToken)
    ? await verifyAndResolveOAuth(bearerToken)
    : await verifyAndResolve(bearerToken);

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
