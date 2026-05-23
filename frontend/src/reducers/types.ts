import { State as notificationState } from "./notification";
import { State as uploadState } from "./upload";
import { State as meState } from "./me";
import { State as filterState } from "./filter";
import { State as pageState } from "./page";
import { State as scheduleState } from "./schedule";
import { State as editorState } from "./editor";
import { State as tipsState } from "./tips";
import { State as projectState } from "./project";
import { State as listingState } from "./listing";

export interface RootState {
  notification: notificationState;
  upload: uploadState;
  me: meState;
  page: pageState;
  filter: filterState;
  schedule: scheduleState;
  editor: editorState;
  tips: tipsState;
  project: projectState;
  listing: listingState;
}
