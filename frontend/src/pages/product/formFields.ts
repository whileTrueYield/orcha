import { ModelStage } from "types/graphql";
import * as yup from "yup";

// Comment out and apply the following to check if the coverage is complete
// import { Product } from "types";
// type FormFields = {
//   [Field in keyof Required<Product>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const productFormFields:FormFields { ...

export const productFeatureFields = {
  name: yup.string().required().max(128),
};

export const productFeatureGroupFields = {
  name: yup.string().required().max(128),
};

export const productFormFields = {
  id: yup.string().required().length(36), // UUID
  suggestedProductId: yup.string().notRequired().length(36), // UUID
  name: yup.string().required().max(128).label("product name"),
  code: yup.string().required().min(1).max(5).uppercase().label("product code"),
  description: yup
    .string()
    .notRequired()
    .max(10 * 1024)
    .label("description"),
  features: yup.string().notRequired().max(2048),
  createdAt: yup.date().notRequired().label("creation date"),
  updatedAt: yup.date().notRequired().label("last update date"),
  coverUrl: yup
    .string()
    .notRequired()
    .nullable()
    .url()
    .label("cover image URL"),
  status: yup.string().required().oneOf(Object.values(ModelStage)),
  isUsingDefaultWorkflows: yup
    .bool()
    .required()
    .label("Is using default workflows"),
};
