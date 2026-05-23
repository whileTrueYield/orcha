import { gql } from "@apollo/client";

export const GET_MINI_PROJECTS_QUERY_FOR_EXPLORER = gql`
  query GetMiniProjectsForExplorer($includeArchived: Boolean) {
    myMiniProjects(includeArchived: $includeArchived) {
      id
      name
      parentId
      stage
      ancestorIsArchived
    }
  }
`;

export const EXPORT_SELECTION_QUERY = gql`
  query ExportTicketsForExplorer($sources: [String!]!) {
    exportTickets(sources: $sources) {
      local_id
      title
      description
      id
      created_at
      status
      stage
      eta
      product
      workflow
      project
      owner_name
      owner_email
      scheduled_at
      closed_at
      author_name
      author_email
      ancestor_tickets
      successor_tickets
      tags
    }
  }
`;
