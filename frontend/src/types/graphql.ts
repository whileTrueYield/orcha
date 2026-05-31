export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
};

export type AcceptRoleInput = {
  roleId: Scalars['Int']['input'];
  timeZone: Scalars['String']['input'];
};

export type AddReplyInput = {
  body: Scalars['String']['input'];
};

export enum AuthStatus {
  Guest = 'GUEST',
  Linked = 'LINKED',
  User = 'USER'
}

export enum BatchUpdateTicketAction {
  ArchiveTickets = 'ARCHIVE_TICKETS',
  CancelRequestEstimate = 'CANCEL_REQUEST_ESTIMATE',
  CancelTickets = 'CANCEL_TICKETS',
  ChangeOwner = 'CHANGE_OWNER',
  ChangeProject = 'CHANGE_PROJECT',
  MarkTicketsAsDone = 'MARK_TICKETS_AS_DONE',
  RequestEstimate = 'REQUEST_ESTIMATE',
  ScheduleTickets = 'SCHEDULE_TICKETS',
  UnarchiveTickets = 'UNARCHIVE_TICKETS',
  UnscheduleTickets = 'UNSCHEDULE_TICKETS'
}

export type BatchUpdateTicketsInput = {
  action: BatchUpdateTicketAction;
  actionMessage: Scalars['String']['input'];
  ownerId?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
};

export type BlackoutTime = {
  __typename?: 'BlackoutTime';
  createdAt: Scalars['DateTime']['output'];
  disabled: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  roles: Array<Role>;
  startAt: Scalars['DateTime']['output'];
  stopAt: Scalars['DateTime']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ChangeEmailInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type ChangePasswordInput = {
  newPassword: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type ChangeTicketWorkflowStateInput = {
  fractionable?: InputMaybe<Scalars['Boolean']['input']>;
  maximum?: InputMaybe<Scalars['Int']['input']>;
  minimum?: InputMaybe<Scalars['Int']['input']>;
  mostLikely?: InputMaybe<Scalars['Int']['input']>;
  roleId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  checked?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
};

export type ClientUpdateIssueInput = {
  hash: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  proof: Scalars['String']['input'];
  status?: InputMaybe<IssueStatus>;
};

export type CloseScheduleItemInput = {
  done?: InputMaybe<Scalars['Boolean']['input']>;
  nextTicketWorkflowStateId?: InputMaybe<Scalars['Int']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
  stoppedAt?: InputMaybe<Scalars['String']['input']>;
};

export type Comment = {
  __typename?: 'Comment';
  acceptedReply?: Maybe<CommentReply>;
  acceptedReplyId?: Maybe<Scalars['Int']['output']>;
  author: Role;
  authorId: Scalars['Int']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  replies: Array<CommentReply>;
  replyCount: Scalars['Int']['output'];
  ticket: Ticket;
  ticketId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CommentReply = {
  __typename?: 'CommentReply';
  author: Role;
  authorId: Scalars['Int']['output'];
  body: Scalars['String']['output'];
  commentId: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  organizationId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateApiTokenInput = {
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  readOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateApiTokenResult = {
  __typename?: 'CreateApiTokenResult';
  plaintext: Scalars['String']['output'];
  token: PersonalAccessToken;
};

export type CreateBlackoutTimeInput = {
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type CreateCommentInput = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDocumentationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateDocumentationPageInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateDrawingInput = {
  data?: InputMaybe<Scalars['String']['input']>;
};

export type CreateFeatureGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
};

export type CreateNoteInput = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOrganizationInput = {
  name: Scalars['String']['input'];
  timeZone: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};

export type CreatePersonalTagInput = {
  name: Scalars['String']['input'];
};

export type CreateProductInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateProjectInput = {
  name: Scalars['String']['input'];
  parentId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRecurringBlackoutTimeInput = {
  friday?: InputMaybe<Scalars['Boolean']['input']>;
  monday?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  saturday?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['String']['input'];
  stopTime: Scalars['String']['input'];
  sunday?: InputMaybe<Scalars['Boolean']['input']>;
  thursday?: InputMaybe<Scalars['Boolean']['input']>;
  tuesday?: InputMaybe<Scalars['Boolean']['input']>;
  wednesday?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateReportInput = {
  name: Scalars['String']['input'];
};

export type CreateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  chartBy: ReportGroupBy;
  chartByLabel?: InputMaybe<Scalars['String']['input']>;
  cummulative?: InputMaybe<Scalars['Boolean']['input']>;
  fromDate?: InputMaybe<Scalars['String']['input']>;
  granularity?: InputMaybe<ReportDateGranularity>;
  groupBy?: InputMaybe<ReportGroupBy>;
  groupByLabel?: InputMaybe<Scalars['String']['input']>;
  isTicketActive?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketCancelled?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketDone?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketNotStarted?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketStarted?: InputMaybe<Scalars['Boolean']['input']>;
  noUnknowns?: InputMaybe<Scalars['Boolean']['input']>;
  ownerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  productIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  sameAsPrimaryFilter?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryAuthorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryChartBy?: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel?: InputMaybe<Scalars['String']['input']>;
  secondaryGroupBy?: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel?: InputMaybe<Scalars['String']['input']>;
  secondaryIsTicketActive?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketCancelled?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketDone?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketNotStarted?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketStarted?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryOwnerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryPaths?: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryProductIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTicketIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  ticketIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  title: Scalars['String']['input'];
  untilDate?: InputMaybe<Scalars['String']['input']>;
  widgetType: ReportWidgetType;
  workflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type CreateScheduleItemInput = {
  startedAt?: InputMaybe<Scalars['String']['input']>;
  stoppedAt?: InputMaybe<Scalars['String']['input']>;
  ticketId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type CreateTagInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateTeamInput = {
  code: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateTicketInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  stage?: InputMaybe<ModelStage>;
  title: Scalars['String']['input'];
  workflowId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateTicketPersonalTagInput = {
  name: Scalars['String']['input'];
};

export type CreateTicketTagInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateTimeOffInput = {
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type CreateTodoInput = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWorkflowInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWorkflowStateInput = {
  name: Scalars['String']['input'];
};

export type Ds_Shadow = {
  __typename?: 'DS_Shadow';
  client: Scalars['Int']['output'];
  document: Scalars['String']['output'];
  server: Scalars['Int']['output'];
};

export type DemoRequest = {
  __typename?: 'DemoRequest';
  config: Scalars['String']['output'];
  confirmed: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ip_address: Scalars['String']['output'];
  status: DemoStatus;
};

export enum DemoStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Queued = 'QUEUED',
  Ready = 'READY'
}

export type DependencySet = {
  __typename?: 'DependencySet';
  projects: Array<ProjectDependency>;
  tickets: Array<TicketDependency>;
};

export type Documentation = {
  __typename?: 'Documentation';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  documentationPages: Array<DocumentationPage>;
  id: Scalars['Int']['output'];
  lastPublishRequestAt?: Maybe<Scalars['DateTime']['output']>;
  lastPublishedAt?: Maybe<Scalars['DateTime']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  stage: ModelStage;
  titles: Array<MiniDocumentationPage>;
  updatedAt: Scalars['DateTime']['output'];
};

export type DocumentationPage = {
  __typename?: 'DocumentationPage';
  body: Scalars['String']['output'];
  children: Array<DocumentationPage>;
  createdAt: Scalars['DateTime']['output'];
  customId?: Maybe<Scalars['String']['output']>;
  documentation: Documentation;
  documentationId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  indexableContent: Scalars['String']['output'];
  keywords: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  parent?: Maybe<DocumentationPage>;
  parentId?: Maybe<Scalars['Int']['output']>;
  position: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  urls: Scalars['String']['output'];
};

export type Drawing = {
  __typename?: 'Drawing';
  createdAt: Scalars['DateTime']['output'];
  data: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  lockExpiration?: Maybe<Scalars['DateTime']['output']>;
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  role?: Maybe<Role>;
  roleId?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type DuplicateReportInput = {
  name: Scalars['String']['input'];
};

export type Estimate = {
  __typename?: 'Estimate';
  assignee: Role;
  assigneeId: Scalars['Int']['output'];
  end: Scalars['Int']['output'];
  end_max: Scalars['Int']['output'];
  end_min: Scalars['Int']['output'];
  end_p50: Scalars['Int']['output'];
  end_p70: Scalars['Int']['output'];
  end_p80: Scalars['Int']['output'];
  end_p90: Scalars['Int']['output'];
  end_p95: Scalars['Int']['output'];
  epoch: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  organizationId: Scalars['Int']['output'];
  start: Scalars['Int']['output'];
  start_max: Scalars['Int']['output'];
  start_min: Scalars['Int']['output'];
  start_p50: Scalars['Int']['output'];
  start_p70: Scalars['Int']['output'];
  start_p80: Scalars['Int']['output'];
  start_p90: Scalars['Int']['output'];
  start_p95: Scalars['Int']['output'];
  type: EstimateType;
  updatedEpoch: Scalars['Int']['output'];
};

export type EstimateTicketWorkflowStateInput = {
  fractionable?: InputMaybe<Scalars['Boolean']['input']>;
  maximum?: InputMaybe<Scalars['Int']['input']>;
  minimum?: InputMaybe<Scalars['Int']['input']>;
  mostLikely?: InputMaybe<Scalars['Int']['input']>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export enum EstimateType {
  TicketWorkflowState = 'TicketWorkflowState'
}

export type Feature = {
  __typename?: 'Feature';
  createdAt: Scalars['DateTime']['output'];
  featureGroup: FeatureGroup;
  featureGroupId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  scheduleConfigs: Array<ScheduleConfig>;
  skills: Array<Skill>;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type FeatureDistribution = {
  __typename?: 'FeatureDistribution';
  feature: Feature;
  featureGroup: FeatureGroup;
  hours: Scalars['Float']['output'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  documentation: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  report: Scalars['Boolean']['output'];
  support: Scalars['Boolean']['output'];
};

export type FeatureGroup = {
  __typename?: 'FeatureGroup';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  features: PaginatedFeatures;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  product: Product;
  productId: Scalars['Int']['output'];
  status: FeatureGroupStatus;
  updatedAt: Scalars['DateTime']['output'];
};


export type FeatureGroupFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export enum FeatureGroupStatus {
  Active = 'ACTIVE',
  Deprecated = 'DEPRECATED'
}

export type FilterElement = {
  __typename?: 'FilterElement';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  recordId: Scalars['Int']['output'];
};

export type HabitProductWorkflow = {
  __typename?: 'HabitProductWorkflow';
  product: Product;
  workflow: Workflow;
};

export type ImportTicketsInput = {
  productId?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  tickets: Array<ImportTicketsInputDetail>;
  workflowId?: InputMaybe<Scalars['Int']['input']>;
};

export type ImportTicketsInputDetail = {
  ancestorIds?: InputMaybe<Scalars['String']['input']>;
  authorEmail?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  ownerEmail?: InputMaybe<Scalars['String']['input']>;
  successorIds?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type InviteInput = {
  roleType?: InputMaybe<RoleType>;
  userEmail: Scalars['String']['input'];
  userName?: InputMaybe<Scalars['String']['input']>;
};

export type Issue = {
  __typename?: 'Issue';
  archived: Scalars['Boolean']['output'];
  assignee?: Maybe<Role>;
  assigneeId?: Maybe<Scalars['Int']['output']>;
  context: IssueContext;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  issueActions: Array<IssueAction>;
  localId: Scalars['Int']['output'];
  metaData: Scalars['String']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  product: Product;
  productId: Scalars['Int']['output'];
  resolveAfterDate?: Maybe<Scalars['DateTime']['output']>;
  status: IssueStatus;
  ticket?: Maybe<Ticket>;
  ticketId?: Maybe<Scalars['Int']['output']>;
  token: Scalars['String']['output'];
  unread: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  userAgent: Scalars['String']['output'];
};

export type IssueAction = {
  __typename?: 'IssueAction';
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']['output']>;
  body?: Maybe<Scalars['String']['output']>;
  category: IssueActionCategory;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  issue: Issue;
  issueId: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export enum IssueActionCategory {
  AutoResolved = 'AUTO_RESOLVED',
  ChangeStatus = 'CHANGE_STATUS',
  ClientImage = 'CLIENT_IMAGE',
  ClientMessage = 'CLIENT_MESSAGE',
  SetAssignee = 'SET_ASSIGNEE',
  SetTicket = 'SET_TICKET',
  SupportImage = 'SUPPORT_IMAGE',
  SupportMessage = 'SUPPORT_MESSAGE',
  SupportNote = 'SUPPORT_NOTE'
}

export type IssueAddNoteInput = {
  note: Scalars['String']['input'];
};

export type IssueContext = {
  __typename?: 'IssueContext';
  browser?: Maybe<Scalars['String']['output']>;
  deviceName?: Maybe<Scalars['String']['output']>;
  deviceType?: Maybe<Scalars['String']['output']>;
  engine?: Maybe<Scalars['String']['output']>;
  os?: Maybe<Scalars['String']['output']>;
  osVersion?: Maybe<Scalars['String']['output']>;
};

export type IssueSendMessageInput = {
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
};

export enum IssueStatus {
  New = 'NEW',
  Processing = 'PROCESSING',
  Resolved = 'RESOLVED'
}

export type IssueUpdateNoteInput = {
  note: Scalars['String']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  password: Scalars['String']['input'];
  proof: Scalars['String']['input'];
};

export type Me = {
  __typename?: 'Me';
  organization?: Maybe<Organization>;
  role?: Maybe<Role>;
  status: AuthStatus;
  user?: Maybe<User>;
};

export type MiniDocumentationPage = {
  __typename?: 'MiniDocumentationPage';
  id: Scalars['Int']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  position: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export type MiniFeature = {
  __typename?: 'MiniFeature';
  featureGroupName: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  productCode: Scalars['String']['output'];
  productName: Scalars['String']['output'];
};

export type MiniProduct = {
  __typename?: 'MiniProduct';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  stage: ModelStage;
};

export type MiniProject = {
  __typename?: 'MiniProject';
  ancestorIsArchived: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  stage: ModelStage;
};

export type MiniRole = {
  __typename?: 'MiniRole';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export type MiniTag = {
  __typename?: 'MiniTag';
  color: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type MiniWorkflow = {
  __typename?: 'MiniWorkflow';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  stage: ModelStage;
};

export enum ModelStage {
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export enum DocumentBodyType {
  Ticket = 'TICKET',
  Project = 'PROJECT',
  Documentation = 'DOCUMENTATION'
}

export type Mutation = {
  __typename?: 'Mutation';
  acceptReply: Comment;
  acceptRole: Role;
  addChildToDocumentationPage: DocumentationPage;
  addFeature: FeatureGroup;
  addFeatureGroup: Product;
  addMembers: Team;
  addReply: CommentReply;
  addTicketAncestor: Ticket;
  addTicketFeatures: Ticket;
  addTicketPersonalTags: Ticket;
  addTicketTags: Ticket;
  /** @deprecated We store and display recently visited project and ticket instead */
  addToRecentSearchHit: Role;
  addWorkflowState: Workflow;
  addWorkflows: Product;
  archiveProject: Project;
  batchUpdateTicketTags: Array<Ticket>;
  batchUpdateTickets: TicketBatchPayload;
  blockTicket: Ticket;
  changeEmail: User;
  changePassword: User;
  changeTicketWorkflowStateAssignee: Ticket;
  checkTodo: Todo;
  /** Close (or update an already closed) last known ticket workflow state */
  closeLastScheduleItem: ScheduleItem;
  /** Close an active workflow state */
  closeScheduleItem: ScheduleItem;
  commitScheduleChanges: Scalars['Boolean']['output'];
  createApiToken: CreateApiTokenResult;
  createBlackoutTime: BlackoutTime;
  createComment: Ticket;
  createDocumentation: Documentation;
  createDocumentationPage: DocumentationPage;
  createDrawing: Drawing;
  createFeatureGroup: FeatureGroup;
  createNote: Note;
  createOrganization: NewOrganization;
  createPersonalTag: PersonalTag;
  createProduct: Product;
  createProject: Project;
  createRecurringBlackoutTime: RecurringBlackoutTime;
  createReport: Report;
  createReportQuery: ReportQuery;
  createScheduleItem: ScheduleItem;
  createTag: Tag;
  createTeam: Team;
  createTicket: Ticket;
  createTicketPersonalTag: Ticket;
  createTicketTag: Ticket;
  createTimeOff: TimeOff;
  createTodo: Todo;
  createWorkflow: Workflow;
  deleteBlackoutTime: Scalars['Int']['output'];
  deleteComment: Scalars['Boolean']['output'];
  deleteDocumentation: Documentation;
  deleteDocumentationPage: DocumentationPage;
  deleteDocumentationPageFromDoc: Documentation;
  deleteDrawing: Drawing;
  deleteFeature: FeatureGroup;
  deleteFeatureGroup: Product;
  deleteIssue: Issue;
  deleteNote: Note;
  deleteNotification: Notification;
  deletePersonalTag: Scalars['Boolean']['output'];
  /** @deprecated Archive product instead of deleting it */
  deleteProduct: Product;
  deleteProject: Scalars['Boolean']['output'];
  deleteRecurringBlackoutTime: Scalars['Int']['output'];
  deleteReply: Scalars['Int']['output'];
  deleteReport: Report;
  deleteReportQuery: Report;
  deleteRole: Role;
  deleteScheduleItem: Scalars['Boolean']['output'];
  deleteTag: Scalars['Boolean']['output'];
  deleteTeam: Scalars['Boolean']['output'];
  deleteTimeOff: TimeOff;
  deleteTodo: Todo;
  /** @deprecated Archive workflow instead of deleting it */
  deleteWorkflow: Workflow;
  deleteWorkflowState: Workflow;
  duplicateReport: Report;
  estimateTicketWorkflowState: TicketWorkflowState;
  getDrawingLock: Drawing;
  importTickets: Array<Ticket>;
  invite: Role;
  issueAddNote: Issue;
  issueDeleteNote: Issue;
  issueRemoveAutoResolve: Issue;
  issueSendMessage: Issue;
  issueSetAutoResolve: Issue;
  issueUpdateNote: IssueAction;
  login: Me;
  logout: Scalars['Boolean']['output'];
  markTicketNotDone: Ticket;
  moveAfterDocumentationPage: DocumentationPage;
  moveBeforeDocumentationPage: DocumentationPage;
  moveIntoProject: Scalars['Boolean']['output'];
  moveProjectToRoot: Project;
  moveWorkflowState: Workflow;
  passwordLost: Scalars['Boolean']['output'];
  passwordReset: Me;
  pinProject: Role;
  publishDocumentation: Documentation;
  publishProject: Project;
  reactivateRole: Role;
  readNotification: Notification;
  register: Me;
  registerFromInvite: Me;
  rejectRole: Role;
  releaseDrawingLock: Drawing;
  removeMembers: Team;
  removeTicketAncestor: Ticket;
  removeTicketFeatures: Ticket;
  removeTicketPersonalTags: Ticket;
  removeTicketTags: Ticket;
  removeWorkflows: Product;
  renameProject: Project;
  requestDemo: DemoRequest;
  resendInvite: Role;
  resumeLastScheduleItem: ScheduleItem;
  revokeApiToken: PersonalAccessToken;
  saveDocumentBody: SaveDocumentBodyResult;
  scheduleTicket: Ticket;
  sendConfirmationEmail: Scalars['Boolean']['output'];
  setChecklist: TicketWorkflowState;
  setProjectChecklist: Project;
  skipTicketWorkflowState: TicketWorkflowState;
  toggleOnboarding: Organization;
  unarchiveProject: Project;
  unblockTicket: Ticket;
  unpinProject: Role;
  unpublishDocumentation: Documentation;
  unreadNotification: Notification;
  unwatchTicket: Ticket;
  updateBlackoutTime: BlackoutTime;
  updateComment: Comment;
  updateDocumentation: Documentation;
  updateDocumentationPage: DocumentationPage;
  updateDocumentationPageConfig: DocumentationPage;
  updateDocumentationStage: Documentation;
  updateDrawing: Drawing;
  updateFeature: Feature;
  updateFeatureGroup: FeatureGroup;
  updateIssue: Issue;
  updateIssueByToken: Issue;
  updateMyRole: Role;
  updateMyScheduleItem: ScheduleItem;
  updateNote: Note;
  updateNoteColor: Note;
  updateOrganization: Organization;
  updateOrganizationPreferences: Organization;
  updatePersonalTag: PersonalTag;
  updateProduct: Product;
  updateProductStage: Product;
  updateProductUseGlobalWorkflow: Product;
  /** @deprecated Use renameProject instead */
  updateProjectName: Project;
  updateProjectOwner: Project;
  updateRecurringBlackoutTime: RecurringBlackoutTime;
  updateReply: CommentReply;
  updateReportQuery: ReportQuery;
  updateReportQueryPlacement: Array<ReportQuery>;
  updateReportQuerySize: ReportQuery;
  updateRole: Role;
  updateRoleAutoResume: RoleAutoResume;
  updateRoleEmail: RoleEmail;
  updateRoleNoteColorPreferences: Role;
  updateRolePreferences: Role;
  updateRoleStartReminder: RoleStartReminder;
  updateRoleWorkWeek: Role;
  updateScheduleConfig: Array<ScheduleConfig>;
  /** @deprecated this is a passthrough method */
  updateScheduleItem: ScheduleItem;
  updateSkill: Skill;
  updateTag: Tag;
  updateTeam: Team;
  updateTicket: Ticket;
  updateTicketStage: Ticket;
  updateTicketStatus: Ticket;
  updateTicketWorkflowStates: Ticket;
  updateTimeOff: TimeOff;
  updateTodo: Todo;
  updateUserPreferences: User;
  updateWorkflow: Workflow;
  updateWorkflowStage: Workflow;
  updateWorkflowState: Workflow;
  watchTicket: Ticket;
};


export type MutationAcceptReplyArgs = {
  commentReplyId: Scalars['Int']['input'];
};


export type MutationAcceptRoleArgs = {
  input: AcceptRoleInput;
};


export type MutationAddChildToDocumentationPageArgs = {
  childDocumentationPageId: Scalars['Int']['input'];
  parentDocumentationPageId: Scalars['Int']['input'];
};


export type MutationAddFeatureArgs = {
  featureGroupId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
};


export type MutationAddFeatureGroupArgs = {
  name: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
};


export type MutationAddMembersArgs = {
  roleIds: Array<Scalars['Int']['input']>;
  teamId: Scalars['Int']['input'];
};


export type MutationAddReplyArgs = {
  commentId: Scalars['Int']['input'];
  input: AddReplyInput;
};


export type MutationAddTicketAncestorArgs = {
  ancestorId: Scalars['Int']['input'];
  ticketId: Scalars['Int']['input'];
};


export type MutationAddTicketFeaturesArgs = {
  featureIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationAddTicketPersonalTagsArgs = {
  personalTagIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationAddTicketTagsArgs = {
  tagIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationAddToRecentSearchHitArgs = {
  searchResult: Scalars['String']['input'];
};


export type MutationAddWorkflowStateArgs = {
  input: CreateWorkflowStateInput;
  workflowId: Scalars['Int']['input'];
};


export type MutationAddWorkflowsArgs = {
  productId: Scalars['Int']['input'];
  workflowIds: Array<Scalars['Int']['input']>;
};


export type MutationArchiveProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationBatchUpdateTicketTagsArgs = {
  addTagIds: Array<InputMaybe<Scalars['Int']['input']>>;
  removeTagIds: Array<InputMaybe<Scalars['Int']['input']>>;
  ticketIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type MutationBatchUpdateTicketsArgs = {
  input: BatchUpdateTicketsInput;
  ticketIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type MutationBlockTicketArgs = {
  note: Scalars['String']['input'];
  ticketId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};


export type MutationChangeEmailArgs = {
  input: ChangeEmailInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationChangeTicketWorkflowStateAssigneeArgs = {
  input: ChangeTicketWorkflowStateInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationCheckTodoArgs = {
  checked: Scalars['Boolean']['input'];
  todoId: Scalars['Int']['input'];
};


export type MutationCloseLastScheduleItemArgs = {
  input?: InputMaybe<CloseScheduleItemInput>;
  ticketId: Scalars['Int']['input'];
};


export type MutationCloseScheduleItemArgs = {
  input?: InputMaybe<CloseScheduleItemInput>;
  scheduleItemId: Scalars['Int']['input'];
};


export type MutationCommitScheduleChangesArgs = {
  addTicketIds: Array<InputMaybe<Scalars['Int']['input']>>;
  removeTicketIds: Array<InputMaybe<Scalars['Int']['input']>>;
  scheduleConfigs: Array<InputMaybe<UpdateScheduleConfig>>;
};


export type MutationCreateApiTokenArgs = {
  input: CreateApiTokenInput;
};


export type MutationCreateBlackoutTimeArgs = {
  input: CreateBlackoutTimeInput;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationCreateDocumentationArgs = {
  input: CreateDocumentationInput;
};


export type MutationCreateDocumentationPageArgs = {
  documentationId: Scalars['Int']['input'];
  input: CreateDocumentationPageInput;
};


export type MutationCreateDrawingArgs = {
  input: CreateDrawingInput;
};


export type MutationCreateFeatureGroupArgs = {
  input: CreateFeatureGroupInput;
};


export type MutationCreateNoteArgs = {
  input: CreateNoteInput;
};


export type MutationCreateOrganizationArgs = {
  input: CreateOrganizationInput;
};


export type MutationCreatePersonalTagArgs = {
  input: CreatePersonalTagInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateRecurringBlackoutTimeArgs = {
  input: CreateRecurringBlackoutTimeInput;
};


export type MutationCreateReportArgs = {
  input: CreateReportInput;
};


export type MutationCreateReportQueryArgs = {
  input: CreateReportQueryInput;
  reportId: Scalars['Int']['input'];
};


export type MutationCreateScheduleItemArgs = {
  input: CreateScheduleItemInput;
};


export type MutationCreateTagArgs = {
  input: CreateTagInput;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
};


export type MutationCreateTicketArgs = {
  input: CreateTicketInput;
};


export type MutationCreateTicketPersonalTagArgs = {
  input: CreateTicketPersonalTagInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationCreateTicketTagArgs = {
  input: CreateTicketTagInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationCreateTimeOffArgs = {
  input: CreateTimeOffInput;
};


export type MutationCreateTodoArgs = {
  input: CreateTodoInput;
};


export type MutationCreateWorkflowArgs = {
  input: CreateWorkflowInput;
};


export type MutationDeleteBlackoutTimeArgs = {
  blackoutTimeId: Scalars['Int']['input'];
};


export type MutationDeleteCommentArgs = {
  commentId: Scalars['Int']['input'];
};


export type MutationDeleteDocumentationArgs = {
  documentationId: Scalars['Int']['input'];
};


export type MutationDeleteDocumentationPageArgs = {
  documentationPageId: Scalars['Int']['input'];
};


export type MutationDeleteDocumentationPageFromDocArgs = {
  documentationPageId: Scalars['Int']['input'];
};


export type MutationDeleteDrawingArgs = {
  drawingId: Scalars['Int']['input'];
};


export type MutationDeleteFeatureArgs = {
  featureId: Scalars['Int']['input'];
};


export type MutationDeleteFeatureGroupArgs = {
  featureGroupId: Scalars['Int']['input'];
};


export type MutationDeleteIssueArgs = {
  issueId: Scalars['Int']['input'];
};


export type MutationDeleteNoteArgs = {
  noteId: Scalars['Int']['input'];
};


export type MutationDeleteNotificationArgs = {
  notificationId: Scalars['Int']['input'];
};


export type MutationDeletePersonalTagArgs = {
  personalTagId: Scalars['Int']['input'];
};


export type MutationDeleteProductArgs = {
  productId: Scalars['Int']['input'];
};


export type MutationDeleteProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationDeleteRecurringBlackoutTimeArgs = {
  recurringBlackoutTimeId: Scalars['Int']['input'];
};


export type MutationDeleteReplyArgs = {
  commentReplyId: Scalars['Int']['input'];
};


export type MutationDeleteReportArgs = {
  reportId: Scalars['Int']['input'];
};


export type MutationDeleteReportQueryArgs = {
  reportQueryId: Scalars['Int']['input'];
};


export type MutationDeleteRoleArgs = {
  roleId: Scalars['Int']['input'];
};


export type MutationDeleteScheduleItemArgs = {
  scheduleItemId: Scalars['Int']['input'];
};


export type MutationDeleteTagArgs = {
  tagId: Scalars['Int']['input'];
};


export type MutationDeleteTeamArgs = {
  teamId: Scalars['Int']['input'];
};


export type MutationDeleteTimeOffArgs = {
  timeOffId: Scalars['Int']['input'];
};


export type MutationDeleteTodoArgs = {
  todoId: Scalars['Int']['input'];
};


export type MutationDeleteWorkflowArgs = {
  workflowId: Scalars['Int']['input'];
};


export type MutationDeleteWorkflowStateArgs = {
  workflowStateId: Scalars['Int']['input'];
};


export type MutationDuplicateReportArgs = {
  input: DuplicateReportInput;
  reportId: Scalars['Int']['input'];
};


export type MutationEstimateTicketWorkflowStateArgs = {
  input: EstimateTicketWorkflowStateInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationGetDrawingLockArgs = {
  drawingId: Scalars['Int']['input'];
  force?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationImportTicketsArgs = {
  input: ImportTicketsInput;
};


export type MutationInviteArgs = {
  input: InviteInput;
};


export type MutationIssueAddNoteArgs = {
  input: IssueAddNoteInput;
  issueId: Scalars['Int']['input'];
};


export type MutationIssueDeleteNoteArgs = {
  issueActionId: Scalars['Int']['input'];
};


export type MutationIssueRemoveAutoResolveArgs = {
  issueId: Scalars['Int']['input'];
};


export type MutationIssueSendMessageArgs = {
  input: IssueSendMessageInput;
  issueId: Scalars['Int']['input'];
};


export type MutationIssueSetAutoResolveArgs = {
  issueId: Scalars['Int']['input'];
};


export type MutationIssueUpdateNoteArgs = {
  input: IssueUpdateNoteInput;
  issueActionId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkTicketNotDoneArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationMoveAfterDocumentationPageArgs = {
  afterDocumentationPageId: Scalars['Int']['input'];
  documentationPageId: Scalars['Int']['input'];
};


export type MutationMoveBeforeDocumentationPageArgs = {
  beforeDocumentationPageId: Scalars['Int']['input'];
  documentationPageId: Scalars['Int']['input'];
};


export type MutationMoveIntoProjectArgs = {
  projectId: Scalars['Int']['input'];
  sources: Array<Scalars['String']['input']>;
};


export type MutationMoveProjectToRootArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationMoveWorkflowStateArgs = {
  direction: WorkflowStateDirection;
  workflowStateId: Scalars['Int']['input'];
};


export type MutationPasswordLostArgs = {
  input: PasswordLostInput;
};


export type MutationPasswordResetArgs = {
  input: PasswordResetInput;
};


export type MutationPinProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationPublishDocumentationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationPublishProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationReactivateRoleArgs = {
  roleId: Scalars['Int']['input'];
};


export type MutationReadNotificationArgs = {
  notificationId: Scalars['Int']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterFromInviteArgs = {
  input: RegisterInput;
};


export type MutationRejectRoleArgs = {
  roleId: Scalars['Int']['input'];
};


export type MutationReleaseDrawingLockArgs = {
  drawingId: Scalars['Int']['input'];
};


export type MutationRemoveMembersArgs = {
  roleIds: Array<Scalars['Int']['input']>;
  teamId: Scalars['Int']['input'];
};


export type MutationRemoveTicketAncestorArgs = {
  ancestorId: Scalars['Int']['input'];
  ticketId: Scalars['Int']['input'];
};


export type MutationRemoveTicketFeaturesArgs = {
  featureIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationRemoveTicketPersonalTagsArgs = {
  personalTagIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationRemoveTicketTagsArgs = {
  tagIds: Array<Scalars['Int']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type MutationRemoveWorkflowsArgs = {
  productId: Scalars['Int']['input'];
  workflowIds: Array<Scalars['Int']['input']>;
};


export type MutationRenameProjectArgs = {
  name: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
};


export type MutationRequestDemoArgs = {
  input: RequestDemoInput;
};


export type MutationResendInviteArgs = {
  email: Scalars['String']['input'];
};


export type MutationRevokeApiTokenArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSaveDocumentBodyArgs = {
  baseVersion: Scalars['Int']['input'];
  documentId: Scalars['Int']['input'];
  documentType: DocumentBodyType;
  markdown: Scalars['String']['input'];
};


export type MutationScheduleTicketArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationSetChecklistArgs = {
  input: Array<UpdateChecklistInput>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};


export type MutationSetProjectChecklistArgs = {
  input: Array<InputMaybe<UpdateProjectChecklistInput>>;
  projectId: Scalars['Int']['input'];
};


export type MutationSkipTicketWorkflowStateArgs = {
  id: Scalars['Int']['input'];
};


export type MutationToggleOnboardingArgs = {
  showOnboarding: Scalars['Boolean']['input'];
};


export type MutationUnarchiveProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationUnblockTicketArgs = {
  note: Scalars['String']['input'];
  ticketId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};


export type MutationUnpinProjectArgs = {
  projectId: Scalars['Int']['input'];
};


export type MutationUnpublishDocumentationArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUnreadNotificationArgs = {
  notificationId: Scalars['Int']['input'];
};


export type MutationUnwatchTicketArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationUpdateBlackoutTimeArgs = {
  blackoutTimeId: Scalars['Int']['input'];
  input: UpdateBlackoutTimeInput;
};


export type MutationUpdateCommentArgs = {
  commentId: Scalars['Int']['input'];
  input: UpdateCommentInput;
};


export type MutationUpdateDocumentationArgs = {
  documentationId: Scalars['Int']['input'];
  input: UpdateDocumentationInput;
};


export type MutationUpdateDocumentationPageArgs = {
  documentationPageId: Scalars['Int']['input'];
  input: UpdateDocumentationPageInput;
};


export type MutationUpdateDocumentationPageConfigArgs = {
  documentationPageId: Scalars['Int']['input'];
  input: UpdateDocumentationPageConfigInput;
};


export type MutationUpdateDocumentationStageArgs = {
  documentationId: Scalars['Int']['input'];
  stage: ModelStage;
};


export type MutationUpdateDrawingArgs = {
  drawingId: Scalars['Int']['input'];
  input: UpdateDrawingInput;
};


export type MutationUpdateFeatureArgs = {
  featureId: Scalars['Int']['input'];
  input: UpdateFeatureInput;
};


export type MutationUpdateFeatureGroupArgs = {
  featureGroupId: Scalars['Int']['input'];
  input: UpdateFeatureGroupInput;
};


export type MutationUpdateIssueArgs = {
  input: UpdateIssueInput;
  issueId: Scalars['Int']['input'];
};


export type MutationUpdateIssueByTokenArgs = {
  input: ClientUpdateIssueInput;
  token: Scalars['String']['input'];
};


export type MutationUpdateMyRoleArgs = {
  input: UpdateMyRoleInput;
};


export type MutationUpdateMyScheduleItemArgs = {
  input: UpdateScheduleItemInput;
  scheduleItemId: Scalars['Int']['input'];
};


export type MutationUpdateNoteArgs = {
  input: UpdateNoteInput;
  noteId: Scalars['Int']['input'];
};


export type MutationUpdateNoteColorArgs = {
  color: NoteColor;
  noteId: Scalars['Int']['input'];
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateOrganizationPreferencesArgs = {
  input: UpdateOrganizationPreferencesInput;
};


export type MutationUpdatePersonalTagArgs = {
  input: UpdatePersonalTagInput;
  tagId: Scalars['Int']['input'];
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
  productId: Scalars['Int']['input'];
};


export type MutationUpdateProductStageArgs = {
  productId: Scalars['Int']['input'];
  stage: ModelStage;
};


export type MutationUpdateProductUseGlobalWorkflowArgs = {
  productId: Scalars['Int']['input'];
  useDefaultWorkflows: Scalars['Boolean']['input'];
};


export type MutationUpdateProjectNameArgs = {
  name: Scalars['String']['input'];
  projectId: Scalars['Int']['input'];
};


export type MutationUpdateProjectOwnerArgs = {
  ownerId?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
};


export type MutationUpdateRecurringBlackoutTimeArgs = {
  input: UpdateRecurringBlackoutTimeInput;
  recurringBlackoutTimeId: Scalars['Int']['input'];
};


export type MutationUpdateReplyArgs = {
  commentReplyId: Scalars['Int']['input'];
  input: UpdateReplyInput;
};


export type MutationUpdateReportQueryArgs = {
  input: UpdateReportQueryInput;
  reportQueryId: Scalars['Int']['input'];
};


export type MutationUpdateReportQueryPlacementArgs = {
  input: UpdateReportQueryPlacementInput;
  reportQueryId: Scalars['Int']['input'];
};


export type MutationUpdateReportQuerySizeArgs = {
  input: UpdateReportQuerySizeInput;
  reportQueryId: Scalars['Int']['input'];
};


export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
  roleId: Scalars['Int']['input'];
};


export type MutationUpdateRoleAutoResumeArgs = {
  input: UpdateRoleAutoResumeInput;
};


export type MutationUpdateRoleEmailArgs = {
  input: UpdateRoleEmailInput;
};


export type MutationUpdateRoleNoteColorPreferencesArgs = {
  input: UpdateRoleNoteColorsInput;
};


export type MutationUpdateRolePreferencesArgs = {
  input: UpdateRolePreferencesInput;
};


export type MutationUpdateRoleStartReminderArgs = {
  input: UpdateRoleStartReminderInput;
};


export type MutationUpdateRoleWorkWeekArgs = {
  input: UpdateRoleWorkWeekInput;
  roleId: Scalars['Int']['input'];
};


export type MutationUpdateScheduleConfigArgs = {
  input: UpdateScheduleConfigs;
};


export type MutationUpdateScheduleItemArgs = {
  input: UpdateScheduleItemInput;
  scheduleItemId: Scalars['Int']['input'];
};


export type MutationUpdateSkillArgs = {
  input: UpdateSkillInput;
  skillId: Scalars['Int']['input'];
};


export type MutationUpdateTagArgs = {
  input: UpdateTagInput;
  tagId: Scalars['Int']['input'];
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
  teamId: Scalars['Int']['input'];
};


export type MutationUpdateTicketArgs = {
  input: UpdateTicketInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationUpdateTicketStageArgs = {
  stage: ModelStage;
  ticketId: Scalars['Int']['input'];
};


export type MutationUpdateTicketStatusArgs = {
  note?: InputMaybe<Scalars['String']['input']>;
  status: TicketStatus;
  ticketId: Scalars['Int']['input'];
};


export type MutationUpdateTicketWorkflowStatesArgs = {
  input: UpdateTicketWorkflowStateInput;
  ticketId: Scalars['Int']['input'];
};


export type MutationUpdateTimeOffArgs = {
  input: UpdateTimeOffInput;
  timeOffId: Scalars['Int']['input'];
};


export type MutationUpdateTodoArgs = {
  input: UpdateTodoInput;
  todoId: Scalars['Int']['input'];
};


export type MutationUpdateUserPreferencesArgs = {
  input: UpdateUserPreferencesInput;
};


export type MutationUpdateWorkflowArgs = {
  input: UpdateWorkflowInput;
  workflowId: Scalars['Int']['input'];
};


export type MutationUpdateWorkflowStageArgs = {
  stage: ModelStage;
  workflowId: Scalars['Int']['input'];
};


export type MutationUpdateWorkflowStateArgs = {
  input: UpdateWorkflowStateInput;
  workflowStateId: Scalars['Int']['input'];
};


export type MutationWatchTicketArgs = {
  ticketId: Scalars['Int']['input'];
};

export type MyPreviousAssignedTicket = {
  __typename?: 'MyPreviousAssignedTicket';
  currentState?: Maybe<TicketWorkflowState>;
  isActive: Scalars['Boolean']['output'];
  isDone: Scalars['Boolean']['output'];
  isNext: Scalars['Boolean']['output'];
  isPaused: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
  lastState?: Maybe<TicketWorkflowState>;
  ticket: Ticket;
};

export type MyUpcomingAssignedTicket = {
  __typename?: 'MyUpcomingAssignedTicket';
  currentState: TicketWorkflowState;
  isActive: Scalars['Boolean']['output'];
  isDone: Scalars['Boolean']['output'];
  isNext: Scalars['Boolean']['output'];
  isPaused: Scalars['Boolean']['output'];
  isStarted: Scalars['Boolean']['output'];
  lastState?: Maybe<TicketWorkflowState>;
  ticket: Ticket;
};

export type NewOrganization = {
  __typename?: 'NewOrganization';
  organization: Organization;
  project: Project;
};

export type NextTicket = {
  __typename?: 'NextTicket';
  nextState: TicketWorkflowState;
  ticket: Ticket;
};

export type Note = {
  __typename?: 'Note';
  body: Scalars['String']['output'];
  color: NoteColor;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  owner: Role;
  ownerId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum NoteColor {
  Blue = 'BLUE',
  Green = 'GREEN',
  Orange = 'ORANGE',
  Pink = 'PINK',
  Purple = 'PURPLE',
  Yellow = 'YELLOW'
}

export type Notification = {
  __typename?: 'Notification';
  actor: Role;
  actorId: Scalars['Int']['output'];
  ancestry?: Maybe<Scalars['String']['output']>;
  category: NotificationCategory;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isRead: Scalars['Boolean']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  role: Role;
  roleId: Scalars['Int']['output'];
  target: NotificationTarget;
  targetId: Scalars['Int']['output'];
  title: Scalars['String']['output'];
};

export enum NotificationCategory {
  AcceptedReply = 'ACCEPTED_REPLY',
  ClosedTicket = 'CLOSED_TICKET',
  Mention = 'MENTION',
  Owned = 'OWNED',
  ReadyToSchedule = 'READY_TO_SCHEDULE',
  Reply = 'REPLY',
  Watched = 'WATCHED'
}

export enum NotificationTarget {
  Comment = 'COMMENT',
  Project = 'PROJECT',
  Question = 'QUESTION',
  Reply = 'REPLY',
  Ticket = 'TICKET'
}

export type OnboardingStatus = {
  __typename?: 'OnboardingStatus';
  invite: Scalars['Boolean']['output'];
  product: Scalars['Boolean']['output'];
  ticket: Scalars['Boolean']['output'];
};

export type OpenTicketsByWorkflow = {
  __typename?: 'OpenTicketsByWorkflow';
  values: Array<TicketOpenByWorkflowDatum>;
  workflow: Workflow;
};

export type Organization = {
  __typename?: 'Organization';
  about?: Maybe<Scalars['String']['output']>;
  billingAddress?: Maybe<OrganizationAddress>;
  billingAddressId?: Maybe<Scalars['Int']['output']>;
  coverUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  estimatedAt: Scalars['DateTime']['output'];
  featureFlag?: Maybe<FeatureFlag>;
  id: Scalars['Int']['output'];
  mailingAddress?: Maybe<OrganizationAddress>;
  mailingAddressId?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  onboardingStatus: OnboardingStatus;
  preferences: OrganizationPreferences;
  products: Array<Product>;
  roles: Array<Role>;
  scheduleStatus: ScheduleStatus;
  showOnboarding: Scalars['Boolean']['output'];
  status: OrganizationStatus;
  tags: Array<Tag>;
  teams: Array<Team>;
  updatedAt: Scalars['DateTime']['output'];
};

export type OrganizationAddress = {
  __typename?: 'OrganizationAddress';
  address1: Scalars['String']['output'];
  address2?: Maybe<Scalars['String']['output']>;
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  organizationId: Scalars['Int']['output'];
  state?: Maybe<Scalars['String']['output']>;
  zipcode: Scalars['String']['output'];
};

export type OrganizationPreferences = {
  __typename?: 'OrganizationPreferences';
  showOnboarding: Scalars['Boolean']['output'];
};

export enum OrganizationStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Suspended = 'SUSPENDED'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Int']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  pageCount: Scalars['Int']['output'];
  pageNumber: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
};

export type PaginatedBlackoutTimes = {
  __typename?: 'PaginatedBlackoutTimes';
  nodes: Array<BlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedCommentReply = {
  __typename?: 'PaginatedCommentReply';
  nodes: Array<CommentReply>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedComments = {
  __typename?: 'PaginatedComments';
  nodes: Array<Comment>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedDocumentations = {
  __typename?: 'PaginatedDocumentations';
  nodes: Array<Documentation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedFeatureGroups = {
  __typename?: 'PaginatedFeatureGroups';
  nodes: Array<FeatureGroup>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedFeatures = {
  __typename?: 'PaginatedFeatures';
  nodes: Array<Feature>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedIssues = {
  __typename?: 'PaginatedIssues';
  nodes: Array<Issue>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedNotes = {
  __typename?: 'PaginatedNotes';
  nodes: Array<Note>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedNotifications = {
  __typename?: 'PaginatedNotifications';
  nodes: Array<Notification>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedOrganizations = {
  __typename?: 'PaginatedOrganizations';
  nodes: Array<Organization>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedPersonalTags = {
  __typename?: 'PaginatedPersonalTags';
  nodes: Array<PersonalTag>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  nodes: Array<Product>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedProjects = {
  __typename?: 'PaginatedProjects';
  nodes: Array<Project>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedRecurringBlackoutTimes = {
  __typename?: 'PaginatedRecurringBlackoutTimes';
  nodes: Array<RecurringBlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedReports = {
  __typename?: 'PaginatedReports';
  nodes: Array<Report>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedRoles = {
  __typename?: 'PaginatedRoles';
  nodes: Array<Role>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedScheduleItems = {
  __typename?: 'PaginatedScheduleItems';
  nodes: Array<ScheduleItem>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedSkills = {
  __typename?: 'PaginatedSkills';
  nodes: Array<Skill>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedTags = {
  __typename?: 'PaginatedTags';
  nodes: Array<Tag>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedTeams = {
  __typename?: 'PaginatedTeams';
  nodes: Array<Team>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedTickets = {
  __typename?: 'PaginatedTickets';
  nodes: Array<Ticket>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedTodos = {
  __typename?: 'PaginatedTodos';
  nodes: Array<Todo>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedWorkflowStates = {
  __typename?: 'PaginatedWorkflowStates';
  nodes: Array<WorkflowState>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PaginatedWorkflows = {
  __typename?: 'PaginatedWorkflows';
  nodes: Array<Workflow>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type PasswordLostInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  proof: Scalars['String']['input'];
};

export type PasswordResetInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  password: Scalars['String']['input'];
  proof: Scalars['String']['input'];
  secret: Scalars['String']['input'];
};

export type PersonalAccessToken = {
  __typename?: 'PersonalAccessToken';
  createdAt: Scalars['DateTime']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  readOnly: Scalars['Boolean']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
  roleId: Scalars['Int']['output'];
  tokenPrefix: Scalars['String']['output'];
};

export type PersonalTag = {
  __typename?: 'PersonalTag';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  owner: Role;
  ownerId: Scalars['Int']['output'];
  replacedBy?: Maybe<PersonalTag>;
  replacedByTagId?: Maybe<Scalars['Int']['output']>;
  replacesTags: Array<PersonalTag>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PlanningTicket = {
  __typename?: 'PlanningTicket';
  eta: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  localId: Scalars['Int']['output'];
  milestone: Scalars['Boolean']['output'];
  productCode: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  projectName: Scalars['String']['output'];
  status: TicketStatus;
  title: Scalars['String']['output'];
  workflowName: Scalars['String']['output'];
};

export type Product = {
  __typename?: 'Product';
  code: Scalars['String']['output'];
  coverUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  featureGroups: PaginatedFeatureGroups;
  features: PaginatedFeatures;
  id: Scalars['Int']['output'];
  isSupportActive: Scalars['Boolean']['output'];
  isUsingDefaultWorkflows: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  stage: ModelStage;
  tickets: PaginatedTickets;
  updatedAt: Scalars['DateTime']['output'];
  workflowIds: Array<Scalars['Int']['output']>;
  workflows: PaginatedWorkflows;
};


export type ProductFeatureGroupsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ProductFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ProductTicketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type ProductWorkflowsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
};

export type Project = {
  __typename?: 'Project';
  ancestorIsArchived: Scalars['Boolean']['output'];
  ancestors: Array<Project>;
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']['output']>;
  checklist: Array<ChecklistItem>;
  children: Array<Project>;
  createdAt: Scalars['DateTime']['output'];
  duration: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  indexableContent: Scalars['String']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  owner?: Maybe<Role>;
  ownerId?: Maybe<Scalars['Int']['output']>;
  parent?: Maybe<Project>;
  parentId?: Maybe<Scalars['Int']['output']>;
  pinnedByRoles: Array<Role>;
  scheduleConfigs: Array<ScheduleConfig>;
  stage: ModelStage;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ProjectAnalytics = {
  __typename?: 'ProjectAnalytics';
  doneTicketCount: Scalars['Int']['output'];
  draftTicketCount: Scalars['Int']['output'];
  estimatedTicketCount: Scalars['Int']['output'];
  inProgressTicketCount: Scalars['Int']['output'];
  organizationId: Scalars['Int']['output'];
  projectId: Scalars['Int']['output'];
  scheduledTicketCount: Scalars['Int']['output'];
  unassignedTicketCount: Scalars['Int']['output'];
  unestimatedTicketCount: Scalars['Int']['output'];
};

export type ProjectDependency = {
  __typename?: 'ProjectDependency';
  ancestors: Array<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  successors: Array<Scalars['Int']['output']>;
};

export type ProjectGoalProgress = {
  __typename?: 'ProjectGoalProgress';
  accomplished: Scalars['Float']['output'];
  eta: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  progress: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type ProjectGoalStats = {
  __typename?: 'ProjectGoalStats';
  cancelled: Scalars['Int']['output'];
  done: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  parentId?: Maybe<Scalars['Int']['output']>;
  scheduled: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  unScheduled: Scalars['Int']['output'];
};

export type ProjectTicket = {
  __typename?: 'ProjectTicket';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  localId?: Maybe<Scalars['Int']['output']>;
  productCode?: Maybe<Scalars['String']['output']>;
  stage: ModelStage;
  status: TicketStatus;
  title: Scalars['String']['output'];
};

export enum ProjectTicketQueryCategory {
  Done = 'Done',
  Draft = 'Draft',
  Estimated = 'Estimated',
  InProgress = 'InProgress',
  Scheduled = 'Scheduled',
  Unassigned = 'Unassigned',
  Unestimated = 'Unestimated'
}

export type Query = {
  __typename?: 'Query';
  activeScheduleItems: Array<ScheduleItem>;
  batchGetTicketTags: Array<Ticket>;
  batchGetTickets: Array<Ticket>;
  blackoutTime: BlackoutTime;
  blackoutTimes: Array<BlackoutTime>;
  blockingTickets: Array<TicketWorkflowState>;
  comment: Comment;
  commentReply: CommentReply;
  comments: PaginatedComments;
  deliveredTicketForPeriod: Array<Ticket>;
  dependencies: DependencySet;
  documentation: Documentation;
  documentationPage: DocumentationPage;
  documentationPageAccessToken?: Maybe<Scalars['String']['output']>;
  documentations: PaginatedDocumentations;
  drawing: Drawing;
  exportTickets: Array<TicketExport>;
  featureFlag: FeatureFlag;
  featureGroup: FeatureGroup;
  featureGroups: PaginatedFeatureGroups;
  features: PaginatedFeatures;
  getAllAwaitingEstimateTasks: Array<Ticket>;
  getAllEstimates: Array<Estimate>;
  getAllRoles: Array<Role>;
  getAllScheduledTasks: Array<Ticket>;
  getAllUnscheduledDependencies: Array<Ticket>;
  getDemo: DemoRequest;
  getEstimates: Array<ScheduleEstimate>;
  getGanttProjects: Array<Project>;
  getScheduleRoles: Array<ScheduleRole>;
  getScheduledTickets: Array<Ticket>;
  getUnscheduledDependencies: Array<Ticket>;
  getUnscheduledTickets: PaginatedTickets;
  habits: RoleHabit;
  issue: Issue;
  issueByToken: Issue;
  issues: PaginatedIssues;
  lastNote?: Maybe<Note>;
  lastNotification?: Maybe<Notification>;
  lastScheduleItem: ScheduleItem;
  lastTicketWorkflowStateNote?: Maybe<TicketWorkflowStateNote>;
  lastTodo?: Maybe<Todo>;
  me: Me;
  miniFeatures: Array<MiniFeature>;
  miniProducts: Array<MiniProduct>;
  miniProjects: Array<MiniProject>;
  miniRoles: Array<MiniRole>;
  miniTags: Array<MiniTag>;
  miniWorkflows: Array<MiniWorkflow>;
  moreTickets: PaginatedTickets;
  moreTicketsForProject: PaginatedTickets;
  myApiTokens: Array<PersonalAccessToken>;
  myEstimatedTickets: Array<Ticket>;
  myLastProject?: Maybe<Project>;
  myMiniProjects: Array<MiniProject>;
  myNextTickets: Array<NextTicket>;
  myNotScheduledTickets: PaginatedTickets;
  myNotifications: PaginatedNotifications;
  myOpenScheduleItems: Array<ScheduleItem>;
  myPreviousTickets: Array<MyPreviousAssignedTicket>;
  /** The user's own projects and drafts */
  myProjects: Array<Project>;
  myRecentlyCreatedTickets: PaginatedTickets;
  myRole: Role;
  myRoles: Array<Role>;
  myScheduleItemPeriod: Array<ScheduleItem>;
  myTickets: Array<Ticket>;
  myTicketsToEstimate: Array<Ticket>;
  myUnestimatedTickets: Array<Ticket>;
  myUnfinishedScheduleItems: Array<ScheduleItem>;
  myUpcomingTickets: Array<MyUpcomingAssignedTicket>;
  myWatchedTickets: Array<Ticket>;
  note: Note;
  notes: PaginatedNotes;
  notification: Notification;
  organization: Organization;
  organizationApiTokens: Array<PersonalAccessToken>;
  organizations: PaginatedOrganizations;
  paginatedBlackoutTimes: PaginatedBlackoutTimes;
  paginatedRecurringBlackoutTimes: PaginatedRecurringBlackoutTimes;
  pastGoalProgress: Array<ProjectGoalProgress>;
  pastWorkflowDistribution: Array<WorkflowDistribution>;
  personalTag: PersonalTag;
  personalTags: PaginatedPersonalTags;
  planningDeliveredTickets: Array<PlanningTicket>;
  planningProjection: Array<PlanningTicket>;
  planningTickets: Array<PlanningTicket>;
  pof: Scalars['String']['output'];
  product: Product;
  productByCode: Product;
  products: PaginatedProducts;
  project: Project;
  projectAccessToken?: Maybe<Scalars['String']['output']>;
  projectAnalytics?: Maybe<ProjectAnalytics>;
  projectGoalStats: Array<ProjectGoalStats>;
  projectTextAccessToken?: Maybe<Scalars['String']['output']>;
  projectTickets: Array<ProjectTicket>;
  projectTicketsForCategory: PaginatedTickets;
  projectedGoalProgress: Array<ProjectGoalProgress>;
  projectedWorkflowDistribution: Array<WorkflowDistribution>;
  /** @deprecated Not useful */
  projectedWorkload: Array<RoleWorkload>;
  projects: PaginatedProjects;
  recurringBlackoutTime: RecurringBlackoutTime;
  recurringBlackoutTimes: Array<RecurringBlackoutTime>;
  replies: Array<CommentReply>;
  report: Report;
  reportQuery: ReportQuery;
  reports: PaginatedReports;
  role: Role;
  roles: PaginatedRoles;
  scheduleConfig: ScheduleConfig;
  scheduleConfigs: Array<ScheduleConfig>;
  scheduleItem: ScheduleItem;
  scheduleItemPeriod: Array<ScheduleItem>;
  scheduleItemUpdateBoundaries: ScheduleItemUpdateBoundaries;
  scheduleItems: PaginatedScheduleItems;
  scheduledTicketToBeClosing: Array<Ticket>;
  scheduledTicketToBeWorked: Array<Ticket>;
  search: Array<SearchResult>;
  searchRole: Array<Role>;
  searchTicket: Array<SearchResult>;
  tag: Tag;
  tags: PaginatedTags;
  team: Team;
  teamByCode: Team;
  teams: PaginatedTeams;
  ticket: Ticket;
  ticketNotes: Array<TicketWorkflowStateNote>;
  ticketStatusHistogram: Array<OpenTicketsByWorkflow>;
  ticketTextAccessToken?: Maybe<Scalars['String']['output']>;
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateNote: TicketWorkflowStateNote;
  tickets: PaginatedTickets;
  ticketsCount: Scalars['Int']['output'];
  ticketsForMyCalendar: Array<Ticket>;
  timeOffs: Array<TimeOff>;
  todo: Todo;
  todos: PaginatedTodos;
  useRole: Me;
  user: User;
  users: PaginatedUsers;
  version: Scalars['String']['output'];
  workedTicketForPeriod: Array<Ticket>;
  workflow: Workflow;
  workflowState: WorkflowState;
  workflows: PaginatedWorkflows;
};


export type QueryBatchGetTicketTagsArgs = {
  ticketIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type QueryBatchGetTicketsArgs = {
  ticketIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type QueryBlackoutTimeArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCommentArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCommentReplyArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCommentsArgs = {
  commentId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  replyId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type QueryDeliveredTicketForPeriodArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryDependenciesArgs = {
  projectId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryDocumentationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDocumentationPageArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDocumentationPageAccessTokenArgs = {
  id: Scalars['Int']['input'];
};


export type QueryDocumentationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryDrawingArgs = {
  id: Scalars['Int']['input'];
};


export type QueryExportTicketsArgs = {
  sources: Array<Scalars['String']['input']>;
};


export type QueryFeatureGroupArgs = {
  id: Scalars['Int']['input'];
};


export type QueryFeatureGroupsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetAllUnscheduledDependenciesArgs = {
  ticketIds: Array<Scalars['Int']['input']>;
};


export type QueryGetDemoArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEstimatesArgs = {
  toDate: Scalars['DateTime']['input'];
};


export type QueryGetScheduleRolesArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryGetUnscheduledDependenciesArgs = {
  ticketIds: Array<Scalars['Int']['input']>;
};


export type QueryGetUnscheduledTicketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  tagId?: InputMaybe<Scalars['Int']['input']>;
  workflowId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryIssueArgs = {
  id: Scalars['Int']['input'];
};


export type QueryIssueByTokenArgs = {
  token: Scalars['String']['input'];
};


export type QueryIssuesArgs = {
  assigneeId?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  statuses?: InputMaybe<Array<IssueStatus>>;
  unassigned?: InputMaybe<Scalars['Boolean']['input']>;
  unread?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryLastTicketWorkflowStateNoteArgs = {
  ticketId: Scalars['Int']['input'];
};


export type QueryMiniFeaturesArgs = {
  productId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMiniWorkflowsArgs = {
  productId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMoreTicketsArgs = {
  allUntagged?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  atRisk?: InputMaybe<Scalars['Boolean']['input']>;
  authorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  closedAtFilter?: InputMaybe<Scalars['String']['input']>;
  createdAtFilter?: InputMaybe<Scalars['String']['input']>;
  cursor?: InputMaybe<Scalars['Int']['input']>;
  etaFilter?: InputMaybe<Scalars['String']['input']>;
  featureIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hideCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  intersectTagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  ownerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  recursive?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  unassigned?: InputMaybe<Scalars['Boolean']['input']>;
  unestimated?: InputMaybe<Scalars['Boolean']['input']>;
  untagged?: InputMaybe<Scalars['Boolean']['input']>;
  workflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryMoreTicketsForProjectArgs = {
  cursor?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hideCompleted?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyMiniProjectsArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyNotScheduledTicketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyNotificationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  unread?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyRecentlyCreatedTicketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryNoteArgs = {
  id: Scalars['Int']['input'];
};


export type QueryNotesArgs = {
  colors?: InputMaybe<Array<NoteColor>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryNotificationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryOrganizationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaginatedBlackoutTimesArgs = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaginatedRecurringBlackoutTimesArgs = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPastGoalProgressArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryPastWorkflowDistributionArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryPersonalTagArgs = {
  id: Scalars['Int']['input'];
};


export type QueryPersonalTagsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanningDeliveredTicketsArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryPlanningProjectionArgs = {
  scheduleConfigs: Array<InputMaybe<ScheduleConfigForEstimateInput>>;
  ticketIds: Array<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProductByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryProjectArgs = {
  id: Scalars['Int']['input'];
  visited?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryProjectAccessTokenArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProjectAnalyticsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectGoalStatsArgs = {
  projectId: Scalars['Int']['input'];
};


export type QueryProjectTextAccessTokenArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProjectTicketsArgs = {
  myDraft?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
};


export type QueryProjectTicketsForCategoryArgs = {
  category: ProjectTicketQueryCategory;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProjectedGoalProgressArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryProjectedWorkflowDistributionArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryProjectedWorkloadArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryProjectsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  parentId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRecurringBlackoutTimeArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRecurringBlackoutTimesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryRepliesArgs = {
  commentId: Scalars['Int']['input'];
};


export type QueryReportArgs = {
  id: Scalars['Int']['input'];
};


export type QueryReportQueryArgs = {
  id: Scalars['Int']['input'];
};


export type QueryReportsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryRoleArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRolesArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryScheduleConfigArgs = {
  id: Scalars['Int']['input'];
};


export type QueryScheduleItemArgs = {
  scheduleItemId: Scalars['Int']['input'];
};


export type QueryScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime']['input'];
  roleId?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryScheduleItemUpdateBoundariesArgs = {
  scheduleItemId: Scalars['Int']['input'];
};


export type QueryScheduleItemsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  roleId?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryScheduledTicketToBeClosingArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryScheduledTicketToBeWorkedArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QuerySearchArgs = {
  includeClosed?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchRoleArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchTicketArgs = {
  includeClosed?: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTagArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTagsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTeamByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryTeamsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTicketArgs = {
  id: Scalars['Int']['input'];
  visited?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryTicketNotesArgs = {
  ticketId: Scalars['Int']['input'];
};


export type QueryTicketStatusHistogramArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryTicketTextAccessTokenArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTicketWorkflowStateArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTicketWorkflowStateNoteArgs = {
  ticketWorkflowStateNoteId: Scalars['Int']['input'];
};


export type QueryTicketsArgs = {
  assigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAtFilter?: InputMaybe<Scalars['String']['input']>;
  etaFilter?: InputMaybe<Scalars['String']['input']>;
  featureIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  productIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  recursive?: InputMaybe<Scalars['Boolean']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  unassigned?: InputMaybe<Scalars['Boolean']['input']>;
  unestimated?: InputMaybe<Scalars['Boolean']['input']>;
  unfinished?: InputMaybe<Scalars['Boolean']['input']>;
  untagged?: InputMaybe<Scalars['Boolean']['input']>;
  watched?: InputMaybe<Scalars['Boolean']['input']>;
  workflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryTicketsCountArgs = {
  addedTicketIds: Array<InputMaybe<Scalars['Int']['input']>>;
  filter: UpdateScheduleConfig;
  removedTicketIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type QueryTicketsForMyCalendarArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTimeOffsArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryTodoArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTodosArgs = {
  dynamic?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryUseRoleArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWorkedTicketForPeriodArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryWorkflowArgs = {
  id: Scalars['Int']['input'];
};


export type QueryWorkflowStateArgs = {
  id: Scalars['Int']['input'];
};


export type QueryWorkflowsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  stages?: InputMaybe<Array<ModelStage>>;
};

export type QueryAggregate = {
  __typename?: 'QueryAggregate';
  main?: Maybe<Scalars['String']['output']>;
  secondary?: Maybe<Scalars['String']['output']>;
  value: Scalars['Float']['output'];
};

export type RecurringBlackoutTime = {
  __typename?: 'RecurringBlackoutTime';
  createdAt: Scalars['DateTime']['output'];
  disabled: Scalars['Boolean']['output'];
  friday: Scalars['Boolean']['output'];
  id: Scalars['Int']['output'];
  monday: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  roles: Array<Role>;
  saturday: Scalars['Boolean']['output'];
  startTime: Scalars['String']['output'];
  stopTime: Scalars['String']['output'];
  sunday: Scalars['Boolean']['output'];
  thursday: Scalars['Boolean']['output'];
  timeZone: Scalars['String']['output'];
  tuesday: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wednesday: Scalars['Boolean']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  password: Scalars['String']['input'];
  proof: Scalars['String']['input'];
};

export type Report = {
  __typename?: 'Report';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  queries: Array<ReportQuery>;
  stage: ModelStage;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReportAggregate = {
  __typename?: 'ReportAggregate';
  primary: Array<QueryAggregate>;
  secondary: Array<QueryAggregate>;
};

export enum ReportAggregateField {
  SumHoursWorked = 'SUM_HOURS_WORKED',
  TicketCount = 'TICKET_COUNT'
}

export enum ReportDateGranularity {
  Auto = 'AUTO',
  Day = 'DAY',
  Month = 'MONTH',
  Week = 'WEEK'
}

export enum ReportGroupBy {
  Assignee = 'ASSIGNEE',
  ClosedAt = 'CLOSED_AT',
  CreatedAt = 'CREATED_AT',
  Eta = 'ETA',
  Product = 'PRODUCT',
  ScheduledAt = 'SCHEDULED_AT',
  Tag = 'TAG',
  Workflow = 'WORKFLOW',
  WorkflowState = 'WORKFLOW_STATE',
  WorkDay = 'WORK_DAY'
}

export type ReportQuery = {
  __typename?: 'ReportQuery';
  aggregateField: ReportAggregateField;
  byAssignees: Array<FilterElement>;
  byAuthors: Array<FilterElement>;
  byOwners: Array<FilterElement>;
  byPaths: Scalars['String']['output'];
  byProducts: Array<FilterElement>;
  byTags: Array<FilterElement>;
  byTickets: Array<FilterElement>;
  byWorkflowStateAssignees: Array<FilterElement>;
  byWorkflowStates: Array<FilterElement>;
  byWorkflows: Array<FilterElement>;
  chartBy: ReportGroupBy;
  chartByLabel?: Maybe<Scalars['String']['output']>;
  cols: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  cummulative: Scalars['Boolean']['output'];
  fromDate?: Maybe<Scalars['String']['output']>;
  granularity: ReportDateGranularity;
  groupBy?: Maybe<ReportGroupBy>;
  groupByLabel?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isTicketActive?: Maybe<Scalars['Boolean']['output']>;
  isTicketDone?: Maybe<Scalars['Boolean']['output']>;
  isTicketNotStarted?: Maybe<Scalars['Boolean']['output']>;
  isTicketStarted?: Maybe<Scalars['Boolean']['output']>;
  noUnknowns: Scalars['Boolean']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  report: Report;
  reportId: Scalars['Int']['output'];
  rows: Scalars['Int']['output'];
  sameAsPrimaryFilter: Scalars['Boolean']['output'];
  secondaryByAssignees: Array<FilterElement>;
  secondaryByAuthors: Array<FilterElement>;
  secondaryByOwners: Array<FilterElement>;
  secondaryByPaths: Scalars['String']['output'];
  secondaryByProducts: Array<FilterElement>;
  secondaryByTags: Array<FilterElement>;
  secondaryByTickets: Array<FilterElement>;
  secondaryByWorkflowStateAssignees: Array<FilterElement>;
  secondaryByWorkflowStates: Array<FilterElement>;
  secondaryByWorkflows: Array<FilterElement>;
  secondaryChartBy?: Maybe<ReportGroupBy>;
  secondaryChartByLabel?: Maybe<Scalars['String']['output']>;
  secondaryGroupBy?: Maybe<ReportGroupBy>;
  secondaryGroupByLabel?: Maybe<Scalars['String']['output']>;
  secondaryIsTicketActive?: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketDone?: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketNotStarted?: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketStarted?: Maybe<Scalars['Boolean']['output']>;
  title: Scalars['String']['output'];
  untilDate?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  values: ReportAggregate;
  widgetType: ReportWidgetType;
};

export enum ReportWidgetType {
  Calendar = 'CALENDAR',
  CompareThroughTime = 'COMPARE_THROUGH_TIME',
  CompareValuesNow = 'COMPARE_VALUES_NOW',
  ValuesBrokenDownNow = 'VALUES_BROKEN_DOWN_NOW',
  ValuesNow = 'VALUES_NOW',
  ValuesThroughTime = 'VALUES_THROUGH_TIME'
}

export type RequestDemoInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  proof: Scalars['String']['input'];
};

export type Role = {
  __typename?: 'Role';
  assignments: Array<TicketWorkflowState>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  checklists: Array<Todo>;
  coverUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  notes: Array<Note>;
  notifications: Array<Notification>;
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  pinnedProjects: Array<Project>;
  preferences: RolePreferences;
  roleAutoResume?: Maybe<RoleAutoResume>;
  roleEmail?: Maybe<RoleEmail>;
  roleStartReminder?: Maybe<RoleStartReminder>;
  skills: Array<Skill>;
  status: RoleStatus;
  teams: Array<Team>;
  ticketsAuthored: Array<Ticket>;
  ticketsOwned: Array<Ticket>;
  ticketsWatched: Array<Ticket>;
  timeZone: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: RoleType;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['Int']['output'];
  workWeek: WorkWeekTime;
};

export type RoleAutoResume = {
  __typename?: 'RoleAutoResume';
  id: Scalars['Int']['output'];
  nextStartNotificationDate: Scalars['DateTime']['output'];
  nextStartNotificationOptOut: Scalars['Boolean']['output'];
  roleId: Scalars['Int']['output'];
};

export type RoleEmail = {
  __typename?: 'RoleEmail';
  id: Scalars['Int']['output'];
  nextWorkDayNotificationDate: Scalars['DateTime']['output'];
  nextWorkDayNotificationOffset: Scalars['Int']['output'];
  nextWorkDayNotificationOptOut: Scalars['Boolean']['output'];
  roleId: Scalars['Int']['output'];
};

export type RoleHabit = {
  __typename?: 'RoleHabit';
  productWorkflows: Array<HabitProductWorkflow>;
  projects: Array<Project>;
};

export type RoleNoteColorPreferences = {
  __typename?: 'RoleNoteColorPreferences';
  BLUE: Scalars['String']['output'];
  GREEN: Scalars['String']['output'];
  ORANGE: Scalars['String']['output'];
  PINK: Scalars['String']['output'];
  PURPLE: Scalars['String']['output'];
  YELLOW: Scalars['String']['output'];
};

export type RolePreferences = {
  __typename?: 'RolePreferences';
  lastProjectId?: Maybe<Scalars['Int']['output']>;
  noteColors: RoleNoteColorPreferences;
  recentSearchHits: Array<Scalars['String']['output']>;
  recentlyVisited: Array<Scalars['String']['output']>;
  showOnboarding: Scalars['Boolean']['output'];
};

export type RoleStartReminder = {
  __typename?: 'RoleStartReminder';
  id: Scalars['Int']['output'];
  nextStartNotificationDate: Scalars['DateTime']['output'];
  nextStartNotificationOffset: Scalars['Int']['output'];
  nextStartNotificationOptOut: Scalars['Boolean']['output'];
  roleId: Scalars['Int']['output'];
};

export enum RoleStatus {
  Accepted = 'ACCEPTED',
  Deactivated = 'DEACTIVATED',
  Invited = 'INVITED',
  Rejected = 'REJECTED'
}

export enum RoleType {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Owner = 'OWNER',
  Visitor = 'VISITOR'
}

export type RoleWorkDay = {
  __typename?: 'RoleWorkDay';
  startTime: Scalars['String']['output'];
  stopTime: Scalars['String']['output'];
};

export type RoleWorkload = {
  __typename?: 'RoleWorkload';
  hours: Scalars['Float']['output'];
  role: Role;
};

export type ScheduleConfig = {
  __typename?: 'ScheduleConfig';
  createdAt: Scalars['DateTime']['output'];
  features: Array<Feature>;
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  priority: Scalars['Int']['output'];
  products: Array<Product>;
  projects: Array<Project>;
  tags: Array<Tag>;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime']['output'];
  workflows: Array<Workflow>;
};

export type ScheduleConfigForEstimateInput = {
  features: Array<ScheduleItemForEstimateObjInput>;
  priority: Scalars['Int']['input'];
  products: Array<ScheduleItemForEstimateObjInput>;
  projects: Array<ScheduleItemForEstimateObjInput>;
  tags: Array<ScheduleItemForEstimateObjInput>;
  tickets: Array<ScheduleItemForEstimateObjInput>;
  workflows: Array<ScheduleItemForEstimateObjInput>;
};

export type ScheduleEstimate = {
  __typename?: 'ScheduleEstimate';
  duration: Scalars['Int']['output'];
  roleId: Scalars['Int']['output'];
  startEpoch: Scalars['Int']['output'];
  start_min: Scalars['Int']['output'];
  stopEpoch: Scalars['Int']['output'];
  ticketId: Scalars['Int']['output'];
  ticketLocalId: Scalars['Int']['output'];
  ticketProductCode: Scalars['String']['output'];
  ticketTitle: Scalars['String']['output'];
  ticketWorkflowStateId: Scalars['Int']['output'];
  ticketWorkflowStateName: Scalars['String']['output'];
};

export type ScheduleItem = {
  __typename?: 'ScheduleItem';
  autoStarted: Scalars['Boolean']['output'];
  autoStopped: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  done: Scalars['Boolean']['output'];
  extendedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  nextTicketWorkflowState?: Maybe<TicketWorkflowState>;
  nextTicketWorkflowStateId?: Maybe<Scalars['Int']['output']>;
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  role: Role;
  roleId: Scalars['Int']['output'];
  startedAt: Scalars['DateTime']['output'];
  stoppedAt?: Maybe<Scalars['DateTime']['output']>;
  ticket: Ticket;
  ticketId: Scalars['Int']['output'];
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ScheduleItemForEstimateObjInput = {
  id: Scalars['Int']['input'];
};

export type ScheduleItemUpdateBoundaries = {
  __typename?: 'ScheduleItemUpdateBoundaries';
  maxDate?: Maybe<Scalars['DateTime']['output']>;
  minDate?: Maybe<Scalars['DateTime']['output']>;
};

export type ScheduleRole = {
  __typename?: 'ScheduleRole';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  futureCapacity: Scalars['Float']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  pastCapacity: Scalars['Float']['output'];
  title?: Maybe<Scalars['String']['output']>;
};

export enum ScheduleStatus {
  AssigneeDeactivated = 'ASSIGNEE_DEACTIVATED',
  Blocked = 'BLOCKED',
  Ok = 'OK'
}

export type SearchResult = {
  __typename?: 'SearchResult';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  meta: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Skill = {
  __typename?: 'Skill';
  createdAt: Scalars['DateTime']['output'];
  feature: Feature;
  featureId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  role: Role;
  roleId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['Float']['output'];
};

export type Tag = {
  __typename?: 'Tag';
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']['output']>;
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  replacedBy?: Maybe<Tag>;
  replacedByTagId?: Maybe<Scalars['Int']['output']>;
  replacesTags: Array<Tag>;
  ticketCount: Scalars['Int']['output'];
  tickets: PaginatedTickets;
  updatedAt: Scalars['DateTime']['output'];
};


export type TagTicketsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type Team = {
  __typename?: 'Team';
  code: Scalars['String']['output'];
  coverUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  memberIds: Array<Scalars['Int']['output']>;
  members: Array<Role>;
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type DocumentBody = {
  __typename?: 'DocumentBody';
  markdown: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type DocumentBodyConflict = {
  __typename?: 'DocumentBodyConflict';
  markdown: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type MentionWarning = {
  __typename?: 'MentionWarning';
  kind: Scalars['String']['output'];
  reference: Scalars['String']['output'];
  matches?: Maybe<Scalars['Int']['output']>;
};

export type SaveDocumentBodyResult = {
  __typename?: 'SaveDocumentBodyResult';
  body?: Maybe<DocumentBody>;
  conflict?: Maybe<DocumentBodyConflict>;
  warnings: Array<MentionWarning>;
};

export type Ticket = {
  __typename?: 'Ticket';
  ancestors: Array<Ticket>;
  archivedAt?: Maybe<Scalars['DateTime']['output']>;
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']['output']>;
  body: DocumentBody;
  cases: Array<Issue>;
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  closingNote?: Maybe<Scalars['String']['output']>;
  comments: PaginatedComments;
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['Int']['output']>;
  estimate: Scalars['Int']['output'];
  estimating: Scalars['Boolean']['output'];
  eta?: Maybe<Scalars['DateTime']['output']>;
  features: Array<Feature>;
  folderId?: Maybe<Scalars['Int']['output']>;
  foreignId?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  indexableContent: Scalars['String']['output'];
  isWatching: Scalars['Boolean']['output'];
  issues: Array<Issue>;
  lastScheduleItem?: Maybe<ScheduleItem>;
  localId?: Maybe<Scalars['Int']['output']>;
  milestone: Scalars['Boolean']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  owner?: Maybe<Role>;
  ownerId?: Maybe<Scalars['Int']['output']>;
  personalTags: Array<PersonalTag>;
  product?: Maybe<Product>;
  productId?: Maybe<Scalars['Int']['output']>;
  progress: Scalars['Float']['output'];
  project: Project;
  projectId: Scalars['Int']['output'];
  scheduleItems: Array<ScheduleItem>;
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  stage: ModelStage;
  state?: Maybe<TicketWorkflowState>;
  status: TicketStatus;
  successors: Array<Ticket>;
  tags: Array<Tag>;
  ticketWorkflowStates: Array<TicketWorkflowState>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  watchers: Array<Role>;
  workflow?: Maybe<Workflow>;
  workflowId?: Maybe<Scalars['Int']['output']>;
};


export type TicketCommentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type TicketBatchPayload = {
  __typename?: 'TicketBatchPayload';
  count: Scalars['Int']['output'];
};

export type TicketDependency = {
  __typename?: 'TicketDependency';
  ancestors: Array<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  localId?: Maybe<Scalars['Int']['output']>;
  milestone: Scalars['Boolean']['output'];
  productCode?: Maybe<Scalars['String']['output']>;
  projectId?: Maybe<Scalars['Int']['output']>;
  status: TicketStatus;
  successors: Array<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
};

export type TicketExport = {
  __typename?: 'TicketExport';
  ancestor_tickets: Scalars['String']['output'];
  author_email: Scalars['String']['output'];
  author_name: Scalars['String']['output'];
  closed_at: Scalars['String']['output'];
  created_at: Scalars['String']['output'];
  description: Scalars['String']['output'];
  eta: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  local_id: Scalars['String']['output'];
  owner_email: Scalars['String']['output'];
  owner_name: Scalars['String']['output'];
  product: Scalars['String']['output'];
  project: Scalars['String']['output'];
  scheduled_at: Scalars['String']['output'];
  stage: ModelStage;
  status: TicketStatus;
  successor_tickets: Scalars['String']['output'];
  tags: Scalars['String']['output'];
  title: Scalars['String']['output'];
  workflow: Scalars['String']['output'];
};

export type TicketOpenByWorkflowDatum = {
  __typename?: 'TicketOpenByWorkflowDatum';
  date: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

export enum TicketStatus {
  Cancelled = 'CANCELLED',
  Done = 'DONE',
  Scheduled = 'SCHEDULED',
  Unscheduled = 'UNSCHEDULED'
}

export type TicketWorkflowState = {
  __typename?: 'TicketWorkflowState';
  assignee?: Maybe<Role>;
  assigneeId?: Maybe<Scalars['Int']['output']>;
  checklist: Array<ChecklistItem>;
  complete: Scalars['Int']['output'];
  estimate?: Maybe<Scalars['DateTime']['output']>;
  estimateMaximum?: Maybe<Scalars['Int']['output']>;
  estimateMinimum?: Maybe<Scalars['Int']['output']>;
  estimateMostLikely?: Maybe<Scalars['Int']['output']>;
  estimateSet?: Maybe<Estimate>;
  fractionable: Scalars['Boolean']['output'];
  fromTicketWorkflowStateNotes: Array<TicketWorkflowStateNote>;
  id: Scalars['Int']['output'];
  isActive: Scalars['Boolean']['output'];
  isBlocked: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  nextScheduleItems: Array<ScheduleItem>;
  position: Scalars['Int']['output'];
  scheduleItems: Array<ScheduleItem>;
  ticket: Ticket;
  ticketId: Scalars['Int']['output'];
  ticketWorkflowStateNotes: Array<TicketWorkflowStateNote>;
  todo: Scalars['Int']['output'];
  workflowState?: Maybe<WorkflowState>;
  workflowStateId?: Maybe<Scalars['Int']['output']>;
};

export type TicketWorkflowStateInput = {
  assigneeId?: InputMaybe<Scalars['Int']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type TicketWorkflowStateNote = {
  __typename?: 'TicketWorkflowStateNote';
  author: Role;
  authorId: Scalars['Int']['output'];
  body: Scalars['String']['output'];
  category: TicketWorkflowStateNoteCategory;
  createdAt: Scalars['DateTime']['output'];
  fromTicketWorkflowState: TicketWorkflowState;
  fromTicketWorkflowStateId: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateId: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum TicketWorkflowStateNoteCategory {
  BlockNote = 'BLOCK_NOTE',
  CloseNote = 'CLOSE_NOTE',
  StateNote = 'STATE_NOTE',
  UnblockNote = 'UNBLOCK_NOTE'
}

export type TimeOff = {
  __typename?: 'TimeOff';
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  role: Role;
  roleId: Scalars['Int']['output'];
  startAt: Scalars['DateTime']['output'];
  stopAt: Scalars['DateTime']['output'];
};

export type Todo = {
  __typename?: 'Todo';
  body: Scalars['String']['output'];
  checked: Scalars['Boolean']['output'];
  checkedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dueDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  owner: Role;
  ownerId: Scalars['Int']['output'];
};

export type UpdateBlackoutTimeInput = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type UpdateChecklistInput = {
  checked?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
};

export type UpdateCommentInput = {
  body: Scalars['String']['input'];
};

export type UpdateDocumentationInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDocumentationPageConfigInput = {
  customId?: InputMaybe<Scalars['String']['input']>;
  keywords: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  urls: Array<Scalars['String']['input']>;
};

export type UpdateDocumentationPageInput = {
  body: Scalars['String']['input'];
};

export type UpdateDrawingInput = {
  data: Scalars['String']['input'];
  renewLock?: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt: Scalars['DateTime']['input'];
};

export type UpdateFeatureGroupInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFeatureInput = {
  name: Scalars['String']['input'];
};

export type UpdateIssueInput = {
  archived?: InputMaybe<Scalars['Boolean']['input']>;
  assigneeId?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<IssueStatus>;
  ticketId?: InputMaybe<Scalars['Int']['input']>;
  unread?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateMyRoleInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  coverUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timeZone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNoteInput = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationAddressInput = {
  address1: Scalars['String']['input'];
  address2?: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  state: Scalars['String']['input'];
  zipcode: Scalars['String']['input'];
};

export type UpdateOrganizationInput = {
  billingAddress?: InputMaybe<UpdateOrganizationAddressInput>;
  coverUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationPreferencesInput = {
  showOnboarding: Scalars['Boolean']['input'];
};

export type UpdatePersonalTagInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  coverUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isSupportActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectChecklistInput = {
  checked?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
};

export type UpdateRecurringBlackoutTimeInput = {
  disabled?: InputMaybe<Scalars['Boolean']['input']>;
  friday?: InputMaybe<Scalars['Boolean']['input']>;
  monday?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  saturday?: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['String']['input'];
  stopTime: Scalars['String']['input'];
  sunday?: InputMaybe<Scalars['Boolean']['input']>;
  thursday?: InputMaybe<Scalars['Boolean']['input']>;
  timeZone: Scalars['String']['input'];
  tuesday?: InputMaybe<Scalars['Boolean']['input']>;
  wednesday?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateReplyInput = {
  body: Scalars['String']['input'];
};

export type UpdateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  chartBy: ReportGroupBy;
  chartByLabel?: InputMaybe<Scalars['String']['input']>;
  cummulative?: InputMaybe<Scalars['Boolean']['input']>;
  fromDate?: InputMaybe<Scalars['String']['input']>;
  granularity?: InputMaybe<ReportDateGranularity>;
  groupBy?: InputMaybe<ReportGroupBy>;
  groupByLabel?: InputMaybe<Scalars['String']['input']>;
  isTicketActive?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketCancelled?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketDone?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketNotStarted?: InputMaybe<Scalars['Boolean']['input']>;
  isTicketStarted?: InputMaybe<Scalars['Boolean']['input']>;
  noUnknowns?: InputMaybe<Scalars['Boolean']['input']>;
  ownerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  paths?: InputMaybe<Array<Scalars['String']['input']>>;
  productIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  sameAsPrimaryFilter?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryAuthorIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryChartBy?: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel?: InputMaybe<Scalars['String']['input']>;
  secondaryGroupBy?: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel?: InputMaybe<Scalars['String']['input']>;
  secondaryIsTicketActive?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketCancelled?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketDone?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketNotStarted?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketStarted?: InputMaybe<Scalars['Boolean']['input']>;
  secondaryOwnerIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryPaths?: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryProductIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTicketIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  tagIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  ticketIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  title: Scalars['String']['input'];
  untilDate?: InputMaybe<Scalars['String']['input']>;
  workflowIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateAssigneeIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type UpdateReportQueryPlacementInput = {
  direction: Scalars['String']['input'];
};

export type UpdateReportQuerySizeInput = {
  cols: Scalars['Int']['input'];
  rows: Scalars['Int']['input'];
};

export type UpdateRoleAutoResumeInput = {
  nextStartNotificationOptOut: Scalars['Boolean']['input'];
};

export type UpdateRoleEmailInput = {
  nextWorkDayNotificationOptOut: Scalars['Boolean']['input'];
};

export type UpdateRoleInput = {
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<RoleType>;
};

export type UpdateRoleNoteColorsInput = {
  color: NoteColor;
  value: Scalars['String']['input'];
};

export type UpdateRolePreferencesInput = {
  showOnboarding: Scalars['Boolean']['input'];
};

export type UpdateRoleStartReminderInput = {
  nextStartNotificationOptOut: Scalars['Boolean']['input'];
};

export type UpdateRoleWorkWeekInput = {
  friday: Array<InputMaybe<WorkDayTimeInput>>;
  monday: Array<InputMaybe<WorkDayTimeInput>>;
  saturday: Array<InputMaybe<WorkDayTimeInput>>;
  sunday: Array<InputMaybe<WorkDayTimeInput>>;
  thursday: Array<InputMaybe<WorkDayTimeInput>>;
  tuesday: Array<InputMaybe<WorkDayTimeInput>>;
  wednesday: Array<InputMaybe<WorkDayTimeInput>>;
};

export type UpdateScheduleConfig = {
  priority: Scalars['Int']['input'];
  productIds: Array<Scalars['Int']['input']>;
  projectIds: Array<Scalars['Int']['input']>;
  tagIds: Array<Scalars['Int']['input']>;
  ticketIds: Array<Scalars['Int']['input']>;
  workflowIds: Array<Scalars['Int']['input']>;
};

export type UpdateScheduleConfigs = {
  configs: Array<UpdateScheduleConfig>;
};

export type UpdateScheduleItemInput = {
  startedAt: Scalars['String']['input'];
  stoppedAt?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSkillInput = {
  value: Scalars['Float']['input'];
};

export type UpdateTagInput = {
  color: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  coverUrl?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTicketInput = {
  difficulty?: InputMaybe<Scalars['Int']['input']>;
  estimating?: InputMaybe<Scalars['Boolean']['input']>;
  milestone?: InputMaybe<Scalars['Boolean']['input']>;
  ownerId?: InputMaybe<Scalars['Int']['input']>;
  productId?: InputMaybe<Scalars['Int']['input']>;
  projectId?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  workflowId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTicketWorkflowStateInput = {
  states: Array<TicketWorkflowStateInput>;
};

export type UpdateTimeOffInput = {
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type UpdateTodoInput = {
  body?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserPreferencesInput = {
  favoriteOrganizations: Array<Scalars['Int']['input']>;
  lastOrganizationId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWorkflowInput = {
  color: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  isDefaultWorkflow?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateWorkflowStateInput = {
  backupTeamIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  name: Scalars['String']['input'];
  teamIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isStaff: Scalars['Boolean']['output'];
  preferences: UserPreferences;
  role: Role;
  roles: Array<Role>;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  favoriteOrganizations: Array<Scalars['Int']['output']>;
  lastOrganizationId?: Maybe<Scalars['Int']['output']>;
};

export enum UserStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Invited = 'INVITED',
  Suspended = 'SUSPENDED',
  Unconfirmed = 'UNCONFIRMED'
}

export type WorkDayTimeInput = {
  startTime: Scalars['String']['input'];
  stopTime: Scalars['String']['input'];
};

export type WorkWeekTime = {
  __typename?: 'WorkWeekTime';
  friday: Array<RoleWorkDay>;
  monday: Array<RoleWorkDay>;
  saturday: Array<RoleWorkDay>;
  sunday: Array<RoleWorkDay>;
  thursday: Array<RoleWorkDay>;
  tuesday: Array<RoleWorkDay>;
  wednesday: Array<RoleWorkDay>;
};

export type Workflow = {
  __typename?: 'Workflow';
  color: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  isDefaultWorkflow: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  products: Array<Product>;
  scheduleConfigs: Array<ScheduleConfig>;
  stage: ModelStage;
  states: Array<WorkflowState>;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime']['output'];
};

export type WorkflowDistribution = {
  __typename?: 'WorkflowDistribution';
  hours: Scalars['Float']['output'];
  workflow: Workflow;
};

export type WorkflowState = {
  __typename?: 'WorkflowState';
  TicketWorkflowState: Array<TicketWorkflowState>;
  backupTeams: Array<Team>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  organization: Organization;
  organizationId: Scalars['Int']['output'];
  position: Scalars['Int']['output'];
  teams: Array<Team>;
  updatedAt: Scalars['DateTime']['output'];
  workflow: Workflow;
  workflowId: Scalars['Int']['output'];
};

/** Used to move a state amongst a workflow */
export enum WorkflowStateDirection {
  Down = 'down',
  First = 'first',
  Last = 'last',
  Up = 'up'
}
