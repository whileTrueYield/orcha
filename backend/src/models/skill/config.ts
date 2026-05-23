import { SkillRequirementConfig } from "./types";

const HOUR = 3600;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

export const SkillRequirementTable: SkillRequirementConfig[] = [
  {
    level: 1,
    period: 1 * WEEK,
    occurences: 1,
    difficulty: 1,
    points: 20 * HOUR,
  },
  {
    level: 2,
    period: 4 * WEEK,
    occurences: 10,
    difficulty: 1,
    points: 1 * WEEK,
  },
  {
    level: 2,
    period: 1 * WEEK,
    occurences: 3,
    difficulty: 2,
    points: 20 * HOUR,
  },
  {
    level: 3,
    period: 4 * WEEK,
    occurences: 10,
    difficulty: 2,
    points: 40 * HOUR,
  },
  {
    level: 2,
    period: 1 * WEEK,
    occurences: 3,
    difficulty: 2,
    points: 20 * HOUR,
  },
];
