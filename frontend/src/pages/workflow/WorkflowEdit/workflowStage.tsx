import React from "react";
import { FCWithFragments } from "types";
import {
  ModelStage,
  MutationUpdateWorkflowStageArgs,
  Workflow,
} from "types/graphql";
import { gql } from "@apollo/client";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { Button } from "components/fields/Button";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  workflow: Workflow;
}

export const WorkflowStage: FCWithFragments<Props> = (props) => {
  const { workflow } = props;
  const [updateWorkflowStage] = useBlockingMutation<
    { updateWorkflowStage: Workflow },
    MutationUpdateWorkflowStageArgs
  >(MUTATE_UPDATE_WORKFLOW_STAGE, {
    onError: onGraphQLError({ title: "Could not update workflow lifecycle" }),
    onCompleted: onMutationComplete({
      title: "Workflow lifecycle has been updated",
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      // update mini workflow cached stage when we update the workflow's stage
      cache.writeFragment({
        id: `MiniWorkflow:${data.updateWorkflowStage.id}`,
        fragment: gql`
          fragment miniWorkflowUpdate on MiniWorkflow {
            id
            stage
          }
        `,
        data: {
          id: data.updateWorkflowStage.id,
          stage: data.updateWorkflowStage.stage,
        },
      });
    },
  });

  const onChange = (stage: ModelStage) => {
    updateWorkflowStage({
      variables: {
        workflowId: workflow.id,
        stage,
      },
    });
  };

  if (workflow.stage === ModelStage.Draft) {
    return <WorkflowDraftStage onChange={onChange} />;
  } else if (workflow.stage === ModelStage.Archived) {
    return <WorkflowArchivedStage onChange={onChange} />;
  } else if (workflow.stage === ModelStage.Published) {
    return <WorkflowPublishedStage onChange={onChange} />;
  }

  return null;
};

interface WorkflowStageChange {
  onChange: (stage: ModelStage) => void;
}

const WorkflowDraftStage: React.FC<WorkflowStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Draft Workflow
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This workflow is in Draft, it may not be use by tickets yet. Publish
            this workflow to let your team use it.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => props.onChange(ModelStage.Published)}
          >
            Publish Workflow
          </Button>
        </div>
      </div>
    </>
  );
};

const WorkflowPublishedStage: React.FC<WorkflowStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Published Workflow
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This workflow is available for your team to use. You may archive it
            to prevent further use, existing ticket using this workflow will
            remain functioning.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="warning"
            onClick={() => props.onChange(ModelStage.Archived)}
          >
            Archive Workflow
          </Button>
        </div>
      </div>
    </>
  );
};

const WorkflowArchivedStage: React.FC<WorkflowStageChange> = (props) => {
  return (
    <>
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Archived Workflow
      </h3>
      <div className="mt-2 sm:flex sm:items-start sm:justify-between sm:space-x-2">
        <div className="max-w-xl text-sm text-gray-500">
          <p>
            This workflow has been archived. You may re-publish this workflow
            and start using again.
          </p>
        </div>
        <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex sm:shrink-0 sm:items-center">
          <Button
            type="button"
            btnType="primary"
            onClick={() => props.onChange(ModelStage.Published)}
          >
            Publish Workflow
          </Button>
        </div>
      </div>
    </>
  );
};

WorkflowStage.fragments = {
  WorkflowStageDetails: gql`
    fragment WorkflowStageDetails on Workflow {
      id
      stage
    }
  `,
};

const MUTATE_UPDATE_WORKFLOW_STAGE = gql`
  mutation UpdateWorkflowStage($stage: ModelStage!, $workflowId: Int!) {
    updateWorkflowStage(stage: $stage, workflowId: $workflowId) {
      ...WorkflowStageDetails
    }
  }
  ${WorkflowStage.fragments.WorkflowStageDetails}
`;
