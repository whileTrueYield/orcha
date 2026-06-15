/**
 * OrchaOAuthProvider — the thin bridge between the SDK's authorization-server
 * router and Orcha's stores. The SDK owns the protocol (metadata, DCR, PKCE
 * validation, route wiring); this provides the four hooks it cannot: who the
 * user is (authorize, via the session + consent), what challenge a code carries,
 * how a code becomes an access token, and how an access token is verified.
 *
 * Scope (slice #77): single default scope (read+write), opaque access tokens, no
 * refresh and no revocation (those throw clearly and land in #78/#81). PKCE-S256
 * is validated by the SDK before exchangeAuthorizationCode runs, so no verifier
 * carries meaning here — we only consume the code and mint.
 *
 * The pending-authorize store is an in-process Map (single-instance only). In a
 * multi-process or multi-replica deployment, a pending authorize on instance A
 * will not be visible to the consent decision route on instance B. A later slice
 * moves this to Redis (#79). Until then, only single-instance deploys are supported.
 *
 * Exports:
 *  - orchaOAuthProvider: the OAuthServerProvider instance the router consumes.
 *  - pendingRequests: the consent route (router.ts) reads/clears on decision.
 *  - PendingRequest: the shape of each stashed authorize request.
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
import { mintAccessToken, verifyAndResolveOAuth } from "./accessTokens";
import prisma from "../../prisma";

const DEFAULT_SCOPE = "mcp";

// A validated authorize request awaiting the user's approve/deny decision.
// Keyed by an opaque requestToken carried through the consent form. In-process only —
// see the file header for the single-instance caveat.
export interface PendingRequest {
  clientId: string; // public client_id
  redirectUri: string;
  codeChallenge: string;
  scope: string;
  state?: string;
  expiresAt: number; // ms since epoch
}

export const pendingRequests = new Map<string, PendingRequest>();

// 5 minutes is generous for a human consent decision; the code still has its
// own 60-second TTL after minting.
const PENDING_TTL_MS = 1000 * 60 * 5;

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
    pendingRequests.set(requestToken, {
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge,
      scope: params.scopes?.join(" ") || DEFAULT_SCOPE,
      state: params.state,
      expiresAt: Date.now() + PENDING_TTL_MS,
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
    const access_token = await mintAccessToken({
      clientId: grant.clientPk,
      roleId: grant.roleId,
      organizationId: grant.organizationId,
      scope: grant.scope,
      // Single default scope this slice: full read+write.
      readOnly: false,
    });
    return {
      access_token,
      token_type: "bearer",
      expires_in: 3600,
      scope: grant.scope,
    };
  },

  async exchangeRefreshToken(): Promise<OAuthTokens> {
    // Refresh tokens are not supported in this slice; a follow-up adds them (#78).
    throw new Error("refresh tokens are not supported yet (#78)");
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
  const pending = pendingRequests.get(requestToken);
  if (!pending || pending.expiresAt < Date.now()) return null;
  const dbClient = await prisma.oAuthClient.findUnique({
    where: { clientId: pending.clientId },
  });
  return { pending, clientName: dbClient?.name ?? pending.clientId };
}
