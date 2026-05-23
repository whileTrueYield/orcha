import { scheduleItemFormFields } from "../formFields";
import * as yup from "yup";
import { Modal, ModalProps } from "components/modals/Modal";
import { gql, useLazyQuery } from "@apollo/client";
import { ScheduleItem } from "types/graphql";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useCallback, useEffect, useState } from "react";
import { Button } from "components/fields/Button";
import { ClockIcon } from "@heroicons/react/outline";
import { Dialog } from "@headlessui/react";
import { FormDateInputGroup } from "components/fields/DateInput";
import { Label } from "components/fields/Label";
import {
  parsedTimeToMilitaryTime,
  transformToTime,
  validateTimeString,
} from "components/WeeklySchedule";
import {
  differenceInMinutes,
  endOfDay,
  format,
  startOfDay,
  subDays,
} from "date-fns";
import { FCWithFragments } from "types";
import { GroupTag } from "components/tags/GroupTag";
import { Link } from "react-router-dom";
import { urlResolver } from "utils/navigation";
import { plural } from "utils/string";
import {
  PencilIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { FormTimeInputGroup } from "components/fields/FormTimeInputGroup";
import { QueryReturnValue } from "types/queryTypes";

const schema = yup
  .object({
    startedAt: scheduleItemFormFields.startedAt.required(),
    stoppedAt: scheduleItemFormFields.stoppedAt.nullable(),
    startTime: yup
      .string()
      .transform(transformToTime)
      .required()
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
    stopTime: yup
      .string()
      .transform(transformToTime)
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  scheduleItem: ScheduleItem;
  onDelete: () => void;
  onChange: (
    scheduleItem: ScheduleItem,
    startDate: Date,
    stopDate: Date | null
  ) => void;
}

export const CalendarItemEditModal: FCWithFragments<Props> = (props) => {
  const { scheduleItem, visible } = props;
  const [editMode, setEditMode] = useState(false);
  const scheduleItemId = scheduleItem.id;

  useEffect(() => {
    setEditMode(false);
  }, [setEditMode, visible]);

  const [minDateTime, setMinDateTime] = useState(
    subDays(new Date(scheduleItem.startedAt), 1)
  );
  const [maxDateTime, setMaxDateTime] = useState(
    scheduleItem.stoppedAt
      ? endOfDay(new Date(scheduleItem.startedAt))
      : endOfDay(new Date(scheduleItem.stoppedAt))
  );

  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      startedAt: startOfDay(new Date(scheduleItem.startedAt)),
      stoppedAt: scheduleItem.stoppedAt
        ? startOfDay(new Date(scheduleItem.stoppedAt))
        : null,
      startTime: format(new Date(scheduleItem.startedAt), "p"),
      stopTime: scheduleItem.stoppedAt
        ? format(new Date(scheduleItem.stoppedAt), "p")
        : "",
    },
  });

  const { watch, clearErrors, setError, getValues } = formContext;

  const validateForm = useCallback(() => {
    const { stopTime, stoppedAt, startedAt, startTime } = getValues();

    // stopped datetime is optional.
    let _stoppedAt = null;
    if (stopTime && stoppedAt) {
      _stoppedAt = getStoppedAt(stoppedAt, stopTime);
    }

    const _startedAt = getStartedAt(startedAt, startTime);
    if (_stoppedAt) {
      if (_startedAt > _stoppedAt) {
        setError("stoppedAt", {
          type: "manual",
          message: "End date cannot be before start date",
        });
      } else if (_stoppedAt > new Date()) {
        setError("stoppedAt", {
          type: "manual",
          message: "Event cannot end in the future",
        });
      } else if (_stoppedAt > maxDateTime) {
        setError("stoppedAt", {
          type: "manual",
          message: `Cannot be after ${format(maxDateTime, "PPpp")}`,
        });
      } else {
        clearErrors("stoppedAt");
      }
    }

    if (_startedAt > new Date()) {
      setError("startedAt", {
        type: "manual",
        message: "Event cannot start in the future",
      });
    } else if (_startedAt < minDateTime) {
      setError("startedAt", {
        type: "manual",
        message: `Cannot be before ${format(minDateTime, "PPp")}`,
      });
    } else {
      clearErrors("startedAt");
    }
  }, [clearErrors, setError, getValues, minDateTime, maxDateTime]);

  // Callback version of watch.  It's your responsibility to unsubscribe when done.
  useEffect(() => {
    const subscription = watch(validateForm);
    return () => subscription.unsubscribe();
  }, [watch, validateForm]);

  const [getBoundaries] = useLazyQuery<
    QueryReturnValue["scheduleItemUpdateBoundaries"]
  >(GET_SCHEDULE_ITEM_BOUNDARIES_QUERY, {
    onCompleted: ({ scheduleItemUpdateBoundaries }) => {
      const maxDate = new Date(scheduleItemUpdateBoundaries.maxDate);
      setMaxDateTime(maxDate);

      if (scheduleItemUpdateBoundaries.minDate) {
        const minDate = new Date(scheduleItemUpdateBoundaries.minDate);
        setMinDateTime(minDate);
      }
    },
  });

  useEffect(() => {
    if (visible) {
      getBoundaries({ variables: { scheduleItemId } });
    }
  }, [visible, getBoundaries, scheduleItemId]);

  const getStoppedAt = (stopDate: Date, stopTime: string) => {
    const time = parsedTimeToMilitaryTime(stopTime);
    return new Date(format(stopDate, "yyyy-MM-dd") + "T" + time);
  };

  const getStartedAt = (startDate: Date, startTime: string) => {
    const time = parsedTimeToMilitaryTime(startTime);
    return new Date(format(startDate, "yyyy-MM-dd") + "T" + time);
  };

  const onSubmit = (formData: FormSchema) => {
    // the crux is to reconstitute the time, a string "2am" and date together.
    // in the current user's timezone

    // stopped datetime is optional.
    let stoppedAt = null;
    if (formData.stopTime && formData.stoppedAt) {
      stoppedAt = getStoppedAt(formData.stoppedAt, formData.stopTime);
    }

    const startedAt = getStartedAt(formData.startedAt, formData.startTime);

    if (props.scheduleItem.stoppedAt) {
      props.onChange(props.scheduleItem, startedAt, stoppedAt);
    } else {
      props.onChange(props.scheduleItem, startedAt, null);
    }
    props.onClose();
  };

  const renderDuration = () => {
    const stoppedAt = scheduleItem.stoppedAt
      ? new Date(scheduleItem.stoppedAt)
      : new Date();
    const startedAt = new Date(scheduleItem.startedAt);
    const minutes = differenceInMinutes(stoppedAt, startedAt);
    const hours = Math.floor(minutes / 60);
    return `${plural("{} hour", "{} hours", hours, "")} ${plural(
      "{} minute",
      "{} minutes",
      minutes % 60,
      ""
    )}`;
  };
  const renderFormDuration = () => {
    const formValues = formContext.getValues();
    const stoppedAt =
      formValues.stoppedAt && formValues.stopTime
        ? getStoppedAt(formValues.stoppedAt, formValues.stopTime)
        : new Date();
    const startedAt = getStartedAt(formValues.startedAt, formValues.startTime);

    const minutes = differenceInMinutes(stoppedAt, startedAt);
    const hours = Math.floor(minutes / 60);
    return `${plural("{} hour", "{} hours", hours, "")} ${plural(
      "{} minute",
      "{} minutes",
      minutes % 60,
      ""
    )}`;
  };

  const renderReadOnly = () => (
    <>
      <div className="mt-6 space-y-4">
        <div className="mt-4">
          <Label className="mb-1">Duration</Label>
          <div className="my-2 text-left text-sm text-gray-600 sm:ml-2">
            {renderDuration()}
          </div>
        </div>

        <div className="mt-4">
          <Label className="mb-1">From</Label>
          <div className="my-2 text-left text-sm text-gray-600 sm:ml-2">
            {format(new Date(scheduleItem.startedAt), "PPPPp")}
          </div>
        </div>

        <div className="mt-4">
          <Label className="mb-1">Until</Label>
          <div className="my-2 text-left text-sm text-gray-600 sm:ml-2">
            {scheduleItem.stoppedAt
              ? format(new Date(scheduleItem.stoppedAt), "PPPPp")
              : "In Progress"}
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:justify-between">
        <Button
          type="button"
          onClick={() => {
            props.onClose();
            props.onDelete();
          }}
          btnType="secondaryDanger"
          tabIndex={5}
          fullInMobile
        >
          <TrashIcon className="mr-2 h-5 w-5" />
          Delete
        </Button>
        <div className="sm:flex sm:flex-row-reverse sm:items-center">
          <Button
            type="button"
            onClick={() => setEditMode(true)}
            btnType="white"
            tabIndex={5}
            fullInMobile
            className="mt-3 sm:mt-0 "
          >
            <PencilIcon className="mr-2 h-5 w-5" />
            Edit
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
    </>
  );

  const renderForm = () => (
    <FormProvider {...formContext}>
      <form onSubmit={formContext.handleSubmit(onSubmit)}>
        <div className="mt-6 space-y-4">
          <div>
            <Label className="mb-1">Duration</Label>
            <div className="my-1.5 ml-2 text-sm text-gray-600">
              {renderFormDuration()}
            </div>
          </div>
          <div>
            <Label className="mb-1" required>
              From
            </Label>
            <div className="grid gap-2 sm:grid-cols-7">
              <div className="sm:col-span-5">
                <FormDateInputGroup name="startedAt" />
              </div>
              <div className="sm:col-span-2">
                <FormTimeInputGroup
                  autoFocus
                  type="text"
                  name="startTime"
                  placeholder="e.g. 8:25"
                />
              </div>
            </div>
          </div>
          <div>
            <Label className="mb-1" required>
              Until
            </Label>
            {scheduleItem.stoppedAt ? (
              <div className="grid gap-2 sm:grid-cols-7">
                <div className="sm:col-span-5">
                  <FormDateInputGroup name="stoppedAt" />
                </div>
                <div className="sm:col-span-2">
                  <FormTimeInputGroup
                    autoFocus
                    type="text"
                    name="stopTime"
                    placeholder="e.g. 8:25"
                  />
                </div>
              </div>
            ) : (
              <div className="my-1.5 ml-2 text-sm text-orange-500">
                In Progress...
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <Button type="submit" btnType="primary" fullInMobile>
            Update
          </Button>
          <Button
            onClick={props.onClose}
            type="button"
            btnType="secondaryWhite"
            className="mt-3 mr-0 sm:mt-0 sm:mr-2"
            fullInMobile
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );

  return (
    <Modal {...props}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 sm:mx-0 sm:h-10 sm:w-10">
          <ClockIcon className="h-6 w-6 text-brand-600" aria-hidden="true" />
        </div>
        <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="flex items-center justify-between text-xl font-medium leading-6 text-gray-900 sm:mr-6 sm:justify-start"
          >
            <Link
              to={urlResolver.ticket.view(
                scheduleItem.ticket.organizationId.toString(),
                scheduleItem.ticket.id
              )}
              className="flex flex-row items-center text-brand-600 underline hover:text-brand-700"
            >
              {scheduleItem.ticket.title}
              <ExternalLinkIcon className="h-5 w-5" />
            </Link>
          </Dialog.Title>
          <div className="mt-2">
            <GroupTag
              large
              bgColor="bg-brand-700 px-2"
              groupBgColor="bg-brand-800 font-semibold"
              className="whitespace-nowrap text-white"
              groupLabel={`${scheduleItem.ticket.product?.code} ${scheduleItem.ticket.localId}`}
              label={scheduleItem.ticketWorkflowState.name}
            />
          </div>
          {editMode ? renderForm() : renderReadOnly()}
        </div>
      </div>
    </Modal>
  );
};

CalendarItemEditModal.fragments = {
  calendarItemEditModalFragment: gql`
    fragment calendarItemEditModalFragment on ScheduleItem {
      id
      startedAt
      stoppedAt
      ticket {
        id
        organizationId
        localId
        title
        product {
          id
          code
        }
      }
      ticketWorkflowState {
        id
        name
      }
    }
  `,
};

const GET_SCHEDULE_ITEM_BOUNDARIES_QUERY = gql`
  query ScheduleItemUpdateBoundariesForEditModal($scheduleItemId: Int!) {
    scheduleItemUpdateBoundaries(scheduleItemId: $scheduleItemId) {
      minDate
      maxDate
    }
  }
`;
