/**
 * Pothos type definitions for Personal Access Tokens.
 *
 * Exports:
 *  - ApiTokenRef: the GraphQL view of a PersonalAccessToken. Deliberately omits
 *    tokenHash — the secret material is never exposed through the API.
 *  - CreateApiTokenResult: the one-time create payload carrying the plaintext
 *    (shown once, never recoverable) alongside the token metadata.
 */

import builder from "../../schema/builder";

export const ApiTokenRef = builder.prismaObject("PersonalAccessToken", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    tokenPrefix: t.exposeString("tokenPrefix"),
    readOnly: t.exposeBoolean("readOnly"),
    lastUsedAt: t.expose("lastUsedAt", { type: "DateTime", nullable: true }),
    expiresAt: t.expose("expiresAt", { type: "DateTime", nullable: true }),
    revokedAt: t.expose("revokedAt", { type: "DateTime", nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    roleId: t.exposeInt("roleId"),
    // tokenHash is intentionally never exposed.
  }),
});

export const CreateApiTokenResult = builder.simpleObject("CreateApiTokenResult", {
  fields: (t) => ({
    plaintext: t.string({}),
    token: t.field({ type: ApiTokenRef, nullable: false }),
  }),
});
