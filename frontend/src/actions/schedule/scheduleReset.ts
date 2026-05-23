import { EmptyAction } from "actions/actionTypes";

export const resetSchedule = (): ResetScheduleAction => ({
  type: "RESET_SCHEDULE",
});

export const resetScheduleTickets = (): ResetScheduleTicketsAction => ({
  type: "RESET_SCHEDULE_TICKETS",
});

export const resetSchedulePriorities = (): ResetSchedulePrioritiesAction => ({
  type: "RESET_SCHEDULE_PRIORITIES",
});

export type ResetScheduleAction = EmptyAction<"RESET_SCHEDULE">;
export type ResetScheduleTicketsAction = EmptyAction<"RESET_SCHEDULE_TICKETS">;
export type ResetSchedulePrioritiesAction =
  EmptyAction<"RESET_SCHEDULE_PRIORITIES">;
