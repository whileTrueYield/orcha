import { timeOffFormFields } from "../formFields";
import * as yup from "yup";
import { Modal, ModalProps } from "components/modals/Modal";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
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
import { format, startOfDay } from "date-fns";
import { FormTimeInputGroup } from "components/fields/FormTimeInputGroup";

const schema = yup
  .object({
    startAt: timeOffFormFields.startAt.required(),
    stopAt: timeOffFormFields.stopAt.required(),
    startTime: yup
      .string()
      .transform(transformToTime)
      .required()
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
    stopTime: yup
      .string()
      .transform(transformToTime)
      .required()
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
  })
  .noUnknown()
  .defined();

type FormSchema = yup.InferType<typeof schema>;

interface Props extends ModalProps {
  onCreate: (startDate: Date, stopDate: Date) => void;
  startAt?: Date;
  stopAt?: Date;
}

export const CalendarCreateTimeOffModal: React.FC<Props> = (props) => {
  const formContext = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      startAt: props.startAt ? startOfDay(new Date(props.startAt)) : undefined,
      stopAt: props.stopAt ? startOfDay(new Date(props.stopAt)) : undefined,
      startTime: props.startAt
        ? format(new Date(props.startAt), "p")
        : undefined,
      stopTime: props.stopAt ? format(new Date(props.stopAt), "p") : undefined,
    },
  });

  const getStoppedAt = (stopDate: Date, stopTime: string) => {
    const time = parsedTimeToMilitaryTime(stopTime);
    return new Date(format(stopDate, "yyyy-MM-dd") + "T" + time);
  };

  const getStartedAt = (startDate: Date, startTime: string) => {
    const time = parsedTimeToMilitaryTime(startTime);
    return new Date(format(startDate, "yyyy-MM-dd") + "T" + time);
  };

  const onSubmit = (formData: FormSchema) => {
    const stopAt = getStoppedAt(formData.stopAt, formData.stopTime);
    const startAt = getStartedAt(formData.startAt, formData.startTime);
    props.onCreate(startAt, stopAt);
    props.onClose();
  };

  return (
    <Modal {...props}>
      <FormProvider {...formContext}>
        <form
          onSubmit={formContext.handleSubmit(onSubmit)}
          className="sm:flex sm:items-start"
        >
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
            <ClockIcon className="h-6 w-6 text-orange-600" aria-hidden="true" />
          </div>
          <div className="mt-3 flex-1 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 sm:mr-6"
            >
              Add Blackout Time
            </Dialog.Title>
            <div className="mt-2 space-y-4">
              <div>
                <Label className="mb-1" required>
                  From Date
                </Label>
                <div className="grid gap-2 sm:grid-cols-7">
                  <div className="sm:col-span-5">
                    <FormDateInputGroup name="startAt" />
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
                  To Date
                </Label>
                <div className="grid gap-2 sm:grid-cols-7">
                  <div className="sm:col-span-5">
                    <FormDateInputGroup name="stopAt" />
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
              </div>
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button type="submit" btnType="primary" tabIndex={5} fullInMobile>
                Create
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
        </form>
      </FormProvider>
    </Modal>
  );
};
