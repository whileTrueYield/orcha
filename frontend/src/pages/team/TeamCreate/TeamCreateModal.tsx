import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { teamFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationCreateTeamArgs, Team } from "types/graphql";
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

const CREATE_TEAM_MUTATION = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      description
    }
  }
`;

const schema = yup.object().noUnknown().defined().shape({
  name: teamFormFields.name,
  code: teamFormFields.code,
  description: teamFormFields.description,
});

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const TeamCreateModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();
  const formContext = useForm<FormSchema>({ resolver: yupResolver(schema) });

  const [createTeam] = useBlockingMutation<
    { createTeam: Team },
    MutationCreateTeamArgs
  >(CREATE_TEAM_MUTATION, {
    onCompleted: onMutationComplete({
      title: "Team created",
      callback: (data) =>
        history.push(urlResolver.team.view(orgId, data.createTeam.id)),
    }),
    onError: onGraphQLError({
      title: "Team creation failed",
      subTitle: "Please review your team definition",
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    createTeam({ variables: { input: formData } });
  };

  return (
    <Modal {...props}>
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <DocumentAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 flex-1 sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-center text-lg font-medium leading-6 text-gray-900 sm:mr-6 sm:text-left"
            >
              Add a New Team
            </Dialog.Title>
            <div className="mt-2">
              <p className="hidden text-sm leading-5 text-gray-500 sm:block">
                You should create a team for each team you have at your
                organization. You can then associate different teams with
                different workflow states.
              </p>
              <div className="mt-4">
                <Label htmlFor="team-name" className="mb-1">
                  Team Name
                </Label>
                <FormInputGroup
                  id="team-name"
                  name="name"
                  autoFocus
                  placeholder="e.g. Potatoe Cannon 2000"
                  tabIndex={1}
                  autoComplete="team-name"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="team-code" className="mb-1">
                  Team Code
                </Label>
                <FormInputGroup
                  id="team-code"
                  name="code"
                  placeholder="e.g. PC2K"
                  tabIndex={2}
                  className="mt-1 w-32"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-5 text-gray-700"
                >
                  Description
                </label>
                <FormTextareaGroup
                  id="description"
                  name="description"
                  tabIndex={3}
                  rows={3}
                  placeholder="e.g. Throws potatoes hundreds of yards away... (optional)"
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                fullInMobile
                type="submit"
                btnType="primary"
                tabIndex={4}
                className="sm:ml-3"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Create Team
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                btnType="secondaryWhite"
                tabIndex={5}
                fullInMobile
                className="mt-3 sm:mt-0"
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
