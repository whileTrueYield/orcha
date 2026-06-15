/**
 * GraphQL operations for the Connected Apps page.
 *
 * A connected app is an OAuth grant — one client the user authorized over the
 * MCP OAuth flow. Both operations share an OAuthGrantFields fragment so the list
 * and the revoke payload always select the same shape:
 *  - MY_OAUTH_GRANTS — the caller's active connected clients.
 *  - REVOKE_OAUTH_GRANT — cut one off by familyId (kills access + refresh).
 *
 * familyId is the grant's identity and the revoke key; no token material is ever
 * selected (the server never exposes it).
 */

import { gql } from "@apollo/client";

export const OAUTH_GRANT_FIELDS = gql`
  fragment OAuthGrantFields on OAuthGrant {
    familyId
    clientId
    clientName
    scope
    readOnly
    connectedAt
    lastUsedAt
  }
`;

export const MY_OAUTH_GRANTS = gql`
  query MyOAuthGrants {
    myOAuthGrants {
      ...OAuthGrantFields
    }
  }
  ${OAUTH_GRANT_FIELDS}
`;

export const REVOKE_OAUTH_GRANT = gql`
  mutation RevokeOAuthGrant($familyId: String!) {
    revokeOAuthGrant(familyId: $familyId) {
      ...OAuthGrantFields
    }
  }
  ${OAUTH_GRANT_FIELDS}
`;
