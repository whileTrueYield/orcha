import { combineReducers } from "redux";

import fromNotification from "./notification";
import fromUpload from "./upload";
import fromMe from "./me";
import fromPage from "./page";
import fromFilter from "./filter";
import fromSchedule from "./schedule";
import fromEditor from "./editor";
import fromTips from "./tips";
import fromProject from "./project";
import fromListing from "./listing";
import { GQLClient } from "utils/GQLClient";

const allReducers = combineReducers({
  notification: fromNotification,
  upload: fromUpload,
  me: fromMe,
  page: fromPage,
  filter: fromFilter,
  schedule: fromSchedule,
  editor: fromEditor,
  tips: fromTips,
  project: fromProject,
  listing: fromListing,
});

// Will flush the redux store on logout
const rootReducer: typeof allReducers = (state, action) => {
  if (action.type === "LOGOUT_SUCCESS") {
    state = undefined as any;
  }
  // No cache clear on LOGIN_SUCCESS: before login the cache has no
  // authenticated data to invalidate, and the new route's components
  // fire their own queries from the network. Clearing here races with
  // those queries ("Store reset while query was in flight").
  // Logout already clears the cache, covering the switch-user case.

  return allReducers(state, action);
};

export default rootReducer;
