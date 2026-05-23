import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { blackoutTimeFormFields } from "../formFields";
import { gql } from "@apollo/client";
import { MutationUpdateBlackoutTimeArgs, BlackoutTime } from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { RoleComboInput } from "../RoleComboInput";
import { FCWithFragments } from "types";
import { FormDateInputGroup } from "components/fields/DateInput";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: blackoutTimeFormFields.name,
    startAt: blackoutTimeFormFields.startAt.required(),
    stopAt: blackoutTimeFormFields.stopAt.required(),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  blackoutTime: BlackoutTime;
  onDelete: (BlackoutTime: BlackoutTime) => void;
}

export const BlackoutTimeEditModal: FCWithFragments<Props> = (props) => {
  const [roleIds, setRoleIds] = useState<number[]>(
    props.blackoutTime.roles.map((role) => role.id)
  );

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...props.blackoutTime,
      startAt: new Date(props.blackoutTime.startAt),
      stopAt: new Date(props.blackoutTime.stopAt),
    },
  });

  const [updateBlackoutTime] = useBlockingMutation<
    MutationReturnValue["updateBlackoutTime"],
    MutationUpdateBlackoutTimeArgs
  >(UPDATE_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Blackout Time update failed",
    }),
    onCompleted: onMutationComplete({
      title: "Blackout Time updated",
      callback: () => props.onClose(),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    updateBlackoutTime({
      variables: {
        blackoutTimeId: props.blackoutTime.id,
        input: {
          ...formData,
          roleIds,
        },
      },
    });
  };

  return (
    <Modal {...props} initialFocusSelector="#blackoutTime-name">
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
              Edit Time Off
            </Dialog.Title>
            <div className="mt-6">
              <Label htmlFor="blackoutTime-name" className="mb-1" required>
                Event Name
              </Label>
              <FormInputGroup
                id="blackoutTime-name"
                name="name"
                autoFocus
                autoComplete="off"
                placeholder="e.g. Standup"
                tabIndex={1}
              />
            </div>
            <div className="mt-6">
              <RoleComboInput
                onChange={(roleIds) => setRoleIds(roleIds)}
                roleIds={roleIds}
              />
            </div>
            <div className="mt-6 flex flex-row space-x-4">
              <div className="flex-1">
                <Label htmlFor="start_time" className="mb-1">
                  Start At
                </Label>
                <FormDateInputGroup name="startAt" />
              </div>
              <div className="flex-1">
                <Label htmlFor="stop_time" className="mb-1">
                  Stop At
                </Label>
                <FormDateInputGroup name="stopAt" />
              </div>
            </div>

            <div className="mt-5 sm:mt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <Button
                  type="button"
                  fullInMobile
                  btnType="secondaryDanger"
                  onClick={() => {
                    props.onClose();
                    props.onDelete(props.blackoutTime);
                  }}
                >
                  Delete
                </Button>
                <div className="sm:flex sm:flex-row-reverse">
                  <Button
                    fullInMobile
                    type="submit"
                    btnType="primary"
                    tabIndex={4}
                  >
                    Update BlackoutTime
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
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

BlackoutTimeEditModal.fragments = {
  BlackoutTimeEditModalFragment: gql`
    fragment BlackoutTimeEditModalFragment on BlackoutTime {
      id
      startAt
      stopAt
      disabled
      name
      createdAt
      roles {
        id
        name
        avatarUrl
      }
    }
  `,
};

const UPDATE_BLACKOUT_TIME_MUTATION = gql`
  mutation UpdateBlackoutTime(
    $blackoutTimeId: Int!
    $input: UpdateBlackoutTimeInput!
  ) {
    updateBlackoutTime(blackoutTimeId: $blackoutTimeId, input: $input) {
      id
      ...BlackoutTimeEditModalFragment
    }
  }
  ${BlackoutTimeEditModal.fragments.BlackoutTimeEditModalFragment}
`;
