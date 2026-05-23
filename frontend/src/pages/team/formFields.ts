import * as yup from "yup";

// Comment out and apply the following to check if the coverage is complete
// import { Team } from "types";
// type FormFields = {
//   [Field in keyof Required<Team>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const teamFormFields:FormFields { ...

export const teamFormFields = {
  id: yup.string().required().length(36), // UUID
  suggestedTeamId: yup.string().notRequired().length(36), // UUID
  name: yup.string().required().max(128).label("team name"),
  code: yup.string().required().min(1).max(9).uppercase().label("team code"),
  description: yup
    .string()
    .notRequired()
    .max(10 * 1024)
    .label("description"),
  createdAt: yup.date().notRequired().label("creation date"),
  updatedAt: yup.date().notRequired().label("last update date"),
  coverUrl: yup
    .string()
    .notRequired()
    .nullable()
    .url()
    .label("cover image URL"),
};
