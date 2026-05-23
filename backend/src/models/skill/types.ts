export interface SkillRequirementConfig {
  level: number;
  period: number; // required time period between first and last session
  occurences: number; // minimum number of sessions
  points: number; // minimum amount of point collected (difficulty * seconds)
  difficulty: number; // should have encountered at least this level of difficulty
}

export interface WorkUnit {
  startDate: string;
  stopDate: string;
  timeSpent: number;
  difficulty: number;
}
