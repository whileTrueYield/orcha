import * as yup from "yup";

// Comment out and apply the following to check if the coverage is complete
// import { Ticket } from "types";
// type FormFields = {
//   [Field in keyof Required<Ticket>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const ticketFormFields:FormFields { ...

export const ticketFormFields = {
  projectId: yup.number().label("Project"),
  productId: yup.number().label("Product"),
  workflowId: yup.number().label("Workflow"),
  difficulty: yup.number().label("Complexity"),
  estimate: yup.number().label("Estimate"),
  title: yup.string().max(128).label("Ticket title"),
  features: yup.string().notRequired().max(2048),
  createdAt: yup.date().notRequired(),
  updatedAt: yup.date().notRequired(),
};
