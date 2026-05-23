import * as yup from "yup";

export const scheduleItemFormFields = {
  startedAt: yup.date().label("Start Time"),
  stoppedAt: yup.date().notRequired().label("End Time"),
  ticketId: yup.number().integer().required().label("Ticket"),
  ticketWorkflowStateId: yup
    .number()
    .integer()
    .required()
    .label("Workflow State"),
};

export const timeOffFormFields = {
  startAt: yup.date().label("Start Time"),
  stopAt: yup.date().notRequired().label("End Time"),
};
