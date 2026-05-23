import * as yup from "yup";

export const noteFormFields = {
  body: yup.string().max(2048).label("Note"),
};
