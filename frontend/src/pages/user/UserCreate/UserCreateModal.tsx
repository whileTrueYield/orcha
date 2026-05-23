import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { useHistory, useParams } from "react-router-dom";
import { roleFormFields, userFormFields } from "../formFields";
import { urlResolver } from "utils/navigation";
import { gql } from "@apollo/client";
import { Role, MutationInviteArgs, RoleType } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { UserAddIcon } from "@heroicons/react/outline";
import { MailIcon } from "@heroicons/react/solid";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { GET_ONBOARDING_STATUS_QUERY } from "components/sidebar/Onboarding";
import { RadioGroup } from "@headlessui/react";
import { RoleRadioGroup } from "./RoleRadioGroup";

const INVITE_MUTATION = gql`
  mutation Invite($input: InviteInput!) {
    invite(input: $input) {
      status
      id
      organization {
        id
      }
      user {
        id
      }
    }
  }
`;

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    userName: roleFormFields.name,
    userEmail: userFormFields.email,
    roleType: userFormFields.role,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {}

export const UserCreateModal: React.FC<Props> = (props) => {
  const history = useHistory();
  const { orgId } = useParams<{ orgId: string }>();

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: { roleType: RoleType.Member },
  });
  const { register, watch, setValue } = formContext;

  useEffect(() => {
    register("roleType");
  }, [register]);
  const roleType = watch("roleType");

  const [invite] = useBlockingMutation<{ invite: Role }, MutationInviteArgs>(
    INVITE_MUTATION,
    {
      refetchQueries: [GET_ONBOARDING_STATUS_QUERY], // this is to refresh the status of the onboarding
      onError: onGraphQLError({
        title: "Invite failed",
      }),
      onCompleted: onMutationComplete({
        title: "Invitation sent",
        callback: (data) =>
          history.push(urlResolver.role.edit(orgId, data.invite.id)),
      }),
    }
  );

  const onSubmit = (formData: FormSchema) => {
    invite({ variables: { input: formData } });
  };

  return (
    <Modal {...props} initialFocusSelector="#invite-userName" large>
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
            <UserAddIcon className="h-6 w-6 text-brand-600" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Invite a new member via email
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500">
                Send an invite to your team member. They’ll have 7 days to
                confirm their account.
              </p>
              <div className="mt-4">
                <Label htmlFor="invite-userName" className="mb-1">
                  Name
                </Label>
                <FormInputGroup
                  id="invite-userName"
                  name="userName"
                  autoFocus
                  placeholder="e.g. Jane Doe"
                  tabIndex={1}
                  autoComplete="invite-username"
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="invite-userEmail" className="mb-1">
                  Email Address
                </Label>
                <FormInputGroup
                  id="invite-userEmail"
                  name="userEmail"
                  tabIndex={2}
                  placeholder="e.g. jane.doe@example.com"
                  autoComplete="invite-email"
                />
              </div>
              <div className="mt-4 text-left">
                <RadioGroup
                  value={roleType as RoleType}
                  onChange={(roleType: RoleType) =>
                    setValue("roleType", roleType, { shouldDirty: true })
                  }
                >
                  <RadioGroup.Label className="mb-1 block text-sm font-medium leading-5 text-gray-700">
                    Role
                  </RadioGroup.Label>
                  <div className="mt-1 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <RoleRadioGroup
                      title="Member"
                      description="Member can access all public items"
                      value={RoleType.Member}
                    />
                    <RoleRadioGroup
                      title="Admin"
                      description="Admin can configure Orcha and invite new members"
                      value={RoleType.Admin}
                      warning
                    />
                    <RoleRadioGroup
                      title="Owner"
                      description="Owner can add and remove admins and other owners"
                      value={RoleType.Owner}
                      danger
                    />
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                fullInMobile
                type="submit"
                tabIndex={4}
                btnType="primary"
                className="sm:ml-3"
              >
                <MailIcon className="mr-2 h-5 w-5" />
                Send
              </Button>
              <Button
                onClick={props.onClose}
                type="button"
                tabIndex={5}
                btnType="secondaryWhite"
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
