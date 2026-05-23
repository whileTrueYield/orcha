import React, { useState } from "react";
import cn from "classnames";
import * as yup from "yup";
import { workflowStateFields } from "../formFields";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { gql } from "@apollo/client";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import {
  WorkflowState,
  MutationUpdateWorkflowStateArgs,
  MutationMoveWorkflowStateArgs,
  WorkflowStateDirection,
  MutationDeleteWorkflowStateArgs,
} from "types/graphql";
import { FCWithFragments } from "types";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { WorkflowStateTeams } from "./WorkflowStateTeams";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@heroicons/react/solid";
import { DangerConfirm } from "components/modals/DangerConfirm";
import { useBlockingMutation } from "utils/graphql";
import { Label } from "components/fields/Label";

interface Props {
  state: WorkflowState;
  last?: boolean;
  first?: boolean;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    stateName: workflowStateFields.name,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const WorkflowStateEdit: FCWithFragments<Props> = (props) => {
  const { state } = props;
  const workflowState = props.state;
  const workflowStateId = workflowState.id;
  const [isOpened, setIsOpened] = useState(false);
  const [
    deleteWorkflowStateModalVisible,
    setDeleteWorkflowStateModalVisibility,
  ] = useState(false);
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      stateName: state.name,
    },
  });

  const [updateState] = useBlockingMutation<
    { updateWorkflowState: WorkflowState },
    MutationUpdateWorkflowStateArgs
  >(MUTATION_UPDATE_STATE, {
    onError: onGraphQLError({ title: "Update State Error" }),
    onCompleted: onMutationComplete({
      title: "State has been updated",
      callback: () => setIsOpened(false),
    }),
  });

  const [moveWorkflowState] = useBlockingMutation<
    { updateWorkflowState: WorkflowState },
    MutationMoveWorkflowStateArgs
  >(MUTATION_MOVE_STATE, {
    onError: onGraphQLError({ title: "Update State Error" }),
    onCompleted: onMutationComplete({ title: "State has been moved" }),
  });

  const [deleteWorkflowState] = useBlockingMutation<
    { deleteWorkflowState: boolean },
    MutationDeleteWorkflowStateArgs
  >(DELETE_WORKFLOW_STATE_MUTATION, {
    onError: onGraphQLError({ title: "Cannot delete Workflow State" }),
    onCompleted: onMutationComplete({
      title: "Workflow State has been deleted",
    }),
  });

  const formClasses = cn("border border-t-0 transition-all overflow-hidden ", {
    "max-h-0 bg-transparent border-0": !isOpened,
    "max-h-[180px] bg-gray-50": isOpened,
    "border-b-0": !props.last,
    "rounded-b-lg": props.last,
  });

  const onMoveState =
    (direction: WorkflowStateDirection) => (event: React.MouseEvent) => {
      moveWorkflowState({
        variables: {
          workflowStateId,
          direction,
        },
      });
      event.stopPropagation();
    };

  const onDeleteWorkflowState = () => {
    deleteWorkflowState({ variables: { workflowStateId } });
  };

  const onSubmit = (formData: FormSchema) => {
    updateState({
      variables: {
        workflowStateId,
        input: {
          name: formData.stateName,
        },
      },
    });
  };

  const stateMoveControlClass = cn(
    "leading-5 text-gray-500 flex flex-row space-x-2"
  );
  const containerClass = cn(
    "block hover:bg-gray-100 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out w-full border",
    {
      "bg-gray-50": isOpened,
      "border-b-0": !props.last || isOpened,
      "rounded-t-lg": props.first,
      "rounded-b-lg": props.last && !isOpened,
    }
  );
  return (
    <>
      <div
        role="button"
        onClick={() => setIsOpened(!isOpened)}
        className={containerClass}
      >
        <div className="flex items-center px-2 py-4 sm:px-3 sm:pr-5">
          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex w-full flex-row items-center justify-between text-sm">
              <div className="flex flex-row truncate font-medium leading-5 text-gray-700">
                <ChevronRightIcon
                  className={`inline-block h-5 w-5 text-gray-400 transition-transform duration-300 ${
                    isOpened ? "rotate-90" : ""
                  }`}
                />
                <div className="ml-2 truncate font-medium leading-5">
                  {state.name}
                </div>
              </div>
              <div
                className={stateMoveControlClass}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="rounded p-1 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
                  onClick={onMoveState(WorkflowStateDirection.Up)}
                  disabled={props.first}
                  title="move up"
                >
                  <ChevronUpIcon className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  className="rounded p-1 hover:bg-gray-200 disabled:text-gray-300 disabled:hover:bg-transparent"
                  onClick={onMoveState(WorkflowStateDirection.Down)}
                  disabled={props.last}
                  title="move down"
                >
                  <ChevronDownIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={formClasses}>
        <FormProvider {...formMethods}>
          <form className="p-4" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="flex-grow">
                <Label
                  htmlFor={`workflow-state-name-${workflowState.id}`}
                  className="mb-1"
                >
                  Workflow State Name
                </Label>
                <FormInputGroup
                  label=""
                  type="text"
                  placeholder="New state's name"
                  name="stateName"
                  className="mt-0"
                  id={`workflow-state-name-${workflowState.id}`}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col justify-between space-y-2 sm:flex-row sm:space-y-0">
              <Button
                type="button"
                btnType="secondaryDanger"
                onClick={() => setDeleteWorkflowStateModalVisibility(true)}
                fullInMobile
              >
                Delete
              </Button>

              <div className="flex flex-row-reverse">
                <Button type="submit" btnType="primary" fullInMobile>
                  Update
                </Button>
                <Button
                  type="button"
                  btnType="secondaryWhite"
                  className="mr-2"
                  onClick={() => setIsOpened(false)}
                  fullInMobile
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
          <DangerConfirm
            onConfirm={onDeleteWorkflowState}
            visible={deleteWorkflowStateModalVisible}
            onClose={() => setDeleteWorkflowStateModalVisibility(false)}
            cta="Delete Workflow State"
            description="Are you sure you want to delete this State? Tickets already published will keep displaying this state, but newly published ticket will not."
            title="Delete Workflow State"
          />
        </FormProvider>
      </div>
    </>
  );
};

WorkflowStateEdit.fragments = {
  workflowStateDetails: gql`
    fragment WorkflowStateEditDetails on Workflow {
      id
      states {
        id
        workflowId
        position
        name
        teams {
          ...WorkflowStateTeamsFragment
        }
        backupTeams {
          ...WorkflowStateTeamsFragment
        }
      }
    }
    ${WorkflowStateTeams.fragments.WorkflowStateTeamsFragment}
  `,
};

const MUTATION_UPDATE_STATE = gql`
  mutation UpdateWorkflowState(
    $workflowStateId: Int!
    $input: UpdateWorkflowStateInput!
  ) {
    updateWorkflowState(workflowStateId: $workflowStateId, input: $input) {
      ...WorkflowStateEditDetails
    }
  }
  ${WorkflowStateEdit.fragments.workflowStateDetails}
`;

const MUTATION_MOVE_STATE = gql`
  mutation MoveWorkflowState(
    $workflowStateId: Int!
    $direction: WorkflowStateDirection!
  ) {
    moveWorkflowState(
      direction: $direction
      workflowStateId: $workflowStateId
    ) {
      ...WorkflowStateEditDetails
    }
  }
  ${WorkflowStateEdit.fragments.workflowStateDetails}
`;

const DELETE_WORKFLOW_STATE_MUTATION = gql`
  mutation DeleteWorkflowState($workflowStateId: Int!) {
    deleteWorkflowState(workflowStateId: $workflowStateId) {
      ...WorkflowStateEditDetails
    }
  }
  ${WorkflowStateEdit.fragments.workflowStateDetails}
`;
