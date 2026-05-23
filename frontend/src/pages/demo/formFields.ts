import * as yup from "yup";

export const demoLoginFields = {
  email: yup.string().required().email().label("Email address"),
};
