import * as yup from "yup";
import { ModelStage } from "types/graphql";
import { colorNames } from "config";

export const workflowStages = Object.values(ModelStage);

// Comment out and apply the following to check if the coverage is complete
// import { Workflow } from "types";
// type FormFields = {
//   [Field in keyof Required<Workflow>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const workflowFormFields:FormFields { ...

export const workflowStateFields = {
  name: yup.string().required().max(128).label("State's name"),
};

export const workflowFormFields = {
  color: yup.string().required().oneOf(colorNames).label("Workflow's color"),
  name: yup.string().required().max(128).label("Name"),
  isDefaultWorkflow: yup.bool().required().label("Is a default workflow"),
  description: yup
    .string()
    .notRequired()
    .max(10 * 1024)
    .label("description"),
  status: yup.string().required().oneOf(workflowStages),
};
