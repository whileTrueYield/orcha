/**
 * GraphQL operations for the Repository Links admin page.
 *
 * A repository link binds one GitHub repo to the Organization for read-only PR
 * mirroring. All three operations share a RepositoryLinkFields fragment so the
 * list and the mutation payloads always select the same shape. No credential
 * material (webhook token/secret) is selected — the server never exposes it,
 * except the one-time webhookSecret returned by the create payload.
 */

import { gql } from "@apollo/client";

export const REPOSITORY_LINK_FIELDS = gql`
  fragment RepositoryLinkFields on RepositoryLink {
    id
    name
    status
    repoFullName
    activatedAt
    createdAt
  }
`;

export const REPOSITORY_LINKS = gql`
  query RepositoryLinks {
    repositoryLinks {
      ...RepositoryLinkFields
    }
  }
  ${REPOSITORY_LINK_FIELDS}
`;

export const CREATE_REPOSITORY_LINK = gql`
  mutation CreateRepositoryLink($input: CreateRepositoryLinkInput!) {
    createRepositoryLink(input: $input) {
      webhookUrl
      webhookSecret
      link {
        ...RepositoryLinkFields
      }
    }
  }
  ${REPOSITORY_LINK_FIELDS}
`;

export const DELETE_REPOSITORY_LINK = gql`
  mutation DeleteRepositoryLink($id: Int!) {
    deleteRepositoryLink(id: $id) {
      id
    }
  }
`;
