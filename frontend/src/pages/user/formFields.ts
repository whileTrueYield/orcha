import * as yup from "yup";

import { RoleType, UserStatus } from "types/graphql";

// Comment out and apply the following to check if the coverage is complete
// import { User } from "types";
// type FormFields = {
//   [Field in keyof Required<User>]: ReturnType<yup.AnySchemaConstructor>;
// };
//
// export const userFormFields:FormFields { ...

const roleTypes = Object.values(RoleType);

export const roleFormFields = {
  title: yup.string().max(128).optional().nullable().label("Work title"),
  type: yup.string().required().oneOf(roleTypes),
  timeZone: yup.string().notRequired().nullable().max(128).label("Time Zone"),
  name: yup.string().required().max(128).label("User name"),
  description: yup.string().notRequired().max(2048),
  coverUrl: yup
    .string()
    .notRequired()
    .nullable()
    .url()
    .label("cover image url"),
  avatarUrl: yup
    .string()
    .notRequired()
    .nullable()
    .url()
    .label("avatar image url"),
};

export const userFormFields = {
  email: yup.string().required().email().label("Email address"),
  status: yup.string().required().oneOf(Object.values(UserStatus)),
  role: yup
    .string()
    .oneOf(Object.values(RoleType))
    .required()
    .oneOf(roleTypes as any),
};

export const rolePreferenceFields = {
  nextWorkDayNotificationOptOut: yup.bool().label("Daily Email Digest"),
};
