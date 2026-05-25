export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: unknown; output: unknown; }
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
  ownerId: InputMaybe<Scalars['Int']['input']>;
  projectId: InputMaybe<Scalars['Int']['input']>;
};

export type BlackoutTime = {
  __typename?: 'BlackoutTime';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  disabled: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  roles: Maybe<Array<Role>>;
  startAt: Maybe<Scalars['DateTime']['output']>;
  stopAt: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
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
  fractionable: InputMaybe<Scalars['Boolean']['input']>;
  maximum: InputMaybe<Scalars['Int']['input']>;
  minimum: InputMaybe<Scalars['Int']['input']>;
  mostLikely: InputMaybe<Scalars['Int']['input']>;
  roleId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  checked: Maybe<Scalars['Boolean']['output']>;
  label: Maybe<Scalars['String']['output']>;
};

export type ClientUpdateIssueInput = {
  hash: Scalars['String']['input'];
  imageUrl: InputMaybe<Scalars['String']['input']>;
  message: InputMaybe<Scalars['String']['input']>;
  proof: Scalars['String']['input'];
  status: InputMaybe<IssueStatus>;
};

export type CloseScheduleItemInput = {
  done: InputMaybe<Scalars['Boolean']['input']>;
  nextTicketWorkflowStateId: InputMaybe<Scalars['Int']['input']>;
  note: InputMaybe<Scalars['String']['input']>;
  stoppedAt: InputMaybe<Scalars['String']['input']>;
};

export type Comment = {
  __typename?: 'Comment';
  acceptedReply: Maybe<CommentReply>;
  acceptedReplyId: Maybe<Scalars['Int']['output']>;
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  body: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  replies: Maybe<Array<CommentReply>>;
  replyCount: Maybe<Scalars['Int']['output']>;
  ticket: Maybe<Ticket>;
  ticketId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type CommentReply = {
  __typename?: 'CommentReply';
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  body: Maybe<Scalars['String']['output']>;
  commentId: Maybe<Scalars['Int']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organizationId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type CreateBlackoutTimeInput = {
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type CreateCommentInput = {
  body: InputMaybe<Scalars['String']['input']>;
};

export type CreateDocumentationInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateDocumentationPageInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateDrawingInput = {
  data: InputMaybe<Scalars['String']['input']>;
};

export type CreateFeatureGroupInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  productId: Scalars['Int']['input'];
};

export type CreateNoteInput = {
  body: InputMaybe<Scalars['String']['input']>;
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
  description: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateProjectInput = {
  name: Scalars['String']['input'];
  parentId: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRecurringBlackoutTimeInput = {
  friday: InputMaybe<Scalars['Boolean']['input']>;
  monday: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  saturday: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['String']['input'];
  stopTime: Scalars['String']['input'];
  sunday: InputMaybe<Scalars['Boolean']['input']>;
  thursday: InputMaybe<Scalars['Boolean']['input']>;
  tuesday: InputMaybe<Scalars['Boolean']['input']>;
  wednesday: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateReportInput = {
  name: Scalars['String']['input'];
};

export type CreateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  chartBy: ReportGroupBy;
  chartByLabel: InputMaybe<Scalars['String']['input']>;
  cummulative: InputMaybe<Scalars['Boolean']['input']>;
  fromDate: InputMaybe<Scalars['String']['input']>;
  granularity: InputMaybe<ReportDateGranularity>;
  groupBy: InputMaybe<ReportGroupBy>;
  groupByLabel: InputMaybe<Scalars['String']['input']>;
  isTicketActive: InputMaybe<Scalars['Boolean']['input']>;
  isTicketCancelled: InputMaybe<Scalars['Boolean']['input']>;
  isTicketDone: InputMaybe<Scalars['Boolean']['input']>;
  isTicketNotStarted: InputMaybe<Scalars['Boolean']['input']>;
  isTicketStarted: InputMaybe<Scalars['Boolean']['input']>;
  noUnknowns: InputMaybe<Scalars['Boolean']['input']>;
  ownerIds: InputMaybe<Array<Scalars['Int']['input']>>;
  paths: InputMaybe<Array<Scalars['String']['input']>>;
  productIds: InputMaybe<Array<Scalars['Int']['input']>>;
  sameAsPrimaryFilter: InputMaybe<Scalars['Boolean']['input']>;
  secondaryAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryAuthorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryChartBy: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel: InputMaybe<Scalars['String']['input']>;
  secondaryGroupBy: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel: InputMaybe<Scalars['String']['input']>;
  secondaryIsTicketActive: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketCancelled: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketDone: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketNotStarted: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketStarted: InputMaybe<Scalars['Boolean']['input']>;
  secondaryOwnerIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryPaths: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryProductIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTicketIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateIds: InputMaybe<Array<Scalars['Int']['input']>>;
  tagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  ticketIds: InputMaybe<Array<Scalars['Int']['input']>>;
  title: Scalars['String']['input'];
  untilDate: InputMaybe<Scalars['String']['input']>;
  widgetType: ReportWidgetType;
  workflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateIds: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type CreateScheduleItemInput = {
  startedAt: InputMaybe<Scalars['String']['input']>;
  stoppedAt: InputMaybe<Scalars['String']['input']>;
  ticketId: Scalars['Int']['input'];
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type CreateTagInput = {
  color: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreateTeamInput = {
  code: Scalars['String']['input'];
  description: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateTicketInput = {
  description: InputMaybe<Scalars['String']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  stage: InputMaybe<ModelStage>;
  title: Scalars['String']['input'];
  workflowId: InputMaybe<Scalars['Int']['input']>;
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
  body: InputMaybe<Scalars['String']['input']>;
};

export type CreateWorkflowInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWorkflowStateInput = {
  name: Scalars['String']['input'];
};

export type Ds_Shadow = {
  __typename?: 'DS_Shadow';
  client: Maybe<Scalars['Int']['output']>;
  document: Maybe<Scalars['String']['output']>;
  server: Maybe<Scalars['Int']['output']>;
};

export type DemoRequest = {
  __typename?: 'DemoRequest';
  config: Maybe<Scalars['String']['output']>;
  confirmed: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  ip_address: Maybe<Scalars['String']['output']>;
  status: Maybe<DemoStatus>;
};

export enum DemoStatus {
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Queued = 'QUEUED',
  Ready = 'READY'
}

export type DependencySet = {
  __typename?: 'DependencySet';
  projects: Maybe<Array<ProjectDependency>>;
  tickets: Maybe<Array<TicketDependency>>;
};

export type Documentation = {
  __typename?: 'Documentation';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  documentationPages: Maybe<Array<DocumentationPage>>;
  id: Maybe<Scalars['Int']['output']>;
  lastPublishRequestAt: Maybe<Scalars['DateTime']['output']>;
  lastPublishedAt: Maybe<Scalars['DateTime']['output']>;
  logoUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  stage: Maybe<ModelStage>;
  titles: Maybe<Array<MiniDocumentationPage>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type DocumentationPage = {
  __typename?: 'DocumentationPage';
  body: Maybe<Scalars['String']['output']>;
  children: Maybe<Array<DocumentationPage>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  customId: Maybe<Scalars['String']['output']>;
  documentation: Maybe<Documentation>;
  documentationId: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  parent: Maybe<DocumentationPage>;
  parentId: Maybe<Scalars['Int']['output']>;
  position: Maybe<Scalars['Int']['output']>;
  title: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type Drawing = {
  __typename?: 'Drawing';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  data: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  lockExpiration: Maybe<Scalars['DateTime']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  role: Maybe<Role>;
  roleId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type DuplicateReportInput = {
  name: Scalars['String']['input'];
};

export type Estimate = {
  __typename?: 'Estimate';
  assignee: Maybe<Role>;
  assigneeId: Maybe<Scalars['Int']['output']>;
  end: Maybe<Scalars['Int']['output']>;
  end_max: Maybe<Scalars['Int']['output']>;
  end_min: Maybe<Scalars['Int']['output']>;
  end_p50: Maybe<Scalars['Int']['output']>;
  end_p70: Maybe<Scalars['Int']['output']>;
  end_p80: Maybe<Scalars['Int']['output']>;
  end_p90: Maybe<Scalars['Int']['output']>;
  end_p95: Maybe<Scalars['Int']['output']>;
  epoch: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organizationId: Maybe<Scalars['Int']['output']>;
  start: Maybe<Scalars['Int']['output']>;
  start_max: Maybe<Scalars['Int']['output']>;
  start_min: Maybe<Scalars['Int']['output']>;
  start_p50: Maybe<Scalars['Int']['output']>;
  start_p70: Maybe<Scalars['Int']['output']>;
  start_p80: Maybe<Scalars['Int']['output']>;
  start_p90: Maybe<Scalars['Int']['output']>;
  start_p95: Maybe<Scalars['Int']['output']>;
  type: Maybe<EstimateType>;
  updatedEpoch: Maybe<Scalars['Int']['output']>;
};

export type EstimateTicketWorkflowStateInput = {
  fractionable: InputMaybe<Scalars['Boolean']['input']>;
  maximum: InputMaybe<Scalars['Int']['input']>;
  minimum: InputMaybe<Scalars['Int']['input']>;
  mostLikely: InputMaybe<Scalars['Int']['input']>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export enum EstimateType {
  TicketWorkflowState = 'TicketWorkflowState'
}

export type Feature = {
  __typename?: 'Feature';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  featureGroup: Maybe<FeatureGroup>;
  featureGroupId: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  scheduleConfigs: Maybe<Array<ScheduleConfig>>;
  skills: Maybe<Array<Skill>>;
  tickets: Maybe<Array<Ticket>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type FeatureDistribution = {
  __typename?: 'FeatureDistribution';
  feature: Maybe<Feature>;
  featureGroup: Maybe<FeatureGroup>;
  hours: Maybe<Scalars['Float']['output']>;
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  documentation: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  report: Maybe<Scalars['Boolean']['output']>;
  support: Maybe<Scalars['Boolean']['output']>;
};

export type FeatureGroup = {
  __typename?: 'FeatureGroup';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  features: Maybe<Array<Feature>>;
  id: Maybe<Scalars['Int']['output']>;
  isActive: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  product: Maybe<Product>;
  productId: Maybe<Scalars['Int']['output']>;
  status: Maybe<FeatureGroupStatus>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export enum FeatureGroupStatus {
  Active = 'ACTIVE',
  Deprecated = 'DEPRECATED'
}

export type FilterElement = {
  __typename?: 'FilterElement';
  id: Maybe<Scalars['ID']['output']>;
  label: Maybe<Scalars['String']['output']>;
  recordId: Maybe<Scalars['Int']['output']>;
};

export type HabitProductWorkflow = {
  __typename?: 'HabitProductWorkflow';
  product: Maybe<Product>;
  workflow: Maybe<Workflow>;
};

export type ImportTicketsInput = {
  productId: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  tickets: Array<ImportTicketsInputDetail>;
  workflowId: InputMaybe<Scalars['Int']['input']>;
};

export type ImportTicketsInputDetail = {
  ancestorIds: InputMaybe<Scalars['String']['input']>;
  authorEmail: InputMaybe<Scalars['String']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['String']['input']>;
  ownerEmail: InputMaybe<Scalars['String']['input']>;
  successorIds: InputMaybe<Scalars['String']['input']>;
  tags: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type InviteInput = {
  roleType: InputMaybe<RoleType>;
  userEmail: Scalars['String']['input'];
  userName: InputMaybe<Scalars['String']['input']>;
};

export type Issue = {
  __typename?: 'Issue';
  archived: Maybe<Scalars['Boolean']['output']>;
  assignee: Maybe<Role>;
  assigneeId: Maybe<Scalars['Int']['output']>;
  context: Maybe<IssueContext>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  issueActions: Maybe<Array<IssueAction>>;
  localId: Maybe<Scalars['Int']['output']>;
  metaData: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  product: Maybe<Product>;
  productId: Maybe<Scalars['Int']['output']>;
  resolveAfterDate: Maybe<Scalars['DateTime']['output']>;
  status: Maybe<IssueStatus>;
  ticket: Maybe<Ticket>;
  ticketId: Maybe<Scalars['Int']['output']>;
  token: Maybe<Scalars['String']['output']>;
  unread: Maybe<Scalars['Boolean']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  url: Maybe<Scalars['String']['output']>;
  userAgent: Maybe<Scalars['String']['output']>;
};

export type IssueAction = {
  __typename?: 'IssueAction';
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  body: Maybe<Scalars['String']['output']>;
  category: Maybe<IssueActionCategory>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  issue: Maybe<Issue>;
  issueId: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  title: Maybe<Scalars['String']['output']>;
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
  browser: Maybe<Scalars['String']['output']>;
  deviceName: Maybe<Scalars['String']['output']>;
  deviceType: Maybe<Scalars['String']['output']>;
  engine: Maybe<Scalars['String']['output']>;
  os: Maybe<Scalars['String']['output']>;
  osVersion: Maybe<Scalars['String']['output']>;
};

export type IssueSendMessageInput = {
  imageUrl: InputMaybe<Scalars['String']['input']>;
  message: InputMaybe<Scalars['String']['input']>;
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
  organization: Maybe<Organization>;
  role: Maybe<Role>;
  status: Maybe<AuthStatus>;
  user: Maybe<User>;
};

export type MiniDocumentationPage = {
  __typename?: 'MiniDocumentationPage';
  id: Maybe<Scalars['Int']['output']>;
  parentId: Maybe<Scalars['Int']['output']>;
  position: Maybe<Scalars['Int']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type MiniFeature = {
  __typename?: 'MiniFeature';
  featureGroupName: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  productCode: Maybe<Scalars['String']['output']>;
  productName: Maybe<Scalars['String']['output']>;
};

export type MiniProduct = {
  __typename?: 'MiniProduct';
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  stage: Maybe<ModelStage>;
};

export type MiniProject = {
  __typename?: 'MiniProject';
  ancestorIsArchived: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Scalars['Int']['output']>;
  stage: Maybe<ModelStage>;
};

export type MiniRole = {
  __typename?: 'MiniRole';
  avatarUrl: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type MiniTag = {
  __typename?: 'MiniTag';
  color: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type MiniWorkflow = {
  __typename?: 'MiniWorkflow';
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  stage: Maybe<ModelStage>;
};

export enum ModelStage {
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export type Mutation = {
  __typename?: 'Mutation';
  acceptReply: Maybe<Comment>;
  acceptRole: Maybe<Role>;
  addChildToDocumentationPage: Maybe<DocumentationPage>;
  addFeature: Maybe<FeatureGroup>;
  addFeatureGroup: Maybe<Product>;
  addMembers: Maybe<Team>;
  addReply: Maybe<CommentReply>;
  addTicketAncestor: Maybe<Ticket>;
  addTicketFeatures: Maybe<Ticket>;
  addTicketPersonalTags: Maybe<Ticket>;
  addTicketTags: Maybe<Ticket>;
  /** @deprecated We store and display recently visited project and ticket instead */
  addToRecentSearchHit: Maybe<Role>;
  addWorkflowState: Maybe<Workflow>;
  addWorkflows: Maybe<Product>;
  archiveProject: Maybe<Project>;
  batchUpdateTicketTags: Maybe<Array<Ticket>>;
  batchUpdateTickets: Maybe<TicketBatchPayload>;
  blockTicket: Maybe<Ticket>;
  changeEmail: Maybe<User>;
  changePassword: Maybe<User>;
  changeTicketWorkflowStateAssignee: Maybe<Ticket>;
  checkTodo: Maybe<Todo>;
  /** Close (or update an already closed) last known ticket workflow state */
  closeLastScheduleItem: Maybe<ScheduleItem>;
  /** Close an active workflow state */
  closeScheduleItem: Maybe<ScheduleItem>;
  commitScheduleChanges: Maybe<Scalars['Boolean']['output']>;
  createBlackoutTime: Maybe<BlackoutTime>;
  createComment: Maybe<Ticket>;
  createDocumentation: Maybe<Documentation>;
  createDocumentationPage: Maybe<DocumentationPage>;
  createDrawing: Maybe<Drawing>;
  createFeatureGroup: Maybe<FeatureGroup>;
  createNote: Maybe<Note>;
  createOrganization: Maybe<NewOrganization>;
  createPersonalTag: Maybe<PersonalTag>;
  createProduct: Maybe<Product>;
  createProject: Maybe<Project>;
  createRecurringBlackoutTime: Maybe<RecurringBlackoutTime>;
  createReport: Maybe<Report>;
  createReportQuery: Maybe<ReportQuery>;
  createScheduleItem: Maybe<ScheduleItem>;
  createTag: Maybe<Tag>;
  createTeam: Maybe<Team>;
  createTicket: Maybe<Ticket>;
  createTicketPersonalTag: Maybe<Ticket>;
  createTicketTag: Maybe<Ticket>;
  createTimeOff: Maybe<TimeOff>;
  createTodo: Maybe<Todo>;
  createWorkflow: Maybe<Workflow>;
  deleteBlackoutTime: Maybe<Scalars['Int']['output']>;
  deleteComment: Maybe<Scalars['Boolean']['output']>;
  deleteDocumentation: Maybe<Documentation>;
  deleteDocumentationPage: Maybe<DocumentationPage>;
  deleteDocumentationPageFromDoc: Maybe<Documentation>;
  deleteDrawing: Maybe<Drawing>;
  deleteFeature: Maybe<FeatureGroup>;
  deleteFeatureGroup: Maybe<Product>;
  deleteIssue: Maybe<Issue>;
  deleteNote: Maybe<Note>;
  deleteNotification: Maybe<Notification>;
  deletePersonalTag: Maybe<Scalars['Boolean']['output']>;
  /** @deprecated Archive product instead of deleting it */
  deleteProduct: Maybe<Product>;
  deleteProject: Maybe<Scalars['Boolean']['output']>;
  deleteRecurringBlackoutTime: Maybe<Scalars['Int']['output']>;
  deleteReply: Maybe<Scalars['Int']['output']>;
  deleteReport: Maybe<Report>;
  deleteReportQuery: Maybe<Report>;
  deleteRole: Maybe<Role>;
  deleteScheduleItem: Maybe<Scalars['Boolean']['output']>;
  deleteTag: Maybe<Scalars['Boolean']['output']>;
  deleteTeam: Maybe<Scalars['Boolean']['output']>;
  deleteTimeOff: Maybe<TimeOff>;
  deleteTodo: Maybe<Todo>;
  /** @deprecated Archive workflow instead of deleting it */
  deleteWorkflow: Maybe<Workflow>;
  deleteWorkflowState: Maybe<Workflow>;
  duplicateReport: Maybe<Report>;
  estimateTicketWorkflowState: Maybe<TicketWorkflowState>;
  getDrawingLock: Maybe<Drawing>;
  importTickets: Maybe<Array<Ticket>>;
  invite: Maybe<Role>;
  issueAddNote: Maybe<Issue>;
  issueDeleteNote: Maybe<Issue>;
  issueRemoveAutoResolve: Maybe<Issue>;
  issueSendMessage: Maybe<Issue>;
  issueSetAutoResolve: Maybe<Issue>;
  issueUpdateNote: Maybe<IssueAction>;
  login: Maybe<Me>;
  logout: Maybe<Scalars['Boolean']['output']>;
  markTicketNotDone: Maybe<Ticket>;
  moveAfterDocumentationPage: Maybe<DocumentationPage>;
  moveBeforeDocumentationPage: Maybe<DocumentationPage>;
  moveIntoProject: Maybe<Scalars['Boolean']['output']>;
  moveProjectToRoot: Maybe<Project>;
  moveWorkflowState: Maybe<Workflow>;
  passwordLost: Maybe<Scalars['Boolean']['output']>;
  passwordReset: Maybe<Me>;
  pinProject: Maybe<Role>;
  publishDocumentation: Maybe<Documentation>;
  publishProject: Maybe<Project>;
  reactivateRole: Maybe<Role>;
  readNotification: Maybe<Notification>;
  register: Maybe<Me>;
  registerFromInvite: Maybe<Me>;
  rejectRole: Maybe<Role>;
  releaseDrawingLock: Maybe<Drawing>;
  removeMembers: Maybe<Team>;
  removeTicketAncestor: Maybe<Ticket>;
  removeTicketFeatures: Maybe<Ticket>;
  removeTicketPersonalTags: Maybe<Ticket>;
  removeTicketTags: Maybe<Ticket>;
  removeWorkflows: Maybe<Product>;
  renameProject: Maybe<Project>;
  requestDemo: Maybe<DemoRequest>;
  resendInvite: Maybe<Role>;
  resumeLastScheduleItem: Maybe<ScheduleItem>;
  scheduleTicket: Maybe<Ticket>;
  sendConfirmationEmail: Maybe<Scalars['Boolean']['output']>;
  setChecklist: Maybe<TicketWorkflowState>;
  setProjectChecklist: Maybe<Project>;
  skipTicketWorkflowState: Maybe<TicketWorkflowState>;
  toggleOnboarding: Maybe<Organization>;
  unarchiveProject: Maybe<Project>;
  unblockTicket: Maybe<Ticket>;
  unpinProject: Maybe<Role>;
  unpublishDocumentation: Maybe<Documentation>;
  unreadNotification: Maybe<Notification>;
  unwatchTicket: Maybe<Ticket>;
  updateBlackoutTime: Maybe<BlackoutTime>;
  updateComment: Maybe<Comment>;
  updateDocumentation: Maybe<Documentation>;
  updateDocumentationPage: Maybe<DocumentationPage>;
  updateDocumentationPageConfig: Maybe<DocumentationPage>;
  updateDocumentationStage: Maybe<Documentation>;
  updateDrawing: Maybe<Drawing>;
  updateFeature: Maybe<Feature>;
  updateFeatureGroup: Maybe<FeatureGroup>;
  updateIssue: Maybe<Issue>;
  updateIssueByToken: Maybe<Issue>;
  updateMyRole: Maybe<Role>;
  updateMyScheduleItem: Maybe<ScheduleItem>;
  updateNote: Maybe<Note>;
  updateNoteColor: Maybe<Note>;
  updateOrganization: Maybe<Organization>;
  updateOrganizationPreferences: Maybe<Organization>;
  updatePersonalTag: Maybe<PersonalTag>;
  updateProduct: Maybe<Product>;
  updateProductStage: Maybe<Product>;
  updateProductUseGlobalWorkflow: Maybe<Product>;
  /** @deprecated Use renameProject instead */
  updateProjectName: Maybe<Project>;
  updateProjectOwner: Maybe<Project>;
  updateRecurringBlackoutTime: Maybe<RecurringBlackoutTime>;
  updateReply: Maybe<CommentReply>;
  updateReportQuery: Maybe<ReportQuery>;
  updateReportQueryPlacement: Maybe<Array<ReportQuery>>;
  updateReportQuerySize: Maybe<ReportQuery>;
  updateRole: Maybe<Role>;
  updateRoleAutoResume: Maybe<RoleAutoResume>;
  updateRoleEmail: Maybe<RoleEmail>;
  updateRoleNoteColorPreferences: Maybe<Role>;
  updateRolePreferences: Maybe<Role>;
  updateRoleStartReminder: Maybe<RoleStartReminder>;
  updateRoleWorkWeek: Maybe<Role>;
  updateScheduleConfig: Maybe<Array<ScheduleConfig>>;
  /** @deprecated this is a passthrough method */
  updateScheduleItem: Maybe<ScheduleItem>;
  updateSkill: Maybe<Skill>;
  updateTag: Maybe<Tag>;
  updateTeam: Maybe<Team>;
  updateTicket: Maybe<Ticket>;
  updateTicketStage: Maybe<Ticket>;
  updateTicketStatus: Maybe<Ticket>;
  updateTicketWorkflowStates: Maybe<Ticket>;
  updateTimeOff: Maybe<TimeOff>;
  updateTodo: Maybe<Todo>;
  updateUserPreferences: Maybe<User>;
  updateWorkflow: Maybe<Workflow>;
  updateWorkflowStage: Maybe<Workflow>;
  updateWorkflowState: Maybe<Workflow>;
  watchTicket: Maybe<Ticket>;
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
  addTagIds: Array<Scalars['Int']['input']>;
  removeTagIds: Array<Scalars['Int']['input']>;
  ticketIds: Array<Scalars['Int']['input']>;
};


export type MutationBatchUpdateTicketsArgs = {
  input: BatchUpdateTicketsInput;
  ticketIds: Array<Scalars['Int']['input']>;
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
  input: InputMaybe<CloseScheduleItemInput>;
  ticketId: Scalars['Int']['input'];
};


export type MutationCloseScheduleItemArgs = {
  input: InputMaybe<CloseScheduleItemInput>;
  scheduleItemId: Scalars['Int']['input'];
};


export type MutationCommitScheduleChangesArgs = {
  addTicketIds: Array<Scalars['Int']['input']>;
  removeTicketIds: Array<Scalars['Int']['input']>;
  scheduleConfigs: Array<UpdateScheduleConfigInput>;
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


export type MutationScheduleTicketArgs = {
  ticketId: Scalars['Int']['input'];
};


export type MutationSetChecklistArgs = {
  input: Array<UpdateChecklistInput>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};


export type MutationSetProjectChecklistArgs = {
  input: Array<UpdateProjectChecklistInput>;
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
  ownerId: InputMaybe<Scalars['Int']['input']>;
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
  input: UpdateScheduleConfigsInput;
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
  note: InputMaybe<Scalars['String']['input']>;
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
  currentState: Maybe<TicketWorkflowState>;
  isActive: Maybe<Scalars['Boolean']['output']>;
  isDone: Maybe<Scalars['Boolean']['output']>;
  isNext: Maybe<Scalars['Boolean']['output']>;
  isPaused: Maybe<Scalars['Boolean']['output']>;
  isStarted: Maybe<Scalars['Boolean']['output']>;
  lastState: Maybe<TicketWorkflowState>;
  ticket: Maybe<Ticket>;
};

export type MyUpcomingAssignedTicket = {
  __typename?: 'MyUpcomingAssignedTicket';
  currentState: Maybe<TicketWorkflowState>;
  isActive: Maybe<Scalars['Boolean']['output']>;
  isDone: Maybe<Scalars['Boolean']['output']>;
  isNext: Maybe<Scalars['Boolean']['output']>;
  isPaused: Maybe<Scalars['Boolean']['output']>;
  isStarted: Maybe<Scalars['Boolean']['output']>;
  lastState: Maybe<TicketWorkflowState>;
  ticket: Maybe<Ticket>;
};

export type NewOrganization = {
  __typename?: 'NewOrganization';
  organization: Maybe<Organization>;
  project: Maybe<Project>;
};

export type NextTicket = {
  __typename?: 'NextTicket';
  nextState: Maybe<TicketWorkflowState>;
  ticket: Maybe<Ticket>;
};

export type Note = {
  __typename?: 'Note';
  body: Maybe<Scalars['String']['output']>;
  color: Maybe<NoteColor>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  owner: Maybe<Role>;
  ownerId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
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
  actor: Maybe<Role>;
  actorId: Maybe<Scalars['Int']['output']>;
  ancestry: Maybe<Scalars['String']['output']>;
  category: Maybe<NotificationCategory>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isRead: Maybe<Scalars['Boolean']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  role: Maybe<Role>;
  roleId: Maybe<Scalars['Int']['output']>;
  target: Maybe<NotificationTarget>;
  targetId: Maybe<Scalars['Int']['output']>;
  title: Maybe<Scalars['String']['output']>;
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
  invite: Maybe<Scalars['Boolean']['output']>;
  product: Maybe<Scalars['Boolean']['output']>;
  ticket: Maybe<Scalars['Boolean']['output']>;
};

export type OpenTicketsByWorkflow = {
  __typename?: 'OpenTicketsByWorkflow';
  values: Maybe<Array<TicketOpenByWorkflowDatum>>;
  workflow: Maybe<Workflow>;
};

export type Organization = {
  __typename?: 'Organization';
  about: Maybe<Scalars['String']['output']>;
  billingAddress: Maybe<OrganizationAddress>;
  billingAddressId: Maybe<Scalars['Int']['output']>;
  coverUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  estimatedAt: Maybe<Scalars['DateTime']['output']>;
  featureFlag: Maybe<FeatureFlag>;
  id: Maybe<Scalars['Int']['output']>;
  mailingAddress: Maybe<OrganizationAddress>;
  mailingAddressId: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  onboardingStatus: Maybe<OnboardingStatus>;
  organizationPreferences: Maybe<OrganizationPreferences>;
  products: Maybe<Array<Product>>;
  roles: Maybe<Array<Role>>;
  scheduleStatus: Maybe<ScheduleStatus>;
  showOnboarding: Maybe<Scalars['Boolean']['output']>;
  status: Maybe<OrganizationStatus>;
  tags: Maybe<Array<Tag>>;
  teams: Maybe<Array<Team>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type OrganizationAddress = {
  __typename?: 'OrganizationAddress';
  address1: Maybe<Scalars['String']['output']>;
  address2: Maybe<Scalars['String']['output']>;
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organizationId: Maybe<Scalars['Int']['output']>;
  state: Maybe<Scalars['String']['output']>;
  zipcode: Maybe<Scalars['String']['output']>;
};

export type OrganizationPreferences = {
  __typename?: 'OrganizationPreferences';
  showOnboarding: Maybe<Scalars['Boolean']['output']>;
};

export enum OrganizationStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Suspended = 'SUSPENDED'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Maybe<Scalars['Int']['output']>;
  hasNextPage: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage: Maybe<Scalars['Boolean']['output']>;
  pageCount: Maybe<Scalars['Int']['output']>;
  pageNumber: Maybe<Scalars['Int']['output']>;
  pageSize: Maybe<Scalars['Int']['output']>;
};

export type PaginatedBlackoutTimes = {
  __typename?: 'PaginatedBlackoutTimes';
  nodes: Array<BlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedCommentReply = {
  __typename?: 'PaginatedCommentReply';
  nodes: Array<CommentReply>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedComments = {
  __typename?: 'PaginatedComments';
  nodes: Array<Comment>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedDocumentations = {
  __typename?: 'PaginatedDocumentations';
  nodes: Array<Documentation>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedFeatureGroups = {
  __typename?: 'PaginatedFeatureGroups';
  nodes: Array<FeatureGroup>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedFeatures = {
  __typename?: 'PaginatedFeatures';
  nodes: Array<Feature>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedIssues = {
  __typename?: 'PaginatedIssues';
  nodes: Array<Issue>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedNotes = {
  __typename?: 'PaginatedNotes';
  nodes: Array<Note>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedNotifications = {
  __typename?: 'PaginatedNotifications';
  nodes: Array<Notification>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedOrganizations = {
  __typename?: 'PaginatedOrganizations';
  nodes: Array<Organization>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedPersonalTags = {
  __typename?: 'PaginatedPersonalTags';
  nodes: Array<PersonalTag>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  nodes: Array<Product>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedProjects = {
  __typename?: 'PaginatedProjects';
  nodes: Array<Project>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedRecurringBlackoutTimes = {
  __typename?: 'PaginatedRecurringBlackoutTimes';
  nodes: Array<RecurringBlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedReports = {
  __typename?: 'PaginatedReports';
  nodes: Array<Report>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedRoles = {
  __typename?: 'PaginatedRoles';
  nodes: Array<Role>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedScheduleItems = {
  __typename?: 'PaginatedScheduleItems';
  nodes: Array<ScheduleItem>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedSkills = {
  __typename?: 'PaginatedSkills';
  nodes: Array<Skill>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedTags = {
  __typename?: 'PaginatedTags';
  nodes: Array<Tag>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedTeams = {
  __typename?: 'PaginatedTeams';
  nodes: Array<Team>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedTickets = {
  __typename?: 'PaginatedTickets';
  nodes: Array<Ticket>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedTodos = {
  __typename?: 'PaginatedTodos';
  nodes: Array<Todo>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedWorkflowStates = {
  __typename?: 'PaginatedWorkflowStates';
  nodes: Array<WorkflowState>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type PaginatedWorkflows = {
  __typename?: 'PaginatedWorkflows';
  nodes: Array<Workflow>;
  pageInfo: PageInfo;
  totalCount: Maybe<Scalars['Int']['output']>;
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

export type PersonalTag = {
  __typename?: 'PersonalTag';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  owner: Maybe<Role>;
  ownerId: Maybe<Scalars['Int']['output']>;
  replacedBy: Maybe<PersonalTag>;
  replacedByTagId: Maybe<Scalars['Int']['output']>;
  replacesTags: Maybe<Array<PersonalTag>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type PlanningTicket = {
  __typename?: 'PlanningTicket';
  eta: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  localId: Maybe<Scalars['Int']['output']>;
  milestone: Maybe<Scalars['Boolean']['output']>;
  productCode: Maybe<Scalars['String']['output']>;
  productName: Maybe<Scalars['String']['output']>;
  projectName: Maybe<Scalars['String']['output']>;
  status: Maybe<TicketStatus>;
  title: Maybe<Scalars['String']['output']>;
  workflowName: Maybe<Scalars['String']['output']>;
};

export type Product = {
  __typename?: 'Product';
  code: Maybe<Scalars['String']['output']>;
  coverUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  featureGroups: Maybe<Array<FeatureGroup>>;
  features: Maybe<PaginatedFeatures>;
  id: Maybe<Scalars['Int']['output']>;
  isSupportActive: Maybe<Scalars['Boolean']['output']>;
  isUsingDefaultWorkflows: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  stage: Maybe<ModelStage>;
  tickets: Maybe<PaginatedTickets>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  workflowIds: Maybe<Array<Scalars['Int']['output']>>;
  workflows: Maybe<Array<Workflow>>;
};


export type ProductFeaturesArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type ProductTicketsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};

export type Project = {
  __typename?: 'Project';
  ancestorIsArchived: Maybe<Scalars['Boolean']['output']>;
  ancestors: Maybe<Array<Project>>;
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  checklist: Maybe<Array<ChecklistItem>>;
  children: Maybe<Array<Project>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  duration: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  owner: Maybe<Role>;
  ownerId: Maybe<Scalars['Int']['output']>;
  parent: Maybe<Project>;
  parentId: Maybe<Scalars['Int']['output']>;
  pinnedByRoles: Maybe<Array<Role>>;
  scheduleConfigs: Maybe<Array<ScheduleConfig>>;
  stage: Maybe<ModelStage>;
  tickets: Maybe<Array<Ticket>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ProjectAnalytics = {
  __typename?: 'ProjectAnalytics';
  doneTicketCount: Maybe<Scalars['Int']['output']>;
  draftTicketCount: Maybe<Scalars['Int']['output']>;
  estimatedTicketCount: Maybe<Scalars['Int']['output']>;
  inProgressTicketCount: Maybe<Scalars['Int']['output']>;
  organizationId: Maybe<Scalars['Int']['output']>;
  projectId: Maybe<Scalars['Int']['output']>;
  scheduledTicketCount: Maybe<Scalars['Int']['output']>;
  unassignedTicketCount: Maybe<Scalars['Int']['output']>;
  unestimatedTicketCount: Maybe<Scalars['Int']['output']>;
};

export type ProjectDependency = {
  __typename?: 'ProjectDependency';
  ancestors: Maybe<Array<Scalars['Int']['output']>>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Scalars['Int']['output']>;
  successors: Maybe<Array<Scalars['Int']['output']>>;
};

export type ProjectGoalProgress = {
  __typename?: 'ProjectGoalProgress';
  accomplished: Maybe<Scalars['Float']['output']>;
  eta: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Scalars['Int']['output']>;
  progress: Maybe<Scalars['Float']['output']>;
  total: Maybe<Scalars['Float']['output']>;
};

export type ProjectGoalStats = {
  __typename?: 'ProjectGoalStats';
  cancelled: Maybe<Scalars['Int']['output']>;
  done: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Scalars['Int']['output']>;
  scheduled: Maybe<Scalars['Int']['output']>;
  total: Maybe<Scalars['Int']['output']>;
  unScheduled: Maybe<Scalars['Int']['output']>;
};

export type ProjectTicket = {
  __typename?: 'ProjectTicket';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  localId: Maybe<Scalars['Int']['output']>;
  productCode: Maybe<Scalars['String']['output']>;
  stage: Maybe<ModelStage>;
  status: Maybe<TicketStatus>;
  title: Maybe<Scalars['String']['output']>;
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
  activeScheduleItems: Maybe<Array<ScheduleItem>>;
  batchGetTicketTags: Maybe<Array<Ticket>>;
  batchGetTickets: Maybe<Array<Ticket>>;
  blackoutTime: Maybe<BlackoutTime>;
  blackoutTimes: Maybe<Array<BlackoutTime>>;
  blockingTickets: Maybe<Array<TicketWorkflowState>>;
  comment: Maybe<Comment>;
  commentReply: Maybe<CommentReply>;
  comments: Maybe<PaginatedComments>;
  deliveredTicketForPeriod: Maybe<Array<Ticket>>;
  dependencies: Maybe<DependencySet>;
  documentation: Maybe<Documentation>;
  documentationPage: Maybe<DocumentationPage>;
  documentationPageAccessToken: Maybe<Scalars['String']['output']>;
  documentations: Maybe<PaginatedDocumentations>;
  drawing: Maybe<Drawing>;
  exportTickets: Maybe<Array<TicketExport>>;
  featureFlag: Maybe<FeatureFlag>;
  featureGroup: Maybe<FeatureGroup>;
  featureGroups: Maybe<PaginatedFeatureGroups>;
  features: Maybe<PaginatedFeatures>;
  getAllAwaitingEstimateTasks: Maybe<Array<Ticket>>;
  getAllEstimates: Maybe<Array<Estimate>>;
  getAllRoles: Maybe<Array<Role>>;
  getAllScheduledTasks: Maybe<Array<Ticket>>;
  getAllUnscheduledDependencies: Maybe<Array<Ticket>>;
  getDemo: Maybe<DemoRequest>;
  getEstimates: Maybe<Array<ScheduleEstimate>>;
  getGanttProjects: Maybe<Array<Project>>;
  getScheduleRoles: Maybe<Array<ScheduleRole>>;
  getScheduledTickets: Maybe<Array<Ticket>>;
  getUnscheduledDependencies: Maybe<Array<Ticket>>;
  getUnscheduledTickets: Maybe<PaginatedTickets>;
  habits: Maybe<RoleHabit>;
  issue: Maybe<Issue>;
  issueByToken: Maybe<Issue>;
  issues: Maybe<PaginatedIssues>;
  lastNote: Maybe<Note>;
  lastNotification: Maybe<Notification>;
  lastScheduleItem: Maybe<ScheduleItem>;
  lastTicketWorkflowStateNote: Maybe<TicketWorkflowStateNote>;
  lastTodo: Maybe<Todo>;
  me: Maybe<Me>;
  miniFeatures: Maybe<Array<MiniFeature>>;
  miniProducts: Maybe<Array<MiniProduct>>;
  miniProjects: Maybe<Array<MiniProject>>;
  miniRoles: Maybe<Array<MiniRole>>;
  miniTags: Maybe<Array<MiniTag>>;
  miniWorkflows: Maybe<Array<MiniWorkflow>>;
  moreTickets: Maybe<PaginatedTickets>;
  moreTicketsForProject: Maybe<PaginatedTickets>;
  myEstimatedTickets: Maybe<Array<Ticket>>;
  myLastProject: Maybe<Project>;
  myMiniProjects: Maybe<Array<MiniProject>>;
  myNextTickets: Maybe<Array<NextTicket>>;
  myNotScheduledTickets: Maybe<PaginatedTickets>;
  myNotifications: Maybe<PaginatedNotifications>;
  myOpenScheduleItems: Maybe<Array<ScheduleItem>>;
  myPreviousTickets: Maybe<Array<MyPreviousAssignedTicket>>;
  /** The user's own projects and drafts */
  myProjects: Maybe<Array<Project>>;
  myRecentlyCreatedTickets: Maybe<PaginatedTickets>;
  myRole: Maybe<Role>;
  myRoles: Maybe<Array<Role>>;
  myScheduleItemPeriod: Maybe<Array<ScheduleItem>>;
  myTickets: Maybe<Array<Ticket>>;
  myTicketsToEstimate: Maybe<Array<Ticket>>;
  myUnestimatedTickets: Maybe<Array<Ticket>>;
  myUnfinishedScheduleItems: Maybe<Array<ScheduleItem>>;
  myUpcomingTickets: Maybe<Array<MyUpcomingAssignedTicket>>;
  myWatchedTickets: Maybe<Array<Ticket>>;
  note: Maybe<Note>;
  notes: Maybe<PaginatedNotes>;
  notification: Maybe<Notification>;
  organization: Maybe<Organization>;
  organizations: Maybe<PaginatedOrganizations>;
  paginatedBlackoutTimes: Maybe<PaginatedBlackoutTimes>;
  paginatedRecurringBlackoutTimes: Maybe<PaginatedRecurringBlackoutTimes>;
  pastGoalProgress: Maybe<Array<ProjectGoalProgress>>;
  pastWorkflowDistribution: Maybe<Array<WorkflowDistribution>>;
  personalTag: Maybe<PersonalTag>;
  personalTags: Maybe<PaginatedPersonalTags>;
  planningDeliveredTickets: Maybe<Array<PlanningTicket>>;
  planningProjection: Maybe<Array<PlanningTicket>>;
  planningTickets: Maybe<Array<PlanningTicket>>;
  pof: Maybe<Scalars['String']['output']>;
  product: Maybe<Product>;
  productByCode: Maybe<Product>;
  products: Maybe<PaginatedProducts>;
  project: Maybe<Project>;
  projectAccessToken: Maybe<Scalars['String']['output']>;
  projectAnalytics: Maybe<ProjectAnalytics>;
  projectGoalStats: Maybe<Array<ProjectGoalStats>>;
  projectTextAccessToken: Maybe<Scalars['String']['output']>;
  projectTickets: Maybe<Array<ProjectTicket>>;
  projectTicketsForCategory: Maybe<PaginatedTickets>;
  projectedGoalProgress: Maybe<Array<ProjectGoalProgress>>;
  projectedWorkflowDistribution: Maybe<Array<WorkflowDistribution>>;
  /** @deprecated Not useful */
  projectedWorkload: Maybe<Array<RoleWorkload>>;
  projects: Maybe<PaginatedProjects>;
  recurringBlackoutTime: Maybe<RecurringBlackoutTime>;
  recurringBlackoutTimes: Maybe<Array<RecurringBlackoutTime>>;
  replies: Maybe<Array<CommentReply>>;
  report: Maybe<Report>;
  reportQuery: Maybe<ReportQuery>;
  reports: Maybe<PaginatedReports>;
  role: Maybe<Role>;
  roles: Maybe<PaginatedRoles>;
  scheduleConfig: Maybe<ScheduleConfig>;
  scheduleConfigs: Maybe<Array<ScheduleConfig>>;
  scheduleItem: Maybe<ScheduleItem>;
  scheduleItemPeriod: Maybe<Array<ScheduleItem>>;
  scheduleItemUpdateBoundaries: Maybe<ScheduleItemUpdateBoundaries>;
  scheduleItems: Maybe<PaginatedScheduleItems>;
  scheduledTicketToBeClosing: Maybe<Array<Ticket>>;
  scheduledTicketToBeWorked: Maybe<Array<Ticket>>;
  search: Maybe<Array<SearchResult>>;
  searchRole: Maybe<Array<Role>>;
  searchTicket: Maybe<Array<SearchResult>>;
  tag: Maybe<Tag>;
  tags: Maybe<PaginatedTags>;
  team: Maybe<Team>;
  teamByCode: Maybe<Team>;
  teams: Maybe<PaginatedTeams>;
  ticket: Maybe<Ticket>;
  ticketNotes: Maybe<Array<TicketWorkflowStateNote>>;
  ticketStatusHistogram: Maybe<Array<OpenTicketsByWorkflow>>;
  ticketTextAccessToken: Maybe<Scalars['String']['output']>;
  ticketWorkflowState: Maybe<TicketWorkflowState>;
  ticketWorkflowStateNote: Maybe<TicketWorkflowStateNote>;
  tickets: Maybe<PaginatedTickets>;
  ticketsCount: Maybe<Scalars['Int']['output']>;
  ticketsForMyCalendar: Maybe<Array<Ticket>>;
  timeOffs: Maybe<Array<TimeOff>>;
  todo: Maybe<Todo>;
  todos: Maybe<PaginatedTodos>;
  useRole: Maybe<Me>;
  user: Maybe<User>;
  users: Maybe<PaginatedUsers>;
  version: Maybe<Scalars['String']['output']>;
  workedTicketForPeriod: Maybe<Array<Ticket>>;
  workflow: Maybe<Workflow>;
  workflowState: Maybe<WorkflowState>;
  workflows: Maybe<PaginatedWorkflows>;
};


export type QueryBatchGetTicketTagsArgs = {
  ticketIds: Array<Scalars['Int']['input']>;
};


export type QueryBatchGetTicketsArgs = {
  ticketIds: Array<Scalars['Int']['input']>;
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
  commentId: InputMaybe<Scalars['Int']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  replyId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  ticketId: Scalars['Int']['input'];
};


export type QueryDeliveredTicketForPeriodArgs = {
  projectId: Scalars['Int']['input'];
  startDate: Scalars['DateTime']['input'];
  stopDate: Scalars['DateTime']['input'];
};


export type QueryDependenciesArgs = {
  projectId: InputMaybe<Scalars['Int']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryFeaturesArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  isReadyToSchedule: InputMaybe<Scalars['Boolean']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  projectId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  tagId: InputMaybe<Scalars['Int']['input']>;
  workflowId: InputMaybe<Scalars['Int']['input']>;
};


export type QueryIssueArgs = {
  id: Scalars['Int']['input'];
};


export type QueryIssueByTokenArgs = {
  token: Scalars['String']['input'];
};


export type QueryIssuesArgs = {
  assigneeId: InputMaybe<Scalars['Int']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  statuses: InputMaybe<Array<IssueStatus>>;
  unassigned: InputMaybe<Scalars['Boolean']['input']>;
  unread: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryLastTicketWorkflowStateNoteArgs = {
  ticketId: Scalars['Int']['input'];
};


export type QueryMiniFeaturesArgs = {
  productId: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMiniWorkflowsArgs = {
  productId: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMoreTicketsArgs = {
  allUntagged: InputMaybe<Scalars['Boolean']['input']>;
  assigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  atRisk: InputMaybe<Scalars['Boolean']['input']>;
  authorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  closedAtFilter: InputMaybe<Scalars['String']['input']>;
  createdAtFilter: InputMaybe<Scalars['String']['input']>;
  cursor: InputMaybe<Scalars['Int']['input']>;
  etaFilter: InputMaybe<Scalars['String']['input']>;
  featureIds: InputMaybe<Array<Scalars['Int']['input']>>;
  first: InputMaybe<Scalars['Int']['input']>;
  hideCompleted: InputMaybe<Scalars['Boolean']['input']>;
  intersectTagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  isReadyToSchedule: InputMaybe<Scalars['Boolean']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  ownerIds: InputMaybe<Array<Scalars['Int']['input']>>;
  productId: InputMaybe<Scalars['Int']['input']>;
  productIds: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId: InputMaybe<Scalars['Int']['input']>;
  recursive: InputMaybe<Scalars['Boolean']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
  statuses: InputMaybe<Array<TicketStatus>>;
  tagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  unassigned: InputMaybe<Scalars['Boolean']['input']>;
  unestimated: InputMaybe<Scalars['Boolean']['input']>;
  untagged: InputMaybe<Scalars['Boolean']['input']>;
  workflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryMoreTicketsForProjectArgs = {
  cursor: InputMaybe<Scalars['Int']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  hideCompleted: InputMaybe<Scalars['Boolean']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyMiniProjectsArgs = {
  includeArchived: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyNotScheduledTicketsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyNotificationsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  unread: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryMyRecentlyCreatedTicketsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: InputMaybe<Scalars['Int']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryMyScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryNoteArgs = {
  id: Scalars['Int']['input'];
};


export type QueryNotesArgs = {
  colors: InputMaybe<Array<NoteColor>>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryNotificationArgs = {
  id: Scalars['Int']['input'];
};


export type QueryOrganizationsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaginatedBlackoutTimesArgs = {
  disabled: InputMaybe<Scalars['Boolean']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryPaginatedRecurringBlackoutTimesArgs = {
  disabled: InputMaybe<Scalars['Boolean']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlanningDeliveredTicketsArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryPlanningProjectionArgs = {
  scheduleConfigs: Array<ScheduleConfigForEstimateInput>;
  ticketIds: Array<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['Int']['input'];
};


export type QueryProductByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
};


export type QueryProjectArgs = {
  id: Scalars['Int']['input'];
  visited: InputMaybe<Scalars['Boolean']['input']>;
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
  myDraft: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  stages: InputMaybe<Array<ModelStage>>;
  statuses: InputMaybe<Array<TicketStatus>>;
};


export type QueryProjectTicketsForCategoryArgs = {
  category: ProjectTicketQueryCategory;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  projectId: Scalars['Int']['input'];
  sort: InputMaybe<Scalars['String']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  parentId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryRecurringBlackoutTimeArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRecurringBlackoutTimesArgs = {
  includeDisabled: InputMaybe<Scalars['Boolean']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
};


export type QueryRoleArgs = {
  id: Scalars['Int']['input'];
};


export type QueryRolesArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryScheduleConfigArgs = {
  id: Scalars['Int']['input'];
};


export type QueryScheduleItemArgs = {
  scheduleItemId: Scalars['Int']['input'];
};


export type QueryScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime']['input'];
  roleId: InputMaybe<Scalars['Int']['input']>;
  toDate: InputMaybe<Scalars['DateTime']['input']>;
};


export type QueryScheduleItemUpdateBoundariesArgs = {
  scheduleItemId: Scalars['Int']['input'];
};


export type QueryScheduleItemsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  roleId: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
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
  includeClosed: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchRoleArgs = {
  query: Scalars['String']['input'];
};


export type QuerySearchTicketArgs = {
  includeClosed: InputMaybe<Scalars['Boolean']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTagArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTagsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTeamByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryTeamsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryTicketArgs = {
  id: Scalars['Int']['input'];
  visited: InputMaybe<Scalars['Boolean']['input']>;
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
  assigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  createdAtFilter: InputMaybe<Scalars['String']['input']>;
  etaFilter: InputMaybe<Scalars['String']['input']>;
  featureIds: InputMaybe<Array<Scalars['Int']['input']>>;
  first: InputMaybe<Scalars['Int']['input']>;
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  isReadyToSchedule: InputMaybe<Scalars['Boolean']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  productIds: InputMaybe<Array<Scalars['Int']['input']>>;
  projectId: InputMaybe<Scalars['Int']['input']>;
  recursive: InputMaybe<Scalars['Boolean']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
  statuses: InputMaybe<Array<TicketStatus>>;
  tagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  unassigned: InputMaybe<Scalars['Boolean']['input']>;
  unestimated: InputMaybe<Scalars['Boolean']['input']>;
  unfinished: InputMaybe<Scalars['Boolean']['input']>;
  untagged: InputMaybe<Scalars['Boolean']['input']>;
  watched: InputMaybe<Scalars['Boolean']['input']>;
  workflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
};


export type QueryTicketsCountArgs = {
  addedTicketIds: Array<Scalars['Int']['input']>;
  filter: UpdateScheduleConfigInput;
  removedTicketIds: Array<Scalars['Int']['input']>;
};


export type QueryTicketsForMyCalendarArgs = {
  search: InputMaybe<Scalars['String']['input']>;
};


export type QueryTimeOffsArgs = {
  fromDate: Scalars['DateTime']['input'];
  toDate: Scalars['DateTime']['input'];
};


export type QueryTodoArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTodosArgs = {
  dynamic: InputMaybe<Scalars['Boolean']['input']>;
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};


export type QueryUseRoleArgs = {
  organizationId: Scalars['Int']['input'];
};


export type QueryUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryUsersArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
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
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
  stages: InputMaybe<Array<ModelStage>>;
};

export type QueryAggregate = {
  __typename?: 'QueryAggregate';
  main: Maybe<Scalars['String']['output']>;
  secondary: Maybe<Scalars['String']['output']>;
  value: Maybe<Scalars['Float']['output']>;
};

export type RecurringBlackoutTime = {
  __typename?: 'RecurringBlackoutTime';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  disabled: Maybe<Scalars['Boolean']['output']>;
  friday: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  monday: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  roles: Maybe<Array<Role>>;
  saturday: Maybe<Scalars['Boolean']['output']>;
  startTime: Maybe<Scalars['String']['output']>;
  stopTime: Maybe<Scalars['String']['output']>;
  sunday: Maybe<Scalars['Boolean']['output']>;
  thursday: Maybe<Scalars['Boolean']['output']>;
  timeZone: Maybe<Scalars['String']['output']>;
  tuesday: Maybe<Scalars['Boolean']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  wednesday: Maybe<Scalars['Boolean']['output']>;
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  hash: Scalars['String']['input'];
  password: Scalars['String']['input'];
  proof: Scalars['String']['input'];
};

export type Report = {
  __typename?: 'Report';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  queries: Maybe<Array<ReportQuery>>;
  stage: Maybe<ModelStage>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ReportAggregate = {
  __typename?: 'ReportAggregate';
  primary: Maybe<Array<QueryAggregate>>;
  secondary: Maybe<Array<QueryAggregate>>;
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
  aggregateField: Maybe<ReportAggregateField>;
  byAssignees: Maybe<Array<FilterElement>>;
  byAuthors: Maybe<Array<FilterElement>>;
  byOwners: Maybe<Array<FilterElement>>;
  byProducts: Maybe<Array<FilterElement>>;
  byTags: Maybe<Array<FilterElement>>;
  byTickets: Maybe<Array<FilterElement>>;
  byWorkflowStateAssignees: Maybe<Array<FilterElement>>;
  byWorkflowStates: Maybe<Array<FilterElement>>;
  byWorkflows: Maybe<Array<FilterElement>>;
  chartBy: Maybe<ReportGroupBy>;
  chartByLabel: Maybe<Scalars['String']['output']>;
  cols: Maybe<Scalars['Int']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  cummulative: Maybe<Scalars['Boolean']['output']>;
  fromDate: Maybe<Scalars['String']['output']>;
  granularity: Maybe<ReportDateGranularity>;
  groupBy: Maybe<ReportGroupBy>;
  groupByLabel: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isTicketActive: Maybe<Scalars['Boolean']['output']>;
  isTicketDone: Maybe<Scalars['Boolean']['output']>;
  isTicketNotStarted: Maybe<Scalars['Boolean']['output']>;
  isTicketStarted: Maybe<Scalars['Boolean']['output']>;
  noUnknowns: Maybe<Scalars['Boolean']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  position: Maybe<Scalars['Int']['output']>;
  report: Maybe<Report>;
  reportId: Maybe<Scalars['Int']['output']>;
  rows: Maybe<Scalars['Int']['output']>;
  sameAsPrimaryFilter: Maybe<Scalars['Boolean']['output']>;
  secondaryByAssignees: Maybe<Array<FilterElement>>;
  secondaryByAuthors: Maybe<Array<FilterElement>>;
  secondaryByOwners: Maybe<Array<FilterElement>>;
  secondaryByProducts: Maybe<Array<FilterElement>>;
  secondaryByTags: Maybe<Array<FilterElement>>;
  secondaryByTickets: Maybe<Array<FilterElement>>;
  secondaryByWorkflowStateAssignees: Maybe<Array<FilterElement>>;
  secondaryByWorkflowStates: Maybe<Array<FilterElement>>;
  secondaryByWorkflows: Maybe<Array<FilterElement>>;
  secondaryChartBy: Maybe<ReportGroupBy>;
  secondaryChartByLabel: Maybe<Scalars['String']['output']>;
  secondaryGroupBy: Maybe<ReportGroupBy>;
  secondaryGroupByLabel: Maybe<Scalars['String']['output']>;
  secondaryIsTicketActive: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketDone: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketNotStarted: Maybe<Scalars['Boolean']['output']>;
  secondaryIsTicketStarted: Maybe<Scalars['Boolean']['output']>;
  title: Maybe<Scalars['String']['output']>;
  untilDate: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  values: Maybe<ReportAggregate>;
  widgetType: Maybe<ReportWidgetType>;
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
  assignments: Maybe<Array<TicketWorkflowState>>;
  avatarUrl: Maybe<Scalars['String']['output']>;
  checklists: Maybe<Array<Todo>>;
  coverUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  notes: Maybe<Array<Note>>;
  notifications: Maybe<Array<Notification>>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  pinnedProjects: Maybe<Array<Project>>;
  roleAutoResume: Maybe<RoleAutoResume>;
  roleEmail: Maybe<RoleEmail>;
  roleStartReminder: Maybe<RoleStartReminder>;
  skills: Maybe<Array<Skill>>;
  status: Maybe<RoleStatus>;
  teams: Maybe<Array<Team>>;
  ticketsAuthored: Maybe<Array<Ticket>>;
  ticketsOwned: Maybe<Array<Ticket>>;
  ticketsWatched: Maybe<Array<Ticket>>;
  timeZone: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  type: Maybe<RoleType>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  user: Maybe<User>;
  userId: Maybe<Scalars['Int']['output']>;
};

export type RoleAutoResume = {
  __typename?: 'RoleAutoResume';
  id: Maybe<Scalars['Int']['output']>;
  nextStartNotificationDate: Maybe<Scalars['DateTime']['output']>;
  nextStartNotificationOptOut: Maybe<Scalars['Boolean']['output']>;
  roleId: Maybe<Scalars['Int']['output']>;
};

export type RoleEmail = {
  __typename?: 'RoleEmail';
  id: Maybe<Scalars['Int']['output']>;
  nextWorkDayNotificationDate: Maybe<Scalars['DateTime']['output']>;
  nextWorkDayNotificationOffset: Maybe<Scalars['Int']['output']>;
  nextWorkDayNotificationOptOut: Maybe<Scalars['Boolean']['output']>;
  roleId: Maybe<Scalars['Int']['output']>;
};

export type RoleHabit = {
  __typename?: 'RoleHabit';
  productWorkflows: Maybe<Array<HabitProductWorkflow>>;
  projects: Maybe<Array<Project>>;
};

export type RoleNoteColorPreferences = {
  __typename?: 'RoleNoteColorPreferences';
  BLUE: Maybe<Scalars['String']['output']>;
  GREEN: Maybe<Scalars['String']['output']>;
  ORANGE: Maybe<Scalars['String']['output']>;
  PINK: Maybe<Scalars['String']['output']>;
  PURPLE: Maybe<Scalars['String']['output']>;
  YELLOW: Maybe<Scalars['String']['output']>;
};

export type RolePreferences = {
  __typename?: 'RolePreferences';
  lastProjectId: Maybe<Scalars['Int']['output']>;
  noteColors: Maybe<RoleNoteColorPreferences>;
  recentSearchHits: Maybe<Array<Scalars['String']['output']>>;
  recentlyVisited: Maybe<Array<Scalars['String']['output']>>;
  showOnboarding: Maybe<Scalars['Boolean']['output']>;
};

export type RoleStartReminder = {
  __typename?: 'RoleStartReminder';
  id: Maybe<Scalars['Int']['output']>;
  nextStartNotificationDate: Maybe<Scalars['DateTime']['output']>;
  nextStartNotificationOffset: Maybe<Scalars['Int']['output']>;
  nextStartNotificationOptOut: Maybe<Scalars['Boolean']['output']>;
  roleId: Maybe<Scalars['Int']['output']>;
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
  startTime: Maybe<Scalars['String']['output']>;
  stopTime: Maybe<Scalars['String']['output']>;
};

export type RoleWorkload = {
  __typename?: 'RoleWorkload';
  hours: Maybe<Scalars['Float']['output']>;
  role: Maybe<Role>;
};

export type ScheduleConfig = {
  __typename?: 'ScheduleConfig';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  features: Maybe<Array<Feature>>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  priority: Maybe<Scalars['Int']['output']>;
  products: Maybe<Array<Product>>;
  projects: Maybe<Array<Project>>;
  tags: Maybe<Array<Tag>>;
  tickets: Maybe<Array<Ticket>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  workflows: Maybe<Array<Workflow>>;
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
  duration: Maybe<Scalars['Int']['output']>;
  roleId: Maybe<Scalars['Int']['output']>;
  startEpoch: Maybe<Scalars['Int']['output']>;
  start_min: Maybe<Scalars['Int']['output']>;
  stopEpoch: Maybe<Scalars['Int']['output']>;
  ticketId: Maybe<Scalars['Int']['output']>;
  ticketLocalId: Maybe<Scalars['Int']['output']>;
  ticketProductCode: Maybe<Scalars['String']['output']>;
  ticketTitle: Maybe<Scalars['String']['output']>;
  ticketWorkflowStateId: Maybe<Scalars['Int']['output']>;
  ticketWorkflowStateName: Maybe<Scalars['String']['output']>;
};

export type ScheduleItem = {
  __typename?: 'ScheduleItem';
  autoStarted: Maybe<Scalars['Boolean']['output']>;
  autoStopped: Maybe<Scalars['Boolean']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  done: Maybe<Scalars['Boolean']['output']>;
  extendedAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  nextTicketWorkflowState: Maybe<TicketWorkflowState>;
  nextTicketWorkflowStateId: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  role: Maybe<Role>;
  roleId: Maybe<Scalars['Int']['output']>;
  startedAt: Maybe<Scalars['DateTime']['output']>;
  stoppedAt: Maybe<Scalars['DateTime']['output']>;
  ticket: Maybe<Ticket>;
  ticketId: Maybe<Scalars['Int']['output']>;
  ticketWorkflowState: Maybe<TicketWorkflowState>;
  ticketWorkflowStateId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type ScheduleItemForEstimateObjInput = {
  id: Scalars['Int']['input'];
};

export type ScheduleItemUpdateBoundaries = {
  __typename?: 'ScheduleItemUpdateBoundaries';
  maxDate: Maybe<Scalars['DateTime']['output']>;
  minDate: Maybe<Scalars['DateTime']['output']>;
};

export type ScheduleRole = {
  __typename?: 'ScheduleRole';
  avatarUrl: Maybe<Scalars['String']['output']>;
  futureCapacity: Maybe<Scalars['Float']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  pastCapacity: Maybe<Scalars['Float']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export enum ScheduleStatus {
  AssigneeDeactivated = 'ASSIGNEE_DEACTIVATED',
  Blocked = 'BLOCKED',
  Ok = 'OK'
}

export type SearchResult = {
  __typename?: 'SearchResult';
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['ID']['output']>;
  meta: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type Skill = {
  __typename?: 'Skill';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  feature: Maybe<Feature>;
  featureId: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  role: Maybe<Role>;
  roleId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  value: Maybe<Scalars['Float']['output']>;
};

export type Tag = {
  __typename?: 'Tag';
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  color: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  replacedBy: Maybe<Tag>;
  replacedByTagId: Maybe<Scalars['Int']['output']>;
  replacesTags: Maybe<Array<Tag>>;
  ticketCount: Maybe<Scalars['Int']['output']>;
  tickets: Maybe<PaginatedTickets>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};


export type TagTicketsArgs = {
  first: InputMaybe<Scalars['Int']['input']>;
  last: InputMaybe<Scalars['Int']['input']>;
  offset: InputMaybe<Scalars['Int']['input']>;
  search: InputMaybe<Scalars['String']['input']>;
  sort: InputMaybe<Scalars['String']['input']>;
};

export type Team = {
  __typename?: 'Team';
  code: Maybe<Scalars['String']['output']>;
  coverUrl: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  memberIds: Maybe<Array<Scalars['Int']['output']>>;
  members: Maybe<Array<Role>>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type Ticket = {
  __typename?: 'Ticket';
  ancestors: Maybe<Array<Ticket>>;
  archivedAt: Maybe<Scalars['DateTime']['output']>;
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  cases: Maybe<Array<Issue>>;
  closedAt: Maybe<Scalars['DateTime']['output']>;
  closingNote: Maybe<Scalars['String']['output']>;
  comments: Maybe<Array<Comment>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  deletedAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  difficulty: Maybe<Scalars['Int']['output']>;
  estimate: Maybe<Scalars['Int']['output']>;
  estimating: Maybe<Scalars['Boolean']['output']>;
  eta: Maybe<Scalars['DateTime']['output']>;
  features: Maybe<Array<Feature>>;
  folderId: Maybe<Scalars['Int']['output']>;
  foreignId: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isWatching: Maybe<Scalars['Boolean']['output']>;
  issues: Maybe<Array<Issue>>;
  lastScheduleItem: Maybe<ScheduleItem>;
  localId: Maybe<Scalars['Int']['output']>;
  milestone: Maybe<Scalars['Boolean']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  owner: Maybe<Role>;
  ownerId: Maybe<Scalars['Int']['output']>;
  personalTags: Maybe<Array<PersonalTag>>;
  product: Maybe<Product>;
  productId: Maybe<Scalars['Int']['output']>;
  progress: Maybe<Scalars['Float']['output']>;
  project: Maybe<Project>;
  projectId: Maybe<Scalars['Int']['output']>;
  scheduleItems: Maybe<Array<ScheduleItem>>;
  scheduledAt: Maybe<Scalars['DateTime']['output']>;
  stage: Maybe<ModelStage>;
  state: Maybe<TicketWorkflowState>;
  status: Maybe<TicketStatus>;
  successors: Maybe<Array<Ticket>>;
  tags: Maybe<Array<Tag>>;
  ticketWorkflowStates: Maybe<Array<TicketWorkflowState>>;
  title: Maybe<Scalars['String']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  watchers: Maybe<Array<Role>>;
  workflow: Maybe<Workflow>;
  workflowId: Maybe<Scalars['Int']['output']>;
};

export type TicketBatchPayload = {
  __typename?: 'TicketBatchPayload';
  count: Maybe<Scalars['Int']['output']>;
};

export type TicketDependency = {
  __typename?: 'TicketDependency';
  ancestors: Maybe<Array<Scalars['Int']['output']>>;
  id: Maybe<Scalars['Int']['output']>;
  localId: Maybe<Scalars['Int']['output']>;
  milestone: Maybe<Scalars['Boolean']['output']>;
  productCode: Maybe<Scalars['String']['output']>;
  projectId: Maybe<Scalars['Int']['output']>;
  status: Maybe<TicketStatus>;
  successors: Maybe<Array<Scalars['Int']['output']>>;
  title: Maybe<Scalars['String']['output']>;
};

export type TicketExport = {
  __typename?: 'TicketExport';
  ancestor_tickets: Maybe<Scalars['String']['output']>;
  author_email: Maybe<Scalars['String']['output']>;
  author_name: Maybe<Scalars['String']['output']>;
  closed_at: Maybe<Scalars['String']['output']>;
  created_at: Maybe<Scalars['String']['output']>;
  description: Maybe<Scalars['String']['output']>;
  eta: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  local_id: Maybe<Scalars['String']['output']>;
  owner_email: Maybe<Scalars['String']['output']>;
  owner_name: Maybe<Scalars['String']['output']>;
  product: Maybe<Scalars['String']['output']>;
  project: Maybe<Scalars['String']['output']>;
  scheduled_at: Maybe<Scalars['String']['output']>;
  stage: Maybe<ModelStage>;
  status: Maybe<TicketStatus>;
  successor_tickets: Maybe<Scalars['String']['output']>;
  tags: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
  workflow: Maybe<Scalars['String']['output']>;
};

export type TicketOpenByWorkflowDatum = {
  __typename?: 'TicketOpenByWorkflowDatum';
  date: Maybe<Scalars['DateTime']['output']>;
  value: Maybe<Scalars['Int']['output']>;
};

export enum TicketStatus {
  Cancelled = 'CANCELLED',
  Done = 'DONE',
  Scheduled = 'SCHEDULED',
  Unscheduled = 'UNSCHEDULED'
}

export type TicketWorkflowState = {
  __typename?: 'TicketWorkflowState';
  assignee: Maybe<Role>;
  assigneeId: Maybe<Scalars['Int']['output']>;
  checklist: Maybe<Array<ChecklistItem>>;
  complete: Maybe<Scalars['Int']['output']>;
  estimate: Maybe<Scalars['DateTime']['output']>;
  estimateMaximum: Maybe<Scalars['Int']['output']>;
  estimateMinimum: Maybe<Scalars['Int']['output']>;
  estimateMostLikely: Maybe<Scalars['Int']['output']>;
  estimateSet: Maybe<Estimate>;
  fractionable: Maybe<Scalars['Boolean']['output']>;
  fromTicketWorkflowStateNotes: Maybe<Array<TicketWorkflowStateNote>>;
  id: Maybe<Scalars['Int']['output']>;
  isActive: Maybe<Scalars['Boolean']['output']>;
  isBlocked: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  nextScheduleItems: Maybe<Array<ScheduleItem>>;
  position: Maybe<Scalars['Int']['output']>;
  scheduleItems: Maybe<Array<ScheduleItem>>;
  ticket: Maybe<Ticket>;
  ticketId: Maybe<Scalars['Int']['output']>;
  ticketWorkflowStateNotes: Maybe<Array<TicketWorkflowStateNote>>;
  todo: Maybe<Scalars['Int']['output']>;
  workflowState: Maybe<WorkflowState>;
  workflowStateId: Maybe<Scalars['Int']['output']>;
};

export type TicketWorkflowStateInput = {
  assigneeId: InputMaybe<Scalars['Int']['input']>;
  isActive: InputMaybe<Scalars['Boolean']['input']>;
  ticketWorkflowStateId: Scalars['Int']['input'];
};

export type TicketWorkflowStateNote = {
  __typename?: 'TicketWorkflowStateNote';
  author: Maybe<Role>;
  authorId: Maybe<Scalars['Int']['output']>;
  body: Maybe<Scalars['String']['output']>;
  category: Maybe<TicketWorkflowStateNoteCategory>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  fromTicketWorkflowState: Maybe<TicketWorkflowState>;
  fromTicketWorkflowStateId: Maybe<Scalars['Int']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  ticketWorkflowState: Maybe<TicketWorkflowState>;
  ticketWorkflowStateId: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export enum TicketWorkflowStateNoteCategory {
  BlockNote = 'BLOCK_NOTE',
  CloseNote = 'CLOSE_NOTE',
  StateNote = 'STATE_NOTE',
  UnblockNote = 'UNBLOCK_NOTE'
}

export type TimeOff = {
  __typename?: 'TimeOff';
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  role: Maybe<Role>;
  roleId: Maybe<Scalars['Int']['output']>;
  startAt: Maybe<Scalars['DateTime']['output']>;
  stopAt: Maybe<Scalars['DateTime']['output']>;
};

export type Todo = {
  __typename?: 'Todo';
  body: Maybe<Scalars['String']['output']>;
  checked: Maybe<Scalars['Boolean']['output']>;
  checkedAt: Maybe<Scalars['DateTime']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  dueDate: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  owner: Maybe<Role>;
  ownerId: Maybe<Scalars['Int']['output']>;
};

export type UpdateBlackoutTimeInput = {
  disabled: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type UpdateChecklistInput = {
  checked: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
};

export type UpdateCommentInput = {
  body: Scalars['String']['input'];
};

export type UpdateDocumentationInput = {
  description: InputMaybe<Scalars['String']['input']>;
  logoUrl: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDocumentationPageConfigInput = {
  customId: InputMaybe<Scalars['String']['input']>;
  keywords: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  urls: Array<Scalars['String']['input']>;
};

export type UpdateDocumentationPageInput = {
  body: Scalars['String']['input'];
};

export type UpdateDrawingInput = {
  data: Scalars['String']['input'];
  renewLock: InputMaybe<Scalars['Boolean']['input']>;
  updatedAt: Scalars['DateTime']['input'];
};

export type UpdateFeatureGroupInput = {
  description: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateFeatureInput = {
  name: Scalars['String']['input'];
};

export type UpdateIssueInput = {
  archived: InputMaybe<Scalars['Boolean']['input']>;
  assigneeId: InputMaybe<Scalars['Int']['input']>;
  status: InputMaybe<IssueStatus>;
  ticketId: InputMaybe<Scalars['Int']['input']>;
  unread: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateMyRoleInput = {
  avatarUrl: InputMaybe<Scalars['String']['input']>;
  coverUrl: InputMaybe<Scalars['String']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  timeZone: InputMaybe<Scalars['String']['input']>;
};

export type UpdateNoteInput = {
  body: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationAddressInput = {
  address1: Scalars['String']['input'];
  address2: InputMaybe<Scalars['String']['input']>;
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  state: Scalars['String']['input'];
  zipcode: Scalars['String']['input'];
};

export type UpdateOrganizationInput = {
  billingAddress: InputMaybe<UpdateOrganizationAddressInput>;
  coverUrl: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrganizationPreferencesInput = {
  showOnboarding: Scalars['Boolean']['input'];
};

export type UpdatePersonalTagInput = {
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductInput = {
  code: InputMaybe<Scalars['String']['input']>;
  coverUrl: InputMaybe<Scalars['String']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  isSupportActive: InputMaybe<Scalars['Boolean']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProjectChecklistInput = {
  checked: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
};

export type UpdateRecurringBlackoutTimeInput = {
  disabled: InputMaybe<Scalars['Boolean']['input']>;
  friday: InputMaybe<Scalars['Boolean']['input']>;
  monday: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  roleIds: Array<Scalars['Int']['input']>;
  saturday: InputMaybe<Scalars['Boolean']['input']>;
  startTime: Scalars['String']['input'];
  stopTime: Scalars['String']['input'];
  sunday: InputMaybe<Scalars['Boolean']['input']>;
  thursday: InputMaybe<Scalars['Boolean']['input']>;
  timeZone: Scalars['String']['input'];
  tuesday: InputMaybe<Scalars['Boolean']['input']>;
  wednesday: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateReplyInput = {
  body: Scalars['String']['input'];
};

export type UpdateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  authorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  chartBy: ReportGroupBy;
  chartByLabel: InputMaybe<Scalars['String']['input']>;
  cummulative: InputMaybe<Scalars['Boolean']['input']>;
  fromDate: InputMaybe<Scalars['String']['input']>;
  granularity: InputMaybe<ReportDateGranularity>;
  groupBy: InputMaybe<ReportGroupBy>;
  groupByLabel: InputMaybe<Scalars['String']['input']>;
  isTicketActive: InputMaybe<Scalars['Boolean']['input']>;
  isTicketCancelled: InputMaybe<Scalars['Boolean']['input']>;
  isTicketDone: InputMaybe<Scalars['Boolean']['input']>;
  isTicketNotStarted: InputMaybe<Scalars['Boolean']['input']>;
  isTicketStarted: InputMaybe<Scalars['Boolean']['input']>;
  noUnknowns: InputMaybe<Scalars['Boolean']['input']>;
  ownerIds: InputMaybe<Array<Scalars['Int']['input']>>;
  paths: InputMaybe<Array<Scalars['String']['input']>>;
  productIds: InputMaybe<Array<Scalars['Int']['input']>>;
  sameAsPrimaryFilter: InputMaybe<Scalars['Boolean']['input']>;
  secondaryAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryAuthorIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryChartBy: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel: InputMaybe<Scalars['String']['input']>;
  secondaryGroupBy: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel: InputMaybe<Scalars['String']['input']>;
  secondaryIsTicketActive: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketCancelled: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketDone: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketNotStarted: InputMaybe<Scalars['Boolean']['input']>;
  secondaryIsTicketStarted: InputMaybe<Scalars['Boolean']['input']>;
  secondaryOwnerIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryPaths: InputMaybe<Array<Scalars['String']['input']>>;
  secondaryProductIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryTicketIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  secondaryWorkflowStateIds: InputMaybe<Array<Scalars['Int']['input']>>;
  tagIds: InputMaybe<Array<Scalars['Int']['input']>>;
  ticketIds: InputMaybe<Array<Scalars['Int']['input']>>;
  title: Scalars['String']['input'];
  untilDate: InputMaybe<Scalars['String']['input']>;
  workflowIds: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateAssigneeIds: InputMaybe<Array<Scalars['Int']['input']>>;
  workflowStateIds: InputMaybe<Array<Scalars['Int']['input']>>;
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
  title: InputMaybe<Scalars['String']['input']>;
  type: InputMaybe<RoleType>;
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
  friday: Array<WorkDayTimeInput>;
  monday: Array<WorkDayTimeInput>;
  saturday: Array<WorkDayTimeInput>;
  sunday: Array<WorkDayTimeInput>;
  thursday: Array<WorkDayTimeInput>;
  tuesday: Array<WorkDayTimeInput>;
  wednesday: Array<WorkDayTimeInput>;
};

export type UpdateScheduleConfigInput = {
  priority: Scalars['Int']['input'];
  productIds: Array<Scalars['Int']['input']>;
  projectIds: Array<Scalars['Int']['input']>;
  tagIds: Array<Scalars['Int']['input']>;
  ticketIds: Array<Scalars['Int']['input']>;
  workflowIds: Array<Scalars['Int']['input']>;
};

export type UpdateScheduleConfigsInput = {
  configs: Array<UpdateScheduleConfigInput>;
};

export type UpdateScheduleItemInput = {
  startedAt: Scalars['String']['input'];
  stoppedAt: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSkillInput = {
  value: Scalars['Float']['input'];
};

export type UpdateTagInput = {
  color: Scalars['String']['input'];
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTeamInput = {
  code: InputMaybe<Scalars['String']['input']>;
  coverUrl: InputMaybe<Scalars['String']['input']>;
  description: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTicketInput = {
  difficulty: InputMaybe<Scalars['Int']['input']>;
  estimating: InputMaybe<Scalars['Boolean']['input']>;
  milestone: InputMaybe<Scalars['Boolean']['input']>;
  ownerId: InputMaybe<Scalars['Int']['input']>;
  productId: InputMaybe<Scalars['Int']['input']>;
  projectId: InputMaybe<Scalars['Int']['input']>;
  title: InputMaybe<Scalars['String']['input']>;
  workflowId: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTicketWorkflowStateInput = {
  states: Array<TicketWorkflowStateInput>;
};

export type UpdateTimeOffInput = {
  startAt: Scalars['String']['input'];
  stopAt: Scalars['String']['input'];
};

export type UpdateTodoInput = {
  body: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserPreferencesInput = {
  favoriteOrganizations: Array<Scalars['Int']['input']>;
  lastOrganizationId: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWorkflowInput = {
  color: Scalars['String']['input'];
  description: InputMaybe<Scalars['String']['input']>;
  isDefaultWorkflow: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
};

export type UpdateWorkflowStateInput = {
  backupTeamIds: InputMaybe<Array<Scalars['Int']['input']>>;
  name: Scalars['String']['input'];
  teamIds: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type User = {
  __typename?: 'User';
  createdAt: Maybe<Scalars['DateTime']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isStaff: Maybe<Scalars['Boolean']['output']>;
  preferences: Maybe<UserPreferences>;
  role: Maybe<Role>;
  roles: Maybe<Array<Role>>;
  status: Maybe<UserStatus>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  favoriteOrganizations: Maybe<Array<Scalars['Int']['output']>>;
  lastOrganizationId: Maybe<Scalars['Int']['output']>;
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
  friday: Maybe<Array<RoleWorkDay>>;
  monday: Maybe<Array<RoleWorkDay>>;
  saturday: Maybe<Array<RoleWorkDay>>;
  sunday: Maybe<Array<RoleWorkDay>>;
  thursday: Maybe<Array<RoleWorkDay>>;
  tuesday: Maybe<Array<RoleWorkDay>>;
  wednesday: Maybe<Array<RoleWorkDay>>;
};

export type Workflow = {
  __typename?: 'Workflow';
  color: Maybe<Scalars['String']['output']>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  description: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isDefaultWorkflow: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  products: Maybe<Array<Product>>;
  scheduleConfigs: Maybe<Array<ScheduleConfig>>;
  stage: Maybe<ModelStage>;
  states: Maybe<Array<WorkflowState>>;
  tickets: Maybe<Array<Ticket>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type WorkflowDistribution = {
  __typename?: 'WorkflowDistribution';
  hours: Maybe<Scalars['Float']['output']>;
  workflow: Maybe<Workflow>;
};

export type WorkflowState = {
  __typename?: 'WorkflowState';
  TicketWorkflowState: Maybe<Array<TicketWorkflowState>>;
  backupTeams: Maybe<Array<Team>>;
  createdAt: Maybe<Scalars['DateTime']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  organization: Maybe<Organization>;
  organizationId: Maybe<Scalars['Int']['output']>;
  position: Maybe<Scalars['Int']['output']>;
  teams: Maybe<Array<Team>>;
  updatedAt: Maybe<Scalars['DateTime']['output']>;
  workflow: Maybe<Workflow>;
  workflowId: Maybe<Scalars['Int']['output']>;
};

/** Used to move a state amongst a workflow */
export enum WorkflowStateDirection {
  Down = 'down',
  First = 'first',
  Last = 'last',
  Up = 'up'
}
