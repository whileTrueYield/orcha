import {
  addDays,
  differenceInDays,
  differenceInHours,
  endOfDay,
  formatISO,
  startOfDay,
} from "date-fns";
import { GanttProject, GanttRoleUsage } from "./types";
import { map, max, min } from "lodash";

/**
 * Compute a ratio of usage for all given assignees on all dates
 * for a set of projects.
 *
 * This is used to display a realistic usage amount for a given role
 * because tasks exist in superposition (when more than one task have
 * a probability of running at the same time)
 */
export const roleUsageCount = (
  projects: GanttProject[],
  usages: GanttRoleUsage = {}
): GanttRoleUsage => {
  const startDate = min(map(projects, "startDate"))!;
  const days = differenceInDays(max(map(projects, "stopDate"))!, startDate);

  for (const project of projects) {
    usages = roleUsageCount(project.children, usages);

    for (let incr = 0; incr <= days; incr++) {
      const date = addDays(startDate, incr);
      const start = startOfDay(date);
      const stop = endOfDay(date);
      const isoDate = formatISO(date, { representation: "date" });

      usages[isoDate] = usages[isoDate] || {};

      for (const state of project.states) {
        // only account for overlaping task
        if (state.stopDate > start && state.startDate < stop) {
          // how many hours of the day was consume by this task
          const amount = differenceInHours(
            min([state.stopDate, stop])!,
            max([state.startDate, start])!,
            { roundingMethod: "round" }
          );

          if (!usages[isoDate][state.roleId]) {
            usages[isoDate][state.roleId] = {
              value: 0,
              byProjectId: {},
            };
          }

          if (!usages[isoDate][state.roleId].byProjectId[project.id]) {
            usages[isoDate][state.roleId].byProjectId[project.id] = 0;
          }

          // only store the # of hours consumed
          usages[isoDate][state.roleId].value =
            usages[isoDate][state.roleId].value + amount / 24;

          usages[isoDate][state.roleId].byProjectId[project.id] =
            usages[isoDate][state.roleId].byProjectId[project.id] + amount / 24;
        }
      }
    }
  }

  return usages;
};
