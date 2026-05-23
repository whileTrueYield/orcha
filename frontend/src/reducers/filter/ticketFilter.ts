import { ACTION_TYPES } from "actions/types";
import { TicketListFilter } from "types/filter";

export type State = TicketListFilter;

const initialState: State = {
  recursive: true,
  recordSets: {
    products: [],
    workflows: [],
    projects: [],
    authors: [],
    assignees: [],
    features: [],
    tags: [],
  },
  flags: {
    isActive: {
      label: "Active",
      value: false,
    },
  },
  valueSets: {
    statuses: [
      /// XXX: Disabled default filter of SCHEDULED tickets
      // {
      //   value: "SCHEDULED",
      //   label: "Scheduled",
      // },
    ],
    stages: [
      /// XXX: Disabled default filter of PUBLISHED tickets
      // {
      //   value: "PUBLISHED",
      //   label: "Published",
      // },
    ],
  },
  dates: {
    createdAt: null,
  },
};

export const reducer = (
  state: State = initialState,
  action: ACTION_TYPES
): State => {
  switch (action.type) {
    case "SET_TICKET_FILTER":
      return action.payload;

    case "CLEAR_TICKET_FILTER":
      return initialState;

    default:
      return state;
  }
};
