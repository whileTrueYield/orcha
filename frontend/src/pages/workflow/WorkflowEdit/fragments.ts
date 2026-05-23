import { gql } from "@apollo/client";

export const fragments = {
  workflowFragment: gql`
    fragment workflowFragment on Workflow {
      id
      name
      description
      stage
      color
      updatedAt
      isDefaultWorkflow
    }
  `,

  workflowStateFragment: gql`
    fragment workflowStateFragment on Workflow {
      id
      states {
        id
        position
        name
      }
    }
  `,
};
