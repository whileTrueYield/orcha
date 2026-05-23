import React, { useState } from "react";
import {
  Workflow,
  WorkflowState,
  MutationAddWorkflowStateArgs,
} from "types/graphql";
import { gql } from "@apollo/client";
import * as yup from "yup";
import { workflowStateFields } from "../formFields";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, FormProvider } from "react-hook-form";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { WorkflowStateEdit } from "./WorkflowStateEdit";
import cn from "classnames";
import { fragments } from "./fragments";
import { FormInput } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { useBlockingMutation } from "utils/graphql";

interface Props {
  workflowId: number;
  states: WorkflowState[];
}

const schema = yup.object().noUnknown().defined().shape({
  stateName: workflowStateFields.name,
});

type FormSchema = yup.InferType<typeof schema>;

export const WorkflowStateManage: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const [isFullFormVisible, setIsFullFormVisible] = useState(false);
  const { states } = props;

  const [addState] = useBlockingMutation<
    { addWorkflowState: Workflow },
    MutationAddWorkflowStateArgs
  >(MUTATION_ADD_WORKFLOW_STATE, {
    onError: onGraphQLError({ title: "Create State Error" }),
    onCompleted: onMutationComplete({
      title: "Workflow State created",
      callback: () => formMethods.reset(),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    addState({
      variables: {
        workflowId: props.workflowId,
        input: {
          name: formData.stateName,
        },
      },
    });
  };

  const displayStates = () => {
    if (states.length) {
      return (
        <div className="mb-8 bg-white">
          <ul>
            {states.map((state, index) => (
              <li key={`state-${state.id}`}>
                <WorkflowStateEdit
                  state={state}
                  first={index === 0}
                  last={index === states.length - 1}
                />
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  const addStateBottomFormClass = cn("mt-4", {
    hidden: !isFullFormVisible,
  });

  return (
    <div className="mt-6 md:col-span-2">
      {displayStates()}
      <div className="border-gray-200 sm:rounded-md">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="mt-6">
              <Label htmlFor="stateName" className="mb-1">
                Add a new state
              </Label>
              <FormInput
                onFocus={() => setIsFullFormVisible(true)}
                name="stateName"
                placeholder="State's name"
              />
            </div>

            <div className={addStateBottomFormClass}>
              <div className="flex flex-row justify-end">
                <Button type="submit" btnType="primary" fullInMobile>
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Add New State
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

const MUTATION_ADD_WORKFLOW_STATE = gql`
  mutation AddWorkflowState(
    $workflowId: Int!
    $input: CreateWorkflowStateInput!
  ) {
    addWorkflowState(workflowId: $workflowId, input: $input) {
      ...workflowStateFragment
    }
  }
  ${fragments.workflowStateFragment}
`;
