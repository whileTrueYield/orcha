import { ActionWithPayload } from "actions/actionTypes";
import { ScheduleConfigs } from "types";

export type SetSchedulePrioritiesAction = ActionWithPayload<
  "SET_SCHEDULE_PRIORITIES",
  ScheduleConfigs[]
>;

export const setSchedulePriorities = (
  payload: ScheduleConfigs[]
): SetSchedulePrioritiesAction => ({
  type: "SET_SCHEDULE_PRIORITIES",
  payload,
});
