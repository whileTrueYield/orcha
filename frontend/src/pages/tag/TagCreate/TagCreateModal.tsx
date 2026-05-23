import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { tagFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationCreateTagArgs, Tag } from "types/graphql";
import { urlResolver } from "utils/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { ColorSelect } from "components/fields/ColorSelect";

const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
      color
    }
  }
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: tagFormFields.name,
    color: tagFormFields.color,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const TagCreateModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { color: "lightGray" },
  });
  const color = formContext.watch("color");

  useEffect(() => {
    formContext.register("color");
  }, [formContext]);

  const [createTag] = useBlockingMutation<
    { createTag: Tag },
    MutationCreateTagArgs
  >(CREATE_TAG_MUTATION, {
    onError: onGraphQLError({
      title: "Tag creation failed",
      subTitle: "Please review your tag definition",
    }),
    onCompleted: onMutationComplete({
      title: "Tag created",
      callback: (data) =>
        history.push(urlResolver.tag.edit(orgId, data.createTag.id)),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    createTag({ variables: { input: formData } });
  };

  return (
    <Modal {...props} initialFocusSelector="#tag-name">
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
              Add a New Tag
            </Dialog.Title>
            <div className="mt-2">
              <p className="hidden text-sm leading-5 text-gray-500 sm:block">
                Tags are associated with tickets, you may use tags to group your
                tickets together, track goals and prioritize your workforce.
              </p>
              <div className="mt-6 grid-cols-1 gap-6 sm:grid sm:grid-cols-5">
                <div className="sm:col-span-3">
                  <Label htmlFor="tag-name" className="mb-1" required>
                    Tag Name
                  </Label>
                  <FormInputGroup
                    id="tag-name"
                    name="name"
                    autoFocus
                    placeholder="e.g. Release Candidate 2"
                    tabIndex={1}
                  />
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  <Label htmlFor="workflow-name" className="mb-1">
                    Color
                  </Label>
                  <ColorSelect
                    onChange={(color) => formContext.setValue("color", color)}
                    value={color}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button fullInMobile type="submit" btnType="primary" tabIndex={4}>
                <PlusIcon className="mr-2 h-5 w-5" />
                Create Tag
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
