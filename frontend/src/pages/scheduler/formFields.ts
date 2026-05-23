import * as yup from "yup";

// Comment out and apply the following to check if the coverage is complete
// import { Ticket } from "types";
// type FormFields = {
//   [Field in keyof Required<Ticket>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const ticketFormFields:FormFields { ...

export const TicketFilterFormFields = {
  ticketId: yup.number().label("Ticket"),
  priority: yup.number().min(0).label("Priority"),
};
