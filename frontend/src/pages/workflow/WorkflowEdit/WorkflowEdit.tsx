import React, { useEffect, useState } from "react";
import { useParams, RouteComponentProps } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Workflow } from "types/graphql";
import { workflowFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { MutationUpdateWorkflowArgs } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onMutationComplete, onGraphQLError } from "utils/GQLClient";
import { WorkflowStateManage } from "./WorkflowStateManage";
import { fragments } from "./fragments";
import { WorkflowStateEdit } from "./WorkflowStateEdit";
import { Button } from "components/fields/Button";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Panel, PanelBody } from "components/views/Panel";
import { WorkflowStage } from "./workflowStage";
import { StageBadge } from "components/tags/StageBadge";
import { useBlockingMutation } from "utils/graphql";
import { ColorSelect } from "components/fields/ColorSelect";
import { getColor } from "config";
import { usePageTitle } from "hooks/usePageTitle";
import { WarningConfirm } from "components/modals/WarningConfirm";
import { useNavConfirmation } from "hooks/useNavConfirmation";
import { FormCheckboxGroup } from "components/fields/Checkbox";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";
import { QueryReturnValue } from "types/queryTypes";
import { FormTextarea } from "components/fields/Textarea";

const MUTATE_UPDATE_WORKFLOW = gql`
  mutation UpdateWorkflow($input: UpdateWorkflowInput!, $workflowId: Int!) {
    updateWorkflow(input: $input, workflowId: $workflowId) {
      id
      ...workflowFragment
      ...workflowStateFragment
    }
  }
  ${fragments.workflowFragment}
  ${fragments.workflowStateFragment}
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: workflowFormFields.name,
    description: workflowFormFields.description,
    color: workflowFormFields.color,
    isDefaultWorkflow: workflowFormFields.isDefaultWorkflow,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface UrlParams {
  workflowId: string;
}
type Props = RouteComponentProps<UrlParams>;

export const WorkflowEdit: React.FC<Props> = () => {
  usePageTitle("Workflow Edit");
  const params = useParams<UrlParams>();
  const [editMode, _setEditMode] = useState(false);
  const workflowId = parseInt(params.workflowId);

  const formMethods = useForm<FormSchema>({ resolver: yupResolver(schema) });
  const {
    formState: { errors, isDirty },
  } = formMethods;

  const color = formMethods.watch("color");
  const colorSet = getColor(color);

  const {
    isConfirmNavVisible,
    onNavAccept,
    onNavCancel,
    activateNavConfirmation,
  } = useNavConfirmation(false);

  useEffect(() => {
    activateNavConfirmation(isDirty);
  }, [isDirty, activateNavConfirmation]);

  const setEditMode = (editMode: boolean) => {
    _setEditMode(editMode);
    activateNavConfirmation(editMode && isDirty);
  };

  const { data, loading } = useQuery<QueryReturnValue["workflow"]>(
    GET_WORKFLOW,
    {
      variables: {
        id: workflowId,
      },
      onError: onGraphQLError({ title: "Could not retrieve workflow" }),
      onCompleted: ({ workflow }) =>
        formMethods.reset({
          name: workflow.name,
          description: workflow.description || "",
          color: workflow.color,
          isDefaultWorkflow: workflow.isDefaultWorkflow,
        }),
    }
  );

  const workflow = data?.workflow;

  const [updateWorkflow] = useBlockingMutation<
    { updateWorkflow: Workflow },
    MutationUpdateWorkflowArgs
  >(MUTATE_UPDATE_WORKFLOW, {
    onError: onGraphQLError({ title: "Could not update workflow" }),
    onCompleted: onMutationComplete({
      title: "Workflow has been updated",
      callback: () => setEditMode(false),
    }),
    update: (cache, { data }) => {
      if (!data) {
        return;
      }

      // update mini workflow cached name when we update the workflow's name
      cache.writeFragment({
        id: `MiniWorkflow:${data.updateWorkflow.id}`,
        fragment: gql`
          fragment miniWorkflowUpdate on MiniWorkflow {
            id
            name
          }
        `,
        data: {
          id: data.updateWorkflow.id,
          name: data.updateWorkflow.name,
        },
      });
    },
  });

  useEffect(() => {
    formMethods.register("color");
  }, [formMethods]);

  if (loading) {
    return null;
  }

  if (!workflow) {
    return null;
  }

  const onSubmit = (formData: FormSchema) => {
    updateWorkflow({
      variables: {
        input: formData,
        workflowId,
      },
    });
  };

  const renderEditView = () => (
    <Panel>
      <PanelBody>
        <h3 className="flex items-center space-x-2">
          <div
            className={`h-4 w-4 rounded-full shadow ${colorSet.bgColor} border-2 ${colorSet.borderColor}`}
          />
          <div className="text-lg font-medium leading-6 text-gray-900">
            {workflow.name} Workflow
          </div>
        </h3>
        <p className="mt-1 text-sm leading-5 text-gray-500">
          You may describe your workflow using Markdown.
        </p>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="mt-6 grid grid-cols-9 gap-6">
              <div className="col-span-7">
                <Label htmlFor="workflow-name" className="mb-1">
                  Workflow Name
                </Label>
                <FormInputGroup
                  id="workflow-name"
                  name="name"
                  placeholder="e.g. Rapid Feature"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="workflow-name" className="mb-1">
                  Color
                </Label>
                <ColorSelect
                  onChange={(color) =>
                    formMethods.setValue("color", color, {
                      shouldDirty: true,
                    })
                  }
                  value={color}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <FormCheckboxGroup
                name="isDefaultWorkflow"
                id="is-default-workflow"
                label="Globally available workflow"
                description="A global workflow is available on all your products"
              />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2 md:col-span-3">
                <Label htmlFor="workflow-description" className="mb-1">
                  Description
                </Label>
                <FormTextarea
                  name="description"
                  aria-invalid={errors["description"] ? "true" : "false"}
                  aria-describedby={`content-field-error`}
                  rows={6}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Brief description for your workflow. URLs are hyperlinked.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col justify-end space-y-2 sm:flex-row sm:items-center sm:space-y-0">
              <div className="flex flex-row-reverse">
                <Button fullInMobile btnType="primary" type="submit">
                  Update Workflow
                </Button>
                <Button
                  type="button"
                  fullInMobile
                  className="mr-2"
                  btnType="secondaryWhite"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </PanelBody>
    </Panel>
  );

  const renderReadOnlyView = () => {
    return (
      <Panel>
        <PanelBody>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
            <h3 className="flex items-center space-x-2">
              <div
                className={`h-4 w-4 rounded-full shadow ${colorSet.bgColor} border-2 ${colorSet.borderColor}`}
              />
              <div className="text-lg font-medium leading-6 text-gray-900">
                {workflow.name} Workflow
              </div>
              <StageBadge
                stage={workflow.stage}
                className="ml-4 align-text-bottom"
              />
            </h3>
            <div className="flex flex-row justify-center">
              {workflow.isDefaultWorkflow ? (
                <div className="flex flex-row items-center justify-center space-x-2 rounded-lg bg-brand-50 px-3 py-1 text-sm font-medium text-brand-600">
                  <EyeIcon className="h-5 w-5 text-brand-500" />
                  <span>Available on all products</span>
                </div>
              ) : (
                <div className="flex flex-row items-center justify-center space-x-2 rounded-lg bg-pink-50 px-3 py-1 text-sm font-medium text-pink-600">
                  <EyeOffIcon className="h-5 w-5 text-pink-500" />
                  <span>Restricted availability</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {workflow.description}
          </div>

          <div className="flex flex-col justify-end sm:flex-row sm:space-y-0">
            <Button
              btnType="white"
              type="button"
              onClick={() => setEditMode(true)}
            >
              Edit Workflow
            </Button>
          </div>
        </PanelBody>
      </Panel>
    );
  };

  return (
    <>
      <WarningConfirm
        title="Discard Workflow Changes"
        description={
          "Are you sure you wish to discard the changes you made " +
          "to this workflow? Once discarded changes are permanently lost."
        }
        onClose={onNavCancel}
        cta="Yes, discard changes"
        onConfirm={onNavAccept}
        visible={isConfirmNavVisible}
      />

      <div className="flex-col space-y-6 px-2 pb-6 first-letter:flex sm:px-0">
        {editMode ? renderEditView() : renderReadOnlyView()}
        <Panel>
          <PanelBody>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Workflow States
            </h3>
            <p className="mt-2 text-sm leading-5 text-gray-500">
              The workflow process is described by the following states. The
              first state is always the initial one, usually defined by "draft".
            </p>

            <WorkflowStateManage
              workflowId={workflowId}
              states={workflow.states}
            />
          </PanelBody>
        </Panel>

        <Panel className="mt-6">
          <PanelBody>
            <WorkflowStage workflow={workflow} />
          </PanelBody>
        </Panel>
      </div>
    </>
  );
};

const GET_WORKFLOW = gql`
  query getWorkflowForEdit($id: Int!) {
    workflow(id: $id) {
      id
      ...WorkflowStateEditDetails
      ...WorkflowStageDetails
      ...workflowFragment
    }
  }
  ${WorkflowStateEdit.fragments.workflowStateDetails}
  ${WorkflowStage.fragments.WorkflowStageDetails}
  ${fragments.workflowFragment}
`;
