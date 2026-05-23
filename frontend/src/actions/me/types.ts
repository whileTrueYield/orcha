import { ActionWithPayload, EmptyAction } from "../actionTypes";
import { FeatureFlag, Organization, Role, User } from "types/graphql";
import { Me } from "types/graphql";

export type SetMe = ActionWithPayload<"SET_ME", Me>;
export type UpdateMeUser = ActionWithPayload<"SET_ME_USER", User>;
export type UpdateMeOrganization = ActionWithPayload<
  "SET_ME_ORGANIZATION",
  Organization
>;
export type SetFeatureFlag = ActionWithPayload<"SET_FEATURE_FLAG", FeatureFlag>;
export type UpdateMeRole = ActionWithPayload<"SET_ME_ROLE", Role>;
export type LoginSuccessAction = ActionWithPayload<"LOGIN_SUCCESS", Me>;
export type LogoutSuccessAction = EmptyAction<"LOGOUT_SUCCESS">;
export type LinkSuccessAction = ActionWithPayload<"LINK_SUCCESS", Me>;
export type RegisterSuccessAction = ActionWithPayload<"REGISTER_SUCCESS", Me>;

export type ME_ACTION_TYPES =
  | LoginSuccessAction
  | LogoutSuccessAction
  | LinkSuccessAction
  | RegisterSuccessAction
  | SetMe
  | UpdateMeUser
  | UpdateMeOrganization
  | UpdateMeRole
  | SetFeatureFlag;
