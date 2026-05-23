import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as yup from "yup";

import { Modal, ModalProps } from "components/modals/Modal";

import { blackoutTimeFormFields } from "../formFields";
import { gql } from "@apollo/client";
import {
  MutationUpdateRecurringBlackoutTimeArgs,
  RecurringBlackoutTime,
} from "types/graphql";
import { yupResolver } from "@hookform/resolvers/yup";
import { onGraphQLError, onMutationComplete } from "utils/GQLClient";
import { FormInputGroup, Input } from "components/fields/Input";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { LocationMarkerIcon } from "@heroicons/react/outline";
import { DocumentAddIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { useBlockingMutation } from "utils/graphql";
import { MutationReturnValue } from "types/queryTypes";
import { RoleComboInput } from "../RoleComboInput";
import cn from "classnames";
import { capitalize, last } from "lodash";
import { FCWithFragments } from "types";
import { FormTimeInputGroup } from "components/fields/FormTimeInputGroup";
import { parsedTimeToMilitaryTime } from "components/WeeklySchedule";
import { formatToLocalTime } from "utils/time";

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    name: blackoutTimeFormFields.name,
    timeZone: blackoutTimeFormFields.timeZone,
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
  recurringBlackoutTime: RecurringBlackoutTime;
  onDelete: (recurringBlackoutTime: RecurringBlackoutTime) => void;
}

export const RecurringBlackoutTimeEditModal: FCWithFragments<Props> = (
  props
) => {
  const [roleIds, setRoleIds] = useState<number[]>(
    props.recurringBlackoutTime.roles.map((role) => role.id)
  );

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...props.recurringBlackoutTime,
      startTime: formatToLocalTime(props.recurringBlackoutTime.startTime),
      stopTime: formatToLocalTime(props.recurringBlackoutTime.stopTime),
    },
  });

  const monday = formContext.watch("monday");
  const tuesday = formContext.watch("tuesday");
  const wednesday = formContext.watch("wednesday");
  const thursday = formContext.watch("thursday");
  const friday = formContext.watch("friday");
  const saturday = formContext.watch("saturday");
  const sunday = formContext.watch("sunday");
  const timeZone = formContext.watch("timeZone");

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

  const [updateRecurringBlackoutTime] = useBlockingMutation<
    MutationReturnValue["updateRecurringBlackoutTime"],
    MutationUpdateRecurringBlackoutTimeArgs
  >(UPDATE_RECURRING_BLACKOUT_TIME_MUTATION, {
    onError: onGraphQLError({
      title: "Blackout Time update failed",
    }),
    onCompleted: onMutationComplete({
      title: "Blackout Time updated",
      callback: () => props.onClose(),
    }),
  });

  const onSubmit = (formData: FormSchema) => {
    updateRecurringBlackoutTime({
      variables: {
        recurringBlackoutTimeId: props.recurringBlackoutTime.id,
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

  const renderTimezone = () => {
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (timeZone !== userTimeZone) {
      return (
        <div className="flex flex-row items-center justify-between">
          <Input
            readOnly
            className="flex-1"
            value={timeZone.replace("_", " ").replace("/", " / ")}
            inputClassName="rounded-r-none flex-1"
          />
          <Button
            type="button"
            btnGroup="end"
            onClick={() => formContext.setValue("timeZone", userTimeZone)}
          >
            <LocationMarkerIcon className="mr-1 -ml-0.5 h-4 w-4" />
            Switch to{" "}
            {(last(userTimeZone.split("/")) as string).replace("_", " ")}
          </Button>
        </div>
      );
    } else {
      return (
        <div className="py-1 text-sm font-medium text-gray-700">
          <Input
            readOnly
            value={timeZone.replace("_", " ").replace("/", " / ")}
          />
        </div>
      );
    }
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
              Edit Recuring Blackout Time
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
                  {renderDayButton("friday", friday)}
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
            <div className="mt-6">
              <Label htmlFor="start_time" className="mb-1">
                Time Zone
              </Label>
              {renderTimezone()}
            </div>
            <div className="mt-5 sm:mt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <Button
                  type="button"
                  btnType="secondaryDanger"
                  fullInMobile
                  onClick={() => {
                    props.onClose();
                    props.onDelete(props.recurringBlackoutTime);
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

RecurringBlackoutTimeEditModal.fragments = {
  RecurringBlackoutTimeEditModalFragment: gql`
    fragment RecurringBlackoutTimeEditModalFragment on RecurringBlackoutTime {
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
  `,
};

const UPDATE_RECURRING_BLACKOUT_TIME_MUTATION = gql`
  mutation UpdateRecurringBlackoutTime(
    $recurringBlackoutTimeId: Int!
    $input: UpdateRecurringBlackoutTimeInput!
  ) {
    updateRecurringBlackoutTime(
      recurringBlackoutTimeId: $recurringBlackoutTimeId
      input: $input
    ) {
      id
      ...RecurringBlackoutTimeEditModalFragment
    }
  }
  ${RecurringBlackoutTimeEditModal.fragments
    .RecurringBlackoutTimeEditModalFragment}
`;
