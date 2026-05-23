import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type AcceptRoleInput = {
  roleId: Scalars['Int'];
  timeZone: Scalars['String'];
};

export type AddReplyInput = {
  body: Scalars['String'];
};

export enum AuthStatus {
  Guest = 'GUEST',
  Linked = 'LINKED',
  User = 'USER'
}

export type BatchPayload = {
  __typename?: 'BatchPayload';
  count: Scalars['Int'];
};

/** Allowed actions on ticket bactch edit */
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
  actionMessage: Scalars['String'];
  ownerId?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['Int']>;
};

export type BlackoutTime = {
  __typename?: 'BlackoutTime';
  createdAt: Scalars['DateTime'];
  disabled: Scalars['Boolean'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organizationId: Scalars['Int'];
  roles: Array<Role>;
  startAt: Scalars['DateTime'];
  stopAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type ChangeEmailInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type ChangePasswordInput = {
  newPassword: Scalars['String'];
  password: Scalars['String'];
};

export type ChangeTicketWorkflowStateInput = {
  fractionable?: Scalars['Boolean'];
  maximum?: InputMaybe<Scalars['Int']>;
  minimum?: InputMaybe<Scalars['Int']>;
  mostLikely?: InputMaybe<Scalars['Int']>;
  roleId: Scalars['Int'];
  ticketWorkflowStateId: Scalars['Int'];
};

export type ChecklistItem = {
  __typename?: 'ChecklistItem';
  checked?: Maybe<Scalars['Boolean']>;
  label: Scalars['String'];
};

export type ClientUpdateIssueInput = {
  hash: Scalars['String'];
  imageUrl?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
  proof: Scalars['String'];
  status?: InputMaybe<IssueStatus>;
};

export type CloseScheduleItemInput = {
  done?: InputMaybe<Scalars['Boolean']>;
  nextTicketWorkflowStateId?: InputMaybe<Scalars['Float']>;
  note?: InputMaybe<Scalars['String']>;
  stoppedAt?: InputMaybe<Scalars['String']>;
};

export type Comment = {
  __typename?: 'Comment';
  acceptedReply?: Maybe<CommentReply>;
  acceptedReplyId?: Maybe<Scalars['Int']>;
  author: Role;
  authorId: Scalars['Int'];
  body: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  organization: Ticket;
  organizationId: Scalars['Int'];
  replies: Array<CommentReply>;
  replyCount: Scalars['Int'];
  ticket: Ticket;
  ticketId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type CommentReply = {
  __typename?: 'CommentReply';
  author: Role;
  authorId: Scalars['Int'];
  body: Scalars['String'];
  commentId: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  organizationId?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTime'];
};

export type CreateBlackoutTimeInput = {
  name: Scalars['String'];
  roleIds: Array<Scalars['Int']>;
  startAt: Scalars['String'];
  stopAt: Scalars['String'];
};

export type CreateCommentInput = {
  body?: InputMaybe<Scalars['String']>;
};

export type CreateDocumentationInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateDocumentationPageInput = {
  body: Scalars['String'];
  title: Scalars['String'];
};

export type CreateDrawingInput = {
  data?: InputMaybe<Scalars['String']>;
};

export type CreateFeatureGroupInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  productId: Scalars['Int'];
};

export type CreateNoteInput = {
  body?: InputMaybe<Scalars['String']>;
};

export type CreateOrganizationInput = {
  name: Scalars['String'];
  timeZone: Scalars['String'];
  userName: Scalars['String'];
};

export type CreatePersonalTagInput = {
  name: Scalars['String'];
};

export type CreateProductInput = {
  code: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateProjectInput = {
  name: Scalars['String'];
  parentId?: InputMaybe<Scalars['Int']>;
};

export type CreateRecurringBlackoutTimeInput = {
  friday?: InputMaybe<Scalars['Boolean']>;
  monday?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  roleIds: Array<Scalars['Int']>;
  saturday?: InputMaybe<Scalars['Boolean']>;
  startTime: Scalars['String'];
  stopTime: Scalars['String'];
  sunday?: InputMaybe<Scalars['Boolean']>;
  thursday?: InputMaybe<Scalars['Boolean']>;
  tuesday?: InputMaybe<Scalars['Boolean']>;
  wednesday?: InputMaybe<Scalars['Boolean']>;
};

export type CreateReportInput = {
  name: Scalars['String'];
};

export type CreateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  authorIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  chartBy: ReportGroupBy;
  chartByLabel?: InputMaybe<Scalars['String']>;
  cummulative?: Scalars['Boolean'];
  fromDate?: InputMaybe<Scalars['String']>;
  granularity?: ReportDateGranularity;
  groupBy?: InputMaybe<ReportGroupBy>;
  groupByLabel?: InputMaybe<Scalars['String']>;
  isTicketActive?: InputMaybe<Scalars['Boolean']>;
  isTicketCancelled?: InputMaybe<Scalars['Boolean']>;
  isTicketDone?: InputMaybe<Scalars['Boolean']>;
  isTicketNotStarted?: InputMaybe<Scalars['Boolean']>;
  isTicketStarted?: InputMaybe<Scalars['Boolean']>;
  noUnknowns?: Scalars['Boolean'];
  ownerIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  paths?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  sameAsPrimaryFilter?: InputMaybe<Scalars['Boolean']>;
  secondaryAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryAuthorIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryChartBy?: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel?: InputMaybe<Scalars['String']>;
  secondaryGroupBy?: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel?: InputMaybe<Scalars['String']>;
  secondaryIsTicketActive?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketCancelled?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketDone?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketNotStarted?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketStarted?: InputMaybe<Scalars['Boolean']>;
  secondaryOwnerIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryPaths?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  secondaryProductIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryTagIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryTicketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowStateAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowStateIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  ticketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  title: Scalars['String'];
  untilDate?: InputMaybe<Scalars['String']>;
  widgetType: ReportWidgetType;
  workflowIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  workflowStateAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  workflowStateIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type CreateScheduleItemInput = {
  startedAt?: InputMaybe<Scalars['String']>;
  stoppedAt?: InputMaybe<Scalars['String']>;
  ticketId: Scalars['Int'];
  ticketWorkflowStateId: Scalars['Int'];
};

export type CreateTagInput = {
  color: Scalars['String'];
  name: Scalars['String'];
};

export type CreateTeamInput = {
  code: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateTicketInput = {
  description?: InputMaybe<Scalars['String']>;
  productId?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['Int'];
  stage?: InputMaybe<ModelStage>;
  title: Scalars['String'];
  workflowId?: InputMaybe<Scalars['Int']>;
};

export type CreateTimeOffInput = {
  startAt: Scalars['String'];
  stopAt: Scalars['String'];
};

export type CreateTodoInput = {
  body?: InputMaybe<Scalars['String']>;
};

export type CreateWorkflowInput = {
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateWorkflowStateInput = {
  name: Scalars['String'];
};

export type DemoRequest = {
  __typename?: 'DemoRequest';
  config: Scalars['String'];
  confirmed: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['String'];
  ip_address: Scalars['String'];
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
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  lastPublishRequestAt?: Maybe<Scalars['DateTime']>;
  lastPublishedAt?: Maybe<Scalars['DateTime']>;
  logoUrl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  stage: ModelStage;
  titles: Array<MiniDocumentationPage>;
  updatedAt: Scalars['DateTime'];
};

export type DocumentationPage = {
  __typename?: 'DocumentationPage';
  body: Scalars['String'];
  createdAt: Scalars['DateTime'];
  customId?: Maybe<Scalars['String']>;
  documentation: Documentation;
  documentationId: Scalars['Int'];
  id: Scalars['Int'];
  keywords: Array<Scalars['String']>;
  organization: Organization;
  organizationId: Scalars['Int'];
  parentId?: Maybe<Scalars['Int']>;
  position: Scalars['Int'];
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  urls: Array<Scalars['String']>;
};

export type Drawing = {
  __typename?: 'Drawing';
  createdAt: Scalars['DateTime'];
  data: Scalars['String'];
  id: Scalars['Int'];
  lockExpiration?: Maybe<Scalars['DateTime']>;
  organization: Organization;
  organizationId: Scalars['Int'];
  roleId?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTime'];
};

export type DuplicateReportInput = {
  name: Scalars['String'];
};

export type Estimate = {
  __typename?: 'Estimate';
  assigneeId: Scalars['Int'];
  end: Scalars['Int'];
  end_max: Scalars['Int'];
  end_min: Scalars['Int'];
  end_p50: Scalars['Int'];
  end_p70: Scalars['Int'];
  end_p80: Scalars['Int'];
  end_p90: Scalars['Int'];
  end_p95: Scalars['Int'];
  epoch: Scalars['Int'];
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  start: Scalars['Int'];
  start_max: Scalars['Int'];
  start_min: Scalars['Int'];
  start_p50: Scalars['Int'];
  start_p70: Scalars['Int'];
  start_p80: Scalars['Int'];
  start_p90: Scalars['Int'];
  start_p95: Scalars['Int'];
  type: EstimateType;
  updatedEpoch: Scalars['Int'];
};

export type EstimateTicketWorkflowStateInput = {
  fractionable?: Scalars['Boolean'];
  maximum?: InputMaybe<Scalars['Int']>;
  minimum?: InputMaybe<Scalars['Int']>;
  mostLikely?: InputMaybe<Scalars['Int']>;
  ticketWorkflowStateId: Scalars['Int'];
};

export enum EstimateType {
  TicketWorkflowState = 'TicketWorkflowState'
}

export type Feature = {
  __typename?: 'Feature';
  createdAt: Scalars['DateTime'];
  featureGroup: FeatureGroup;
  featureGroupId: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  documentation: Scalars['Boolean'];
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  report: Scalars['Boolean'];
  support: Scalars['Boolean'];
};

export type FeatureGroup = {
  __typename?: 'FeatureGroup';
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  features: PaginatedFeatures;
  id: Scalars['Int'];
  isActive: Scalars['Boolean'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  product: Product;
  productId: Scalars['Int'];
  status: FeatureGroupStatus;
  updatedAt: Scalars['DateTime'];
};


export type FeatureGroupFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};

export enum FeatureGroupStatus {
  Active = 'ACTIVE',
  Deprecated = 'DEPRECATED'
}

export type FilterElement = {
  __typename?: 'FilterElement';
  id: Scalars['ID'];
  label: Scalars['String'];
  recordId: Scalars['Int'];
};

export type HabitProductWorkflow = {
  __typename?: 'HabitProductWorkflow';
  product: Product;
  workflow: Workflow;
};

export type ImportTicketsInput = {
  productId?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['Int'];
  tickets: Array<ImportTicketsInputDetail>;
  workflowId?: InputMaybe<Scalars['Int']>;
};

export type ImportTicketsInputDetail = {
  ancestorIds?: InputMaybe<Scalars['String']>;
  authorEmail?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  ownerEmail?: InputMaybe<Scalars['String']>;
  successorIds?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};

export type InviteInput = {
  roleType?: InputMaybe<RoleType>;
  userEmail: Scalars['String'];
  userName?: InputMaybe<Scalars['String']>;
};

export type Issue = {
  __typename?: 'Issue';
  archived: Scalars['Boolean'];
  assignee?: Maybe<Role>;
  assigneeId?: Maybe<Scalars['Int']>;
  context: IssueContext;
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Int'];
  issueActions: Array<IssueAction>;
  localId: Scalars['Int'];
  metaData: Scalars['String'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  product: Product;
  productId: Scalars['Int'];
  resolveAfterDate?: Maybe<Scalars['DateTime']>;
  status: IssueStatus;
  ticket?: Maybe<Ticket>;
  ticketId?: Maybe<Scalars['Int']>;
  token: Scalars['String'];
  unread: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
  url: Scalars['String'];
  userAgent: Scalars['String'];
};

export type IssueAction = {
  __typename?: 'IssueAction';
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']>;
  body?: Maybe<Scalars['String']>;
  category: IssueActionCategory;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  issueId: Scalars['Int'];
  organization: Organization;
  organizationId: Scalars['Int'];
  title: Scalars['String'];
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
  note: Scalars['String'];
};

export type IssueContext = {
  __typename?: 'IssueContext';
  browser?: Maybe<Scalars['String']>;
  deviceName?: Maybe<Scalars['String']>;
  deviceType?: Maybe<Scalars['String']>;
  engine?: Maybe<Scalars['String']>;
  os?: Maybe<Scalars['String']>;
  osVersion?: Maybe<Scalars['String']>;
};

export type IssueSendMessageInput = {
  imageUrl?: InputMaybe<Scalars['String']>;
  message?: InputMaybe<Scalars['String']>;
};

export enum IssueStatus {
  New = 'NEW',
  Processing = 'PROCESSING',
  Resolved = 'RESOLVED'
}

export type IssueUpdateNoteInput = {
  note: Scalars['String'];
};

export type LoginInput = {
  email: Scalars['String'];
  hash: Scalars['String'];
  password: Scalars['String'];
  proof: Scalars['String'];
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
  id: Scalars['Int'];
  parentId?: Maybe<Scalars['Int']>;
  position: Scalars['Int'];
  title: Scalars['String'];
};

export type MiniFeature = {
  __typename?: 'MiniFeature';
  featureGroupName: Scalars['String'];
  id: Scalars['Float'];
  name: Scalars['String'];
  productCode: Scalars['String'];
  productName: Scalars['String'];
};

export type MiniProduct = {
  __typename?: 'MiniProduct';
  id: Scalars['Float'];
  name: Scalars['String'];
  stage: ModelStage;
};

export type MiniProject = {
  __typename?: 'MiniProject';
  ancestorIsArchived: Scalars['Boolean'];
  id: Scalars['Int'];
  name: Scalars['String'];
  parentId?: Maybe<Scalars['Int']>;
  stage: ModelStage;
};

export type MiniRole = {
  __typename?: 'MiniRole';
  avatarUrl?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  name: Scalars['String'];
  title?: Maybe<Scalars['String']>;
};

export type MiniTag = {
  __typename?: 'MiniTag';
  color: Scalars['String'];
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type MiniWorkflow = {
  __typename?: 'MiniWorkflow';
  id: Scalars['Float'];
  name: Scalars['String'];
  stage: ModelStage;
};

export enum ModelStage {
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
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
  /** add and remove tags to the provided tickets */
  batchUpdateTicketTags: Array<Ticket>;
  /** add and remove tags to the provided tickets */
  batchUpdateTickets: BatchPayload;
  blockTicket: Ticket;
  changeEmail: User;
  changePassword: User;
  changeTicketWorkflowStateAssignee: Ticket;
  checkTodo: Todo;
  /** Close (or update an already closed) last known ticket workflow state */
  closeLastScheduleItem: ScheduleItem;
  /** Close an active workflow state */
  closeScheduleItem: ScheduleItem;
  commitScheduleChanges: Scalars['Boolean'];
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
  deleteBlackoutTime: Scalars['Int'];
  deleteComment: Scalars['Boolean'];
  deleteDocumentation: Documentation;
  deleteDocumentationPage: Documentation;
  deleteDrawing: Drawing;
  deleteFeature: FeatureGroup;
  deleteFeatureGroup: Product;
  deleteIssue: Issue;
  deleteNote: Note;
  deleteNotification: Notification;
  deletePersonalTag: Scalars['Boolean'];
  /** @deprecated Archive product instead of deleting it */
  deleteProduct: Product;
  deleteProject: Scalars['Boolean'];
  deleteRecurringBlackoutTime: Scalars['Int'];
  deleteReply: Scalars['Int'];
  deleteReport: Report;
  deleteReportQuery: Report;
  deleteRole: Role;
  deleteScheduleItem: Scalars['Boolean'];
  deleteTag: Scalars['Boolean'];
  deleteTeam: Scalars['Boolean'];
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
  logout: Scalars['Boolean'];
  markTicketNotDone: Ticket;
  moveAfterDocumentationPage: DocumentationPage;
  moveBeforeDocumentationPage: DocumentationPage;
  moveIntoProject: Scalars['Boolean'];
  moveProjectToRoot: Project;
  moveWorkflowState: Workflow;
  passwordLost: Scalars['Boolean'];
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
  scheduleTicket: Ticket;
  sendConfirmationEmail: Scalars['Boolean'];
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
  commentReplyId: Scalars['Int'];
};


export type MutationAcceptRoleArgs = {
  input: AcceptRoleInput;
};


export type MutationAddChildToDocumentationPageArgs = {
  childDocumentationPageId: Scalars['Int'];
  parentDocumentationPageId: Scalars['Int'];
};


export type MutationAddFeatureArgs = {
  featureGroupId: Scalars['Int'];
  name: Scalars['String'];
};


export type MutationAddFeatureGroupArgs = {
  name: Scalars['String'];
  productId: Scalars['Int'];
};


export type MutationAddMembersArgs = {
  roleIds: Array<Scalars['Int']>;
  teamId: Scalars['Int'];
};


export type MutationAddReplyArgs = {
  commentId: Scalars['Int'];
  input: AddReplyInput;
};


export type MutationAddTicketAncestorArgs = {
  ancestorId: Scalars['Int'];
  ticketId: Scalars['Int'];
};


export type MutationAddTicketFeaturesArgs = {
  featureIds: Array<InputMaybe<Scalars['Int']>>;
  ticketId: Scalars['Int'];
};


export type MutationAddTicketPersonalTagsArgs = {
  personalTagIds: Array<Scalars['Int']>;
  ticketId: Scalars['Int'];
};


export type MutationAddTicketTagsArgs = {
  tagIds: Array<Scalars['Int']>;
  ticketId: Scalars['Int'];
};


export type MutationAddToRecentSearchHitArgs = {
  searchResult: Scalars['String'];
};


export type MutationAddWorkflowStateArgs = {
  input: CreateWorkflowStateInput;
  workflowId: Scalars['Int'];
};


export type MutationAddWorkflowsArgs = {
  productId: Scalars['Int'];
  workflowIds: Array<Scalars['Int']>;
};


export type MutationArchiveProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationBatchUpdateTicketTagsArgs = {
  addTagIds: Array<InputMaybe<Scalars['Int']>>;
  removeTagIds: Array<InputMaybe<Scalars['Int']>>;
  ticketIds: Array<InputMaybe<Scalars['Int']>>;
};


export type MutationBatchUpdateTicketsArgs = {
  input: BatchUpdateTicketsInput;
  ticketIds: Array<InputMaybe<Scalars['Int']>>;
};


export type MutationBlockTicketArgs = {
  note: Scalars['String'];
  ticketId: Scalars['Int'];
  ticketWorkflowStateId: Scalars['Int'];
};


export type MutationChangeEmailArgs = {
  input: ChangeEmailInput;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationChangeTicketWorkflowStateAssigneeArgs = {
  input: ChangeTicketWorkflowStateInput;
  ticketId: Scalars['Int'];
};


export type MutationCheckTodoArgs = {
  checked: Scalars['Boolean'];
  todoId: Scalars['Int'];
};


export type MutationCloseLastScheduleItemArgs = {
  input?: CloseScheduleItemInput;
  ticketId: Scalars['Int'];
};


export type MutationCloseScheduleItemArgs = {
  input?: CloseScheduleItemInput;
  scheduleItemId: Scalars['Int'];
};


export type MutationCommitScheduleChangesArgs = {
  addTicketIds: Array<InputMaybe<Scalars['Int']>>;
  removeTicketIds: Array<InputMaybe<Scalars['Int']>>;
  scheduleConfigs: Array<InputMaybe<UpdateScheduleConfig>>;
};


export type MutationCreateBlackoutTimeArgs = {
  input: CreateBlackoutTimeInput;
};


export type MutationCreateCommentArgs = {
  input: CreateCommentInput;
  ticketId: Scalars['Int'];
};


export type MutationCreateDocumentationArgs = {
  input: CreateDocumentationInput;
};


export type MutationCreateDocumentationPageArgs = {
  documentationId: Scalars['Int'];
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
  reportId: Scalars['Int'];
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
  input: CreatePersonalTagInput;
  ticketId: Scalars['Int'];
};


export type MutationCreateTicketTagArgs = {
  input: CreateTagInput;
  ticketId: Scalars['Int'];
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
  blackoutTimeId: Scalars['Int'];
};


export type MutationDeleteCommentArgs = {
  commentId: Scalars['Int'];
};


export type MutationDeleteDocumentationArgs = {
  documentationId: Scalars['Int'];
};


export type MutationDeleteDocumentationPageArgs = {
  documentationPageId: Scalars['Int'];
};


export type MutationDeleteDrawingArgs = {
  drawingId: Scalars['Int'];
};


export type MutationDeleteFeatureArgs = {
  featureId: Scalars['Int'];
};


export type MutationDeleteFeatureGroupArgs = {
  featureGroupId: Scalars['Int'];
};


export type MutationDeleteIssueArgs = {
  issueId: Scalars['Int'];
};


export type MutationDeleteNoteArgs = {
  noteId: Scalars['Int'];
};


export type MutationDeleteNotificationArgs = {
  notificationId: Scalars['Int'];
};


export type MutationDeletePersonalTagArgs = {
  personalTagId: Scalars['Int'];
};


export type MutationDeleteProductArgs = {
  productId: Scalars['Int'];
};


export type MutationDeleteProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationDeleteRecurringBlackoutTimeArgs = {
  recurringBlackoutTimeId: Scalars['Int'];
};


export type MutationDeleteReplyArgs = {
  commentReplyId: Scalars['Int'];
};


export type MutationDeleteReportArgs = {
  reportId: Scalars['Int'];
};


export type MutationDeleteReportQueryArgs = {
  reportQueryId: Scalars['Int'];
};


export type MutationDeleteRoleArgs = {
  roleId: Scalars['Int'];
};


export type MutationDeleteScheduleItemArgs = {
  scheduleItemId: Scalars['Int'];
};


export type MutationDeleteTagArgs = {
  tagId: Scalars['Int'];
};


export type MutationDeleteTeamArgs = {
  teamId: Scalars['Int'];
};


export type MutationDeleteTimeOffArgs = {
  timeOffId: Scalars['Int'];
};


export type MutationDeleteTodoArgs = {
  todoId: Scalars['Int'];
};


export type MutationDeleteWorkflowArgs = {
  workflowId: Scalars['Int'];
};


export type MutationDeleteWorkflowStateArgs = {
  workflowStateId: Scalars['Int'];
};


export type MutationDuplicateReportArgs = {
  input: DuplicateReportInput;
  reportId: Scalars['Int'];
};


export type MutationEstimateTicketWorkflowStateArgs = {
  input: EstimateTicketWorkflowStateInput;
  ticketId: Scalars['Int'];
};


export type MutationGetDrawingLockArgs = {
  drawingId: Scalars['Int'];
  force?: Scalars['Boolean'];
};


export type MutationImportTicketsArgs = {
  input: ImportTicketsInput;
};


export type MutationInviteArgs = {
  input: InviteInput;
};


export type MutationIssueAddNoteArgs = {
  input: IssueAddNoteInput;
  issueId: Scalars['Int'];
};


export type MutationIssueDeleteNoteArgs = {
  issueActionId: Scalars['Int'];
};


export type MutationIssueRemoveAutoResolveArgs = {
  issueId: Scalars['Int'];
};


export type MutationIssueSendMessageArgs = {
  input: IssueSendMessageInput;
  issueId: Scalars['Int'];
};


export type MutationIssueSetAutoResolveArgs = {
  issueId: Scalars['Int'];
};


export type MutationIssueUpdateNoteArgs = {
  input: IssueUpdateNoteInput;
  issueActionId: Scalars['Int'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkTicketNotDoneArgs = {
  ticketId: Scalars['Int'];
};


export type MutationMoveAfterDocumentationPageArgs = {
  afterDocumentationPageId: Scalars['Int'];
  documentationPageId: Scalars['Int'];
};


export type MutationMoveBeforeDocumentationPageArgs = {
  beforeDocumentationPageId: Scalars['Int'];
  documentationPageId: Scalars['Int'];
};


export type MutationMoveIntoProjectArgs = {
  projectId: Scalars['Int'];
  sources: Array<Scalars['String']>;
};


export type MutationMoveProjectToRootArgs = {
  projectId: Scalars['Int'];
};


export type MutationMoveWorkflowStateArgs = {
  direction: WorkflowStateDirection;
  workflowStateId: Scalars['Int'];
};


export type MutationPasswordLostArgs = {
  input: PasswordLostInput;
};


export type MutationPasswordResetArgs = {
  input: PasswordResetInput;
};


export type MutationPinProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationPublishDocumentationArgs = {
  id: Scalars['Int'];
};


export type MutationPublishProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationReactivateRoleArgs = {
  roleId: Scalars['Int'];
};


export type MutationReadNotificationArgs = {
  notificationId: Scalars['Int'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterFromInviteArgs = {
  input: RegisterInput;
};


export type MutationRejectRoleArgs = {
  roleId: Scalars['Int'];
};


export type MutationReleaseDrawingLockArgs = {
  drawingId: Scalars['Int'];
};


export type MutationRemoveMembersArgs = {
  roleIds: Array<Scalars['Int']>;
  teamId: Scalars['Int'];
};


export type MutationRemoveTicketAncestorArgs = {
  ancestorId: Scalars['Int'];
  ticketId: Scalars['Int'];
};


export type MutationRemoveTicketFeaturesArgs = {
  featureIds: Array<InputMaybe<Scalars['Int']>>;
  ticketId: Scalars['Int'];
};


export type MutationRemoveTicketPersonalTagsArgs = {
  personalTagIds: Array<InputMaybe<Scalars['Int']>>;
  ticketId: Scalars['Int'];
};


export type MutationRemoveTicketTagsArgs = {
  tagIds: Array<InputMaybe<Scalars['Int']>>;
  ticketId: Scalars['Int'];
};


export type MutationRemoveWorkflowsArgs = {
  productId: Scalars['Int'];
  workflowIds: Array<Scalars['Int']>;
};


export type MutationRenameProjectArgs = {
  name: Scalars['String'];
  projectId: Scalars['Int'];
};


export type MutationRequestDemoArgs = {
  input: RequestDemoInput;
};


export type MutationResendInviteArgs = {
  email: Scalars['String'];
};


export type MutationScheduleTicketArgs = {
  ticketId: Scalars['Int'];
};


export type MutationSetChecklistArgs = {
  input: Array<InputMaybe<UpdateChecklistInput>>;
  ticketWorkflowStateId: Scalars['Int'];
};


export type MutationSetProjectChecklistArgs = {
  input: Array<InputMaybe<UpdateProjectChecklistInput>>;
  projectId: Scalars['Int'];
};


export type MutationSkipTicketWorkflowStateArgs = {
  id: Scalars['Int'];
};


export type MutationToggleOnboardingArgs = {
  showOnboarding: Scalars['Boolean'];
};


export type MutationUnarchiveProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationUnblockTicketArgs = {
  note: Scalars['String'];
  ticketId: Scalars['Int'];
  ticketWorkflowStateId: Scalars['Int'];
};


export type MutationUnpinProjectArgs = {
  projectId: Scalars['Int'];
};


export type MutationUnpublishDocumentationArgs = {
  id: Scalars['Int'];
};


export type MutationUnreadNotificationArgs = {
  notificationId: Scalars['Int'];
};


export type MutationUnwatchTicketArgs = {
  ticketId: Scalars['Int'];
};


export type MutationUpdateBlackoutTimeArgs = {
  blackoutTimeId: Scalars['Int'];
  input: UpdateBlackoutTimeInput;
};


export type MutationUpdateCommentArgs = {
  commentId: Scalars['Int'];
  input: UpdateCommentInput;
};


export type MutationUpdateDocumentationArgs = {
  documentationId: Scalars['Int'];
  input: UpdateDocumentationInput;
};


export type MutationUpdateDocumentationPageArgs = {
  documentationPageId: Scalars['Int'];
  input: UpdateDocumentationPageInput;
};


export type MutationUpdateDocumentationPageConfigArgs = {
  documentationPageId: Scalars['Int'];
  input: UpdateDocumentationPageConfigInput;
};


export type MutationUpdateDocumentationStageArgs = {
  documentationId: Scalars['Int'];
  stage: ModelStage;
};


export type MutationUpdateDrawingArgs = {
  drawingId: Scalars['Int'];
  input: UpdateDrawingInput;
};


export type MutationUpdateFeatureArgs = {
  featureId: Scalars['Int'];
  input: UpdateFeatureInput;
};


export type MutationUpdateFeatureGroupArgs = {
  featureGroupId: Scalars['Int'];
  input: UpdateFeatureGroupInput;
};


export type MutationUpdateIssueArgs = {
  input: UpdateIssueInput;
  issueId: Scalars['Int'];
};


export type MutationUpdateIssueByTokenArgs = {
  input: ClientUpdateIssueInput;
  token: Scalars['String'];
};


export type MutationUpdateMyRoleArgs = {
  input: UpdateMyRoleInput;
};


export type MutationUpdateMyScheduleItemArgs = {
  input: UpdateScheduleItemInput;
  scheduleItemId: Scalars['Int'];
};


export type MutationUpdateNoteArgs = {
  input: UpdateNoteInput;
  noteId: Scalars['Int'];
};


export type MutationUpdateNoteColorArgs = {
  color: NoteColor;
  noteId: Scalars['Int'];
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateOrganizationPreferencesArgs = {
  input: UpdateOrganizationPreferencesInput;
};


export type MutationUpdatePersonalTagArgs = {
  input: UpdatePersonalTagInput;
  tagId: Scalars['Int'];
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
  productId: Scalars['Int'];
};


export type MutationUpdateProductStageArgs = {
  productId: Scalars['Int'];
  stage: ModelStage;
};


export type MutationUpdateProductUseGlobalWorkflowArgs = {
  productId: Scalars['Int'];
  useDefaultWorkflows: Scalars['Boolean'];
};


export type MutationUpdateProjectNameArgs = {
  name: Scalars['String'];
  projectId: Scalars['Int'];
};


export type MutationUpdateProjectOwnerArgs = {
  ownerId?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['Int'];
};


export type MutationUpdateRecurringBlackoutTimeArgs = {
  input: UpdateRecurringBlackoutTimeInput;
  recurringBlackoutTimeId: Scalars['Int'];
};


export type MutationUpdateReplyArgs = {
  commentReplyId: Scalars['Int'];
  input: UpdateReplyInput;
};


export type MutationUpdateReportQueryArgs = {
  input: UpdateReportQueryInput;
  reportQueryId: Scalars['Int'];
};


export type MutationUpdateReportQueryPlacementArgs = {
  input: UpdateReportQueryPlacementInput;
  reportQueryId: Scalars['Int'];
};


export type MutationUpdateReportQuerySizeArgs = {
  input: UpdateReportQuerySizeInput;
  reportQueryId: Scalars['Int'];
};


export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
  roleId: Scalars['Int'];
};


export type MutationUpdateRoleAutoResumeArgs = {
  input: UpdateRoleAutoResumeInput;
};


export type MutationUpdateRoleEmailArgs = {
  input: UpdateRoleEmailInput;
};


export type MutationUpdateRoleNoteColorPreferencesArgs = {
  input: UpdateRoleNotColorsInput;
};


export type MutationUpdateRolePreferencesArgs = {
  input: UpdateRolePreferencesInput;
};


export type MutationUpdateRoleStartReminderArgs = {
  input: UpdateRoleStartReminderInput;
};


export type MutationUpdateRoleWorkWeekArgs = {
  input: UpdateRoleWorkWeekInput;
  roleId: Scalars['Int'];
};


export type MutationUpdateScheduleConfigArgs = {
  input: UpdateScheduleConfigs;
};


export type MutationUpdateScheduleItemArgs = {
  input: UpdateScheduleItemInput;
  scheduleItemId: Scalars['Int'];
};


export type MutationUpdateSkillArgs = {
  input: UpdateSkillInput;
  skillId: Scalars['Int'];
};


export type MutationUpdateTagArgs = {
  input: UpdateTagInput;
  tagId: Scalars['Int'];
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
  teamId: Scalars['Int'];
};


export type MutationUpdateTicketArgs = {
  input: UpdateTicketInput;
  ticketId: Scalars['Int'];
};


export type MutationUpdateTicketStageArgs = {
  stage: ModelStage;
  ticketId: Scalars['Int'];
};


export type MutationUpdateTicketStatusArgs = {
  note?: InputMaybe<Scalars['String']>;
  status: TicketStatus;
  ticketId: Scalars['Int'];
};


export type MutationUpdateTicketWorkflowStatesArgs = {
  input: UpdateTicketWorkflowStateInput;
  ticketId: Scalars['Int'];
};


export type MutationUpdateTimeOffArgs = {
  input: UpdateTimeOffInput;
  timeOffId: Scalars['Int'];
};


export type MutationUpdateTodoArgs = {
  input: UpdateTodoInput;
  todoId: Scalars['Int'];
};


export type MutationUpdateUserPreferencesArgs = {
  input: UpdateUserPreferencesInput;
};


export type MutationUpdateWorkflowArgs = {
  input: UpdateWorkflowInput;
  workflowId: Scalars['Int'];
};


export type MutationUpdateWorkflowStageArgs = {
  stage: ModelStage;
  workflowId: Scalars['Int'];
};


export type MutationUpdateWorkflowStateArgs = {
  input: UpdateWorkflowStateInput;
  workflowStateId: Scalars['Int'];
};


export type MutationWatchTicketArgs = {
  ticketId: Scalars['Int'];
};

export type MyPreviousAssignedTicket = {
  __typename?: 'MyPreviousAssignedTicket';
  currentState?: Maybe<TicketWorkflowState>;
  isActive: Scalars['Boolean'];
  isDone: Scalars['Boolean'];
  isNext: Scalars['Boolean'];
  isPaused: Scalars['Boolean'];
  isStarted: Scalars['Boolean'];
  lastState?: Maybe<TicketWorkflowState>;
  ticket: Ticket;
};

export type MyUpcomingAssignedTicket = {
  __typename?: 'MyUpcomingAssignedTicket';
  currentState: TicketWorkflowState;
  isActive: Scalars['Boolean'];
  isDone: Scalars['Boolean'];
  isNext: Scalars['Boolean'];
  isPaused: Scalars['Boolean'];
  isStarted: Scalars['Boolean'];
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
  body: Scalars['String'];
  color: NoteColor;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  organization: Organization;
  organizationId: Scalars['Int'];
  owner: Role;
  ownerId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
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
  actorId: Scalars['Int'];
  ancestry?: Maybe<Scalars['String']>;
  category: NotificationCategory;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  isRead: Scalars['Boolean'];
  organization: Organization;
  organizationId: Scalars['Int'];
  role: Role;
  roleId: Scalars['Int'];
  target: NotificationTarget;
  targetId: Scalars['Int'];
  title: Scalars['String'];
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
  invite: Scalars['Boolean'];
  product: Scalars['Boolean'];
  ticket: Scalars['Boolean'];
};

export type OpenTicketsByWorkflow = {
  __typename?: 'OpenTicketsByWorkflow';
  values: Array<TicketOpenByWorkflowDatum>;
  workflow: Workflow;
};

export type Organization = {
  __typename?: 'Organization';
  about?: Maybe<Scalars['String']>;
  billingAddress?: Maybe<OrganizationAddress>;
  billingAddressId?: Maybe<Scalars['Int']>;
  coverUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  estimatedAt: Scalars['DateTime'];
  id: Scalars['Int'];
  mailingAddressId?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  onboardingStatus: OnboardingStatus;
  preferences: OrganizationPreferences;
  roles: PaginatedRoles;
  scheduleStatus: ScheduleStatus;
  showOnboarding: Scalars['Boolean'];
  status: OrganizationStatus;
  updatedAt: Scalars['DateTime'];
};


export type OrganizationRolesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type OrganizationAddress = {
  __typename?: 'OrganizationAddress';
  address1: Scalars['String'];
  address2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  country: Scalars['String'];
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  state?: Maybe<Scalars['String']>;
  zipcode: Scalars['String'];
};

export type OrganizationPreferences = {
  __typename?: 'OrganizationPreferences';
  showOnboarding: Scalars['Boolean'];
};

export enum OrganizationStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Suspended = 'SUSPENDED'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Int']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  pageCount: Scalars['Int'];
  pageNumber: Scalars['Int'];
  pageSize: Scalars['Int'];
};

export type PaginatedBlackoutTimes = {
  __typename?: 'PaginatedBlackoutTimes';
  nodes: Array<BlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedComments = {
  __typename?: 'PaginatedComments';
  nodes: Array<Comment>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedDocumentations = {
  __typename?: 'PaginatedDocumentations';
  nodes: Array<Documentation>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedFeatureGroups = {
  __typename?: 'PaginatedFeatureGroups';
  nodes: Array<FeatureGroup>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedFeatures = {
  __typename?: 'PaginatedFeatures';
  nodes: Array<Feature>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedIssues = {
  __typename?: 'PaginatedIssues';
  nodes: Array<Issue>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedNotes = {
  __typename?: 'PaginatedNotes';
  nodes: Array<Note>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedNotifications = {
  __typename?: 'PaginatedNotifications';
  nodes: Array<Notification>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedOrganizations = {
  __typename?: 'PaginatedOrganizations';
  nodes: Array<Organization>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedPersonalTags = {
  __typename?: 'PaginatedPersonalTags';
  nodes: Array<PersonalTag>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedProducts = {
  __typename?: 'PaginatedProducts';
  nodes: Array<Product>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedProjects = {
  __typename?: 'PaginatedProjects';
  nodes: Array<Project>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedRecurringBlackoutTimes = {
  __typename?: 'PaginatedRecurringBlackoutTimes';
  nodes: Array<RecurringBlackoutTime>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedReports = {
  __typename?: 'PaginatedReports';
  nodes: Array<Report>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedRoles = {
  __typename?: 'PaginatedRoles';
  nodes: Array<Role>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedScheduleItems = {
  __typename?: 'PaginatedScheduleItems';
  nodes: Array<ScheduleItem>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedTags = {
  __typename?: 'PaginatedTags';
  nodes: Array<Tag>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedTeams = {
  __typename?: 'PaginatedTeams';
  nodes: Array<Team>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedTickets = {
  __typename?: 'PaginatedTickets';
  nodes: Array<Ticket>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedTodos = {
  __typename?: 'PaginatedTodos';
  nodes: Array<Todo>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedUsers = {
  __typename?: 'PaginatedUsers';
  nodes: Array<User>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PaginatedWorkflows = {
  __typename?: 'PaginatedWorkflows';
  nodes: Array<Workflow>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int'];
};

export type PasswordLostInput = {
  email: Scalars['String'];
  hash: Scalars['String'];
  proof: Scalars['String'];
};

export type PasswordResetInput = {
  email: Scalars['String'];
  hash: Scalars['String'];
  password: Scalars['String'];
  proof: Scalars['String'];
  secret: Scalars['String'];
};

export type PersonalTag = {
  __typename?: 'PersonalTag';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  owner: Role;
  ownerId: Scalars['Int'];
  replacedByTagId?: Maybe<Scalars['Int']>;
  updatedAt: Scalars['DateTime'];
};

export type PlanningTicket = {
  __typename?: 'PlanningTicket';
  eta: Scalars['DateTime'];
  id: Scalars['Int'];
  localId: Scalars['Int'];
  milestone: Scalars['Boolean'];
  productCode: Scalars['String'];
  productName: Scalars['String'];
  projectName: Scalars['String'];
  status: TicketStatus;
  title: Scalars['String'];
  workflowName: Scalars['String'];
};

export type Product = {
  __typename?: 'Product';
  code: Scalars['String'];
  coverUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  featureGroups: PaginatedFeatureGroups;
  features: PaginatedFeatures;
  id: Scalars['Int'];
  isSupportActive: Scalars['Boolean'];
  isUsingDefaultWorkflows: Scalars['Boolean'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  stage: ModelStage;
  tickets: PaginatedTickets;
  updatedAt: Scalars['DateTime'];
  workflowIds: Array<Scalars['Int']>;
  workflows: PaginatedWorkflows;
};


export type ProductFeatureGroupsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type ProductFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type ProductTicketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type ProductWorkflowsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
};

export type Project = {
  __typename?: 'Project';
  ancestorIsArchived: Scalars['Boolean'];
  ancestors: Array<Project>;
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']>;
  checklist: Array<ChecklistItem>;
  createdAt: Scalars['DateTime'];
  duration: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  owner?: Maybe<Role>;
  ownerId?: Maybe<Scalars['Int']>;
  parentId?: Maybe<Scalars['Int']>;
  stage: ModelStage;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime'];
};

export type ProjectAnalytics = {
  __typename?: 'ProjectAnalytics';
  doneTicketCount: Scalars['Int'];
  draftTicketCount: Scalars['Int'];
  estimatedTicketCount: Scalars['Int'];
  inProgressTicketCount: Scalars['Int'];
  organizationId: Scalars['Int'];
  projectId: Scalars['Int'];
  scheduledTicketCount: Scalars['Int'];
  unassignedTicketCount: Scalars['Int'];
  unestimatedTicketCount: Scalars['Int'];
};

export type ProjectDependency = {
  __typename?: 'ProjectDependency';
  ancestors: Array<Scalars['Int']>;
  id: Scalars['Int'];
  name: Scalars['String'];
  parentId?: Maybe<Scalars['Int']>;
  successors: Array<Scalars['Int']>;
};

export type ProjectGoalProgress = {
  __typename?: 'ProjectGoalProgress';
  accomplished: Scalars['Float'];
  eta: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  parentId?: Maybe<Scalars['Int']>;
  progress: Scalars['Float'];
  total: Scalars['Float'];
};

export type ProjectGoalStats = {
  __typename?: 'ProjectGoalStats';
  cancelled: Scalars['Int'];
  done: Scalars['Int'];
  id: Scalars['Int'];
  name: Scalars['String'];
  parentId?: Maybe<Scalars['Int']>;
  scheduled: Scalars['Int'];
  total: Scalars['Int'];
  unScheduled: Scalars['Int'];
};

export type ProjectTicket = {
  __typename?: 'ProjectTicket';
  createdAt: Scalars['DateTime'];
  id: Scalars['Float'];
  localId?: Maybe<Scalars['Float']>;
  productCode?: Maybe<Scalars['String']>;
  stage: ModelStage;
  status: TicketStatus;
  title: Scalars['String'];
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
  /** retrieve the tags for the provided tickets */
  batchGetTicketTags: Array<Ticket>;
  /** retrieve the tags for the provided tickets */
  batchGetTickets: Array<Ticket>;
  blackoutTime: BlackoutTime;
  blackoutTimes: Array<BlackoutTime>;
  /** scheduled tickets that cannot be estimated */
  blockingTickets: Array<TicketWorkflowState>;
  comment: Comment;
  comments: PaginatedComments;
  deliveredTicketForPeriod: Array<Ticket>;
  dependencies: DependencySet;
  documentation: Documentation;
  documentationPage: DocumentationPage;
  documentationPageAccessToken?: Maybe<Scalars['String']>;
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
  /** The user's own tickets and drafts */
  myTickets: Array<Ticket>;
  /** estimated and not yet estimated ticket assigned to me */
  myTicketsToEstimate: Array<Ticket>;
  myUnestimatedTickets: Array<Ticket>;
  myUnfinishedScheduleItems: Array<ScheduleItem>;
  /** tickets we will be working on, once the current assignee is done */
  myUpcomingTickets: Array<MyUpcomingAssignedTicket>;
  myWatchedTickets: Array<Ticket>;
  note: Note;
  notes: PaginatedNotes;
  notification: Notification;
  organization: Organization;
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
  pof: Scalars['String'];
  product: Product;
  productByCode: Product;
  products: PaginatedProducts;
  project: Project;
  projectAccessToken?: Maybe<Scalars['String']>;
  projectAnalytics?: Maybe<ProjectAnalytics>;
  projectGoalStats: Array<ProjectGoalStats>;
  projectTextAccessToken?: Maybe<Scalars['String']>;
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
  ticketTextAccessToken?: Maybe<Scalars['String']>;
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateNote: TicketWorkflowStateNote;
  tickets: PaginatedTickets;
  ticketsCount: Scalars['Int'];
  ticketsForMyCalendar: Array<Ticket>;
  timeOffs: Array<TimeOff>;
  todo: Todo;
  todos: PaginatedTodos;
  useRole: Me;
  user: User;
  users: PaginatedUsers;
  version: Scalars['String'];
  workedTicketForPeriod: Array<Ticket>;
  workflow: Workflow;
  workflowState: WorkflowState;
  workflows: PaginatedWorkflows;
};


export type QueryBatchGetTicketTagsArgs = {
  ticketIds: Array<InputMaybe<Scalars['Int']>>;
};


export type QueryBatchGetTicketsArgs = {
  ticketIds: Array<InputMaybe<Scalars['Int']>>;
};


export type QueryBlackoutTimeArgs = {
  id: Scalars['Int'];
};


export type QueryCommentArgs = {
  id: Scalars['Int'];
};


export type QueryCommentsArgs = {
  commentId?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  replyId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  ticketId: Scalars['Int'];
};


export type QueryDeliveredTicketForPeriodArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryDependenciesArgs = {
  projectId?: InputMaybe<Scalars['Int']>;
};


export type QueryDocumentationArgs = {
  id: Scalars['Int'];
};


export type QueryDocumentationPageArgs = {
  id: Scalars['Int'];
};


export type QueryDocumentationPageAccessTokenArgs = {
  id: Scalars['Int'];
};


export type QueryDocumentationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryDrawingArgs = {
  id: Scalars['Int'];
};


export type QueryExportTicketsArgs = {
  sources: Array<Scalars['String']>;
};


export type QueryFeatureGroupArgs = {
  id: Scalars['Int'];
};


export type QueryFeatureGroupsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['ID']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryFeaturesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryGetAllUnscheduledDependenciesArgs = {
  ticketIds: Array<Scalars['Int']>;
};


export type QueryGetDemoArgs = {
  id: Scalars['String'];
};


export type QueryGetEstimatesArgs = {
  toDate: Scalars['DateTime'];
};


export type QueryGetScheduleRolesArgs = {
  fromDate: Scalars['DateTime'];
  toDate: Scalars['DateTime'];
};


export type QueryGetUnscheduledDependenciesArgs = {
  ticketIds: Array<Scalars['Int']>;
};


export type QueryGetUnscheduledTicketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  tagId?: InputMaybe<Scalars['Int']>;
  workflowId?: InputMaybe<Scalars['Int']>;
};


export type QueryIssueArgs = {
  id: Scalars['Int'];
};


export type QueryIssueByTokenArgs = {
  token: Scalars['String'];
};


export type QueryIssuesArgs = {
  assigneeId?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  statuses?: InputMaybe<Array<IssueStatus>>;
  unassigned?: InputMaybe<Scalars['Boolean']>;
  unread?: InputMaybe<Scalars['Boolean']>;
};


export type QueryLastTicketWorkflowStateNoteArgs = {
  ticketId: Scalars['Int'];
};


export type QueryMiniFeaturesArgs = {
  productId?: InputMaybe<Scalars['Int']>;
};


export type QueryMiniWorkflowsArgs = {
  productId?: InputMaybe<Scalars['Int']>;
};


export type QueryMoreTicketsArgs = {
  allUntagged?: InputMaybe<Scalars['Boolean']>;
  assigneeIds?: InputMaybe<Array<Scalars['Int']>>;
  atRisk?: InputMaybe<Scalars['Boolean']>;
  authorIds?: InputMaybe<Array<Scalars['Int']>>;
  closedAtFilter?: InputMaybe<Scalars['String']>;
  createdAtFilter?: InputMaybe<Scalars['String']>;
  cursor?: InputMaybe<Scalars['Int']>;
  etaFilter?: InputMaybe<Scalars['String']>;
  featureIds?: InputMaybe<Array<Scalars['Int']>>;
  first?: InputMaybe<Scalars['Int']>;
  hideCompleted?: InputMaybe<Scalars['Boolean']>;
  intersectTagIds?: InputMaybe<Array<Scalars['Int']>>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  ownerIds?: InputMaybe<Array<Scalars['Int']>>;
  productId?: InputMaybe<Scalars['Int']>;
  productIds?: InputMaybe<Array<Scalars['Int']>>;
  projectId?: InputMaybe<Scalars['Int']>;
  recursive?: InputMaybe<Scalars['Boolean']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
  tagIds?: InputMaybe<Array<Scalars['Int']>>;
  unassigned?: InputMaybe<Scalars['Boolean']>;
  unestimated?: InputMaybe<Scalars['Boolean']>;
  untagged?: InputMaybe<Scalars['Boolean']>;
  workflowIds?: InputMaybe<Array<Scalars['Int']>>;
};


export type QueryMoreTicketsForProjectArgs = {
  cursor?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  hideCompleted?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['Int'];
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryMyMiniProjectsArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']>;
};


export type QueryMyNotScheduledTicketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryMyNotificationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  unread?: InputMaybe<Scalars['Boolean']>;
};


export type QueryMyRecentlyCreatedTicketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryMyScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime'];
  toDate: Scalars['DateTime'];
};


export type QueryNoteArgs = {
  id: Scalars['Int'];
};


export type QueryNotesArgs = {
  colors?: InputMaybe<Array<NoteColor>>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryNotificationArgs = {
  id: Scalars['Int'];
};


export type QueryOrganizationsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryPaginatedBlackoutTimesArgs = {
  disabled?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryPaginatedRecurringBlackoutTimesArgs = {
  disabled?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryPastGoalProgressArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryPastWorkflowDistributionArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryPersonalTagArgs = {
  id: Scalars['Int'];
};


export type QueryPersonalTagsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryPlanningDeliveredTicketsArgs = {
  fromDate: Scalars['DateTime'];
  toDate: Scalars['DateTime'];
};


export type QueryPlanningProjectionArgs = {
  scheduleConfigs: Array<InputMaybe<ScheduleConfigForEstimateInput>>;
  ticketIds: Array<Scalars['Int']>;
};


export type QueryProductArgs = {
  id: Scalars['Int'];
};


export type QueryProductByCodeArgs = {
  code: Scalars['String'];
};


export type QueryProductsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryProjectArgs = {
  id: Scalars['Int'];
  visited?: InputMaybe<Scalars['Boolean']>;
};


export type QueryProjectAccessTokenArgs = {
  id: Scalars['Int'];
};


export type QueryProjectAnalyticsArgs = {
  projectId: Scalars['Int'];
};


export type QueryProjectGoalStatsArgs = {
  projectId: Scalars['Int'];
};


export type QueryProjectTextAccessTokenArgs = {
  id: Scalars['Int'];
};


export type QueryProjectTicketsArgs = {
  myDraft?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
};


export type QueryProjectTicketsForCategoryArgs = {
  category: ProjectTicketQueryCategory;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  projectId: Scalars['Int'];
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryProjectedGoalProgressArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryProjectedWorkflowDistributionArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryProjectedWorkloadArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryProjectsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  parentId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryRecurringBlackoutTimeArgs = {
  id: Scalars['Int'];
};


export type QueryRecurringBlackoutTimesArgs = {
  includeDisabled?: InputMaybe<Scalars['Boolean']>;
};


export type QueryRepliesArgs = {
  commentId: Scalars['Int'];
};


export type QueryReportArgs = {
  id: Scalars['Int'];
};


export type QueryReportQueryArgs = {
  id: Scalars['Int'];
};


export type QueryReportsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
};


export type QueryRoleArgs = {
  id: Scalars['Int'];
};


export type QueryRolesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryScheduleConfigArgs = {
  id: Scalars['Int'];
};


export type QueryScheduleItemArgs = {
  scheduleItemId: Scalars['Int'];
};


export type QueryScheduleItemPeriodArgs = {
  fromDate: Scalars['DateTime'];
  roleId?: InputMaybe<Scalars['Int']>;
  toDate?: InputMaybe<Scalars['DateTime']>;
};


export type QueryScheduleItemUpdateBoundariesArgs = {
  scheduleItemId: Scalars['Int'];
};


export type QueryScheduleItemsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  roleId?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryScheduledTicketToBeClosingArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryScheduledTicketToBeWorkedArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QuerySearchArgs = {
  includeClosed?: InputMaybe<Scalars['Boolean']>;
  query: Scalars['String'];
};


export type QuerySearchRoleArgs = {
  query: Scalars['String'];
};


export type QuerySearchTicketArgs = {
  includeClosed?: InputMaybe<Scalars['Boolean']>;
  query: Scalars['String'];
};


export type QueryTagArgs = {
  id: Scalars['Int'];
};


export type QueryTagsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryTeamArgs = {
  id: Scalars['Int'];
};


export type QueryTeamByCodeArgs = {
  code: Scalars['String'];
};


export type QueryTeamsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryTicketArgs = {
  id: Scalars['Int'];
  visited?: InputMaybe<Scalars['Boolean']>;
};


export type QueryTicketNotesArgs = {
  ticketId: Scalars['Int'];
};


export type QueryTicketStatusHistogramArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryTicketTextAccessTokenArgs = {
  id: Scalars['Int'];
};


export type QueryTicketWorkflowStateArgs = {
  id: Scalars['Int'];
};


export type QueryTicketWorkflowStateNoteArgs = {
  ticketWorkflowStateNoteId: Scalars['Int'];
};


export type QueryTicketsArgs = {
  assigneeIds?: InputMaybe<Array<Scalars['Int']>>;
  authorIds?: InputMaybe<Array<Scalars['Int']>>;
  createdAtFilter?: InputMaybe<Scalars['String']>;
  etaFilter?: InputMaybe<Scalars['String']>;
  featureIds?: InputMaybe<Array<Scalars['Int']>>;
  first?: InputMaybe<Scalars['Int']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  isReadyToSchedule?: InputMaybe<Scalars['Boolean']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  productIds?: InputMaybe<Array<Scalars['Int']>>;
  projectId?: InputMaybe<Scalars['Int']>;
  recursive?: InputMaybe<Scalars['Boolean']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
  statuses?: InputMaybe<Array<TicketStatus>>;
  tagIds?: InputMaybe<Array<Scalars['Int']>>;
  unassigned?: InputMaybe<Scalars['Boolean']>;
  unestimated?: InputMaybe<Scalars['Boolean']>;
  unfinished?: InputMaybe<Scalars['Boolean']>;
  untagged?: InputMaybe<Scalars['Boolean']>;
  watched?: InputMaybe<Scalars['Boolean']>;
  workflowIds?: InputMaybe<Array<Scalars['Int']>>;
};


export type QueryTicketsCountArgs = {
  addedTicketIds: Array<InputMaybe<Scalars['Int']>>;
  filter: UpdateScheduleConfig;
  removedTicketIds: Array<InputMaybe<Scalars['Int']>>;
};


export type QueryTicketsForMyCalendarArgs = {
  search?: InputMaybe<Scalars['String']>;
};


export type QueryTimeOffsArgs = {
  fromDate: Scalars['DateTime'];
  toDate: Scalars['DateTime'];
};


export type QueryTodoArgs = {
  id: Scalars['Int'];
};


export type QueryTodosArgs = {
  dynamic?: InputMaybe<Scalars['Boolean']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryUseRoleArgs = {
  organizationId: Scalars['Int'];
};


export type QueryUserArgs = {
  id: Scalars['Int'];
};


export type QueryUsersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};


export type QueryWorkedTicketForPeriodArgs = {
  projectId: Scalars['Int'];
  startDate: Scalars['DateTime'];
  stopDate: Scalars['DateTime'];
};


export type QueryWorkflowArgs = {
  id: Scalars['Int'];
};


export type QueryWorkflowStateArgs = {
  id: Scalars['Int'];
};


export type QueryWorkflowsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
  stages?: InputMaybe<Array<ModelStage>>;
};

export type QueryAggregate = {
  __typename?: 'QueryAggregate';
  main?: Maybe<Scalars['String']>;
  secondary?: Maybe<Scalars['String']>;
  value: Scalars['Float'];
};

export type RecurringBlackoutTime = {
  __typename?: 'RecurringBlackoutTime';
  createdAt: Scalars['DateTime'];
  disabled: Scalars['Boolean'];
  friday: Scalars['Boolean'];
  id: Scalars['Int'];
  monday: Scalars['Boolean'];
  name: Scalars['String'];
  organizationId: Scalars['Int'];
  roles: Array<Role>;
  saturday: Scalars['Boolean'];
  startTime: Scalars['String'];
  stopTime: Scalars['String'];
  sunday: Scalars['Boolean'];
  thursday: Scalars['Boolean'];
  timeZone: Scalars['String'];
  tuesday: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
  wednesday: Scalars['Boolean'];
};

export type RegisterInput = {
  email: Scalars['String'];
  hash: Scalars['String'];
  password: Scalars['String'];
  proof: Scalars['String'];
};

export type Report = {
  __typename?: 'Report';
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  queries: Array<ReportQuery>;
  stage: ModelStage;
  updatedAt: Scalars['DateTime'];
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
  byProducts: Array<FilterElement>;
  byTags: Array<FilterElement>;
  byTickets: Array<FilterElement>;
  byWorkflowStateAssignees: Array<FilterElement>;
  byWorkflowStates: Array<FilterElement>;
  byWorkflows: Array<FilterElement>;
  chartBy: ReportGroupBy;
  chartByLabel?: Maybe<Scalars['String']>;
  cols: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  cummulative: Scalars['Boolean'];
  fromDate?: Maybe<Scalars['String']>;
  granularity: ReportDateGranularity;
  groupBy?: Maybe<ReportGroupBy>;
  groupByLabel?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  isTicketActive?: Maybe<Scalars['Boolean']>;
  isTicketDone?: Maybe<Scalars['Boolean']>;
  isTicketNotStarted?: Maybe<Scalars['Boolean']>;
  isTicketStarted?: Maybe<Scalars['Boolean']>;
  noUnknowns: Scalars['Boolean'];
  organization: Organization;
  organizationId: Scalars['Int'];
  position: Scalars['Int'];
  reportId: Scalars['Int'];
  rows: Scalars['Int'];
  sameAsPrimaryFilter: Scalars['Boolean'];
  secondaryByAssignees: Array<FilterElement>;
  secondaryByAuthors: Array<FilterElement>;
  secondaryByOwners: Array<FilterElement>;
  secondaryByProducts: Array<FilterElement>;
  secondaryByTags: Array<FilterElement>;
  secondaryByTickets: Array<FilterElement>;
  secondaryByWorkflowStateAssignees: Array<FilterElement>;
  secondaryByWorkflowStates: Array<FilterElement>;
  secondaryByWorkflows: Array<FilterElement>;
  secondaryChartBy?: Maybe<ReportGroupBy>;
  secondaryChartByLabel?: Maybe<Scalars['String']>;
  secondaryGroupBy?: Maybe<ReportGroupBy>;
  secondaryGroupByLabel?: Maybe<Scalars['String']>;
  secondaryIsTicketActive?: Maybe<Scalars['Boolean']>;
  secondaryIsTicketDone?: Maybe<Scalars['Boolean']>;
  secondaryIsTicketNotStarted?: Maybe<Scalars['Boolean']>;
  secondaryIsTicketStarted?: Maybe<Scalars['Boolean']>;
  title: Scalars['String'];
  untilDate?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
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
  email: Scalars['String'];
  hash: Scalars['String'];
  proof: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  avatarUrl?: Maybe<Scalars['String']>;
  coverUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  pinnedProjects: Array<Project>;
  preferences: RolePreferences;
  roleAutoResume: RoleAutoResume;
  roleEmail: RoleEmail;
  roleStartReminder: RoleStartReminder;
  status: RoleStatus;
  teams: Array<Team>;
  timeZone: Scalars['String'];
  title?: Maybe<Scalars['String']>;
  type: RoleType;
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['Int'];
  workWeek: WorkWeekTime;
};

export type RoleAutoResume = {
  __typename?: 'RoleAutoResume';
  id: Scalars['Int'];
  nextStartNotificationDate: Scalars['DateTime'];
  nextStartNotificationOptOut: Scalars['Boolean'];
  roleId: Scalars['Int'];
};

export type RoleEmail = {
  __typename?: 'RoleEmail';
  id: Scalars['Int'];
  nextWorkDayNotificationDate: Scalars['DateTime'];
  nextWorkDayNotificationOffset: Scalars['Int'];
  nextWorkDayNotificationOptOut: Scalars['Boolean'];
  roleId: Scalars['Int'];
};

export type RoleHabit = {
  __typename?: 'RoleHabit';
  productWorkflows: Array<HabitProductWorkflow>;
  projects: Array<Project>;
};

export type RoleNoteColorPreferences = {
  __typename?: 'RoleNoteColorPreferences';
  BLUE: Scalars['String'];
  GREEN: Scalars['String'];
  ORANGE: Scalars['String'];
  PINK: Scalars['String'];
  PURPLE: Scalars['String'];
  YELLOW: Scalars['String'];
};

export type RolePreferences = {
  __typename?: 'RolePreferences';
  lastProjectId?: Maybe<Scalars['Int']>;
  noteColors: RoleNoteColorPreferences;
  recentSearchHits: Array<Scalars['String']>;
  recentlyVisited: Array<Scalars['String']>;
  showOnboarding: Scalars['Boolean'];
};

export type RoleStartReminder = {
  __typename?: 'RoleStartReminder';
  id: Scalars['Int'];
  nextStartNotificationDate: Scalars['DateTime'];
  nextStartNotificationOffset: Scalars['Int'];
  nextStartNotificationOptOut: Scalars['Boolean'];
  roleId: Scalars['Int'];
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
  startTime: Scalars['String'];
  stopTime: Scalars['String'];
};

export type RoleWorkload = {
  __typename?: 'RoleWorkload';
  hours: Scalars['Float'];
  role: Role;
};

export type ScheduleConfig = {
  __typename?: 'ScheduleConfig';
  createdAt: Scalars['DateTime'];
  features: Array<Feature>;
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  priority: Scalars['Int'];
  products: Array<Product>;
  projects: Array<Project>;
  tags: Array<Tag>;
  tickets: Array<Ticket>;
  updatedAt: Scalars['DateTime'];
  workflows: Array<Workflow>;
};

export type ScheduleConfigForEstimateInput = {
  features: Array<ScheduleItemForEstimateObjInput>;
  priority: Scalars['Float'];
  products: Array<ScheduleItemForEstimateObjInput>;
  projects: Array<ScheduleItemForEstimateObjInput>;
  tags: Array<ScheduleItemForEstimateObjInput>;
  tickets: Array<ScheduleItemForEstimateObjInput>;
  workflows: Array<ScheduleItemForEstimateObjInput>;
};

export type ScheduleEstimate = {
  __typename?: 'ScheduleEstimate';
  duration: Scalars['Int'];
  roleId: Scalars['Int'];
  startEpoch: Scalars['Int'];
  start_min: Scalars['Int'];
  stopEpoch: Scalars['Int'];
  ticketId: Scalars['Int'];
  ticketLocalId: Scalars['Int'];
  ticketProductCode: Scalars['String'];
  ticketTitle: Scalars['String'];
  ticketWorkflowStateId: Scalars['Int'];
  ticketWorkflowStateName: Scalars['String'];
};

export type ScheduleItem = {
  __typename?: 'ScheduleItem';
  autoStarted: Scalars['Boolean'];
  autoStopped: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  done: Scalars['Boolean'];
  extendedAt?: Maybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  nextTicketWorkflowState?: Maybe<TicketWorkflowState>;
  nextTicketWorkflowStateId?: Maybe<Scalars['Int']>;
  organization: Organization;
  organizationId: Scalars['Int'];
  role: Role;
  roleId: Scalars['Int'];
  startedAt: Scalars['DateTime'];
  stoppedAt?: Maybe<Scalars['DateTime']>;
  ticket: Ticket;
  ticketId: Scalars['Int'];
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export type ScheduleItemForEstimateObjInput = {
  id: Scalars['Float'];
};

export type ScheduleItemUpdateBoundaries = {
  __typename?: 'ScheduleItemUpdateBoundaries';
  maxDate: Scalars['DateTime'];
  minDate?: Maybe<Scalars['DateTime']>;
};

export type ScheduleRole = {
  __typename?: 'ScheduleRole';
  avatarUrl?: Maybe<Scalars['String']>;
  /** available time in hours */
  futureCapacity: Scalars['Float'];
  id: Scalars['Float'];
  name: Scalars['String'];
  /** available time in hours */
  pastCapacity: Scalars['Float'];
  title?: Maybe<Scalars['String']>;
};

export enum ScheduleStatus {
  AssigneeDeactivated = 'ASSIGNEE_DEACTIVATED',
  Blocked = 'BLOCKED',
  Ok = 'OK'
}

export type SearchResult = {
  __typename?: 'SearchResult';
  description: Scalars['String'];
  id: Scalars['ID'];
  meta: Scalars['String'];
  name: Scalars['String'];
};

export type Skill = {
  __typename?: 'Skill';
  createdAt: Scalars['DateTime'];
  featureId: Scalars['Int'];
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  roleId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  value: Scalars['Float'];
};

export type Tag = {
  __typename?: 'Tag';
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']>;
  color: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  replacedByTagId?: Maybe<Scalars['Int']>;
  ticketCount: Scalars['Int'];
  tickets: PaginatedTickets;
  updatedAt: Scalars['DateTime'];
};


export type TagTicketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type Team = {
  __typename?: 'Team';
  code: Scalars['String'];
  coverUrl?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  memberIds: Array<Scalars['Int']>;
  members: PaginatedRoles;
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};


export type TeamMembersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type Ticket = {
  __typename?: 'Ticket';
  ancestors: Array<Ticket>;
  archivedAt?: Maybe<Scalars['DateTime']>;
  author?: Maybe<Role>;
  authorId?: Maybe<Scalars['Int']>;
  closedAt?: Maybe<Scalars['DateTime']>;
  closingNote?: Maybe<Scalars['String']>;
  comments: PaginatedComments;
  createdAt: Scalars['DateTime'];
  deletedAt?: Maybe<Scalars['DateTime']>;
  description?: Maybe<Scalars['String']>;
  difficulty?: Maybe<Scalars['Int']>;
  estimate: Scalars['Int'];
  estimating: Scalars['Boolean'];
  eta?: Maybe<Scalars['DateTime']>;
  features: Array<Feature>;
  folderId?: Maybe<Scalars['Int']>;
  foreignId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  isWatching: Scalars['Boolean'];
  issues: Array<Issue>;
  lastScheduleItem?: Maybe<ScheduleItem>;
  localId?: Maybe<Scalars['Int']>;
  milestone: Scalars['Boolean'];
  organization: Organization;
  organizationId: Scalars['Int'];
  owner?: Maybe<Role>;
  ownerId?: Maybe<Scalars['Int']>;
  personalTags: Array<PersonalTag>;
  product?: Maybe<Product>;
  productId?: Maybe<Scalars['Int']>;
  progress: Scalars['Float'];
  project?: Maybe<Project>;
  projectId: Scalars['Int'];
  scheduleItems: Array<ScheduleItem>;
  scheduledAt?: Maybe<Scalars['DateTime']>;
  stage: ModelStage;
  state?: Maybe<TicketWorkflowState>;
  status: TicketStatus;
  successors: Array<Ticket>;
  tags: Array<Tag>;
  ticketWorkflowStates: Array<TicketWorkflowState>;
  title: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  watchers: Array<Role>;
  workflow?: Maybe<Workflow>;
  workflowId?: Maybe<Scalars['Int']>;
};


export type TicketCommentsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  search?: InputMaybe<Scalars['String']>;
};

export type TicketDependency = {
  __typename?: 'TicketDependency';
  ancestors: Array<Scalars['Int']>;
  id: Scalars['Int'];
  localId?: Maybe<Scalars['Int']>;
  milestone: Scalars['Boolean'];
  productCode?: Maybe<Scalars['String']>;
  projectId?: Maybe<Scalars['Int']>;
  status: TicketStatus;
  successors: Array<Scalars['Int']>;
  title: Scalars['String'];
};

export type TicketExport = {
  __typename?: 'TicketExport';
  ancestor_tickets: Scalars['String'];
  author_email: Scalars['String'];
  author_name: Scalars['String'];
  closed_at: Scalars['String'];
  created_at: Scalars['String'];
  description: Scalars['String'];
  eta: Scalars['String'];
  id: Scalars['Int'];
  local_id: Scalars['String'];
  owner_email: Scalars['String'];
  owner_name: Scalars['String'];
  product: Scalars['String'];
  project: Scalars['String'];
  scheduled_at: Scalars['String'];
  stage: ModelStage;
  status: TicketStatus;
  successor_tickets: Scalars['String'];
  tags: Scalars['String'];
  title: Scalars['String'];
  workflow: Scalars['String'];
};

export type TicketOpenByWorkflowDatum = {
  __typename?: 'TicketOpenByWorkflowDatum';
  date: Scalars['DateTime'];
  value: Scalars['Int'];
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
  assigneeId?: Maybe<Scalars['Int']>;
  checklist: Array<ChecklistItem>;
  complete: Scalars['Int'];
  estimate?: Maybe<Scalars['DateTime']>;
  estimateMaximum?: Maybe<Scalars['Int']>;
  estimateMinimum?: Maybe<Scalars['Int']>;
  estimateMostLikely?: Maybe<Scalars['Int']>;
  estimateSet?: Maybe<Estimate>;
  fractionable: Scalars['Boolean'];
  id: Scalars['Int'];
  isActive: Scalars['Boolean'];
  isBlocked: Scalars['Boolean'];
  name: Scalars['String'];
  position: Scalars['Int'];
  scheduleItems: Array<ScheduleItem>;
  ticket: Ticket;
  ticketId: Scalars['Int'];
  ticketWorkflowStateNotes: Array<TicketWorkflowStateNote>;
  todo: Scalars['Int'];
  workflowState?: Maybe<WorkflowState>;
  workflowStateId?: Maybe<Scalars['Int']>;
};

export type TicketWorkflowStateInput = {
  assigneeId?: InputMaybe<Scalars['Int']>;
  isActive?: InputMaybe<Scalars['Boolean']>;
  ticketWorkflowStateId: Scalars['Int'];
};

export type TicketWorkflowStateNote = {
  __typename?: 'TicketWorkflowStateNote';
  author: Role;
  authorId: Scalars['Int'];
  body: Scalars['String'];
  category: TicketWorkflowStateNoteCategory;
  createdAt: Scalars['DateTime'];
  fromTicketWorkflowState: TicketWorkflowState;
  fromTicketWorkflowStateId: Scalars['Int'];
  id: Scalars['Int'];
  ticketWorkflowState: TicketWorkflowState;
  ticketWorkflowStateId: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
};

export enum TicketWorkflowStateNoteCategory {
  BlockNote = 'BLOCK_NOTE',
  CloseNote = 'CLOSE_NOTE',
  StateNote = 'STATE_NOTE',
  UnblockNote = 'UNBLOCK_NOTE'
}

export type TimeOff = {
  __typename?: 'TimeOff';
  id: Scalars['Int'];
  organizationId: Scalars['Int'];
  roleId: Scalars['Int'];
  startAt: Scalars['DateTime'];
  stopAt: Scalars['DateTime'];
};

export type Todo = {
  __typename?: 'Todo';
  body: Scalars['String'];
  checked: Scalars['Boolean'];
  checkedAt?: Maybe<Scalars['DateTime']>;
  createdAt: Scalars['DateTime'];
  dueDate?: Maybe<Scalars['DateTime']>;
  id: Scalars['Int'];
  organization: Organization;
  organizationId: Scalars['Int'];
  owner: Role;
  ownerId: Scalars['Int'];
};

export type UpdateBlackoutTimeInput = {
  disabled?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  roleIds: Array<Scalars['Int']>;
  startAt: Scalars['String'];
  stopAt: Scalars['String'];
};

export type UpdateChecklistInput = {
  checked?: InputMaybe<Scalars['Boolean']>;
  label: Scalars['String'];
};

export type UpdateCommentInput = {
  body: Scalars['String'];
};

export type UpdateDocumentationInput = {
  coverUrl?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateDocumentationPageConfigInput = {
  customId?: InputMaybe<Scalars['String']>;
  keywords: Array<Scalars['String']>;
  title: Scalars['String'];
  urls: Array<Scalars['String']>;
};

export type UpdateDocumentationPageInput = {
  body: Scalars['String'];
};

export type UpdateDrawingInput = {
  data: Scalars['String'];
  renewLock?: Scalars['Boolean'];
  updatedAt: Scalars['DateTime'];
};

export type UpdateFeatureGroupInput = {
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateFeatureInput = {
  name: Scalars['String'];
};

export type UpdateIssueInput = {
  archived?: InputMaybe<Scalars['Boolean']>;
  assigneeId?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<IssueStatus>;
  ticketId?: InputMaybe<Scalars['Int']>;
  unread?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateMyRoleInput = {
  avatarUrl?: InputMaybe<Scalars['String']>;
  coverUrl?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  timeZone?: InputMaybe<Scalars['String']>;
};

export type UpdateNoteInput = {
  body?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationAddressInput = {
  address1: Scalars['String'];
  address2?: InputMaybe<Scalars['String']>;
  city: Scalars['String'];
  country: Scalars['String'];
  state: Scalars['String'];
  zipcode: Scalars['String'];
};

export type UpdateOrganizationInput = {
  billingAddress?: InputMaybe<UpdateOrganizationAddressInput>;
  coverUrl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateOrganizationPreferencesInput = {
  showOnboarding: Scalars['Boolean'];
};

export type UpdatePersonalTagInput = {
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateProductInput = {
  code?: InputMaybe<Scalars['String']>;
  coverUrl?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  isSupportActive?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateProjectChecklistInput = {
  checked?: InputMaybe<Scalars['Boolean']>;
  label: Scalars['String'];
};

export type UpdateRecurringBlackoutTimeInput = {
  disabled?: InputMaybe<Scalars['Boolean']>;
  friday?: InputMaybe<Scalars['Boolean']>;
  monday?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
  roleIds: Array<Scalars['Int']>;
  saturday?: InputMaybe<Scalars['Boolean']>;
  startTime: Scalars['String'];
  stopTime: Scalars['String'];
  sunday?: InputMaybe<Scalars['Boolean']>;
  thursday?: InputMaybe<Scalars['Boolean']>;
  timeZone: Scalars['String'];
  tuesday?: InputMaybe<Scalars['Boolean']>;
  wednesday?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateReplyInput = {
  body: Scalars['String'];
};

export type UpdateReportQueryInput = {
  aggregateField: ReportAggregateField;
  assigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  authorIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  chartBy: ReportGroupBy;
  chartByLabel?: InputMaybe<Scalars['String']>;
  cummulative?: Scalars['Boolean'];
  fromDate?: InputMaybe<Scalars['String']>;
  granularity?: ReportDateGranularity;
  groupBy?: InputMaybe<ReportGroupBy>;
  groupByLabel?: InputMaybe<Scalars['String']>;
  isTicketActive?: InputMaybe<Scalars['Boolean']>;
  isTicketCancelled?: InputMaybe<Scalars['Boolean']>;
  isTicketDone?: InputMaybe<Scalars['Boolean']>;
  isTicketNotStarted?: InputMaybe<Scalars['Boolean']>;
  isTicketStarted?: InputMaybe<Scalars['Boolean']>;
  noUnknowns?: Scalars['Boolean'];
  ownerIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  paths?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  productIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  sameAsPrimaryFilter?: InputMaybe<Scalars['Boolean']>;
  secondaryAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryAuthorIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryChartBy?: InputMaybe<ReportGroupBy>;
  secondaryChartByLabel?: InputMaybe<Scalars['String']>;
  secondaryGroupBy?: InputMaybe<ReportGroupBy>;
  secondaryGroupByLabel?: InputMaybe<Scalars['String']>;
  secondaryIsTicketActive?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketCancelled?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketDone?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketNotStarted?: InputMaybe<Scalars['Boolean']>;
  secondaryIsTicketStarted?: InputMaybe<Scalars['Boolean']>;
  secondaryOwnerIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryPaths?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  secondaryProductIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryTagIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryTicketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowStateAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  secondaryWorkflowStateIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  tagIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  ticketIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  title: Scalars['String'];
  untilDate?: InputMaybe<Scalars['String']>;
  workflowIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  workflowStateAssigneeIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
  workflowStateIds?: InputMaybe<Array<InputMaybe<Scalars['Int']>>>;
};

export type UpdateReportQueryPlacementInput = {
  direction: Scalars['String'];
};

export type UpdateReportQuerySizeInput = {
  cols: Scalars['Int'];
  rows: Scalars['Int'];
};

export type UpdateRoleAutoResumeInput = {
  nextStartNotificationOptOut: Scalars['Boolean'];
};

export type UpdateRoleEmailInput = {
  nextWorkDayNotificationOptOut: Scalars['Boolean'];
};

export type UpdateRoleInput = {
  title?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<RoleType>;
};

export type UpdateRoleNotColorsInput = {
  color: NoteColor;
  value: Scalars['String'];
};

export type UpdateRolePreferencesInput = {
  showOnboarding: Scalars['Boolean'];
};

export type UpdateRoleStartReminderInput = {
  nextStartNotificationOptOut: Scalars['Boolean'];
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
  priority: Scalars['Float'];
  productIds: Array<Scalars['Int']>;
  projectIds: Array<Scalars['Int']>;
  tagIds: Array<Scalars['Int']>;
  ticketIds: Array<Scalars['Int']>;
  workflowIds: Array<Scalars['Int']>;
};

export type UpdateScheduleConfigs = {
  configs: Array<UpdateScheduleConfig>;
};

export type UpdateScheduleItemInput = {
  startedAt: Scalars['String'];
  stoppedAt?: InputMaybe<Scalars['String']>;
};

export type UpdateSkillInput = {
  value: Scalars['Float'];
};

export type UpdateTagInput = {
  color: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateTeamInput = {
  code?: InputMaybe<Scalars['String']>;
  coverUrl?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateTicketInput = {
  difficulty?: InputMaybe<Scalars['Int']>;
  estimating?: InputMaybe<Scalars['Boolean']>;
  milestone?: InputMaybe<Scalars['Boolean']>;
  ownerId?: InputMaybe<Scalars['Int']>;
  productId?: InputMaybe<Scalars['Int']>;
  projectId?: InputMaybe<Scalars['Int']>;
  title?: InputMaybe<Scalars['String']>;
  workflowId?: InputMaybe<Scalars['Int']>;
};

export type UpdateTicketWorkflowStateInput = {
  states: Array<TicketWorkflowStateInput>;
};

export type UpdateTimeOffInput = {
  startAt: Scalars['String'];
  stopAt: Scalars['String'];
};

export type UpdateTodoInput = {
  body?: InputMaybe<Scalars['String']>;
};

export type UpdateUserPreferencesInput = {
  favoriteOrganizations: Array<InputMaybe<Scalars['Int']>>;
  lastOrganizationId?: InputMaybe<Scalars['Int']>;
};

export type UpdateWorkflowInput = {
  color: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  isDefaultWorkflow?: InputMaybe<Scalars['Boolean']>;
  name: Scalars['String'];
};

export type UpdateWorkflowStateInput = {
  backupTeamIds?: InputMaybe<Array<Scalars['Int']>>;
  name: Scalars['String'];
  teamIds?: InputMaybe<Array<Scalars['Int']>>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  id: Scalars['Int'];
  isStaff: Scalars['Boolean'];
  password: Scalars['String'];
  preferences: UserPreferences;
  role: Role;
  roles: PaginatedRoles;
  status: UserStatus;
  updatedAt: Scalars['DateTime'];
};


export type UserRolesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  sort?: InputMaybe<Scalars['String']>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  favoriteOrganizations: Array<Maybe<Scalars['Int']>>;
  lastOrganizationId?: Maybe<Scalars['Int']>;
};

export enum UserStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Invited = 'INVITED',
  Suspended = 'SUSPENDED',
  Unconfirmed = 'UNCONFIRMED'
}

export type WorkDayTimeInput = {
  startTime: Scalars['String'];
  stopTime: Scalars['String'];
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
  color: Scalars['String'];
  createdAt: Scalars['DateTime'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  isDefaultWorkflow: Scalars['Boolean'];
  name: Scalars['String'];
  organization: Organization;
  organizationId: Scalars['Int'];
  products: Array<Product>;
  stage: ModelStage;
  states: Array<WorkflowState>;
  updatedAt: Scalars['DateTime'];
};

export type WorkflowDistribution = {
  __typename?: 'WorkflowDistribution';
  hours: Scalars['Float'];
  workflow: Workflow;
};

export type WorkflowState = {
  __typename?: 'WorkflowState';
  backupTeams: Array<Team>;
  createdAt: Scalars['DateTime'];
  id: Scalars['Int'];
  name: Scalars['String'];
  organizationId: Scalars['Int'];
  position: Scalars['Int'];
  teams: Array<Team>;
  updatedAt: Scalars['DateTime'];
  workflowId: Scalars['Int'];
};

/** Used to move a state amongst a workflow */
export enum WorkflowStateDirection {
  Down = 'down',
  First = 'first',
  Last = 'last',
  Up = 'up'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AcceptRoleInput: AcceptRoleInput;
  AddReplyInput: AddReplyInput;
  AuthStatus: AuthStatus;
  BatchPayload: ResolverTypeWrapper<BatchPayload>;
  BatchUpdateTicketAction: BatchUpdateTicketAction;
  BatchUpdateTicketsInput: BatchUpdateTicketsInput;
  BlackoutTime: ResolverTypeWrapper<BlackoutTime>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ChangeEmailInput: ChangeEmailInput;
  ChangePasswordInput: ChangePasswordInput;
  ChangeTicketWorkflowStateInput: ChangeTicketWorkflowStateInput;
  ChecklistItem: ResolverTypeWrapper<ChecklistItem>;
  ClientUpdateIssueInput: ClientUpdateIssueInput;
  CloseScheduleItemInput: CloseScheduleItemInput;
  Comment: ResolverTypeWrapper<Comment>;
  CommentReply: ResolverTypeWrapper<CommentReply>;
  CreateBlackoutTimeInput: CreateBlackoutTimeInput;
  CreateCommentInput: CreateCommentInput;
  CreateDocumentationInput: CreateDocumentationInput;
  CreateDocumentationPageInput: CreateDocumentationPageInput;
  CreateDrawingInput: CreateDrawingInput;
  CreateFeatureGroupInput: CreateFeatureGroupInput;
  CreateNoteInput: CreateNoteInput;
  CreateOrganizationInput: CreateOrganizationInput;
  CreatePersonalTagInput: CreatePersonalTagInput;
  CreateProductInput: CreateProductInput;
  CreateProjectInput: CreateProjectInput;
  CreateRecurringBlackoutTimeInput: CreateRecurringBlackoutTimeInput;
  CreateReportInput: CreateReportInput;
  CreateReportQueryInput: CreateReportQueryInput;
  CreateScheduleItemInput: CreateScheduleItemInput;
  CreateTagInput: CreateTagInput;
  CreateTeamInput: CreateTeamInput;
  CreateTicketInput: CreateTicketInput;
  CreateTimeOffInput: CreateTimeOffInput;
  CreateTodoInput: CreateTodoInput;
  CreateWorkflowInput: CreateWorkflowInput;
  CreateWorkflowStateInput: CreateWorkflowStateInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DemoRequest: ResolverTypeWrapper<DemoRequest>;
  DemoStatus: DemoStatus;
  DependencySet: ResolverTypeWrapper<DependencySet>;
  Documentation: ResolverTypeWrapper<Documentation>;
  DocumentationPage: ResolverTypeWrapper<DocumentationPage>;
  Drawing: ResolverTypeWrapper<Drawing>;
  DuplicateReportInput: DuplicateReportInput;
  Estimate: ResolverTypeWrapper<Estimate>;
  EstimateTicketWorkflowStateInput: EstimateTicketWorkflowStateInput;
  EstimateType: EstimateType;
  Feature: ResolverTypeWrapper<Feature>;
  FeatureFlag: ResolverTypeWrapper<FeatureFlag>;
  FeatureGroup: ResolverTypeWrapper<FeatureGroup>;
  FeatureGroupStatus: FeatureGroupStatus;
  FilterElement: ResolverTypeWrapper<FilterElement>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  HabitProductWorkflow: ResolverTypeWrapper<HabitProductWorkflow>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ImportTicketsInput: ImportTicketsInput;
  ImportTicketsInputDetail: ImportTicketsInputDetail;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  InviteInput: InviteInput;
  Issue: ResolverTypeWrapper<Issue>;
  IssueAction: ResolverTypeWrapper<IssueAction>;
  IssueActionCategory: IssueActionCategory;
  IssueAddNoteInput: IssueAddNoteInput;
  IssueContext: ResolverTypeWrapper<IssueContext>;
  IssueSendMessageInput: IssueSendMessageInput;
  IssueStatus: IssueStatus;
  IssueUpdateNoteInput: IssueUpdateNoteInput;
  LoginInput: LoginInput;
  Me: ResolverTypeWrapper<Me>;
  MiniDocumentationPage: ResolverTypeWrapper<MiniDocumentationPage>;
  MiniFeature: ResolverTypeWrapper<MiniFeature>;
  MiniProduct: ResolverTypeWrapper<MiniProduct>;
  MiniProject: ResolverTypeWrapper<MiniProject>;
  MiniRole: ResolverTypeWrapper<MiniRole>;
  MiniTag: ResolverTypeWrapper<MiniTag>;
  MiniWorkflow: ResolverTypeWrapper<MiniWorkflow>;
  ModelStage: ModelStage;
  Mutation: ResolverTypeWrapper<{}>;
  MyPreviousAssignedTicket: ResolverTypeWrapper<MyPreviousAssignedTicket>;
  MyUpcomingAssignedTicket: ResolverTypeWrapper<MyUpcomingAssignedTicket>;
  NewOrganization: ResolverTypeWrapper<NewOrganization>;
  NextTicket: ResolverTypeWrapper<NextTicket>;
  Note: ResolverTypeWrapper<Note>;
  NoteColor: NoteColor;
  Notification: ResolverTypeWrapper<Notification>;
  NotificationCategory: NotificationCategory;
  NotificationTarget: NotificationTarget;
  OnboardingStatus: ResolverTypeWrapper<OnboardingStatus>;
  OpenTicketsByWorkflow: ResolverTypeWrapper<OpenTicketsByWorkflow>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationAddress: ResolverTypeWrapper<OrganizationAddress>;
  OrganizationPreferences: ResolverTypeWrapper<OrganizationPreferences>;
  OrganizationStatus: OrganizationStatus;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PaginatedBlackoutTimes: ResolverTypeWrapper<PaginatedBlackoutTimes>;
  PaginatedComments: ResolverTypeWrapper<PaginatedComments>;
  PaginatedDocumentations: ResolverTypeWrapper<PaginatedDocumentations>;
  PaginatedFeatureGroups: ResolverTypeWrapper<PaginatedFeatureGroups>;
  PaginatedFeatures: ResolverTypeWrapper<PaginatedFeatures>;
  PaginatedIssues: ResolverTypeWrapper<PaginatedIssues>;
  PaginatedNotes: ResolverTypeWrapper<PaginatedNotes>;
  PaginatedNotifications: ResolverTypeWrapper<PaginatedNotifications>;
  PaginatedOrganizations: ResolverTypeWrapper<PaginatedOrganizations>;
  PaginatedPersonalTags: ResolverTypeWrapper<PaginatedPersonalTags>;
  PaginatedProducts: ResolverTypeWrapper<PaginatedProducts>;
  PaginatedProjects: ResolverTypeWrapper<PaginatedProjects>;
  PaginatedRecurringBlackoutTimes: ResolverTypeWrapper<PaginatedRecurringBlackoutTimes>;
  PaginatedReports: ResolverTypeWrapper<PaginatedReports>;
  PaginatedRoles: ResolverTypeWrapper<PaginatedRoles>;
  PaginatedScheduleItems: ResolverTypeWrapper<PaginatedScheduleItems>;
  PaginatedTags: ResolverTypeWrapper<PaginatedTags>;
  PaginatedTeams: ResolverTypeWrapper<PaginatedTeams>;
  PaginatedTickets: ResolverTypeWrapper<PaginatedTickets>;
  PaginatedTodos: ResolverTypeWrapper<PaginatedTodos>;
  PaginatedUsers: ResolverTypeWrapper<PaginatedUsers>;
  PaginatedWorkflows: ResolverTypeWrapper<PaginatedWorkflows>;
  PasswordLostInput: PasswordLostInput;
  PasswordResetInput: PasswordResetInput;
  PersonalTag: ResolverTypeWrapper<PersonalTag>;
  PlanningTicket: ResolverTypeWrapper<PlanningTicket>;
  Product: ResolverTypeWrapper<Product>;
  Project: ResolverTypeWrapper<Project>;
  ProjectAnalytics: ResolverTypeWrapper<ProjectAnalytics>;
  ProjectDependency: ResolverTypeWrapper<ProjectDependency>;
  ProjectGoalProgress: ResolverTypeWrapper<ProjectGoalProgress>;
  ProjectGoalStats: ResolverTypeWrapper<ProjectGoalStats>;
  ProjectTicket: ResolverTypeWrapper<ProjectTicket>;
  ProjectTicketQueryCategory: ProjectTicketQueryCategory;
  Query: ResolverTypeWrapper<{}>;
  QueryAggregate: ResolverTypeWrapper<QueryAggregate>;
  RecurringBlackoutTime: ResolverTypeWrapper<RecurringBlackoutTime>;
  RegisterInput: RegisterInput;
  Report: ResolverTypeWrapper<Report>;
  ReportAggregate: ResolverTypeWrapper<ReportAggregate>;
  ReportAggregateField: ReportAggregateField;
  ReportDateGranularity: ReportDateGranularity;
  ReportGroupBy: ReportGroupBy;
  ReportQuery: ResolverTypeWrapper<ReportQuery>;
  ReportWidgetType: ReportWidgetType;
  RequestDemoInput: RequestDemoInput;
  Role: ResolverTypeWrapper<Role>;
  RoleAutoResume: ResolverTypeWrapper<RoleAutoResume>;
  RoleEmail: ResolverTypeWrapper<RoleEmail>;
  RoleHabit: ResolverTypeWrapper<RoleHabit>;
  RoleNoteColorPreferences: ResolverTypeWrapper<RoleNoteColorPreferences>;
  RolePreferences: ResolverTypeWrapper<RolePreferences>;
  RoleStartReminder: ResolverTypeWrapper<RoleStartReminder>;
  RoleStatus: RoleStatus;
  RoleType: RoleType;
  RoleWorkDay: ResolverTypeWrapper<RoleWorkDay>;
  RoleWorkload: ResolverTypeWrapper<RoleWorkload>;
  ScheduleConfig: ResolverTypeWrapper<ScheduleConfig>;
  ScheduleConfigForEstimateInput: ScheduleConfigForEstimateInput;
  ScheduleEstimate: ResolverTypeWrapper<ScheduleEstimate>;
  ScheduleItem: ResolverTypeWrapper<ScheduleItem>;
  ScheduleItemForEstimateObjInput: ScheduleItemForEstimateObjInput;
  ScheduleItemUpdateBoundaries: ResolverTypeWrapper<ScheduleItemUpdateBoundaries>;
  ScheduleRole: ResolverTypeWrapper<ScheduleRole>;
  ScheduleStatus: ScheduleStatus;
  SearchResult: ResolverTypeWrapper<SearchResult>;
  Skill: ResolverTypeWrapper<Skill>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tag: ResolverTypeWrapper<Tag>;
  Team: ResolverTypeWrapper<Team>;
  Ticket: ResolverTypeWrapper<Ticket>;
  TicketDependency: ResolverTypeWrapper<TicketDependency>;
  TicketExport: ResolverTypeWrapper<TicketExport>;
  TicketOpenByWorkflowDatum: ResolverTypeWrapper<TicketOpenByWorkflowDatum>;
  TicketStatus: TicketStatus;
  TicketWorkflowState: ResolverTypeWrapper<TicketWorkflowState>;
  TicketWorkflowStateInput: TicketWorkflowStateInput;
  TicketWorkflowStateNote: ResolverTypeWrapper<TicketWorkflowStateNote>;
  TicketWorkflowStateNoteCategory: TicketWorkflowStateNoteCategory;
  TimeOff: ResolverTypeWrapper<TimeOff>;
  Todo: ResolverTypeWrapper<Todo>;
  UpdateBlackoutTimeInput: UpdateBlackoutTimeInput;
  UpdateChecklistInput: UpdateChecklistInput;
  UpdateCommentInput: UpdateCommentInput;
  UpdateDocumentationInput: UpdateDocumentationInput;
  UpdateDocumentationPageConfigInput: UpdateDocumentationPageConfigInput;
  UpdateDocumentationPageInput: UpdateDocumentationPageInput;
  UpdateDrawingInput: UpdateDrawingInput;
  UpdateFeatureGroupInput: UpdateFeatureGroupInput;
  UpdateFeatureInput: UpdateFeatureInput;
  UpdateIssueInput: UpdateIssueInput;
  UpdateMyRoleInput: UpdateMyRoleInput;
  UpdateNoteInput: UpdateNoteInput;
  UpdateOrganizationAddressInput: UpdateOrganizationAddressInput;
  UpdateOrganizationInput: UpdateOrganizationInput;
  UpdateOrganizationPreferencesInput: UpdateOrganizationPreferencesInput;
  UpdatePersonalTagInput: UpdatePersonalTagInput;
  UpdateProductInput: UpdateProductInput;
  UpdateProjectChecklistInput: UpdateProjectChecklistInput;
  UpdateRecurringBlackoutTimeInput: UpdateRecurringBlackoutTimeInput;
  UpdateReplyInput: UpdateReplyInput;
  UpdateReportQueryInput: UpdateReportQueryInput;
  UpdateReportQueryPlacementInput: UpdateReportQueryPlacementInput;
  UpdateReportQuerySizeInput: UpdateReportQuerySizeInput;
  UpdateRoleAutoResumeInput: UpdateRoleAutoResumeInput;
  UpdateRoleEmailInput: UpdateRoleEmailInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateRoleNotColorsInput: UpdateRoleNotColorsInput;
  UpdateRolePreferencesInput: UpdateRolePreferencesInput;
  UpdateRoleStartReminderInput: UpdateRoleStartReminderInput;
  UpdateRoleWorkWeekInput: UpdateRoleWorkWeekInput;
  UpdateScheduleConfig: UpdateScheduleConfig;
  UpdateScheduleConfigs: UpdateScheduleConfigs;
  UpdateScheduleItemInput: UpdateScheduleItemInput;
  UpdateSkillInput: UpdateSkillInput;
  UpdateTagInput: UpdateTagInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateTicketInput: UpdateTicketInput;
  UpdateTicketWorkflowStateInput: UpdateTicketWorkflowStateInput;
  UpdateTimeOffInput: UpdateTimeOffInput;
  UpdateTodoInput: UpdateTodoInput;
  UpdateUserPreferencesInput: UpdateUserPreferencesInput;
  UpdateWorkflowInput: UpdateWorkflowInput;
  UpdateWorkflowStateInput: UpdateWorkflowStateInput;
  User: ResolverTypeWrapper<User>;
  UserPreferences: ResolverTypeWrapper<UserPreferences>;
  UserStatus: UserStatus;
  WorkDayTimeInput: WorkDayTimeInput;
  WorkWeekTime: ResolverTypeWrapper<WorkWeekTime>;
  Workflow: ResolverTypeWrapper<Workflow>;
  WorkflowDistribution: ResolverTypeWrapper<WorkflowDistribution>;
  WorkflowState: ResolverTypeWrapper<WorkflowState>;
  WorkflowStateDirection: WorkflowStateDirection;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AcceptRoleInput: AcceptRoleInput;
  AddReplyInput: AddReplyInput;
  BatchPayload: BatchPayload;
  BatchUpdateTicketsInput: BatchUpdateTicketsInput;
  BlackoutTime: BlackoutTime;
  Boolean: Scalars['Boolean'];
  ChangeEmailInput: ChangeEmailInput;
  ChangePasswordInput: ChangePasswordInput;
  ChangeTicketWorkflowStateInput: ChangeTicketWorkflowStateInput;
  ChecklistItem: ChecklistItem;
  ClientUpdateIssueInput: ClientUpdateIssueInput;
  CloseScheduleItemInput: CloseScheduleItemInput;
  Comment: Comment;
  CommentReply: CommentReply;
  CreateBlackoutTimeInput: CreateBlackoutTimeInput;
  CreateCommentInput: CreateCommentInput;
  CreateDocumentationInput: CreateDocumentationInput;
  CreateDocumentationPageInput: CreateDocumentationPageInput;
  CreateDrawingInput: CreateDrawingInput;
  CreateFeatureGroupInput: CreateFeatureGroupInput;
  CreateNoteInput: CreateNoteInput;
  CreateOrganizationInput: CreateOrganizationInput;
  CreatePersonalTagInput: CreatePersonalTagInput;
  CreateProductInput: CreateProductInput;
  CreateProjectInput: CreateProjectInput;
  CreateRecurringBlackoutTimeInput: CreateRecurringBlackoutTimeInput;
  CreateReportInput: CreateReportInput;
  CreateReportQueryInput: CreateReportQueryInput;
  CreateScheduleItemInput: CreateScheduleItemInput;
  CreateTagInput: CreateTagInput;
  CreateTeamInput: CreateTeamInput;
  CreateTicketInput: CreateTicketInput;
  CreateTimeOffInput: CreateTimeOffInput;
  CreateTodoInput: CreateTodoInput;
  CreateWorkflowInput: CreateWorkflowInput;
  CreateWorkflowStateInput: CreateWorkflowStateInput;
  DateTime: Scalars['DateTime'];
  DemoRequest: DemoRequest;
  DependencySet: DependencySet;
  Documentation: Documentation;
  DocumentationPage: DocumentationPage;
  Drawing: Drawing;
  DuplicateReportInput: DuplicateReportInput;
  Estimate: Estimate;
  EstimateTicketWorkflowStateInput: EstimateTicketWorkflowStateInput;
  Feature: Feature;
  FeatureFlag: FeatureFlag;
  FeatureGroup: FeatureGroup;
  FilterElement: FilterElement;
  Float: Scalars['Float'];
  HabitProductWorkflow: HabitProductWorkflow;
  ID: Scalars['ID'];
  ImportTicketsInput: ImportTicketsInput;
  ImportTicketsInputDetail: ImportTicketsInputDetail;
  Int: Scalars['Int'];
  InviteInput: InviteInput;
  Issue: Issue;
  IssueAction: IssueAction;
  IssueAddNoteInput: IssueAddNoteInput;
  IssueContext: IssueContext;
  IssueSendMessageInput: IssueSendMessageInput;
  IssueUpdateNoteInput: IssueUpdateNoteInput;
  LoginInput: LoginInput;
  Me: Me;
  MiniDocumentationPage: MiniDocumentationPage;
  MiniFeature: MiniFeature;
  MiniProduct: MiniProduct;
  MiniProject: MiniProject;
  MiniRole: MiniRole;
  MiniTag: MiniTag;
  MiniWorkflow: MiniWorkflow;
  Mutation: {};
  MyPreviousAssignedTicket: MyPreviousAssignedTicket;
  MyUpcomingAssignedTicket: MyUpcomingAssignedTicket;
  NewOrganization: NewOrganization;
  NextTicket: NextTicket;
  Note: Note;
  Notification: Notification;
  OnboardingStatus: OnboardingStatus;
  OpenTicketsByWorkflow: OpenTicketsByWorkflow;
  Organization: Organization;
  OrganizationAddress: OrganizationAddress;
  OrganizationPreferences: OrganizationPreferences;
  PageInfo: PageInfo;
  PaginatedBlackoutTimes: PaginatedBlackoutTimes;
  PaginatedComments: PaginatedComments;
  PaginatedDocumentations: PaginatedDocumentations;
  PaginatedFeatureGroups: PaginatedFeatureGroups;
  PaginatedFeatures: PaginatedFeatures;
  PaginatedIssues: PaginatedIssues;
  PaginatedNotes: PaginatedNotes;
  PaginatedNotifications: PaginatedNotifications;
  PaginatedOrganizations: PaginatedOrganizations;
  PaginatedPersonalTags: PaginatedPersonalTags;
  PaginatedProducts: PaginatedProducts;
  PaginatedProjects: PaginatedProjects;
  PaginatedRecurringBlackoutTimes: PaginatedRecurringBlackoutTimes;
  PaginatedReports: PaginatedReports;
  PaginatedRoles: PaginatedRoles;
  PaginatedScheduleItems: PaginatedScheduleItems;
  PaginatedTags: PaginatedTags;
  PaginatedTeams: PaginatedTeams;
  PaginatedTickets: PaginatedTickets;
  PaginatedTodos: PaginatedTodos;
  PaginatedUsers: PaginatedUsers;
  PaginatedWorkflows: PaginatedWorkflows;
  PasswordLostInput: PasswordLostInput;
  PasswordResetInput: PasswordResetInput;
  PersonalTag: PersonalTag;
  PlanningTicket: PlanningTicket;
  Product: Product;
  Project: Project;
  ProjectAnalytics: ProjectAnalytics;
  ProjectDependency: ProjectDependency;
  ProjectGoalProgress: ProjectGoalProgress;
  ProjectGoalStats: ProjectGoalStats;
  ProjectTicket: ProjectTicket;
  Query: {};
  QueryAggregate: QueryAggregate;
  RecurringBlackoutTime: RecurringBlackoutTime;
  RegisterInput: RegisterInput;
  Report: Report;
  ReportAggregate: ReportAggregate;
  ReportQuery: ReportQuery;
  RequestDemoInput: RequestDemoInput;
  Role: Role;
  RoleAutoResume: RoleAutoResume;
  RoleEmail: RoleEmail;
  RoleHabit: RoleHabit;
  RoleNoteColorPreferences: RoleNoteColorPreferences;
  RolePreferences: RolePreferences;
  RoleStartReminder: RoleStartReminder;
  RoleWorkDay: RoleWorkDay;
  RoleWorkload: RoleWorkload;
  ScheduleConfig: ScheduleConfig;
  ScheduleConfigForEstimateInput: ScheduleConfigForEstimateInput;
  ScheduleEstimate: ScheduleEstimate;
  ScheduleItem: ScheduleItem;
  ScheduleItemForEstimateObjInput: ScheduleItemForEstimateObjInput;
  ScheduleItemUpdateBoundaries: ScheduleItemUpdateBoundaries;
  ScheduleRole: ScheduleRole;
  SearchResult: SearchResult;
  Skill: Skill;
  String: Scalars['String'];
  Tag: Tag;
  Team: Team;
  Ticket: Ticket;
  TicketDependency: TicketDependency;
  TicketExport: TicketExport;
  TicketOpenByWorkflowDatum: TicketOpenByWorkflowDatum;
  TicketWorkflowState: TicketWorkflowState;
  TicketWorkflowStateInput: TicketWorkflowStateInput;
  TicketWorkflowStateNote: TicketWorkflowStateNote;
  TimeOff: TimeOff;
  Todo: Todo;
  UpdateBlackoutTimeInput: UpdateBlackoutTimeInput;
  UpdateChecklistInput: UpdateChecklistInput;
  UpdateCommentInput: UpdateCommentInput;
  UpdateDocumentationInput: UpdateDocumentationInput;
  UpdateDocumentationPageConfigInput: UpdateDocumentationPageConfigInput;
  UpdateDocumentationPageInput: UpdateDocumentationPageInput;
  UpdateDrawingInput: UpdateDrawingInput;
  UpdateFeatureGroupInput: UpdateFeatureGroupInput;
  UpdateFeatureInput: UpdateFeatureInput;
  UpdateIssueInput: UpdateIssueInput;
  UpdateMyRoleInput: UpdateMyRoleInput;
  UpdateNoteInput: UpdateNoteInput;
  UpdateOrganizationAddressInput: UpdateOrganizationAddressInput;
  UpdateOrganizationInput: UpdateOrganizationInput;
  UpdateOrganizationPreferencesInput: UpdateOrganizationPreferencesInput;
  UpdatePersonalTagInput: UpdatePersonalTagInput;
  UpdateProductInput: UpdateProductInput;
  UpdateProjectChecklistInput: UpdateProjectChecklistInput;
  UpdateRecurringBlackoutTimeInput: UpdateRecurringBlackoutTimeInput;
  UpdateReplyInput: UpdateReplyInput;
  UpdateReportQueryInput: UpdateReportQueryInput;
  UpdateReportQueryPlacementInput: UpdateReportQueryPlacementInput;
  UpdateReportQuerySizeInput: UpdateReportQuerySizeInput;
  UpdateRoleAutoResumeInput: UpdateRoleAutoResumeInput;
  UpdateRoleEmailInput: UpdateRoleEmailInput;
  UpdateRoleInput: UpdateRoleInput;
  UpdateRoleNotColorsInput: UpdateRoleNotColorsInput;
  UpdateRolePreferencesInput: UpdateRolePreferencesInput;
  UpdateRoleStartReminderInput: UpdateRoleStartReminderInput;
  UpdateRoleWorkWeekInput: UpdateRoleWorkWeekInput;
  UpdateScheduleConfig: UpdateScheduleConfig;
  UpdateScheduleConfigs: UpdateScheduleConfigs;
  UpdateScheduleItemInput: UpdateScheduleItemInput;
  UpdateSkillInput: UpdateSkillInput;
  UpdateTagInput: UpdateTagInput;
  UpdateTeamInput: UpdateTeamInput;
  UpdateTicketInput: UpdateTicketInput;
  UpdateTicketWorkflowStateInput: UpdateTicketWorkflowStateInput;
  UpdateTimeOffInput: UpdateTimeOffInput;
  UpdateTodoInput: UpdateTodoInput;
  UpdateUserPreferencesInput: UpdateUserPreferencesInput;
  UpdateWorkflowInput: UpdateWorkflowInput;
  UpdateWorkflowStateInput: UpdateWorkflowStateInput;
  User: User;
  UserPreferences: UserPreferences;
  WorkDayTimeInput: WorkDayTimeInput;
  WorkWeekTime: WorkWeekTime;
  Workflow: Workflow;
  WorkflowDistribution: WorkflowDistribution;
  WorkflowState: WorkflowState;
};

export type BatchPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['BatchPayload'] = ResolversParentTypes['BatchPayload']> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BlackoutTimeResolvers<ContextType = any, ParentType extends ResolversParentTypes['BlackoutTime'] = ResolversParentTypes['BlackoutTime']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  disabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  startAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  stopAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ChecklistItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['ChecklistItem'] = ResolversParentTypes['ChecklistItem']> = {
  checked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<ContextType = any, ParentType extends ResolversParentTypes['Comment'] = ResolversParentTypes['Comment']> = {
  acceptedReply?: Resolver<Maybe<ResolversTypes['CommentReply']>, ParentType, ContextType>;
  acceptedReplyId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  author?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  authorId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['CommentReply']>, ParentType, ContextType>;
  replyCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  ticketId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentReplyResolvers<ContextType = any, ParentType extends ResolversParentTypes['CommentReply'] = ResolversParentTypes['CommentReply']> = {
  author?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  authorId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  commentId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DemoRequestResolvers<ContextType = any, ParentType extends ResolversParentTypes['DemoRequest'] = ResolversParentTypes['DemoRequest']> = {
  config?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  confirmed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ip_address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['DemoStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DependencySetResolvers<ContextType = any, ParentType extends ResolversParentTypes['DependencySet'] = ResolversParentTypes['DependencySet']> = {
  projects?: Resolver<Array<ResolversTypes['ProjectDependency']>, ParentType, ContextType>;
  tickets?: Resolver<Array<ResolversTypes['TicketDependency']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Documentation'] = ResolversParentTypes['Documentation']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastPublishRequestAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  lastPublishedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  titles?: Resolver<Array<ResolversTypes['MiniDocumentationPage']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentationPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['DocumentationPage'] = ResolversParentTypes['DocumentationPage']> = {
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  documentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType>;
  documentationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  keywords?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  urls?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DrawingResolvers<ContextType = any, ParentType extends ResolversParentTypes['Drawing'] = ResolversParentTypes['Drawing']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  data?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lockExpiration?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roleId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EstimateResolvers<ContextType = any, ParentType extends ResolversParentTypes['Estimate'] = ResolversParentTypes['Estimate']> = {
  assigneeId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_max?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_min?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_p50?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_p70?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_p80?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_p90?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end_p95?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  epoch?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_max?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_min?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_p50?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_p70?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_p80?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_p90?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_p95?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EstimateType'], ParentType, ContextType>;
  updatedEpoch?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  featureGroup?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType>;
  featureGroupId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureFlagResolvers<ContextType = any, ParentType extends ResolversParentTypes['FeatureFlag'] = ResolversParentTypes['FeatureFlag']> = {
  documentation?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  report?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  support?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['FeatureGroup'] = ResolversParentTypes['FeatureGroup']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  features?: Resolver<ResolversTypes['PaginatedFeatures'], ParentType, ContextType, Partial<FeatureGroupFeaturesArgs>>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['FeatureGroupStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilterElementResolvers<ContextType = any, ParentType extends ResolversParentTypes['FilterElement'] = ResolversParentTypes['FilterElement']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recordId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HabitProductWorkflowResolvers<ContextType = any, ParentType extends ResolversParentTypes['HabitProductWorkflow'] = ResolversParentTypes['HabitProductWorkflow']> = {
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  workflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IssueResolvers<ContextType = any, ParentType extends ResolversParentTypes['Issue'] = ResolversParentTypes['Issue']> = {
  archived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  assignee?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  assigneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  context?: Resolver<ResolversTypes['IssueContext'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  issueActions?: Resolver<Array<ResolversTypes['IssueAction']>, ParentType, ContextType>;
  localId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  metaData?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  resolveAfterDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['IssueStatus'], ParentType, ContextType>;
  ticket?: Resolver<Maybe<ResolversTypes['Ticket']>, ParentType, ContextType>;
  ticketId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unread?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userAgent?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IssueActionResolvers<ContextType = any, ParentType extends ResolversParentTypes['IssueAction'] = ResolversParentTypes['IssueAction']> = {
  author?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  authorId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  body?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['IssueActionCategory'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  issueId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IssueContextResolvers<ContextType = any, ParentType extends ResolversParentTypes['IssueContext'] = ResolversParentTypes['IssueContext']> = {
  browser?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  engine?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  os?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  osVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']> = {
  organization?: Resolver<Maybe<ResolversTypes['Organization']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['AuthStatus'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniDocumentationPageResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniDocumentationPage'] = ResolversParentTypes['MiniDocumentationPage']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniFeatureResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniFeature'] = ResolversParentTypes['MiniFeature']> = {
  featureGroupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniProduct'] = ResolversParentTypes['MiniProduct']> = {
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniProjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniProject'] = ResolversParentTypes['MiniProject']> = {
  ancestorIsArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniRoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniRole'] = ResolversParentTypes['MiniRole']> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniTag'] = ResolversParentTypes['MiniTag']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MiniWorkflowResolvers<ContextType = any, ParentType extends ResolversParentTypes['MiniWorkflow'] = ResolversParentTypes['MiniWorkflow']> = {
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  acceptReply?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationAcceptReplyArgs, 'commentReplyId'>>;
  acceptRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationAcceptRoleArgs, 'input'>>;
  addChildToDocumentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationAddChildToDocumentationPageArgs, 'childDocumentationPageId' | 'parentDocumentationPageId'>>;
  addFeature?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType, RequireFields<MutationAddFeatureArgs, 'featureGroupId' | 'name'>>;
  addFeatureGroup?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationAddFeatureGroupArgs, 'name' | 'productId'>>;
  addMembers?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationAddMembersArgs, 'roleIds' | 'teamId'>>;
  addReply?: Resolver<ResolversTypes['CommentReply'], ParentType, ContextType, RequireFields<MutationAddReplyArgs, 'commentId' | 'input'>>;
  addTicketAncestor?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationAddTicketAncestorArgs, 'ancestorId' | 'ticketId'>>;
  addTicketFeatures?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationAddTicketFeaturesArgs, 'featureIds' | 'ticketId'>>;
  addTicketPersonalTags?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationAddTicketPersonalTagsArgs, 'personalTagIds' | 'ticketId'>>;
  addTicketTags?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationAddTicketTagsArgs, 'tagIds' | 'ticketId'>>;
  addToRecentSearchHit?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationAddToRecentSearchHitArgs, 'searchResult'>>;
  addWorkflowState?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationAddWorkflowStateArgs, 'input' | 'workflowId'>>;
  addWorkflows?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationAddWorkflowsArgs, 'productId' | 'workflowIds'>>;
  archiveProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationArchiveProjectArgs, 'projectId'>>;
  batchUpdateTicketTags?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<MutationBatchUpdateTicketTagsArgs, 'addTagIds' | 'removeTagIds' | 'ticketIds'>>;
  batchUpdateTickets?: Resolver<ResolversTypes['BatchPayload'], ParentType, ContextType, RequireFields<MutationBatchUpdateTicketsArgs, 'input' | 'ticketIds'>>;
  blockTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationBlockTicketArgs, 'note' | 'ticketId' | 'ticketWorkflowStateId'>>;
  changeEmail?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationChangeEmailArgs, 'input'>>;
  changePassword?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationChangePasswordArgs, 'input'>>;
  changeTicketWorkflowStateAssignee?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationChangeTicketWorkflowStateAssigneeArgs, 'input' | 'ticketId'>>;
  checkTodo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType, RequireFields<MutationCheckTodoArgs, 'checked' | 'todoId'>>;
  closeLastScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<MutationCloseLastScheduleItemArgs, 'input' | 'ticketId'>>;
  closeScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<MutationCloseScheduleItemArgs, 'input' | 'scheduleItemId'>>;
  commitScheduleChanges?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCommitScheduleChangesArgs, 'addTicketIds' | 'removeTicketIds' | 'scheduleConfigs'>>;
  createBlackoutTime?: Resolver<ResolversTypes['BlackoutTime'], ParentType, ContextType, RequireFields<MutationCreateBlackoutTimeArgs, 'input'>>;
  createComment?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationCreateCommentArgs, 'input' | 'ticketId'>>;
  createDocumentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationCreateDocumentationArgs, 'input'>>;
  createDocumentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationCreateDocumentationPageArgs, 'documentationId' | 'input'>>;
  createDrawing?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<MutationCreateDrawingArgs, 'input'>>;
  createFeatureGroup?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType, RequireFields<MutationCreateFeatureGroupArgs, 'input'>>;
  createNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationCreateNoteArgs, 'input'>>;
  createOrganization?: Resolver<ResolversTypes['NewOrganization'], ParentType, ContextType, RequireFields<MutationCreateOrganizationArgs, 'input'>>;
  createPersonalTag?: Resolver<ResolversTypes['PersonalTag'], ParentType, ContextType, RequireFields<MutationCreatePersonalTagArgs, 'input'>>;
  createProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationCreateProductArgs, 'input'>>;
  createProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  createRecurringBlackoutTime?: Resolver<ResolversTypes['RecurringBlackoutTime'], ParentType, ContextType, RequireFields<MutationCreateRecurringBlackoutTimeArgs, 'input'>>;
  createReport?: Resolver<ResolversTypes['Report'], ParentType, ContextType, RequireFields<MutationCreateReportArgs, 'input'>>;
  createReportQuery?: Resolver<ResolversTypes['ReportQuery'], ParentType, ContextType, RequireFields<MutationCreateReportQueryArgs, 'input' | 'reportId'>>;
  createScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<MutationCreateScheduleItemArgs, 'input'>>;
  createTag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType, RequireFields<MutationCreateTagArgs, 'input'>>;
  createTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationCreateTeamArgs, 'input'>>;
  createTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationCreateTicketArgs, 'input'>>;
  createTicketPersonalTag?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationCreateTicketPersonalTagArgs, 'input' | 'ticketId'>>;
  createTicketTag?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationCreateTicketTagArgs, 'input' | 'ticketId'>>;
  createTimeOff?: Resolver<ResolversTypes['TimeOff'], ParentType, ContextType, RequireFields<MutationCreateTimeOffArgs, 'input'>>;
  createTodo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType, RequireFields<MutationCreateTodoArgs, 'input'>>;
  createWorkflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationCreateWorkflowArgs, 'input'>>;
  deleteBlackoutTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteBlackoutTimeArgs, 'blackoutTimeId'>>;
  deleteComment?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCommentArgs, 'commentId'>>;
  deleteDocumentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationDeleteDocumentationArgs, 'documentationId'>>;
  deleteDocumentationPage?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationDeleteDocumentationPageArgs, 'documentationPageId'>>;
  deleteDrawing?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<MutationDeleteDrawingArgs, 'drawingId'>>;
  deleteFeature?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType, RequireFields<MutationDeleteFeatureArgs, 'featureId'>>;
  deleteFeatureGroup?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationDeleteFeatureGroupArgs, 'featureGroupId'>>;
  deleteIssue?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationDeleteIssueArgs, 'issueId'>>;
  deleteNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationDeleteNoteArgs, 'noteId'>>;
  deleteNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationDeleteNotificationArgs, 'notificationId'>>;
  deletePersonalTag?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeletePersonalTagArgs, 'personalTagId'>>;
  deleteProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationDeleteProductArgs, 'productId'>>;
  deleteProject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteProjectArgs, 'projectId'>>;
  deleteRecurringBlackoutTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteRecurringBlackoutTimeArgs, 'recurringBlackoutTimeId'>>;
  deleteReply?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteReplyArgs, 'commentReplyId'>>;
  deleteReport?: Resolver<ResolversTypes['Report'], ParentType, ContextType, RequireFields<MutationDeleteReportArgs, 'reportId'>>;
  deleteReportQuery?: Resolver<ResolversTypes['Report'], ParentType, ContextType, RequireFields<MutationDeleteReportQueryArgs, 'reportQueryId'>>;
  deleteRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationDeleteRoleArgs, 'roleId'>>;
  deleteScheduleItem?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteScheduleItemArgs, 'scheduleItemId'>>;
  deleteTag?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTagArgs, 'tagId'>>;
  deleteTeam?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTeamArgs, 'teamId'>>;
  deleteTimeOff?: Resolver<ResolversTypes['TimeOff'], ParentType, ContextType, RequireFields<MutationDeleteTimeOffArgs, 'timeOffId'>>;
  deleteTodo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType, RequireFields<MutationDeleteTodoArgs, 'todoId'>>;
  deleteWorkflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationDeleteWorkflowArgs, 'workflowId'>>;
  deleteWorkflowState?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationDeleteWorkflowStateArgs, 'workflowStateId'>>;
  duplicateReport?: Resolver<ResolversTypes['Report'], ParentType, ContextType, RequireFields<MutationDuplicateReportArgs, 'input' | 'reportId'>>;
  estimateTicketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType, RequireFields<MutationEstimateTicketWorkflowStateArgs, 'input' | 'ticketId'>>;
  getDrawingLock?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<MutationGetDrawingLockArgs, 'drawingId' | 'force'>>;
  importTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<MutationImportTicketsArgs, 'input'>>;
  invite?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationInviteArgs, 'input'>>;
  issueAddNote?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationIssueAddNoteArgs, 'input' | 'issueId'>>;
  issueDeleteNote?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationIssueDeleteNoteArgs, 'issueActionId'>>;
  issueRemoveAutoResolve?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationIssueRemoveAutoResolveArgs, 'issueId'>>;
  issueSendMessage?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationIssueSendMessageArgs, 'input' | 'issueId'>>;
  issueSetAutoResolve?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationIssueSetAutoResolveArgs, 'issueId'>>;
  issueUpdateNote?: Resolver<ResolversTypes['IssueAction'], ParentType, ContextType, RequireFields<MutationIssueUpdateNoteArgs, 'input' | 'issueActionId'>>;
  login?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  markTicketNotDone?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationMarkTicketNotDoneArgs, 'ticketId'>>;
  moveAfterDocumentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationMoveAfterDocumentationPageArgs, 'afterDocumentationPageId' | 'documentationPageId'>>;
  moveBeforeDocumentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationMoveBeforeDocumentationPageArgs, 'beforeDocumentationPageId' | 'documentationPageId'>>;
  moveIntoProject?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationMoveIntoProjectArgs, 'projectId' | 'sources'>>;
  moveProjectToRoot?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationMoveProjectToRootArgs, 'projectId'>>;
  moveWorkflowState?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationMoveWorkflowStateArgs, 'direction' | 'workflowStateId'>>;
  passwordLost?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationPasswordLostArgs, 'input'>>;
  passwordReset?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<MutationPasswordResetArgs, 'input'>>;
  pinProject?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationPinProjectArgs, 'projectId'>>;
  publishDocumentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationPublishDocumentationArgs, 'id'>>;
  publishProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationPublishProjectArgs, 'projectId'>>;
  reactivateRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationReactivateRoleArgs, 'roleId'>>;
  readNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationReadNotificationArgs, 'notificationId'>>;
  register?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<MutationRegisterArgs, 'input'>>;
  registerFromInvite?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<MutationRegisterFromInviteArgs, 'input'>>;
  rejectRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationRejectRoleArgs, 'roleId'>>;
  releaseDrawingLock?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<MutationReleaseDrawingLockArgs, 'drawingId'>>;
  removeMembers?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationRemoveMembersArgs, 'roleIds' | 'teamId'>>;
  removeTicketAncestor?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationRemoveTicketAncestorArgs, 'ancestorId' | 'ticketId'>>;
  removeTicketFeatures?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationRemoveTicketFeaturesArgs, 'featureIds' | 'ticketId'>>;
  removeTicketPersonalTags?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationRemoveTicketPersonalTagsArgs, 'personalTagIds' | 'ticketId'>>;
  removeTicketTags?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationRemoveTicketTagsArgs, 'tagIds' | 'ticketId'>>;
  removeWorkflows?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationRemoveWorkflowsArgs, 'productId' | 'workflowIds'>>;
  renameProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationRenameProjectArgs, 'name' | 'projectId'>>;
  requestDemo?: Resolver<ResolversTypes['DemoRequest'], ParentType, ContextType, RequireFields<MutationRequestDemoArgs, 'input'>>;
  resendInvite?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationResendInviteArgs, 'email'>>;
  resumeLastScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType>;
  scheduleTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationScheduleTicketArgs, 'ticketId'>>;
  sendConfirmationEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  setChecklist?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType, RequireFields<MutationSetChecklistArgs, 'input' | 'ticketWorkflowStateId'>>;
  setProjectChecklist?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationSetProjectChecklistArgs, 'input' | 'projectId'>>;
  skipTicketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType, RequireFields<MutationSkipTicketWorkflowStateArgs, 'id'>>;
  toggleOnboarding?: Resolver<ResolversTypes['Organization'], ParentType, ContextType, RequireFields<MutationToggleOnboardingArgs, 'showOnboarding'>>;
  unarchiveProject?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUnarchiveProjectArgs, 'projectId'>>;
  unblockTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUnblockTicketArgs, 'note' | 'ticketId' | 'ticketWorkflowStateId'>>;
  unpinProject?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUnpinProjectArgs, 'projectId'>>;
  unpublishDocumentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationUnpublishDocumentationArgs, 'id'>>;
  unreadNotification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<MutationUnreadNotificationArgs, 'notificationId'>>;
  unwatchTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUnwatchTicketArgs, 'ticketId'>>;
  updateBlackoutTime?: Resolver<ResolversTypes['BlackoutTime'], ParentType, ContextType, RequireFields<MutationUpdateBlackoutTimeArgs, 'blackoutTimeId' | 'input'>>;
  updateComment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<MutationUpdateCommentArgs, 'commentId' | 'input'>>;
  updateDocumentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationUpdateDocumentationArgs, 'documentationId' | 'input'>>;
  updateDocumentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationUpdateDocumentationPageArgs, 'documentationPageId' | 'input'>>;
  updateDocumentationPageConfig?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<MutationUpdateDocumentationPageConfigArgs, 'documentationPageId' | 'input'>>;
  updateDocumentationStage?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<MutationUpdateDocumentationStageArgs, 'documentationId' | 'stage'>>;
  updateDrawing?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<MutationUpdateDrawingArgs, 'drawingId' | 'input'>>;
  updateFeature?: Resolver<ResolversTypes['Feature'], ParentType, ContextType, RequireFields<MutationUpdateFeatureArgs, 'featureId' | 'input'>>;
  updateFeatureGroup?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType, RequireFields<MutationUpdateFeatureGroupArgs, 'featureGroupId' | 'input'>>;
  updateIssue?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationUpdateIssueArgs, 'input' | 'issueId'>>;
  updateIssueByToken?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<MutationUpdateIssueByTokenArgs, 'input' | 'token'>>;
  updateMyRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateMyRoleArgs, 'input'>>;
  updateMyScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<MutationUpdateMyScheduleItemArgs, 'input' | 'scheduleItemId'>>;
  updateNote?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationUpdateNoteArgs, 'input' | 'noteId'>>;
  updateNoteColor?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<MutationUpdateNoteColorArgs, 'color' | 'noteId'>>;
  updateOrganization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType, RequireFields<MutationUpdateOrganizationArgs, 'input'>>;
  updateOrganizationPreferences?: Resolver<ResolversTypes['Organization'], ParentType, ContextType, RequireFields<MutationUpdateOrganizationPreferencesArgs, 'input'>>;
  updatePersonalTag?: Resolver<ResolversTypes['PersonalTag'], ParentType, ContextType, RequireFields<MutationUpdatePersonalTagArgs, 'input' | 'tagId'>>;
  updateProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationUpdateProductArgs, 'input' | 'productId'>>;
  updateProductStage?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationUpdateProductStageArgs, 'productId' | 'stage'>>;
  updateProductUseGlobalWorkflow?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationUpdateProductUseGlobalWorkflowArgs, 'productId' | 'useDefaultWorkflows'>>;
  updateProjectName?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUpdateProjectNameArgs, 'name' | 'projectId'>>;
  updateProjectOwner?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<MutationUpdateProjectOwnerArgs, 'projectId'>>;
  updateRecurringBlackoutTime?: Resolver<ResolversTypes['RecurringBlackoutTime'], ParentType, ContextType, RequireFields<MutationUpdateRecurringBlackoutTimeArgs, 'input' | 'recurringBlackoutTimeId'>>;
  updateReply?: Resolver<ResolversTypes['CommentReply'], ParentType, ContextType, RequireFields<MutationUpdateReplyArgs, 'commentReplyId' | 'input'>>;
  updateReportQuery?: Resolver<ResolversTypes['ReportQuery'], ParentType, ContextType, RequireFields<MutationUpdateReportQueryArgs, 'input' | 'reportQueryId'>>;
  updateReportQueryPlacement?: Resolver<Array<ResolversTypes['ReportQuery']>, ParentType, ContextType, RequireFields<MutationUpdateReportQueryPlacementArgs, 'input' | 'reportQueryId'>>;
  updateReportQuerySize?: Resolver<ResolversTypes['ReportQuery'], ParentType, ContextType, RequireFields<MutationUpdateReportQuerySizeArgs, 'input' | 'reportQueryId'>>;
  updateRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateRoleArgs, 'input' | 'roleId'>>;
  updateRoleAutoResume?: Resolver<ResolversTypes['RoleAutoResume'], ParentType, ContextType, RequireFields<MutationUpdateRoleAutoResumeArgs, 'input'>>;
  updateRoleEmail?: Resolver<ResolversTypes['RoleEmail'], ParentType, ContextType, RequireFields<MutationUpdateRoleEmailArgs, 'input'>>;
  updateRoleNoteColorPreferences?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateRoleNoteColorPreferencesArgs, 'input'>>;
  updateRolePreferences?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateRolePreferencesArgs, 'input'>>;
  updateRoleStartReminder?: Resolver<ResolversTypes['RoleStartReminder'], ParentType, ContextType, RequireFields<MutationUpdateRoleStartReminderArgs, 'input'>>;
  updateRoleWorkWeek?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<MutationUpdateRoleWorkWeekArgs, 'input' | 'roleId'>>;
  updateScheduleConfig?: Resolver<Array<ResolversTypes['ScheduleConfig']>, ParentType, ContextType, RequireFields<MutationUpdateScheduleConfigArgs, 'input'>>;
  updateScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<MutationUpdateScheduleItemArgs, 'input' | 'scheduleItemId'>>;
  updateSkill?: Resolver<ResolversTypes['Skill'], ParentType, ContextType, RequireFields<MutationUpdateSkillArgs, 'input' | 'skillId'>>;
  updateTag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType, RequireFields<MutationUpdateTagArgs, 'input' | 'tagId'>>;
  updateTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUpdateTeamArgs, 'input' | 'teamId'>>;
  updateTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUpdateTicketArgs, 'input' | 'ticketId'>>;
  updateTicketStage?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUpdateTicketStageArgs, 'stage' | 'ticketId'>>;
  updateTicketStatus?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUpdateTicketStatusArgs, 'status' | 'ticketId'>>;
  updateTicketWorkflowStates?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationUpdateTicketWorkflowStatesArgs, 'input' | 'ticketId'>>;
  updateTimeOff?: Resolver<ResolversTypes['TimeOff'], ParentType, ContextType, RequireFields<MutationUpdateTimeOffArgs, 'input' | 'timeOffId'>>;
  updateTodo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType, RequireFields<MutationUpdateTodoArgs, 'input' | 'todoId'>>;
  updateUserPreferences?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserPreferencesArgs, 'input'>>;
  updateWorkflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationUpdateWorkflowArgs, 'input' | 'workflowId'>>;
  updateWorkflowStage?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationUpdateWorkflowStageArgs, 'stage' | 'workflowId'>>;
  updateWorkflowState?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<MutationUpdateWorkflowStateArgs, 'input' | 'workflowStateId'>>;
  watchTicket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<MutationWatchTicketArgs, 'ticketId'>>;
};

export type MyPreviousAssignedTicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyPreviousAssignedTicket'] = ResolversParentTypes['MyPreviousAssignedTicket']> = {
  currentState?: Resolver<Maybe<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isDone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNext?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPaused?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastState?: Resolver<Maybe<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MyUpcomingAssignedTicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUpcomingAssignedTicket'] = ResolversParentTypes['MyUpcomingAssignedTicket']> = {
  currentState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isDone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isNext?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isPaused?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastState?: Resolver<Maybe<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewOrganizationResolvers<ContextType = any, ParentType extends ResolversParentTypes['NewOrganization'] = ResolversParentTypes['NewOrganization']> = {
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  project?: Resolver<ResolversTypes['Project'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NextTicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['NextTicket'] = ResolversParentTypes['NextTicket']> = {
  nextState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['Note'] = ResolversParentTypes['Note']> = {
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['NoteColor'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NotificationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  actor?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  actorId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ancestry?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['NotificationCategory'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  target?: Resolver<ResolversTypes['NotificationTarget'], ParentType, ContextType>;
  targetId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OnboardingStatusResolvers<ContextType = any, ParentType extends ResolversParentTypes['OnboardingStatus'] = ResolversParentTypes['OnboardingStatus']> = {
  invite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OpenTicketsByWorkflowResolvers<ContextType = any, ParentType extends ResolversParentTypes['OpenTicketsByWorkflow'] = ResolversParentTypes['OpenTicketsByWorkflow']> = {
  values?: Resolver<Array<ResolversTypes['TicketOpenByWorkflowDatum']>, ParentType, ContextType>;
  workflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Organization'] = ResolversParentTypes['Organization']> = {
  about?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  billingAddress?: Resolver<Maybe<ResolversTypes['OrganizationAddress']>, ParentType, ContextType>;
  billingAddressId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  coverUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  estimatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  mailingAddressId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  onboardingStatus?: Resolver<ResolversTypes['OnboardingStatus'], ParentType, ContextType>;
  preferences?: Resolver<ResolversTypes['OrganizationPreferences'], ParentType, ContextType>;
  roles?: Resolver<ResolversTypes['PaginatedRoles'], ParentType, ContextType, Partial<OrganizationRolesArgs>>;
  scheduleStatus?: Resolver<ResolversTypes['ScheduleStatus'], ParentType, ContextType>;
  showOnboarding?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrganizationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationAddressResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrganizationAddress'] = ResolversParentTypes['OrganizationAddress']> = {
  address1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  address2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zipcode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrganizationPreferencesResolvers<ContextType = any, ParentType extends ResolversParentTypes['OrganizationPreferences'] = ResolversParentTypes['OrganizationPreferences']> = {
  showOnboarding?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  pageCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pageSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedBlackoutTimesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedBlackoutTimes'] = ResolversParentTypes['PaginatedBlackoutTimes']> = {
  nodes?: Resolver<Array<ResolversTypes['BlackoutTime']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedCommentsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedComments'] = ResolversParentTypes['PaginatedComments']> = {
  nodes?: Resolver<Array<ResolversTypes['Comment']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedDocumentationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedDocumentations'] = ResolversParentTypes['PaginatedDocumentations']> = {
  nodes?: Resolver<Array<ResolversTypes['Documentation']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedFeatureGroupsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedFeatureGroups'] = ResolversParentTypes['PaginatedFeatureGroups']> = {
  nodes?: Resolver<Array<ResolversTypes['FeatureGroup']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedFeaturesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedFeatures'] = ResolversParentTypes['PaginatedFeatures']> = {
  nodes?: Resolver<Array<ResolversTypes['Feature']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedIssuesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedIssues'] = ResolversParentTypes['PaginatedIssues']> = {
  nodes?: Resolver<Array<ResolversTypes['Issue']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedNotesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedNotes'] = ResolversParentTypes['PaginatedNotes']> = {
  nodes?: Resolver<Array<ResolversTypes['Note']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedNotificationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedNotifications'] = ResolversParentTypes['PaginatedNotifications']> = {
  nodes?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedOrganizationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedOrganizations'] = ResolversParentTypes['PaginatedOrganizations']> = {
  nodes?: Resolver<Array<ResolversTypes['Organization']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedPersonalTagsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedPersonalTags'] = ResolversParentTypes['PaginatedPersonalTags']> = {
  nodes?: Resolver<Array<ResolversTypes['PersonalTag']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedProductsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedProducts'] = ResolversParentTypes['PaginatedProducts']> = {
  nodes?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedProjectsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedProjects'] = ResolversParentTypes['PaginatedProjects']> = {
  nodes?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedRecurringBlackoutTimesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedRecurringBlackoutTimes'] = ResolversParentTypes['PaginatedRecurringBlackoutTimes']> = {
  nodes?: Resolver<Array<ResolversTypes['RecurringBlackoutTime']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedReportsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedReports'] = ResolversParentTypes['PaginatedReports']> = {
  nodes?: Resolver<Array<ResolversTypes['Report']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedRolesResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedRoles'] = ResolversParentTypes['PaginatedRoles']> = {
  nodes?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedScheduleItemsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedScheduleItems'] = ResolversParentTypes['PaginatedScheduleItems']> = {
  nodes?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTagsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTags'] = ResolversParentTypes['PaginatedTags']> = {
  nodes?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTeamsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTeams'] = ResolversParentTypes['PaginatedTeams']> = {
  nodes?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTicketsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTickets'] = ResolversParentTypes['PaginatedTickets']> = {
  nodes?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTodosResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTodos'] = ResolversParentTypes['PaginatedTodos']> = {
  nodes?: Resolver<Array<ResolversTypes['Todo']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedUsersResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedUsers'] = ResolversParentTypes['PaginatedUsers']> = {
  nodes?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedWorkflowsResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedWorkflows'] = ResolversParentTypes['PaginatedWorkflows']> = {
  nodes?: Resolver<Array<ResolversTypes['Workflow']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersonalTagResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonalTag'] = ResolversParentTypes['PersonalTag']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  replacedByTagId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PlanningTicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['PlanningTicket'] = ResolversParentTypes['PlanningTicket']> = {
  eta?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  localId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  milestone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  productCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  projectName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workflowName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coverUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  featureGroups?: Resolver<ResolversTypes['PaginatedFeatureGroups'], ParentType, ContextType, Partial<ProductFeatureGroupsArgs>>;
  features?: Resolver<ResolversTypes['PaginatedFeatures'], ParentType, ContextType, Partial<ProductFeaturesArgs>>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isSupportActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isUsingDefaultWorkflows?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  tickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<ProductTicketsArgs>>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workflowIds?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  workflows?: Resolver<ResolversTypes['PaginatedWorkflows'], ParentType, ContextType, Partial<ProductWorkflowsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectResolvers<ContextType = any, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  ancestorIsArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  ancestors?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  authorId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  checklist?: Resolver<Array<ResolversTypes['ChecklistItem']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  tickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectAnalyticsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectAnalytics'] = ResolversParentTypes['ProjectAnalytics']> = {
  doneTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  draftTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  estimatedTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  inProgressTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  projectId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduledTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unassignedTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unestimatedTicketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectDependencyResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectDependency'] = ResolversParentTypes['ProjectDependency']> = {
  ancestors?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  successors?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectGoalProgressResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectGoalProgress'] = ResolversParentTypes['ProjectGoalProgress']> = {
  accomplished?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  eta?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectGoalStatsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectGoalStats'] = ResolversParentTypes['ProjectGoalStats']> = {
  cancelled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  done?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  parentId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  scheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  unScheduled?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProjectTicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProjectTicket'] = ResolversParentTypes['ProjectTicket']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  localId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  productCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  activeScheduleItems?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  batchGetTicketTags?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryBatchGetTicketTagsArgs, 'ticketIds'>>;
  batchGetTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryBatchGetTicketsArgs, 'ticketIds'>>;
  blackoutTime?: Resolver<ResolversTypes['BlackoutTime'], ParentType, ContextType, RequireFields<QueryBlackoutTimeArgs, 'id'>>;
  blackoutTimes?: Resolver<Array<ResolversTypes['BlackoutTime']>, ParentType, ContextType>;
  blockingTickets?: Resolver<Array<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  comment?: Resolver<ResolversTypes['Comment'], ParentType, ContextType, RequireFields<QueryCommentArgs, 'id'>>;
  comments?: Resolver<ResolversTypes['PaginatedComments'], ParentType, ContextType, RequireFields<QueryCommentsArgs, 'ticketId'>>;
  deliveredTicketForPeriod?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryDeliveredTicketForPeriodArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  dependencies?: Resolver<ResolversTypes['DependencySet'], ParentType, ContextType, Partial<QueryDependenciesArgs>>;
  documentation?: Resolver<ResolversTypes['Documentation'], ParentType, ContextType, RequireFields<QueryDocumentationArgs, 'id'>>;
  documentationPage?: Resolver<ResolversTypes['DocumentationPage'], ParentType, ContextType, RequireFields<QueryDocumentationPageArgs, 'id'>>;
  documentationPageAccessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryDocumentationPageAccessTokenArgs, 'id'>>;
  documentations?: Resolver<ResolversTypes['PaginatedDocumentations'], ParentType, ContextType, Partial<QueryDocumentationsArgs>>;
  drawing?: Resolver<ResolversTypes['Drawing'], ParentType, ContextType, RequireFields<QueryDrawingArgs, 'id'>>;
  exportTickets?: Resolver<Array<ResolversTypes['TicketExport']>, ParentType, ContextType, RequireFields<QueryExportTicketsArgs, 'sources'>>;
  featureFlag?: Resolver<ResolversTypes['FeatureFlag'], ParentType, ContextType>;
  featureGroup?: Resolver<ResolversTypes['FeatureGroup'], ParentType, ContextType, RequireFields<QueryFeatureGroupArgs, 'id'>>;
  featureGroups?: Resolver<ResolversTypes['PaginatedFeatureGroups'], ParentType, ContextType, Partial<QueryFeatureGroupsArgs>>;
  features?: Resolver<ResolversTypes['PaginatedFeatures'], ParentType, ContextType, Partial<QueryFeaturesArgs>>;
  getAllAwaitingEstimateTasks?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  getAllEstimates?: Resolver<Array<ResolversTypes['Estimate']>, ParentType, ContextType>;
  getAllRoles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  getAllScheduledTasks?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  getAllUnscheduledDependencies?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryGetAllUnscheduledDependenciesArgs, 'ticketIds'>>;
  getDemo?: Resolver<ResolversTypes['DemoRequest'], ParentType, ContextType, RequireFields<QueryGetDemoArgs, 'id'>>;
  getEstimates?: Resolver<Array<ResolversTypes['ScheduleEstimate']>, ParentType, ContextType, RequireFields<QueryGetEstimatesArgs, 'toDate'>>;
  getGanttProjects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  getScheduleRoles?: Resolver<Array<ResolversTypes['ScheduleRole']>, ParentType, ContextType, RequireFields<QueryGetScheduleRolesArgs, 'fromDate' | 'toDate'>>;
  getScheduledTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  getUnscheduledDependencies?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryGetUnscheduledDependenciesArgs, 'ticketIds'>>;
  getUnscheduledTickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<QueryGetUnscheduledTicketsArgs>>;
  habits?: Resolver<ResolversTypes['RoleHabit'], ParentType, ContextType>;
  issue?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<QueryIssueArgs, 'id'>>;
  issueByToken?: Resolver<ResolversTypes['Issue'], ParentType, ContextType, RequireFields<QueryIssueByTokenArgs, 'token'>>;
  issues?: Resolver<ResolversTypes['PaginatedIssues'], ParentType, ContextType, Partial<QueryIssuesArgs>>;
  lastNote?: Resolver<Maybe<ResolversTypes['Note']>, ParentType, ContextType>;
  lastNotification?: Resolver<Maybe<ResolversTypes['Notification']>, ParentType, ContextType>;
  lastScheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType>;
  lastTicketWorkflowStateNote?: Resolver<Maybe<ResolversTypes['TicketWorkflowStateNote']>, ParentType, ContextType, RequireFields<QueryLastTicketWorkflowStateNoteArgs, 'ticketId'>>;
  lastTodo?: Resolver<Maybe<ResolversTypes['Todo']>, ParentType, ContextType>;
  me?: Resolver<ResolversTypes['Me'], ParentType, ContextType>;
  miniFeatures?: Resolver<Array<ResolversTypes['MiniFeature']>, ParentType, ContextType, Partial<QueryMiniFeaturesArgs>>;
  miniProducts?: Resolver<Array<ResolversTypes['MiniProduct']>, ParentType, ContextType>;
  miniProjects?: Resolver<Array<ResolversTypes['MiniProject']>, ParentType, ContextType>;
  miniRoles?: Resolver<Array<ResolversTypes['MiniRole']>, ParentType, ContextType>;
  miniTags?: Resolver<Array<ResolversTypes['MiniTag']>, ParentType, ContextType>;
  miniWorkflows?: Resolver<Array<ResolversTypes['MiniWorkflow']>, ParentType, ContextType, Partial<QueryMiniWorkflowsArgs>>;
  moreTickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<QueryMoreTicketsArgs>>;
  moreTicketsForProject?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, RequireFields<QueryMoreTicketsForProjectArgs, 'projectId'>>;
  myEstimatedTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  myLastProject?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  myMiniProjects?: Resolver<Array<ResolversTypes['MiniProject']>, ParentType, ContextType, Partial<QueryMyMiniProjectsArgs>>;
  myNextTickets?: Resolver<Array<ResolversTypes['NextTicket']>, ParentType, ContextType>;
  myNotScheduledTickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<QueryMyNotScheduledTicketsArgs>>;
  myNotifications?: Resolver<ResolversTypes['PaginatedNotifications'], ParentType, ContextType, Partial<QueryMyNotificationsArgs>>;
  myOpenScheduleItems?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  myPreviousTickets?: Resolver<Array<ResolversTypes['MyPreviousAssignedTicket']>, ParentType, ContextType>;
  myProjects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  myRecentlyCreatedTickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<QueryMyRecentlyCreatedTicketsArgs>>;
  myRole?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  myRoles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  myScheduleItemPeriod?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType, RequireFields<QueryMyScheduleItemPeriodArgs, 'fromDate' | 'toDate'>>;
  myTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  myTicketsToEstimate?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  myUnestimatedTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  myUnfinishedScheduleItems?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  myUpcomingTickets?: Resolver<Array<ResolversTypes['MyUpcomingAssignedTicket']>, ParentType, ContextType>;
  myWatchedTickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  note?: Resolver<ResolversTypes['Note'], ParentType, ContextType, RequireFields<QueryNoteArgs, 'id'>>;
  notes?: Resolver<ResolversTypes['PaginatedNotes'], ParentType, ContextType, Partial<QueryNotesArgs>>;
  notification?: Resolver<ResolversTypes['Notification'], ParentType, ContextType, RequireFields<QueryNotificationArgs, 'id'>>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizations?: Resolver<ResolversTypes['PaginatedOrganizations'], ParentType, ContextType, Partial<QueryOrganizationsArgs>>;
  paginatedBlackoutTimes?: Resolver<ResolversTypes['PaginatedBlackoutTimes'], ParentType, ContextType, Partial<QueryPaginatedBlackoutTimesArgs>>;
  paginatedRecurringBlackoutTimes?: Resolver<ResolversTypes['PaginatedRecurringBlackoutTimes'], ParentType, ContextType, Partial<QueryPaginatedRecurringBlackoutTimesArgs>>;
  pastGoalProgress?: Resolver<Array<ResolversTypes['ProjectGoalProgress']>, ParentType, ContextType, RequireFields<QueryPastGoalProgressArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  pastWorkflowDistribution?: Resolver<Array<ResolversTypes['WorkflowDistribution']>, ParentType, ContextType, RequireFields<QueryPastWorkflowDistributionArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  personalTag?: Resolver<ResolversTypes['PersonalTag'], ParentType, ContextType, RequireFields<QueryPersonalTagArgs, 'id'>>;
  personalTags?: Resolver<ResolversTypes['PaginatedPersonalTags'], ParentType, ContextType, Partial<QueryPersonalTagsArgs>>;
  planningDeliveredTickets?: Resolver<Array<ResolversTypes['PlanningTicket']>, ParentType, ContextType, RequireFields<QueryPlanningDeliveredTicketsArgs, 'fromDate' | 'toDate'>>;
  planningProjection?: Resolver<Array<ResolversTypes['PlanningTicket']>, ParentType, ContextType, RequireFields<QueryPlanningProjectionArgs, 'scheduleConfigs' | 'ticketIds'>>;
  planningTickets?: Resolver<Array<ResolversTypes['PlanningTicket']>, ParentType, ContextType>;
  pof?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryProductArgs, 'id'>>;
  productByCode?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryProductByCodeArgs, 'code'>>;
  products?: Resolver<ResolversTypes['PaginatedProducts'], ParentType, ContextType, Partial<QueryProductsArgs>>;
  project?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<QueryProjectArgs, 'id'>>;
  projectAccessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryProjectAccessTokenArgs, 'id'>>;
  projectAnalytics?: Resolver<Maybe<ResolversTypes['ProjectAnalytics']>, ParentType, ContextType, RequireFields<QueryProjectAnalyticsArgs, 'projectId'>>;
  projectGoalStats?: Resolver<Array<ResolversTypes['ProjectGoalStats']>, ParentType, ContextType, RequireFields<QueryProjectGoalStatsArgs, 'projectId'>>;
  projectTextAccessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryProjectTextAccessTokenArgs, 'id'>>;
  projectTickets?: Resolver<Array<ResolversTypes['ProjectTicket']>, ParentType, ContextType, RequireFields<QueryProjectTicketsArgs, 'name'>>;
  projectTicketsForCategory?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, RequireFields<QueryProjectTicketsForCategoryArgs, 'category' | 'projectId'>>;
  projectedGoalProgress?: Resolver<Array<ResolversTypes['ProjectGoalProgress']>, ParentType, ContextType, RequireFields<QueryProjectedGoalProgressArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  projectedWorkflowDistribution?: Resolver<Array<ResolversTypes['WorkflowDistribution']>, ParentType, ContextType, RequireFields<QueryProjectedWorkflowDistributionArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  projectedWorkload?: Resolver<Array<ResolversTypes['RoleWorkload']>, ParentType, ContextType, RequireFields<QueryProjectedWorkloadArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  projects?: Resolver<ResolversTypes['PaginatedProjects'], ParentType, ContextType, Partial<QueryProjectsArgs>>;
  recurringBlackoutTime?: Resolver<ResolversTypes['RecurringBlackoutTime'], ParentType, ContextType, RequireFields<QueryRecurringBlackoutTimeArgs, 'id'>>;
  recurringBlackoutTimes?: Resolver<Array<ResolversTypes['RecurringBlackoutTime']>, ParentType, ContextType, Partial<QueryRecurringBlackoutTimesArgs>>;
  replies?: Resolver<Array<ResolversTypes['CommentReply']>, ParentType, ContextType, RequireFields<QueryRepliesArgs, 'commentId'>>;
  report?: Resolver<ResolversTypes['Report'], ParentType, ContextType, RequireFields<QueryReportArgs, 'id'>>;
  reportQuery?: Resolver<ResolversTypes['ReportQuery'], ParentType, ContextType, RequireFields<QueryReportQueryArgs, 'id'>>;
  reports?: Resolver<ResolversTypes['PaginatedReports'], ParentType, ContextType, Partial<QueryReportsArgs>>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType, RequireFields<QueryRoleArgs, 'id'>>;
  roles?: Resolver<ResolversTypes['PaginatedRoles'], ParentType, ContextType, Partial<QueryRolesArgs>>;
  scheduleConfig?: Resolver<ResolversTypes['ScheduleConfig'], ParentType, ContextType, RequireFields<QueryScheduleConfigArgs, 'id'>>;
  scheduleConfigs?: Resolver<Array<ResolversTypes['ScheduleConfig']>, ParentType, ContextType>;
  scheduleItem?: Resolver<ResolversTypes['ScheduleItem'], ParentType, ContextType, RequireFields<QueryScheduleItemArgs, 'scheduleItemId'>>;
  scheduleItemPeriod?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType, RequireFields<QueryScheduleItemPeriodArgs, 'fromDate'>>;
  scheduleItemUpdateBoundaries?: Resolver<ResolversTypes['ScheduleItemUpdateBoundaries'], ParentType, ContextType, RequireFields<QueryScheduleItemUpdateBoundariesArgs, 'scheduleItemId'>>;
  scheduleItems?: Resolver<ResolversTypes['PaginatedScheduleItems'], ParentType, ContextType, Partial<QueryScheduleItemsArgs>>;
  scheduledTicketToBeClosing?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryScheduledTicketToBeClosingArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  scheduledTicketToBeWorked?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryScheduledTicketToBeWorkedArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  search?: Resolver<Array<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchArgs, 'query'>>;
  searchRole?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType, RequireFields<QuerySearchRoleArgs, 'query'>>;
  searchTicket?: Resolver<Array<ResolversTypes['SearchResult']>, ParentType, ContextType, RequireFields<QuerySearchTicketArgs, 'query'>>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType, RequireFields<QueryTagArgs, 'id'>>;
  tags?: Resolver<ResolversTypes['PaginatedTags'], ParentType, ContextType, Partial<QueryTagsArgs>>;
  team?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<QueryTeamArgs, 'id'>>;
  teamByCode?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<QueryTeamByCodeArgs, 'code'>>;
  teams?: Resolver<ResolversTypes['PaginatedTeams'], ParentType, ContextType, Partial<QueryTeamsArgs>>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType, RequireFields<QueryTicketArgs, 'id'>>;
  ticketNotes?: Resolver<Array<ResolversTypes['TicketWorkflowStateNote']>, ParentType, ContextType, RequireFields<QueryTicketNotesArgs, 'ticketId'>>;
  ticketStatusHistogram?: Resolver<Array<ResolversTypes['OpenTicketsByWorkflow']>, ParentType, ContextType, RequireFields<QueryTicketStatusHistogramArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  ticketTextAccessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryTicketTextAccessTokenArgs, 'id'>>;
  ticketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType, RequireFields<QueryTicketWorkflowStateArgs, 'id'>>;
  ticketWorkflowStateNote?: Resolver<ResolversTypes['TicketWorkflowStateNote'], ParentType, ContextType, RequireFields<QueryTicketWorkflowStateNoteArgs, 'ticketWorkflowStateNoteId'>>;
  tickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<QueryTicketsArgs>>;
  ticketsCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<QueryTicketsCountArgs, 'addedTicketIds' | 'filter' | 'removedTicketIds'>>;
  ticketsForMyCalendar?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, Partial<QueryTicketsForMyCalendarArgs>>;
  timeOffs?: Resolver<Array<ResolversTypes['TimeOff']>, ParentType, ContextType, RequireFields<QueryTimeOffsArgs, 'fromDate' | 'toDate'>>;
  todo?: Resolver<ResolversTypes['Todo'], ParentType, ContextType, RequireFields<QueryTodoArgs, 'id'>>;
  todos?: Resolver<ResolversTypes['PaginatedTodos'], ParentType, ContextType, Partial<QueryTodosArgs>>;
  useRole?: Resolver<ResolversTypes['Me'], ParentType, ContextType, RequireFields<QueryUseRoleArgs, 'organizationId'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  users?: Resolver<ResolversTypes['PaginatedUsers'], ParentType, ContextType, Partial<QueryUsersArgs>>;
  version?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workedTicketForPeriod?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<QueryWorkedTicketForPeriodArgs, 'projectId' | 'startDate' | 'stopDate'>>;
  workflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType, RequireFields<QueryWorkflowArgs, 'id'>>;
  workflowState?: Resolver<ResolversTypes['WorkflowState'], ParentType, ContextType, RequireFields<QueryWorkflowStateArgs, 'id'>>;
  workflows?: Resolver<ResolversTypes['PaginatedWorkflows'], ParentType, ContextType, Partial<QueryWorkflowsArgs>>;
};

export type QueryAggregateResolvers<ContextType = any, ParentType extends ResolversParentTypes['QueryAggregate'] = ResolversParentTypes['QueryAggregate']> = {
  main?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secondary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecurringBlackoutTimeResolvers<ContextType = any, ParentType extends ResolversParentTypes['RecurringBlackoutTime'] = ResolversParentTypes['RecurringBlackoutTime']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  disabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  friday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  monday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  saturday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stopTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  sunday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  thursday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timeZone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tuesday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  wednesday?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReportResolvers<ContextType = any, ParentType extends ResolversParentTypes['Report'] = ResolversParentTypes['Report']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  queries?: Resolver<Array<ResolversTypes['ReportQuery']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReportAggregateResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReportAggregate'] = ResolversParentTypes['ReportAggregate']> = {
  primary?: Resolver<Array<ResolversTypes['QueryAggregate']>, ParentType, ContextType>;
  secondary?: Resolver<Array<ResolversTypes['QueryAggregate']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReportQueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReportQuery'] = ResolversParentTypes['ReportQuery']> = {
  aggregateField?: Resolver<ResolversTypes['ReportAggregateField'], ParentType, ContextType>;
  byAssignees?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byAuthors?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byOwners?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byProducts?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byTags?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byTickets?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byWorkflowStateAssignees?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byWorkflowStates?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  byWorkflows?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  chartBy?: Resolver<ResolversTypes['ReportGroupBy'], ParentType, ContextType>;
  chartByLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cols?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  cummulative?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fromDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  granularity?: Resolver<ResolversTypes['ReportDateGranularity'], ParentType, ContextType>;
  groupBy?: Resolver<Maybe<ResolversTypes['ReportGroupBy']>, ParentType, ContextType>;
  groupByLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isTicketActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTicketDone?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTicketNotStarted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTicketStarted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  noUnknowns?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reportId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rows?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sameAsPrimaryFilter?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  secondaryByAssignees?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByAuthors?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByOwners?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByProducts?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByTags?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByTickets?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByWorkflowStateAssignees?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByWorkflowStates?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryByWorkflows?: Resolver<Array<ResolversTypes['FilterElement']>, ParentType, ContextType>;
  secondaryChartBy?: Resolver<Maybe<ResolversTypes['ReportGroupBy']>, ParentType, ContextType>;
  secondaryChartByLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secondaryGroupBy?: Resolver<Maybe<ResolversTypes['ReportGroupBy']>, ParentType, ContextType>;
  secondaryGroupByLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  secondaryIsTicketActive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  secondaryIsTicketDone?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  secondaryIsTicketNotStarted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  secondaryIsTicketStarted?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  untilDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  values?: Resolver<ResolversTypes['ReportAggregate'], ParentType, ContextType>;
  widgetType?: Resolver<ResolversTypes['ReportWidgetType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coverUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pinnedProjects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  preferences?: Resolver<ResolversTypes['RolePreferences'], ParentType, ContextType>;
  roleAutoResume?: Resolver<ResolversTypes['RoleAutoResume'], ParentType, ContextType>;
  roleEmail?: Resolver<ResolversTypes['RoleEmail'], ParentType, ContextType>;
  roleStartReminder?: Resolver<ResolversTypes['RoleStartReminder'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  timeZone?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['RoleType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  workWeek?: Resolver<ResolversTypes['WorkWeekTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleAutoResumeResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleAutoResume'] = ResolversParentTypes['RoleAutoResume']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextStartNotificationDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  nextStartNotificationOptOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleEmailResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleEmail'] = ResolversParentTypes['RoleEmail']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextWorkDayNotificationDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  nextWorkDayNotificationOffset?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextWorkDayNotificationOptOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleHabitResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleHabit'] = ResolversParentTypes['RoleHabit']> = {
  productWorkflows?: Resolver<Array<ResolversTypes['HabitProductWorkflow']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleNoteColorPreferencesResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleNoteColorPreferences'] = ResolversParentTypes['RoleNoteColorPreferences']> = {
  BLUE?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  GREEN?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ORANGE?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  PINK?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  PURPLE?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  YELLOW?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RolePreferencesResolvers<ContextType = any, ParentType extends ResolversParentTypes['RolePreferences'] = ResolversParentTypes['RolePreferences']> = {
  lastProjectId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  noteColors?: Resolver<ResolversTypes['RoleNoteColorPreferences'], ParentType, ContextType>;
  recentSearchHits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  recentlyVisited?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  showOnboarding?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleStartReminderResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleStartReminder'] = ResolversParentTypes['RoleStartReminder']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextStartNotificationDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  nextStartNotificationOffset?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextStartNotificationOptOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleWorkDayResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleWorkDay'] = ResolversParentTypes['RoleWorkDay']> = {
  startTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stopTime?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleWorkloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['RoleWorkload'] = ResolversParentTypes['RoleWorkload']> = {
  hours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleConfig'] = ResolversParentTypes['ScheduleConfig']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  features?: Resolver<Array<ResolversTypes['Feature']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  priority?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  projects?: Resolver<Array<ResolversTypes['Project']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  tickets?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workflows?: Resolver<Array<ResolversTypes['Workflow']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleEstimateResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleEstimate'] = ResolversParentTypes['ScheduleEstimate']> = {
  duration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startEpoch?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  start_min?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  stopEpoch?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketLocalId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketProductCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ticketTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ticketWorkflowStateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketWorkflowStateName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleItem'] = ResolversParentTypes['ScheduleItem']> = {
  autoStarted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  autoStopped?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  done?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  extendedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  nextTicketWorkflowState?: Resolver<Maybe<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  nextTicketWorkflowStateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  stoppedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  ticketId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType>;
  ticketWorkflowStateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleItemUpdateBoundariesResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleItemUpdateBoundaries'] = ResolversParentTypes['ScheduleItemUpdateBoundaries']> = {
  maxDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  minDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScheduleRoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['ScheduleRole'] = ResolversParentTypes['ScheduleRole']> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  futureCapacity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pastCapacity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meta?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SkillResolvers<ContextType = any, ParentType extends ResolversParentTypes['Skill'] = ResolversParentTypes['Skill']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  featureId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  author?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  authorId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  replacedByTagId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ticketCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  tickets?: Resolver<ResolversTypes['PaginatedTickets'], ParentType, ContextType, Partial<TagTicketsArgs>>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TeamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  coverUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  memberIds?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  members?: Resolver<ResolversTypes['PaginatedRoles'], ParentType, ContextType, Partial<TeamMembersArgs>>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketResolvers<ContextType = any, ParentType extends ResolversParentTypes['Ticket'] = ResolversParentTypes['Ticket']> = {
  ancestors?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  authorId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  closedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  closingNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comments?: Resolver<ResolversTypes['PaginatedComments'], ParentType, ContextType, Partial<TicketCommentsArgs>>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  estimate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  estimating?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  eta?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  features?: Resolver<Array<ResolversTypes['Feature']>, ParentType, ContextType>;
  folderId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  foreignId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isWatching?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  issues?: Resolver<Array<ResolversTypes['Issue']>, ParentType, ContextType>;
  lastScheduleItem?: Resolver<Maybe<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  localId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  milestone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  ownerId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  personalTags?: Resolver<Array<ResolversTypes['PersonalTag']>, ParentType, ContextType>;
  product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType>;
  productId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  progress?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['Project']>, ParentType, ContextType>;
  projectId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduleItems?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  successors?: Resolver<Array<ResolversTypes['Ticket']>, ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  ticketWorkflowStates?: Resolver<Array<ResolversTypes['TicketWorkflowState']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  watchers?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  workflow?: Resolver<Maybe<ResolversTypes['Workflow']>, ParentType, ContextType>;
  workflowId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketDependencyResolvers<ContextType = any, ParentType extends ResolversParentTypes['TicketDependency'] = ResolversParentTypes['TicketDependency']> = {
  ancestors?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  localId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  milestone?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  productCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  successors?: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketExportResolvers<ContextType = any, ParentType extends ResolversParentTypes['TicketExport'] = ResolversParentTypes['TicketExport']> = {
  ancestor_tickets?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  author_email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  author_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  closed_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  eta?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  local_id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner_email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner_name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  product?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  project?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scheduled_at?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TicketStatus'], ParentType, ContextType>;
  successor_tickets?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tags?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workflow?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketOpenByWorkflowDatumResolvers<ContextType = any, ParentType extends ResolversParentTypes['TicketOpenByWorkflowDatum'] = ResolversParentTypes['TicketOpenByWorkflowDatum']> = {
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketWorkflowStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['TicketWorkflowState'] = ResolversParentTypes['TicketWorkflowState']> = {
  assignee?: Resolver<Maybe<ResolversTypes['Role']>, ParentType, ContextType>;
  assigneeId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  checklist?: Resolver<Array<ResolversTypes['ChecklistItem']>, ParentType, ContextType>;
  complete?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  estimate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  estimateMaximum?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  estimateMinimum?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  estimateMostLikely?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  estimateSet?: Resolver<Maybe<ResolversTypes['Estimate']>, ParentType, ContextType>;
  fractionable?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isBlocked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  scheduleItems?: Resolver<Array<ResolversTypes['ScheduleItem']>, ParentType, ContextType>;
  ticket?: Resolver<ResolversTypes['Ticket'], ParentType, ContextType>;
  ticketId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketWorkflowStateNotes?: Resolver<Array<ResolversTypes['TicketWorkflowStateNote']>, ParentType, ContextType>;
  todo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  workflowState?: Resolver<Maybe<ResolversTypes['WorkflowState']>, ParentType, ContextType>;
  workflowStateId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TicketWorkflowStateNoteResolvers<ContextType = any, ParentType extends ResolversParentTypes['TicketWorkflowStateNote'] = ResolversParentTypes['TicketWorkflowStateNote']> = {
  author?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  authorId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['TicketWorkflowStateNoteCategory'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  fromTicketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType>;
  fromTicketWorkflowStateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ticketWorkflowState?: Resolver<ResolversTypes['TicketWorkflowState'], ParentType, ContextType>;
  ticketWorkflowStateId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TimeOffResolvers<ContextType = any, ParentType extends ResolversParentTypes['TimeOff'] = ResolversParentTypes['TimeOff']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  roleId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  startAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  stopAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TodoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Todo'] = ResolversParentTypes['Todo']> = {
  body?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  checked?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  checkedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  ownerId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isStaff?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preferences?: Resolver<ResolversTypes['UserPreferences'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  roles?: Resolver<ResolversTypes['PaginatedRoles'], ParentType, ContextType, Partial<UserRolesArgs>>;
  status?: Resolver<ResolversTypes['UserStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserPreferencesResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserPreferences'] = ResolversParentTypes['UserPreferences']> = {
  favoriteOrganizations?: Resolver<Array<Maybe<ResolversTypes['Int']>>, ParentType, ContextType>;
  lastOrganizationId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkWeekTimeResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkWeekTime'] = ResolversParentTypes['WorkWeekTime']> = {
  friday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  monday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  saturday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  sunday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  thursday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  tuesday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  wednesday?: Resolver<Array<ResolversTypes['RoleWorkDay']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkflowResolvers<ContextType = any, ParentType extends ResolversParentTypes['Workflow'] = ResolversParentTypes['Workflow']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isDefaultWorkflow?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<ResolversTypes['Organization'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  products?: Resolver<Array<ResolversTypes['Product']>, ParentType, ContextType>;
  stage?: Resolver<ResolversTypes['ModelStage'], ParentType, ContextType>;
  states?: Resolver<Array<ResolversTypes['WorkflowState']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkflowDistributionResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkflowDistribution'] = ResolversParentTypes['WorkflowDistribution']> = {
  hours?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  workflow?: Resolver<ResolversTypes['Workflow'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkflowStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkflowState'] = ResolversParentTypes['WorkflowState']> = {
  backupTeams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  organizationId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  teams?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  workflowId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  BatchPayload?: BatchPayloadResolvers<ContextType>;
  BlackoutTime?: BlackoutTimeResolvers<ContextType>;
  ChecklistItem?: ChecklistItemResolvers<ContextType>;
  Comment?: CommentResolvers<ContextType>;
  CommentReply?: CommentReplyResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DemoRequest?: DemoRequestResolvers<ContextType>;
  DependencySet?: DependencySetResolvers<ContextType>;
  Documentation?: DocumentationResolvers<ContextType>;
  DocumentationPage?: DocumentationPageResolvers<ContextType>;
  Drawing?: DrawingResolvers<ContextType>;
  Estimate?: EstimateResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  FeatureFlag?: FeatureFlagResolvers<ContextType>;
  FeatureGroup?: FeatureGroupResolvers<ContextType>;
  FilterElement?: FilterElementResolvers<ContextType>;
  HabitProductWorkflow?: HabitProductWorkflowResolvers<ContextType>;
  Issue?: IssueResolvers<ContextType>;
  IssueAction?: IssueActionResolvers<ContextType>;
  IssueContext?: IssueContextResolvers<ContextType>;
  Me?: MeResolvers<ContextType>;
  MiniDocumentationPage?: MiniDocumentationPageResolvers<ContextType>;
  MiniFeature?: MiniFeatureResolvers<ContextType>;
  MiniProduct?: MiniProductResolvers<ContextType>;
  MiniProject?: MiniProjectResolvers<ContextType>;
  MiniRole?: MiniRoleResolvers<ContextType>;
  MiniTag?: MiniTagResolvers<ContextType>;
  MiniWorkflow?: MiniWorkflowResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MyPreviousAssignedTicket?: MyPreviousAssignedTicketResolvers<ContextType>;
  MyUpcomingAssignedTicket?: MyUpcomingAssignedTicketResolvers<ContextType>;
  NewOrganization?: NewOrganizationResolvers<ContextType>;
  NextTicket?: NextTicketResolvers<ContextType>;
  Note?: NoteResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  OnboardingStatus?: OnboardingStatusResolvers<ContextType>;
  OpenTicketsByWorkflow?: OpenTicketsByWorkflowResolvers<ContextType>;
  Organization?: OrganizationResolvers<ContextType>;
  OrganizationAddress?: OrganizationAddressResolvers<ContextType>;
  OrganizationPreferences?: OrganizationPreferencesResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  PaginatedBlackoutTimes?: PaginatedBlackoutTimesResolvers<ContextType>;
  PaginatedComments?: PaginatedCommentsResolvers<ContextType>;
  PaginatedDocumentations?: PaginatedDocumentationsResolvers<ContextType>;
  PaginatedFeatureGroups?: PaginatedFeatureGroupsResolvers<ContextType>;
  PaginatedFeatures?: PaginatedFeaturesResolvers<ContextType>;
  PaginatedIssues?: PaginatedIssuesResolvers<ContextType>;
  PaginatedNotes?: PaginatedNotesResolvers<ContextType>;
  PaginatedNotifications?: PaginatedNotificationsResolvers<ContextType>;
  PaginatedOrganizations?: PaginatedOrganizationsResolvers<ContextType>;
  PaginatedPersonalTags?: PaginatedPersonalTagsResolvers<ContextType>;
  PaginatedProducts?: PaginatedProductsResolvers<ContextType>;
  PaginatedProjects?: PaginatedProjectsResolvers<ContextType>;
  PaginatedRecurringBlackoutTimes?: PaginatedRecurringBlackoutTimesResolvers<ContextType>;
  PaginatedReports?: PaginatedReportsResolvers<ContextType>;
  PaginatedRoles?: PaginatedRolesResolvers<ContextType>;
  PaginatedScheduleItems?: PaginatedScheduleItemsResolvers<ContextType>;
  PaginatedTags?: PaginatedTagsResolvers<ContextType>;
  PaginatedTeams?: PaginatedTeamsResolvers<ContextType>;
  PaginatedTickets?: PaginatedTicketsResolvers<ContextType>;
  PaginatedTodos?: PaginatedTodosResolvers<ContextType>;
  PaginatedUsers?: PaginatedUsersResolvers<ContextType>;
  PaginatedWorkflows?: PaginatedWorkflowsResolvers<ContextType>;
  PersonalTag?: PersonalTagResolvers<ContextType>;
  PlanningTicket?: PlanningTicketResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  ProjectAnalytics?: ProjectAnalyticsResolvers<ContextType>;
  ProjectDependency?: ProjectDependencyResolvers<ContextType>;
  ProjectGoalProgress?: ProjectGoalProgressResolvers<ContextType>;
  ProjectGoalStats?: ProjectGoalStatsResolvers<ContextType>;
  ProjectTicket?: ProjectTicketResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QueryAggregate?: QueryAggregateResolvers<ContextType>;
  RecurringBlackoutTime?: RecurringBlackoutTimeResolvers<ContextType>;
  Report?: ReportResolvers<ContextType>;
  ReportAggregate?: ReportAggregateResolvers<ContextType>;
  ReportQuery?: ReportQueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RoleAutoResume?: RoleAutoResumeResolvers<ContextType>;
  RoleEmail?: RoleEmailResolvers<ContextType>;
  RoleHabit?: RoleHabitResolvers<ContextType>;
  RoleNoteColorPreferences?: RoleNoteColorPreferencesResolvers<ContextType>;
  RolePreferences?: RolePreferencesResolvers<ContextType>;
  RoleStartReminder?: RoleStartReminderResolvers<ContextType>;
  RoleWorkDay?: RoleWorkDayResolvers<ContextType>;
  RoleWorkload?: RoleWorkloadResolvers<ContextType>;
  ScheduleConfig?: ScheduleConfigResolvers<ContextType>;
  ScheduleEstimate?: ScheduleEstimateResolvers<ContextType>;
  ScheduleItem?: ScheduleItemResolvers<ContextType>;
  ScheduleItemUpdateBoundaries?: ScheduleItemUpdateBoundariesResolvers<ContextType>;
  ScheduleRole?: ScheduleRoleResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  Skill?: SkillResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  Ticket?: TicketResolvers<ContextType>;
  TicketDependency?: TicketDependencyResolvers<ContextType>;
  TicketExport?: TicketExportResolvers<ContextType>;
  TicketOpenByWorkflowDatum?: TicketOpenByWorkflowDatumResolvers<ContextType>;
  TicketWorkflowState?: TicketWorkflowStateResolvers<ContextType>;
  TicketWorkflowStateNote?: TicketWorkflowStateNoteResolvers<ContextType>;
  TimeOff?: TimeOffResolvers<ContextType>;
  Todo?: TodoResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserPreferences?: UserPreferencesResolvers<ContextType>;
  WorkWeekTime?: WorkWeekTimeResolvers<ContextType>;
  Workflow?: WorkflowResolvers<ContextType>;
  WorkflowDistribution?: WorkflowDistributionResolvers<ContextType>;
  WorkflowState?: WorkflowStateResolvers<ContextType>;
};

