import { ModelStage } from "types/graphql";
import * as yup from "yup";

// the documentation fields
export const documentationFormFields = {
  name: yup.string().required().max(128).label("Name"),
  description: yup.string().notRequired().max(2048).label("Description"),
  status: yup.string().required().oneOf(Object.values(ModelStage)),
};

export const documentationPageFormFields = {
  title: yup.string().required().max(128).label("Title"),
  body: yup.string().notRequired().label("Content"),
  customId: yup.string().notRequired().max(128).label("Id").nullable(),
};
