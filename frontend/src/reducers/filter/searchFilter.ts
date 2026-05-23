import { ACTION_TYPES } from "actions/types";
import { merge } from "lodash";
import { SearchFilter } from "types/filter";

export type State = SearchFilter;

export const initialState: SearchFilter = {
  search: null,
  allUntagged: false,
  recordSets: {
    products: [],
    workflows: [],
    authors: [],
    owners: [],
    assignees: [],
    tags: [],
  },
  flags: {
    isActive: {
      label: "Active",
      value: false,
    },
    untagged: {
      label: "No Tags",
      value: false,
    },
    unestimated: {
      label: "Not Fully Estimated",
      value: false,
    },
    unassigned: {
      label: "Not Fully Assigned",
      value: false,
    },
    atRisk: {
      label: "At Risk",
      value: false,
    },
    hideCompleted: {
      label: "Hide Completed",
      value: false,
    },
    readyToSchedule: {
      label: "Ready to Schedule",
      value: false,
    },
  },
  valueSets: {
    statuses: [],
  },
  dates: {
    closedAt: null,
    createdAt: null,
    eta: null,
  },
  sort: {
    direction: "ASC",
    field: "title",
  },
};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_SEARCH_FILTER":
      return merge({}, initialState, action.payload);

    case "UPDATE_SEARCH_FILTER":
      return merge({}, state, action.payload);

    case "TOGGLE_ALL_UNTAGGED":
      return {
        ...state,
        allUntagged: !state.allUntagged,
      };

    // clear and replace all previous filter with new value
    // but maintain search
    case "CLEAR_SEARCH_FILTER":
      return {
        ...initialState,
        search: state.search,
      };

    default:
      return state;
  }
};
