export interface RecordFilterElement {
  id: number;
  label: string;
}

export interface ValueFilterElement {
  value: any;
  label: string;
}

export interface DateFilterElement {
  beforeDate?: string;
  afterDate?: string;
}

export interface ListFilter {
  recordSets: {
    [key: string]: RecordFilterElement[];
  };
  valueSets: {
    [key: string]: ValueFilterElement[];
  };
  dates: {
    [key: string]: DateFilterElement | null;
  };
  flags: {
    [key: string]: ValueFilterElement | null;
  };
}

export interface ReportQueryListFilter extends ListFilter {
  recordSets: {
    products: RecordFilterElement[];
    workflows: RecordFilterElement[];
    authors: RecordFilterElement[];
    assignees: RecordFilterElement[];
    tags: RecordFilterElement[];
    tickets: RecordFilterElement[];
  };
}

export interface TicketListFilter extends ListFilter {
  project?: RecordFilterElement;
  recursive: boolean;
  recordSets: {
    projects: RecordFilterElement[];
    products: RecordFilterElement[];
    workflows: RecordFilterElement[];
    authors: RecordFilterElement[];
    assignees: RecordFilterElement[];
    features: RecordFilterElement[];
    tags: RecordFilterElement[];
  };
  dates: {
    createdAt: DateFilterElement | null;
  };
  valueSets: {
    statuses: ValueFilterElement[];
    stages: ValueFilterElement[];
  };
  flags: {
    isActive: ValueFilterElement;
  };
}

export interface SearchFilter extends ListFilter {
  search: string | null;
  allUntagged: boolean;
  recordSets: {
    products: RecordFilterElement[];
    workflows: RecordFilterElement[];
    authors: RecordFilterElement[];
    owners: RecordFilterElement[];
    assignees: RecordFilterElement[];
    tags: RecordFilterElement[];
  };
  dates: {
    closedAt: DateFilterElement | null;
    createdAt: DateFilterElement | null;
    eta: DateFilterElement | null;
  };
  valueSets: {
    statuses: ValueFilterElement[];
  };
  flags: {
    isActive: ValueFilterElement;
    atRisk: ValueFilterElement;
    untagged: ValueFilterElement;
    hideCompleted: ValueFilterElement;
    readyToSchedule: ValueFilterElement;
    unassigned: ValueFilterElement;
    unestimated: ValueFilterElement;
  };
  sort: {
    direction: "ASC" | "DESC";
    field:
      | "title"
      | "createdAt"
      | "eta"
      | "status"
      | "project"
      | "workflow"
      | "localId";
  };
}

export interface ExplorerFilter extends ListFilter {
  sort: {
    direction: "ASC" | "DESC";
    field: "title" | "workflow" | "eta" | "status";
  };
  flags: {
    hideCompleted: ValueFilterElement;
  };
}
