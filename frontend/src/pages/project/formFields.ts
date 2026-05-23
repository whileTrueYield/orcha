import * as yup from "yup";

export const projectFormFields = {
  name: yup.string().max(128).label("Project name"),
  parentId: yup.number().label("Parent Project"),
  description: yup
    .string()
    .max(1024 * 40)
    .label("Project description"),
};
