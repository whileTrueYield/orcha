import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { documentationFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationUpdateDocumentationArgs, Documentation } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { FormTextareaGroup } from "components/fields/Textarea";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";

const UPDATE_DOCUMENTATION_MUTATION = gql`
  mutation UpdateDocumentation(
    $documentationId: Int!
    $input: UpdateDocumentationInput!
  ) {
    updateDocumentation(documentationId: $documentationId, input: $input) {
      id
      name
      description
    }
  }
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: documentationFormFields.name,
    description: documentationFormFields.description,
  })

  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  documentation: Documentation;
}

export const DocumentationEditModal: React.FC<Props> = (props) => {
  const { documentation } = props;
  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: documentation.name,
      description: documentation.description,
    },
  });
  const [submitted, setSubmitted] = useState(false);

  const [updateDocumentation] = useBlockingMutation<
    { updateDocumentation: Documentation },
    MutationUpdateDocumentationArgs
  >(UPDATE_DOCUMENTATION_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Documentation updated",
      callback: (data) => props.onClose(),
    }),
    onError: onGraphQLError({
      title: "Documentation update failed",
      callback: () => setSubmitted(false),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    setSubmitted(true);
    updateDocumentation({
      variables: { documentationId: documentation.id, input: formData },
    });
  };

  return (
    <Modal {...props} initialFocusSelector="#documentation-name">
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
              Update Documentation
            </Dialog.Title>
            <div className="mt-2 space-y-4">
              <div>
                <Label htmlFor="documentation-name" className="mb-1">
                  Documentation Name
                </Label>
                <FormInputGroup
                  id="documentation-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Mobile Application"
                  tabIndex={1}
                />
              </div>
              <div>
                <Label
                  htmlFor="documentation-description"
                  className="mb-1"
                  optional
                >
                  Description
                </Label>
                <FormTextareaGroup
                  id="documentation-description"
                  name="description"
                  tabIndex={2}
                  rows={5}
                  description="This description is for internal purpose only, and does not appear on the published documentation"
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="submit"
                btnType="primary"
                tabIndex={3}
                fullInMobile
                disabled={submitted}
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Update Documentation
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                tabIndex={4}
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
