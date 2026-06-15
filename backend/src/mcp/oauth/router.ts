/**
 * The OAuth authorization-server surface for /mcp.
 *
 * Builds the SDK's mcpAuthRouter (metadata + DCR + authorize + token, PKCE-S256
 * enforced) from OrchaOAuthProvider and config.apiUri, and adds the backend
 * consent routes the provider defers to: GET /oauth/consent renders the page once
 * the user is logged in (else hands off to the SPA login with a returnTo), POST
 * /oauth/consent/decision mints a code on approve and redirects to the client.
 *
 * MUST be mounted at the app root, BEHIND the session middleware (authorize +
 * consent read req.session). Exports a single Router.
 */
import { Router, urlencoded } from "express";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { config } from "../../config";
import {
  orchaOAuthProvider,
  pendingRequests,
  describePending,
} from "./provider";
import { renderConsent, scopeLabel } from "./consent";
import { mintCode } from "./codes";
import { SUPPORTED_SCOPES, offeredScopes, isGrantableScope } from "./scopes";
import prisma from "../../prisma";

const ISSUER = new URL(config.apiUri);
const RESOURCE = new URL(`${config.apiUri}${config.apiPathPrefix}/mcp`);

export const oauthRouter = Router();

// SDK-owned endpoints: /.well-known/*, /authorize, /token, /register.
oauthRouter.use(
  mcpAuthRouter({
    provider: orchaOAuthProvider,
    issuerUrl: ISSUER,
    resourceServerUrl: RESOURCE,
    scopesSupported: SUPPORTED_SCOPES,
  }),
);

// GET /oauth/consent — the provider redirected here after recording the request.
oauthRouter.get("/oauth/consent", async (req, res) => {
  const requestToken = String(req.query.request ?? "");
  const described = await describePending(requestToken);
  if (!described) {
    res.status(400).send("Authorization request expired or unknown.");
    return;
  }

  // Session gate: if not signed in, hand off to the SPA login and come back.
  const { roleId, organizationId } = req.session;
  if (!roleId || !organizationId) {
    const returnTo = encodeURIComponent(
      `${config.apiUri}/oauth/consent?request=${requestToken}`,
    );
    res.redirect(`${config.webAppUri}/login?returnTo=${returnTo}`);
    return;
  }

  // Build the Role chooser from every Role on the session (a user may hold
  // several across orgs); the session's active one is pre-selected.
  const roleIds = req.session.roles?.length
    ? req.session.roles.map((r) => r.id)
    : [roleId];
  const roleRows = await prisma.role.findMany({
    where: { id: { in: roleIds } },
    include: { organization: true },
  });
  const roles = roleRows.map((r) => ({
    value: r.id,
    label: `${r.organization?.name ?? "your organization"} / ${r.name}`,
    selected: r.id === roleId,
  }));

  // Offer only the scopes the client requested; pre-select the requested grant.
  const scopeChoices = offeredScopes(described.pending.scope).map((value) => ({
    value,
    label: scopeLabel(value),
    selected: value === described.pending.scope,
  }));

  res.set("Content-Type", "text/html").send(
    renderConsent({
      clientName: described.clientName,
      roles,
      scopeChoices,
      requestToken,
      decisionPath: "/oauth/consent/decision",
    }),
  );
});

// POST /oauth/consent/decision — approve mints a code and redirects to the client.
oauthRouter.post(
  "/oauth/consent/decision",
  urlencoded({ extended: false }),
  async (req, res) => {
    const requestToken = String(req.body.request ?? "");
    const pending = pendingRequests.get(requestToken);
    const { roleId, organizationId } = req.session;
    // Reject an expired pending request, matching the GET consent route's TTL
    // guard — a consent form left open past the window must not still mint a code.
    if (
      !pending ||
      pending.expiresAt < Date.now() ||
      !roleId ||
      !organizationId
    ) {
      pendingRequests.delete(requestToken);
      res.status(400).send("Authorization request expired or unknown.");
      return;
    }
    pendingRequests.delete(requestToken);

    const redirect = new URL(pending.redirectUri);
    if (pending.state) redirect.searchParams.set("state", pending.state);

    if (req.body.decision !== "approve") {
      redirect.searchParams.set("error", "access_denied");
      res.redirect(redirect.toString());
      return;
    }

    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: pending.clientId },
    });
    if (!client) {
      res.status(400).send("Unknown client.");
      return;
    }

    // Bind the grant to the Role the user chose, but only to one they actually
    // hold (crash early on a forged roleId rather than mint for a foreign tenant).
    // Falls back to the session's active Role for a session predating the list.
    const candidateRoles: { id: number; organizationId: number }[] = req.session
      .roles?.length
      ? req.session.roles
      : [{ id: roleId, organizationId }];
    const chosenRole = candidateRoles.find(
      (r) => r.id === Number(req.body.roleId),
    );
    if (!chosenRole) {
      res.status(400).send("Invalid role selection.");
      return;
    }

    // The chosen access level must be one the request offered — reject anything
    // that would widen the grant past what the client asked for.
    const chosenScope = String(req.body.scope ?? "");
    if (!isGrantableScope(chosenScope, pending.scope)) {
      res.status(400).send("Invalid scope selection.");
      return;
    }

    const code = await mintCode({
      clientPk: client.id,
      roleId: chosenRole.id,
      organizationId: chosenRole.organizationId,
      scope: chosenScope,
      codeChallenge: pending.codeChallenge,
      redirectUri: pending.redirectUri,
    });
    redirect.searchParams.set("code", code);
    res.redirect(redirect.toString());
  },
);
