import React from "react";
import * as yup from "yup";

import {
  WeeklyCalendarItem,
  converTimeToEpoch,
  parsedTimeToMilitaryTime,
  transformToTime,
  validateTimeString,
} from "components/WeeklySchedule";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Label } from "components/fields/Label";
import { Button } from "components/fields/Button";
import { FormTimeInputGroup } from "components/fields/FormTimeInputGroup";

interface Props {
  item: WeeklyCalendarItem;
  onSubmit: (item: WeeklyCalendarItem) => void;
  onClose: () => void;
}

const schema = yup
  .object()
  .noUnknown()
  .defined()
  .shape({
    startTime: yup
      .string()
      .transform(transformToTime)
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
    stopTime: yup
      .string()
      .transform(transformToTime)
      .test("isTime", "Shoud be HH:mm (e.g. 22:23)", validateTimeString),
  })
  .required();

type FormSchema = yup.InferType<typeof schema>;

export const CreateWeeklyCalendarItemForm: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      startTime: transformToTime(props.item.startTime),
      stopTime: transformToTime(props.item.stopTime),
    },
  });

  const onSubmit = (formData: FormSchema) => {
    if (
      converTimeToEpoch(formData.startTime) <
      converTimeToEpoch(formData.stopTime)
    ) {
      props.onSubmit({
        title: props.item.title,
        dayOfTheWeek: props.item.dayOfTheWeek,
        startTime: parsedTimeToMilitaryTime(formData.startTime),
        stopTime: parsedTimeToMilitaryTime(formData.stopTime),
        startEpoch: converTimeToEpoch(formData.startTime),
        stopEpoch: converTimeToEpoch(formData.stopTime),
      });
      props.onClose();
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form
        className="w-64 rounded-md border bg-white shadow-lg"
        onSubmit={formMethods.handleSubmit(onSubmit)}
      >
        <div className="px-4 py-2">
          <div className="flex flex-row space-x-4">
            <div className="mt-2">
              <Label htmlFor="start_time" className="mb-1">
                Start at:
              </Label>
              <FormTimeInputGroup
                autoFocus
                type="text"
                id="start_time"
                name="startTime"
                placeholder="e.g. 8:25"
                onFocus={(event) => event.target.select()}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="stop_time" className="mb-1">
                Stop at:
              </Label>
              <FormTimeInputGroup
                type="text"
                id="stop_time"
                name="stopTime"
                placeholder="e.g. 8:25"
                onFocus={(event) => event.target.select()}
              />
            </div>
          </div>
        </div>
        <div className="mt-2 rounded-b-md bg-gray-100 py-2 px-4">
          <Button type="submit" btnSize="small" btnType="primary" block>
            Create
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
