import { trim } from "lodash";
import * as yup from "yup";

// Comment out and apply the following to check if the coverage is complete
// import { Product } from "types";
// type FormFields = {
//   [Field in keyof Required<Product>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const productFormFields:FormFields { ...

export const authLoginFields = {
  email: yup.string().required().email().label("Email address"),
  password: yup.string().required().label("Password"),
};

export const passwordTest = {
  name: "password-is-solid",
  message:
    // eslint-disable-next-line no-template-curly-in-string
    "${path} requires at least one uppercase, lowercase and number and" +
    " be at least 12 char in length",
  test: (value?: any) => {
    if (!/[A-Z]+/.test(value)) {
      return false;
    }
    if (!/[a-z]+/.test(value)) {
      return false;
    }
    if (!/[0-9]+/.test(value)) {
      return false;
    }
    if (trim(value).length < 12) {
      return false;
    }

    return true;
  },
};

export const authRegisterFields = {
  email: yup.string().email().label("Email address"),
  timeZone: yup.string().label("Time zone"),
  // password: yup.string().test(passwordTest).label("Password"),
  password: yup.string().min(12).label("Password"),
};

export const passwordLostFields = {
  email: yup.string().email().required().label("Email address"),
};

export const passwordResetFields = {
  email: yup.string().email().required(),
  secret: yup.string().required(),
  password: yup.string().min(12).label("Password").required(),
  // password: yup.string().test(passwordTest).required(),
};

export const NewOrganizationFields = {
  name: yup.string().trim().min(2).label("Organization's name"),
  address1: yup.string().trim().max(256).label("Organization's address"),
  address2: yup
    .string()
    .nullable()
    .trim()
    .transform((value) => (value ? value : null))
    .max(256)
    .label("Organization's address"),
  country: yup.string().trim().max(256).label("Country"),
  state: yup.string().trim().max(256).label("State"),
  zipcode: yup.string().trim().max(12).label("Zip code"),
  city: yup.string().trim().max(256).label("City"),
};
