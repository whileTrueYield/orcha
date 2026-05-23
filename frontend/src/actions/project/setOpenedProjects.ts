import { ActionWithPayload } from "../actionTypes";

export type SetOpenedProjects = ActionWithPayload<
  "SET_OPENED_PROJECTS",
  number[]
>;

export const setOpenedProjects = (projectIds: number[]): SetOpenedProjects => ({
  type: "SET_OPENED_PROJECTS",
  payload: projectIds,
});
