import { SkillRequirementConfig, WorkUnit } from "./types";
import { filter } from "lodash";

export const computeSkill = (
  workUnits: WorkUnit[],
  SkillRequirementTable: SkillRequirementConfig[]
): number => {
  let level = 0;

  const difficultyCounts: { [difficulty: string]: number } = {};
  let points = 0;
  const deltaDates: number[] = [];

  let previousMedian = 0;
  for (const wu of workUnits) {
    difficultyCounts[wu.difficulty] = difficultyCounts[wu.difficulty]
      ? difficultyCounts[wu.difficulty] + 1
      : 1;
    points += wu.difficulty * wu.timeSpent;

    const startDate = new Date(wu.startDate);
    const stopDate = new Date(wu.startDate);
    const median =
      startDate.getTime() + (stopDate.getTime() - startDate.getTime()) / 2;

    if (previousMedian) {
      deltaDates.push(median - previousMedian);
    }

    previousMedian = median;
  }

  for (const sr of SkillRequirementTable) {
    if (difficultyCounts[sr.difficulty] < sr.occurences) {
      continue;
    }

    if (points < sr.points) {
      continue;
    }

    if (sr.occurences === 2) {
      if (deltaDates[0] < sr.period) {
        continue;
      }
    } else if (sr.occurences > 2) {
      const minAvg = sr.period / (workUnits.length + 1);
      const occurences = filter(deltaDates, (date) => date > minAvg).length;

      if (occurences + 1 < sr.occurences) {
        continue;
      }
    }

    if (sr.level > level) {
      level = sr.level;
    }
  }

  return level;
};
