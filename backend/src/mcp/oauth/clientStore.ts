/**
 * Dynamic-client-registration store — the OAuthRegisteredClientsStore the SDK's
 * /register and client-auth machinery read and write.
 *
 * Our clients are public PKCE clients (no client secret), so DCR records only
 * the library-generated client_id, the registered redirect_uris, and a display
 * name. The SDK generates client_id/client_id_issued_at before calling
 * registerClient, so this store only persists and reflects them back.
 *
 * Exports:
 *  - orchaClientsStore: the OAuthRegisteredClientsStore implementation.
 */
import { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import { OAuthClientInformationFull } from "@modelcontextprotocol/sdk/shared/auth.js";
import prisma from "../../prisma";

function toClientInformation(row: {
  clientId: string;
  redirectUris: string[];
  name: string | null;
  clientIdIssuedAt: Date;
}): OAuthClientInformationFull {
  return {
    client_id: row.clientId,
    client_id_issued_at: Math.floor(row.clientIdIssuedAt.getTime() / 1000),
    redirect_uris: row.redirectUris,
    client_name: row.name ?? undefined,
    token_endpoint_auth_method: "none",
  } as OAuthClientInformationFull;
}

export const orchaClientsStore: OAuthRegisteredClientsStore = {
  async getClient(clientId) {
    const row = await prisma.oAuthClient.findUnique({ where: { clientId } });
    return row ? toClientInformation(row) : undefined;
  },

  async registerClient(client) {
    // The SDK sets client_id + client_id_issued_at before calling us, even
    // though the type omits them — cast to the full shape to access them.
    const full = client as OAuthClientInformationFull;
    const row = await prisma.oAuthClient.create({
      data: {
        clientId: full.client_id,
        name: full.client_name ?? null,
        redirectUris: full.redirect_uris,
        clientIdIssuedAt: full.client_id_issued_at
          ? new Date(full.client_id_issued_at * 1000)
          : new Date(),
      },
    });
    return toClientInformation(row);
  },
};
