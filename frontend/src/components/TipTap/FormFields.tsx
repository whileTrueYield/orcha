import * as yup from "yup";

export const slateLinkFields = {
  text: yup.string().required().max(128).label("Link text"),
  url: yup.string().notRequired().nullable().label("Destination link"),
};
