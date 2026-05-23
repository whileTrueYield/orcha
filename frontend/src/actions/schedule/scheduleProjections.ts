import { ActionWithPayload } from "actions/actionTypes";
import {
  ScheduleTicketRow,
  ScheduleTicketColumns,
  ScheduleTicketSortDirection,
} from "types";

export type SetScheduleProjectionsAction = ActionWithPayload<
  "SET_SCHEDULE_PROJECTIONS",
  ScheduleTicketRow[] | null
>;

export type SetScheduleProjectionSortingAction = ActionWithPayload<
  "SET_SCHEDULE_PROJECTIONS_SORTING",
  { sort: ScheduleTicketColumns; direction: ScheduleTicketSortDirection }
>;

export const setScheduleProjections = (
  payload: ScheduleTicketRow[] | null
): SetScheduleProjectionsAction => ({
  type: "SET_SCHEDULE_PROJECTIONS",
  payload,
});

export const setScheduleProjectionSorting = (payload: {
  sort: ScheduleTicketColumns;
  direction: ScheduleTicketSortDirection;
}): SetScheduleProjectionSortingAction => ({
  type: "SET_SCHEDULE_PROJECTIONS_SORTING",
  payload,
});
