import { Ticket } from "types/graphql";

export interface GanttState {
  startDate: Date;
  stopDate: Date;
  roleId: number;
}

export interface GanttProject {
  id: number;
  name: string;
  startDate: Date | null;
  stopDate: Date | null;
  states: GanttState[];
  children: GanttProject[];
  parentId?: number | null;
  milestones: GanttProjectMilestone[];
  childrenMilestones: GanttProjectMilestone[];
  childrenStates: GanttState[];
  level: number;
}

export interface GanttProjectMilestone {
  ticket: Ticket;
  date: Date;
}

export type GanttRoleUsage = {
  [date: string]: {
    [roleId: number]: {
      value: number;
      byProjectId: { [projectId: number]: number };
    };
  };
};

export type GanttProjectAncestry = { [projectId: number]: number[] };

export type GanttDisplayMode = "all" | "scheduledOnly";
export type GanttTimeScale = "day" | "week" | "month";
