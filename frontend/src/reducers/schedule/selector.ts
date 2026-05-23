import { State } from "./index";

export const getAddedTicketsToSchedule = (state: State) => state.addedTickets;
export const getRemovedTicketsFromSchedule = (state: State) =>
  state.removedTickets;

export const getSchedulePriorities = (state: State) => state.priorities;
export const getScheduleProjections = (state: State) => state.projections;

export const scheduleProjectionsRequireRefresh = (state: State) =>
  state.projectionsRequireRefresh;

export const getScheduleProjectionSorting = (state: State) =>
  state.projectionSorting;
