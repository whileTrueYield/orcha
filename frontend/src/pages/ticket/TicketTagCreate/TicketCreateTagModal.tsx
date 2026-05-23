import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { gql } from "@apollo/client";
import {
  MutationCreateTicketPersonalTagArgs,
  MutationCreateTicketTagArgs,
  Ticket,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { useBlockingMutation } from "utils/graphql";
import { tagFormFields } from "pages/tag/formFields";
import { ColorSelect } from "components/fields/ColorSelect";

const CREATE_TICKET_TAG_MUTATION = gql`
  mutation CreateTicketTag($ticketId: Int!, $input: CreateTagInput!) {
    createTicketTag(ticketId: $ticketId, input: $input) {
      id
      tags {
        id
        name
      }
    }
  }
`;

const CREATE_PERSONAL_TICKET_TAG_MUTATION = gql`
  mutation CreatePersonalTicketTag(
    $ticketId: Int!
    $input: CreatePersonalTagInput!
  ) {
    createTicketPersonalTag(ticketId: $ticketId, input: $input) {
      id
      tags {
        id
        name
      }
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

interface Props extends ModalProps {
  ticketId: number;
  name?: string;
}

export const TicketTagCreateModal: React.FC<Props> = (props) => {
  const { ticketId, name } = props;

  const [personalTag] = useState(false);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { name, color: "lightGray" },
  });

  const color = formContext.watch("color");

  useEffect(() => {
    formContext.register("color");
  }, [formContext]);

  useEffect(() => {
    formContext.setValue("name", name);
  }, [name, formContext]);

  const [createTicketTag] = useBlockingMutation<
    { createTicketTag: Ticket },
    MutationCreateTicketTagArgs
  >(CREATE_TICKET_TAG_MUTATION, {
    onError: onGraphQLError({ title: "Tag creation failed" }),
    onCompleted: onMutationComplete({
      title: "Tag created",
      callback: props.onClose,
    }),
  });

  const [createTicketPersonalTag] = useBlockingMutation<
    { createTicketPersonalTag: Ticket },
    MutationCreateTicketPersonalTagArgs
  >(CREATE_PERSONAL_TICKET_TAG_MUTATION, {
    onError: onGraphQLError({ title: "Personal Tag creation failed" }),
    onCompleted: onMutationComplete({
      title: "Personal Tag created",
      callback: props.onClose,
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    if (personalTag) {
      createTicketPersonalTag({ variables: { ticketId, input: formData } });
    } else {
      createTicketTag({ variables: { ticketId, input: formData } });
    }
  };

  return (
    <Modal {...props}>
      <FormProvider {...formContext}>
        <form onSubmit={formContext.handleSubmit(onSubmit)}>
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
              <DocumentAddIcon className="h-6 w-6 text-brand-600" />
            </div>
            <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900 sm:mr-6">
                Add a New Tag
              </h3>
              <div className="mt-2 space-y-4">
                <p className="text-sm leading-5 text-gray-500">
                  Tags allow you to organize and aggregate informations between
                  your tickets, stories and projects.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-7">
                  <div className="sm:col-span-4">
                    <Label htmlFor="tag-name" className="mb-1">
                      Tag Name
                    </Label>
                    <FormInputGroup
                      id="tag-name"
                      name="name"
                      placeholder="e.g. Release Candidate 2"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor="tag-name" className="mb-1">
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
                <Button
                  type="submit"
                  btnType="primary"
                  tabIndex={5}
                  fullInMobile
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Create and Add Tag
                </Button>
                <Button
                  onClick={props.onClose}
                  type="button"
                  btnType="secondaryWhite"
                  className="mt-3 mr-0 sm:mt-0 sm:mr-2"
                  tabIndex={6}
                  fullInMobile
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
