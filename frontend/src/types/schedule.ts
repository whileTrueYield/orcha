import { ListFilter, RecordFilterElement } from "./filter";

export interface ScheduleConfigs {
  id: number;
  filter: ScheduleFilter;
}

export interface ScheduleFilter extends ListFilter {
  recordSets: {
    projects: RecordFilterElement[];
    products: RecordFilterElement[];
    workflows: RecordFilterElement[];
    tickets: RecordFilterElement[];
    tags: RecordFilterElement[];
  };
}

export type ScheduleTicketColumns =
  | "title"
  | "workflowName"
  | "status"
  | "newEta"
  | "currentEta"
  | "delta";

export type ScheduleTicketSortDirection = "asc" | "desc";

export interface ScheduleTicketRow {
  id: number;
  title: string;
  localId: number;
  productCode: string;
  workflowName: string;
  newEta: Date | null;
  currentEta: Date | null;
  milestone: boolean;
  isRemoved: boolean;
  isNew: boolean;
  status: "added" | "kept" | "removed";
  delta: number;
}
