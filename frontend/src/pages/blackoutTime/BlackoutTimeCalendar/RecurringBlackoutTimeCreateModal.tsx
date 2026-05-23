import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { blackoutTimeFormFields } from "../formFields";
import { gql } from "@apollo/client";
import {
  MutationCreateRecurringBlackoutTimeArgs,
  RecurringBlackoutTime,
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
import cn from "classnames";
import { capitalize } from "lodash";
import { FormTimeInputGroup } from "components/fields/FormTimeInputGroup";
import { parsedTimeToMilitaryTime } from "components/WeeklySchedule";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: blackoutTimeFormFields.name,
    startTime: blackoutTimeFormFields.startTime,
    stopTime: blackoutTimeFormFields.stopTime,
    monday: blackoutTimeFormFields.activeDay,
    tuesday: blackoutTimeFormFields.activeDay,
    wednesday: blackoutTimeFormFields.activeDay,
    thursday: blackoutTimeFormFields.activeDay,
    friday: blackoutTimeFormFields.activeDay,
    saturday: blackoutTimeFormFields.activeDay,
    sunday: blackoutTimeFormFields.activeDay,
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  defaultValues: Partial<FormSchema>;
  defaultDay: string;
  onCreate?: (recurringBlackoutTime: RecurringBlackoutTime) => void;
}

export const RecurringBlackoutTimeCreateModal: React.FC<Props> = (props) => {
  const { defaultDay } = props;
  const [roleIds, setRoleIds] = useState<number[]>([]);

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: props.defaultValues,
  });

  const monday = formContext.watch("monday");
  const tuesday = formContext.watch("tuesday");
  const wednesday = formContext.watch("wednesday");
  const thursday = formContext.watch("thursday");
  const friday = formContext.watch("friday");
  const saturday = formContext.watch("saturday");
  const sunday = formContext.watch("sunday");

  useEffect(() => {
    formContext.register("startTime");
    formContext.register("stopTime");
    formContext.register("monday");
    formContext.register("tuesday");
    formContext.register("wednesday");
    formContext.register("thursday");
    formContext.register("friday");
    formContext.register("saturday");
    formContext.register("sunday");
  });

  useEffect(() => {
    formContext.setValue(defaultDay, true);
  }, [defaultDay, formContext]);

  const [createBlackoutTime] = useBlockingMutation<
    MutationReturnValue["createRecurringBlackoutTime"],
    MutationCreateRecurringBlackoutTimeArgs
  >(CREATE_RECURRING_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Blackout Time creation failed",
    }),
    onCompleted: onMutationComplete({
      title: "Blackout Time created",
      callback: ({ createRecurringBlackoutTime }) => {
        props.onCreate?.(createRecurringBlackoutTime);
        formContext.reset();
        setRoleIds([]);
        props.onClose();
      },
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    createBlackoutTime({
      variables: {
        input: {
          ...formData,
          roleIds,
          startTime: parsedTimeToMilitaryTime(formData.startTime),
          stopTime: parsedTimeToMilitaryTime(formData.stopTime),
        },
      },
    });
  };

  const renderDayButton = (day: string, isActive: boolean, dark?: boolean) => (
    <button
      type="button"
      onClick={() => formContext.setValue(day, !isActive)}
      className={cn("truncate px-4 py-1.5 text-sm font-semibold", {
        "bg-sky-600 text-white": isActive,
        "bg-gray-100 text-gray-500": !isActive && dark,
        "bg-white text-gray-600": !isActive && !dark,
        "hover:bg-sky-100": !isActive,
      })}
    >
      {capitalize(day.slice(0, 3))}
    </button>
  );

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
              Create Recuring Blackout Event
            </Dialog.Title>
            <div className="mt-2">
              <p className="hidden text-sm leading-5 text-gray-500 sm:block">
                Incorporating Blackout Time into the scheduling system enhances
                its predictive capabilities by allowing it to account for
                periods of unavailability. You can utilize it for activities
                such as morning standup or weekly sprint planning.
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
                  placeholder="e.g. Morning Standup"
                  tabIndex={1}
                />
              </div>
              <div className="mt-6">
                <RoleComboInput
                  onChange={(roleIds) => setRoleIds(roleIds)}
                  roleIds={roleIds}
                />
              </div>
              <div className="mt-6">
                <Label htmlFor="blackoutTime-name" className="mb-1">
                  Active Days
                </Label>
                <div className="flex min-w-0 flex-col items-start justify-start gap-4 sm:flex-row">
                  <div className="divide-x overflow-hidden rounded-md border">
                    {renderDayButton("monday", monday)}
                    {renderDayButton("tuesday", tuesday)}
                    {renderDayButton("wednesday", wednesday)}
                    {renderDayButton("thursday", thursday)}
                    {renderDayButton("friday", friday)}{" "}
                  </div>
                  <div className="flex divide-x overflow-hidden rounded-md border">
                    {renderDayButton("saturday", saturday, true)}
                    {renderDayButton("sunday", sunday, true)}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-row space-x-4">
                <div>
                  <Label htmlFor="start_time" className="mb-1">
                    Start Time
                  </Label>
                  <FormTimeInputGroup name="startTime" />
                </div>
                <div>
                  <Label htmlFor="stop_time" className="mb-1">
                    Stop Time
                  </Label>
                  <FormTimeInputGroup name="stopTime" />
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
              <Button fullInMobile type="submit" btnType="primary" tabIndex={4}>
                <PlusIcon className="mr-2 h-5 w-5" />
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

const CREATE_RECURRING_BLACKOUT_TIME_MUTATION = gql`
  mutation CreateRecurringBlackoutTime(
    $input: CreateRecurringBlackoutTimeInput!
  ) {
    createRecurringBlackoutTime(input: $input) {
      id
      startTime
      stopTime
      timeZone
      disabled
      name
      createdAt
      monday
      tuesday
      wednesday
      thursday
      friday
      saturday
      sunday
      roles {
        id
        name
        avatarUrl
      }
    }
  }
`;
