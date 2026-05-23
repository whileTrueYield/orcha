import { EDITOR_ACTION_TYPES } from "./editor/types";
import { FILTER_ACTION_TYPES } from "./filter/types";
import { ME_ACTION_TYPES } from "./me/types";
import { NOTIFICATION_ACTION_TYPES } from "./notification/types";
import { PAGE_ACTION_TYPES } from "./page/types";
import { PROJECT_ACTION_TYPES } from "./project/types";
import { SCHEDULE_ACTION_TYPES } from "./schedule/types";
import { TIPS_ACTION_TYPES } from "./tips/types";
import { UPLOAD_ACTION_TYPES } from "./upload/types";
import { LISTING_ACTION_TYPES } from "./listing/types";

export type ACTION_TYPES =
  | EDITOR_ACTION_TYPES
  | FILTER_ACTION_TYPES
  | ME_ACTION_TYPES
  | NOTIFICATION_ACTION_TYPES
  | PAGE_ACTION_TYPES
  | PROJECT_ACTION_TYPES
  | SCHEDULE_ACTION_TYPES
  | LISTING_ACTION_TYPES
  | TIPS_ACTION_TYPES
  | UPLOAD_ACTION_TYPES;
