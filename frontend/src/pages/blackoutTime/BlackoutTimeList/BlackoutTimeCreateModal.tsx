import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { blackoutTimeFormFields } from "../formFields";
import { gql } from "@apollo/client";
import {
  BlackoutTime,
  MutationCreateRecurringBlackoutTimeArgs,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { PlusIcon } from "@heroicons/react/solid";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { RoleComboInput } from "../RoleComboInput";
import { FormDateInputGroup } from "components/fields/DateInput";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: blackoutTimeFormFields.name,
    startAt: blackoutTimeFormFields.startAt,
    stopAt: blackoutTimeFormFields.stopAt,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  onCreate?: (blackoutTime: BlackoutTime) => void;
}

export const BlackoutTimeCreateModal: React.FC<Props> = (props) => {
  const [roleIds, setRoleIds] = useState<number[]>([]);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    formContext.register("startAt");
    formContext.register("stopAt");
  });

  const [createBlackoutTime] = useBlockingMutation<
    MutationReturnValue["createBlackoutTime"],
    MutationCreateRecurringBlackoutTimeArgs
  >(CREATE_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Blackout Time creation failed",
    }),
    onCompleted: onMutationComplete({
      title: "Blackout Time created",
      callback: ({ createBlackoutTime }) => {
        props.onCreate?.(createBlackoutTime);
        props.onClose();
        formContext.reset();
        setRoleIds([]);
      },
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    createBlackoutTime({
      variables: {
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
              Create Time Off
            </Dialog.Title>
            <div className="mt-2">
              <p className="hidden text-sm leading-5 text-gray-500 sm:block">
                Keeping track of time offs enhances the accuracy of predictions
                by enabling the scheduling system to work around periods of
                unavailability. You can schedule upcoming PTOs or company
                outings in this section.
              </p>
              <div className="mt-6">
                <Label htmlFor="blackoutTime-name" className="mb-1" required>
                  Event Name
                </Label>
                <FormInputGroup
                  id="blackoutTime-name"
                  name="name"
                  autoFocus
                  autoComplete="off"
                  placeholder="e.g. Company Outing"
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
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button fullInMobile type="submit" btnType="primary" tabIndex={4}>
                <PlusIcon className="mr-1 -ml-0.5 h-5 w-5" />
                Create BlackoutTime
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

const CREATE_BLACKOUT_TIME_MUTATION = gql`
  mutation CreateBlackoutTime($input: CreateBlackoutTimeInput!) {
    createBlackoutTime(input: $input) {
      id
      name
      startAt
      stopAt
      roles {
        id
        name
        avatarUrl
      }
    }
  }
`;
