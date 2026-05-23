import {
  AddTicketToScheduleAction,
  RemoveTicketFromScheduleAction,
} from "./scheduleTicket";

import {
  ResetScheduleAction,
  ResetScheduleTicketsAction,
  ResetSchedulePrioritiesAction,
} from "./scheduleReset";
import { SetSchedulePrioritiesAction } from "./schedulePriorities";
import {
  SetScheduleProjectionsAction,
  SetScheduleProjectionSortingAction,
} from "./scheduleProjections";

export type SCHEDULE_ACTION_TYPES =
  | AddTicketToScheduleAction
  | RemoveTicketFromScheduleAction
  | ResetScheduleAction
  | ResetScheduleTicketsAction
  | ResetSchedulePrioritiesAction
  | SetSchedulePrioritiesAction
  | SetScheduleProjectionsAction
  | SetScheduleProjectionSortingAction;
