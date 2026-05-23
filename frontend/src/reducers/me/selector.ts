import { State } from "./index";
import { FeatureFlag, MiniRole } from "types/graphql";
import { get } from "lodash";

export const getMe = (state: State) => state.me;

export const getMiniMe = (state: State): MiniRole | undefined => {
  if (state.me && state.me.role) {
    return {
      id: state.me?.role.id,
      name: state.me?.role?.name,
      avatarUrl: state.me?.role?.avatarUrl,
    };
  }
};

export const getAuthStatus = (state: State) =>
  state.me ? state.me.status : "unknown";

export const getUserStatus = (state: State) => {
  if (state.me?.user) {
    return state.me.user.status;
  }

  return "unknown";
};

type FeatureFlagSet = keyof Omit<
  FeatureFlag,
  "id" | "organizationId" | "__typename"
>;

export const hasAccessToFeature = (state: State, feature: FeatureFlagSet) => {
  return get(state.featureFlag, feature) === true;
};
