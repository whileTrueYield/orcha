/**
 * Pothos type for an OAuth grant — one connected client in the "connected apps"
 * view. A simpleObject (not a prismaObject): a grant has no table of its own, it
 * is derived from a familyId's tokens by mcp/oauth/grants, so the resolver hands
 * back plain Grant objects whose fields line up one-to-one with these.
 *
 * Exposes only what the UI shows — client, scope, capability, timing. No token
 * material ever crosses the API (the same discipline as ApiTokenRef).
 */

import builder from "../../schema/builder";

export const OAuthGrantRef = builder.simpleObject("OAuthGrant", {
  fields: (t) => ({
    // The grant's identity AND the revocation key — revokeOAuthGrant takes it.
    familyId: t.string({}),
    clientId: t.string({}),
    clientName: t.string({ nullable: true }),
    roleId: t.int({}),
    scope: t.string({}),
    readOnly: t.boolean({}),
    connectedAt: t.field({ type: "DateTime", nullable: false }),
    lastUsedAt: t.field({ type: "DateTime", nullable: true }),
  }),
});
