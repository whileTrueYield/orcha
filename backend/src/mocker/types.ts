import {
  Feature,
  FeatureGroup,
  Organization,
  Product,
  Role,
  Team,
  Ticket,
  User,
  Workflow,
  WorkflowState,
  Documentation,
  DocumentationPage,
  Project,
  Tag,
} from ".prisma/client";

export interface Odds {
  period: number;
}

export interface ContextTeam {
  team: Team;
  members: Role[];
}

export interface ContextWorkflowState {
  state: WorkflowState;
  teams: Team[];
}

export interface ContextWorkflow {
  workflow: Workflow;
  states: ContextWorkflowState[];
}

export interface ContextFeatureGroup {
  featureGroup: FeatureGroup;
  features: Feature[];
}

export interface ContextProduct {
  product: Product;
  workflows: Workflow[];
  featureGroups: ContextFeatureGroup[];
}

export interface ContextDocumentation {
  documentation: Documentation;
  documentationPages: DocumentationPage[];
}

export interface ContextRole {
  role: Role;
  user: User;
}

export interface Context {
  organization: Organization;
  teams: ContextTeam[];
  workflows: ContextWorkflow[];
  products: ContextProduct[];
  employees: ContextRole[];
  tickets: Ticket[];
  tags: Tag[];
  projects: Project[];
  documentations: ContextDocumentation[];
}

export interface MemberWorkUnit {
  offset: number; // offset from the first day of the week at midnight
  duration: number;
}

export interface MemberOffWorkUnit {
  startDate: string;
  endDate: string;
}

export interface SchedulerWorkDayBlock {
  startTime: string;
  stopTime: string;
}

export interface SchedulerWorkWeek {
  monday: SchedulerWorkDayBlock[];
  tuesday: SchedulerWorkDayBlock[];
  wednesday: SchedulerWorkDayBlock[];
  thursday: SchedulerWorkDayBlock[];
  friday: SchedulerWorkDayBlock[];
  saturday: SchedulerWorkDayBlock[];
  sunday: SchedulerWorkDayBlock[];
}

export const DayOfTheWeekMap: { [day: string]: keyof SchedulerWorkWeek } = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

export interface SchedulerUser {
  id: number;
  name: string;
  workUnits: SchedulerWorkWeek;
  offWorkUnits: MemberOffWorkUnit[];
  timeZone: string;
}

export interface SchedulerTeam {
  id: number;
  name: string;
  members: SchedulerUser[];
}

export interface SchedulerWorkflow {
  id: number;
  name: string;
  states: SchedulerWorkflowState[];
}

export interface SchedulerWorkflowState {
  id: number;
  name: string;
  teams: SchedulerTeam[];
  backupTeams: SchedulerTeam[];
  duration?: number;
  durationFn?: (part: SchedulerPart) => number;
}

export interface SchedulerPart {
  id: number;
  name: string;
  difficulty: number;
  workflow: SchedulerWorkflow;
}

export interface PartUnit {
  state: SchedulerWorkflowState;
  part: SchedulerPart;
  last?: boolean;
}

export interface ScheduleItem extends PartUnit {
  startDate: string;
  stopDate: string;
  user: SchedulerUser;
  label?: string;
  previous?: ScheduleItem;
}

export interface ScheduleItemLight {
  label?: string;
  startDate: string;
  stopDate: string;
  roleId: number;
  workflowStateId: number;
  ticketId: number;
}
