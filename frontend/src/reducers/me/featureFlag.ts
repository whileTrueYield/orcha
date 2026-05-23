import { ACTION_TYPES } from "actions/types";
import { merge } from "lodash";
import { FeatureFlag } from "types/graphql";

export type State = FeatureFlag | null;

const defaultValues: Partial<FeatureFlag> = {
  documentation: false,
  support: false,
  report: false,
};

const initialState: State = null;

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_FEATURE_FLAG":
      return merge(defaultValues, initialState, action.payload);
    default:
      return state;
  }
};
