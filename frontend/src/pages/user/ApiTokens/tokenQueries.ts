/**
 * GraphQL operations for the Personal Access Token UI.
 *
 * Exports the four operations the token pages ride on, all sharing one
 * ApiTokenFields fragment so the personal list, the org-admin list, and the
 * create payload always select the same shape:
 *  - MY_API_TOKENS / ORGANIZATION_API_TOKENS — the two list queries.
 *  - CREATE_API_TOKEN — mints a token; returns the one-time plaintext.
 *  - REVOKE_API_TOKEN — revokes by id.
 *
 * The fragment includes role { id, name } so the org-admin view can name the
 * person who minted each token. tokenHash is never selected (never exposed).
 */

import { gql } from "@apollo/client";

export const API_TOKEN_FIELDS = gql`
  fragment ApiTokenFields on PersonalAccessToken {
    id
    name
    tokenPrefix
    readOnly
    lastUsedAt
    expiresAt
    revokedAt
    createdAt
    roleId
    role {
      id
      name
    }
  }
`;

export const MY_API_TOKENS = gql`
  query MyApiTokens {
    myApiTokens {
      ...ApiTokenFields
    }
  }
  ${API_TOKEN_FIELDS}
`;

export const ORGANIZATION_API_TOKENS = gql`
  query OrganizationApiTokens {
    organizationApiTokens {
      ...ApiTokenFields
    }
  }
  ${API_TOKEN_FIELDS}
`;

export const CREATE_API_TOKEN = gql`
  mutation CreateApiToken($input: CreateApiTokenInput!) {
    createApiToken(input: $input) {
      plaintext
      token {
        ...ApiTokenFields
      }
    }
  }
  ${API_TOKEN_FIELDS}
`;

export const REVOKE_API_TOKEN = gql`
  mutation RevokeApiToken($id: Int!) {
    revokeApiToken(id: $id) {
      ...ApiTokenFields
    }
  }
  ${API_TOKEN_FIELDS}
`;
