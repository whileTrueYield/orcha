import * as yup from "yup";

export const OrganizationFields = {
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
