import * as yup from "yup";
import { colorNames } from "config";

export const tagFormFields = {
  color: yup.string().required().oneOf(colorNames).label("Tag's color"),
  name: yup.string().required().max(128).label("Name"),
};
