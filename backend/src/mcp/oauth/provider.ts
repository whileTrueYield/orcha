/**
 * OrchaOAuthProvider — the thin bridge between the SDK's authorization-server
 * router and Orcha's stores. The SDK owns the protocol (metadata, DCR, PKCE
 * validation, route wiring); this provides the four hooks it cannot: who the
 * user is (authorize, via the session + consent), what challenge a code carries,
 * how a code becomes an access token, and how an access token is verified.
 *
 * Scope (slice #79): real `read` / `read write` scopes — the authorize request's
 * requested scope is granted (via grantedScopeFromRequest) and carried on the code
 * and tokens; the mint paths derive `readOnly` from it (isReadOnlyScope), so a
 * read-only grant hits the same write-tool refusal a read-only PAT does. Opaque
 * access tokens; refresh tokens are issued on code exchange and rotated on the
 * refresh grant; revocation endpoints remain a later slice (#81). PKCE-S256 is
 * validated by the SDK before exchangeAuthorizationCode runs, so no verifier carries
 * meaning here — we only consume the code and mint.
 *
 * The pending-authorize request (the bridge between /authorize and the consent
 * decision) lives in Redis via pendingStore — shared across instances and
 * self-expiring — so this provider holds no per-request state and the server can
 * run on any number of replicas.
 *
 * Exports:
 *  - orchaOAuthProvider: the OAuthServerProvider instance the router consumes.
 *  - describePending(token): resolve a pending request to its display data.
 */
import { randomUUID } from "crypto";
import { Response } from "express";
import {
  OAuthServerProvider,
  AuthorizationParams,
} from "@modelcontextprotocol/sdk/server/auth/provider.js";
import {
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { orchaClientsStore } from "./clientStore";
import { lookupChallenge, consumeCode } from "./codes";
import { grantedScopeFromRequest, isReadOnlyScope } from "./scopes";
import { putPending, getPending } from "./pendingStore";
import type { PendingRequest } from "./pendingStore";
import { mintAccessToken, verifyAndResolveOAuth } from "./accessTokens";
import {
  mintRefreshToken,
  rotateRefreshToken,
  RefreshTokenGrant,
  InvalidRefreshTokenError,
} from "./refreshTokens";
import { InvalidGrantError } from "@modelcontextprotocol/sdk/server/auth/errors.js";
import prisma from "../../prisma";
import { logger } from "../../logger";

export const orchaOAuthProvider: OAuthServerProvider = {
  get clientsStore() {
    return orchaClientsStore;
  },

  // Stash the validated request and redirect to the consent page. The actual
  // code is minted only after the user approves in the decision route (router.ts),
  // which reads req.session and calls mintCode directly.
  async authorize(
    client: OAuthClientInformationFull,
    params: AuthorizationParams,
    res: Response,
  ): Promise<void> {
    const requestToken = randomUUID();
    await putPending(requestToken, {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      // The client's requested scope, narrowed to what Orcha grants; carried
      // through consent → code → tokens so the resource server enforces it.
      scope: grantedScopeFromRequest(params.scopes),
      state: params.state,
    });
    // Consent rendering and session gate live in the consent route (router.ts);
    // authorize only records intent so it remains testable without a live session.
    res.redirect(`/oauth/consent?request=${requestToken}`);
  },

  async challengeForAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<string> {
    return lookupChallenge(client.client_id, authorizationCode);
  },

  // PKCE-S256 is already verified by the SDK before this runs, so the optional
  // codeVerifier param is intentionally unused. We only consume (single-use)
  // and mint the access token.
  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
  ): Promise<OAuthTokens> {
    const grant = await consumeCode(client.client_id, authorizationCode);
    // One family id ties this access token to its paired refresh token and every
    // future rotation of the pair, so a reuse can revoke the whole chain.
    const familyId = randomUUID();
    // The granted scope is the source of truth; the capability flag is derived
    // from it, so a `read` grant is read-only and a `read write` grant is not.
    const readOnly = isReadOnlyScope(grant.scope);
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly,
      familyId,
    });
    const refresh_token = await mintRefreshToken({
      clientPk: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly,
      familyId,
    });
    return {
      access_token,
      refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },

  // The SDK's hook can pass a requested-scope subset (and resource) as extra
  // args; we omit those params and always reissue the granted scope (and its
  // derived readOnly) unchanged, so rotation never silently widens a grant.
  // TODO: honor a down-scoping refresh request (e.g. read+write → read) once a
  // client needs it; widening must still require fresh consent.
  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
  ): Promise<OAuthTokens> {
    let grant: RefreshTokenGrant;
    try {
      grant = await rotateRefreshToken(client.client_id, refreshToken);
    } catch (err) {
      // A protocol rejection (unknown / reuse / expired / client mismatch) is an
      // invalid grant — a deliberately undifferentiated 400 so a probe can't tell
      // the reasons apart. Anything else (a DB/store failure) is NOT an invalid
      // grant: rethrow it so it surfaces as a 500 instead of masquerading as a
      // bad token.
      if (!(err instanceof InvalidRefreshTokenError)) throw err;
      // A reuse means rotateRefreshToken just revoked an entire family — a real
      // theft signal. Record it server-side; the client still gets the generic 400.
      if (err.reason === "REUSE") {
        logger.warn("oauth refresh token reuse detected — family revoked", {
          clientId: client.client_id,
        });
      }
      throw new InvalidGrantError("invalid refresh token");
    }
    // clientPk (refresh grant) and clientId (access grant) are the same FK under
    // different names — map explicitly when minting the access token.
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      readOnly: grant.readOnly,
      familyId: grant.familyId,
    });
    const refresh_token = await mintRefreshToken(grant);
    return {
      access_token,
      refresh_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const resolved = await verifyAndResolveOAuth(token);
    return {
      token,
      clientId: resolved.clientId,
      scopes: resolved.scopes,
      // expiresAt is seconds since epoch (SDK AuthInfo convention).
      expiresAt: Math.floor(resolved.expiresAt.getTime() / 1000),
    };
  },
};

// Resolve a pending request's display metadata for the consent page (router.ts).
// Returns null if the token is unknown or has expired.
export async function describePending(requestToken: string): Promise<{
  pending: PendingRequest;
  clientName: string;
} | null> {
  const pending = await getPending(requestToken);
  if (!pending) return null;
  const dbClient = await prisma.oAuthClient.findUnique({
    where: { clientId: pending.clientId },
  });
  return { pending, clientName: dbClient?.name ?? pending.clientId };
}
