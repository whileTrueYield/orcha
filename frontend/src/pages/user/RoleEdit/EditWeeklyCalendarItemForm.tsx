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
  onSubmit: (
    previousItem: WeeklyCalendarItem,
    updatedItem: WeeklyCalendarItem | null
  ) => void;
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

export const EditWeeklyCalendarItemForm: React.FC<Props> = (props) => {
  const formMethods = useForm<FormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      startTime: transformToTime(props.item.startTime),
      stopTime: transformToTime(props.item.stopTime),
    },
  });

  const onDelete = () => {
    props.onSubmit(props.item, null);
    props.onClose();
  };

  const onSubmit = (formData: FormSchema) => {
    if (
      converTimeToEpoch(formData.startTime) <
      converTimeToEpoch(formData.stopTime)
    ) {
      props.onSubmit(props.item, {
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
          <div className="flex flex-row space-x-2">
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
        <div className="mt-2 flex flex-row justify-between space-x-2 rounded-b-md bg-gray-100 py-2 px-4">
          <Button
            onClick={onDelete}
            type="button"
            btnSize="small"
            btnType="secondaryDanger"
          >
            Delete
          </Button>
          <Button type="submit" btnSize="small" btnType="primary">
            Update
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
