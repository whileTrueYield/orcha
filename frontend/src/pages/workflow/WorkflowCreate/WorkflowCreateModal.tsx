import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { workflowFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationCreateWorkflowArgs, Workflow } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";

const CREATE_WORKFLOW_MUTATION = gql`
  mutation CreateWorkflow($input: CreateWorkflowInput!) {
    createWorkflow(input: $input) {
      id
      name
    }
  }
`;

const schema = yup.object().noUnknown().defined().shape({
  name: workflowFormFields.name,
  description: workflowFormFields.description,
});

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const WorkflowCreateModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  const formContext = useForm<FormSchema>({ resolver: yupResolver(schema) });

  const [createWorkflow] = useBlockingMutation<
    { createWorkflow: Workflow },
    MutationCreateWorkflowArgs
  >(CREATE_WORKFLOW_MUTATION, {
    onError: onGraphQLError({
      title: "Workflow creation failed",
      subTitle: "Please review your workflow definition",
    }),
    onCompleted: onMutationComplete({
      title: "Workflow created",
      callback: (data) =>
        history.push(urlResolver.workflow.edit(orgId, data.createWorkflow.id)),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    createWorkflow({ variables: { input: formData } });
  };

  return (
    <Modal {...props} initialFocusSelector="#workflow-name">
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Add a New Workflow
            </Dialog.Title>
            <div className="mt-2">
              <p className="hidden text-sm leading-5 text-gray-500 sm:block">
                You should create a workflow for each distinct process in your
                organization.
              </p>
              <div className="mt-4">
                <Label htmlFor="workflow-name" className="mb-1" required>
                  Workflow Name
                </Label>
                <FormInputGroup
                  id="workflow-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Bug"
                  tabIndex={1}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="workflow-description" className="mb-1" optional>
                  Description
                </Label>
                <FormTextareaGroup
                  id="workflow-description"
                  name="description"
                  tabIndex={3}
                  rows={3}
                  placeholder="e.g. Address issues in existing code..."
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button fullInMobile type="submit" btnType="primary" tabIndex={4}>
                <PlusIcon className="mr-2 h-5 w-5" />
                Create Workflow
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                btnType="secondaryWhite"
                tabIndex={5}
                fullInMobile
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
