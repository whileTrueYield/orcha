import * as yup from "yup";

export const blackoutTimeFormFields = {
  name: yup.string().required().max(128).label("Name"),
  timeZone: yup.string().required().max(128),
  activeDay: yup.boolean().optional(),
  stopAt: yup.date().required().label("Stop Date"),
  startAt: yup.date().required().label("Start Date"),
  disabled: yup.boolean().optional(),
  startTime: yup.string().required().label("Start Time"),
  stopTime: yup.string().required().label("Stop Time"),
};
