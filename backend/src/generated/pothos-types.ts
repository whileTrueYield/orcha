/* eslint-disable */
import type { Prisma, PushSubscription, Documentation, DocumentationPage, DocumentationPageText, DocumentationPageTextRevision, DocumentationPageData, DocumentationPagePOI, Comment, CommentReply, Report, ReportQuery, Todo, Note, Notification, EmailConfirmation, Feature, FeatureGroup, migrations, OrganizationAddress, Issue, IssueAction, FeatureFlag, Organization, OrganizationUpload, PasswordLost, PersonalAccessToken, PersonalTag, Product, Estimate, Page, Folder, FolderDataBlock, Drawing, Project, ProjectData, ProjectText, ProjectTextRevision, Question, QuestionReply, RoleEmail, RoleStartReminder, RoleAutoResume, Role, ScheduleItem, TimeOff, BlackoutTime, RecurringBlackoutTime, Skill, SkillRating, Tag, Team, Ticket, TicketText, TicketTextRevision, ScheduleConfig, TicketWorkflowStateNote, TicketWorkflowState, User, UserEmailChange, Workflow, WorkflowState, DemoRequest } from "@prisma/client";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    PushSubscription: {
        Name: "PushSubscription";
        Shape: PushSubscription;
        Include: Prisma.PushSubscriptionInclude;
        Select: Prisma.PushSubscriptionSelect;
        OrderBy: Prisma.PushSubscriptionOrderByWithRelationInput;
        WhereUnique: Prisma.PushSubscriptionWhereUniqueInput;
        Where: Prisma.PushSubscriptionWhereInput;
        Create: {};
        Update: {};
        RelationName: "role";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
        };
    };
    Documentation: {
        Name: "Documentation";
        Shape: Documentation;
        Include: Prisma.DocumentationInclude;
        Select: Prisma.DocumentationSelect;
        OrderBy: Prisma.DocumentationOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationWhereUniqueInput;
        Where: Prisma.DocumentationWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "documentationPages" | "pois";
        ListRelations: "documentationPages" | "pois";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            documentationPages: {
                Shape: DocumentationPage[];
                Name: "DocumentationPage";
                Nullable: false;
            };
            pois: {
                Shape: DocumentationPagePOI[];
                Name: "DocumentationPagePOI";
                Nullable: false;
            };
        };
    };
    DocumentationPage: {
        Name: "DocumentationPage";
        Shape: DocumentationPage;
        Include: Prisma.DocumentationPageInclude;
        Select: Prisma.DocumentationPageSelect;
        OrderBy: Prisma.DocumentationPageOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationPageWhereUniqueInput;
        Where: Prisma.DocumentationPageWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "documentation" | "parent" | "children" | "pois" | "documentationPageData" | "documentationPageText" | "documentationPageTextRevisions";
        ListRelations: "children" | "pois" | "documentationPageTextRevisions";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            documentation: {
                Shape: Documentation;
                Name: "Documentation";
                Nullable: false;
            };
            parent: {
                Shape: DocumentationPage | null;
                Name: "DocumentationPage";
                Nullable: true;
            };
            children: {
                Shape: DocumentationPage[];
                Name: "DocumentationPage";
                Nullable: false;
            };
            pois: {
                Shape: DocumentationPagePOI[];
                Name: "DocumentationPagePOI";
                Nullable: false;
            };
            documentationPageData: {
                Shape: DocumentationPageData | null;
                Name: "DocumentationPageData";
                Nullable: true;
            };
            documentationPageText: {
                Shape: DocumentationPageText | null;
                Name: "DocumentationPageText";
                Nullable: true;
            };
            documentationPageTextRevisions: {
                Shape: DocumentationPageTextRevision[];
                Name: "DocumentationPageTextRevision";
                Nullable: false;
            };
        };
    };
    DocumentationPageText: {
        Name: "DocumentationPageText";
        Shape: DocumentationPageText;
        Include: Prisma.DocumentationPageTextInclude;
        Select: Prisma.DocumentationPageTextSelect;
        OrderBy: Prisma.DocumentationPageTextOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationPageTextWhereUniqueInput;
        Where: Prisma.DocumentationPageTextWhereInput;
        Create: {};
        Update: {};
        RelationName: "documentationPage";
        ListRelations: never;
        Relations: {
            documentationPage: {
                Shape: DocumentationPage;
                Name: "DocumentationPage";
                Nullable: false;
            };
        };
    };
    DocumentationPageTextRevision: {
        Name: "DocumentationPageTextRevision";
        Shape: DocumentationPageTextRevision;
        Include: Prisma.DocumentationPageTextRevisionInclude;
        Select: Prisma.DocumentationPageTextRevisionSelect;
        OrderBy: Prisma.DocumentationPageTextRevisionOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationPageTextRevisionWhereUniqueInput;
        Where: Prisma.DocumentationPageTextRevisionWhereInput;
        Create: {};
        Update: {};
        RelationName: "documentationPage";
        ListRelations: never;
        Relations: {
            documentationPage: {
                Shape: DocumentationPage;
                Name: "DocumentationPage";
                Nullable: false;
            };
        };
    };
    DocumentationPageData: {
        Name: "DocumentationPageData";
        Shape: DocumentationPageData;
        Include: Prisma.DocumentationPageDataInclude;
        Select: Prisma.DocumentationPageDataSelect;
        OrderBy: Prisma.DocumentationPageDataOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationPageDataWhereUniqueInput;
        Where: Prisma.DocumentationPageDataWhereInput;
        Create: {};
        Update: {};
        RelationName: "documentationPage";
        ListRelations: never;
        Relations: {
            documentationPage: {
                Shape: DocumentationPage;
                Name: "DocumentationPage";
                Nullable: false;
            };
        };
    };
    DocumentationPagePOI: {
        Name: "DocumentationPagePOI";
        Shape: DocumentationPagePOI;
        Include: Prisma.DocumentationPagePOIInclude;
        Select: Prisma.DocumentationPagePOISelect;
        OrderBy: Prisma.DocumentationPagePOIOrderByWithRelationInput;
        WhereUnique: Prisma.DocumentationPagePOIWhereUniqueInput;
        Where: Prisma.DocumentationPagePOIWhereInput;
        Create: {};
        Update: {};
        RelationName: "documentation" | "documentationPage";
        ListRelations: never;
        Relations: {
            documentation: {
                Shape: Documentation;
                Name: "Documentation";
                Nullable: false;
            };
            documentationPage: {
                Shape: DocumentationPage;
                Name: "DocumentationPage";
                Nullable: false;
            };
        };
    };
    Comment: {
        Name: "Comment";
        Shape: Comment;
        Include: Prisma.CommentInclude;
        Select: Prisma.CommentSelect;
        OrderBy: Prisma.CommentOrderByWithRelationInput;
        WhereUnique: Prisma.CommentWhereUniqueInput;
        Where: Prisma.CommentWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "organization" | "ticket" | "acceptedReply" | "replies";
        ListRelations: "replies";
        Relations: {
            author: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
            acceptedReply: {
                Shape: CommentReply | null;
                Name: "CommentReply";
                Nullable: true;
            };
            replies: {
                Shape: CommentReply[];
                Name: "CommentReply";
                Nullable: false;
            };
        };
    };
    CommentReply: {
        Name: "CommentReply";
        Shape: CommentReply;
        Include: Prisma.CommentReplyInclude;
        Select: Prisma.CommentReplySelect;
        OrderBy: Prisma.CommentReplyOrderByWithRelationInput;
        WhereUnique: Prisma.CommentReplyWhereUniqueInput;
        Where: Prisma.CommentReplyWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "comment" | "Organization" | "acceptedReplyForComments";
        ListRelations: "acceptedReplyForComments";
        Relations: {
            author: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            comment: {
                Shape: Comment;
                Name: "Comment";
                Nullable: false;
            };
            Organization: {
                Shape: Organization | null;
                Name: "Organization";
                Nullable: true;
            };
            acceptedReplyForComments: {
                Shape: Comment[];
                Name: "Comment";
                Nullable: false;
            };
        };
    };
    Report: {
        Name: "Report";
        Shape: Report;
        Include: Prisma.ReportInclude;
        Select: Prisma.ReportSelect;
        OrderBy: Prisma.ReportOrderByWithRelationInput;
        WhereUnique: Prisma.ReportWhereUniqueInput;
        Where: Prisma.ReportWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "reportQueries";
        ListRelations: "reportQueries";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    ReportQuery: {
        Name: "ReportQuery";
        Shape: ReportQuery;
        Include: Prisma.ReportQueryInclude;
        Select: Prisma.ReportQuerySelect;
        OrderBy: Prisma.ReportQueryOrderByWithRelationInput;
        WhereUnique: Prisma.ReportQueryWhereUniqueInput;
        Where: Prisma.ReportQueryWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "report" | "byTags" | "byProducts" | "byWorkflows" | "byFeatures" | "byTickets" | "byOwners" | "byAuthors" | "byAssignees" | "byWorkflowStateAssignees" | "byWorkflowStates" | "secondaryByTags" | "secondaryByProducts" | "secondaryByWorkflows" | "secondaryByFeatures" | "secondaryByTickets" | "secondaryByOwners" | "secondaryByAuthors" | "secondaryByAssignees" | "secondaryByWorkflowStateAssignees" | "secondaryByWorkflowStates";
        ListRelations: "byTags" | "byProducts" | "byWorkflows" | "byFeatures" | "byTickets" | "byOwners" | "byAuthors" | "byAssignees" | "byWorkflowStateAssignees" | "byWorkflowStates" | "secondaryByTags" | "secondaryByProducts" | "secondaryByWorkflows" | "secondaryByFeatures" | "secondaryByTickets" | "secondaryByOwners" | "secondaryByAuthors" | "secondaryByAssignees" | "secondaryByWorkflowStateAssignees" | "secondaryByWorkflowStates";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            report: {
                Shape: Report;
                Name: "Report";
                Nullable: false;
            };
            byTags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            byProducts: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            byWorkflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            byFeatures: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
            byTickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            byOwners: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            byAuthors: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            byAssignees: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            byWorkflowStateAssignees: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            byWorkflowStates: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
            secondaryByTags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            secondaryByProducts: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            secondaryByWorkflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            secondaryByFeatures: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
            secondaryByTickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            secondaryByOwners: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            secondaryByAuthors: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            secondaryByAssignees: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            secondaryByWorkflowStateAssignees: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            secondaryByWorkflowStates: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
        };
    };
    Todo: {
        Name: "Todo";
        Shape: Todo;
        Include: Prisma.TodoInclude;
        Select: Prisma.TodoSelect;
        OrderBy: Prisma.TodoOrderByWithRelationInput;
        WhereUnique: Prisma.TodoWhereUniqueInput;
        Where: Prisma.TodoWhereInput;
        Create: {};
        Update: {};
        RelationName: "owner" | "organization";
        ListRelations: never;
        Relations: {
            owner: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Note: {
        Name: "Note";
        Shape: Note;
        Include: Prisma.NoteInclude;
        Select: Prisma.NoteSelect;
        OrderBy: Prisma.NoteOrderByWithRelationInput;
        WhereUnique: Prisma.NoteWhereUniqueInput;
        Where: Prisma.NoteWhereInput;
        Create: {};
        Update: {};
        RelationName: "owner" | "organization";
        ListRelations: never;
        Relations: {
            owner: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Notification: {
        Name: "Notification";
        Shape: Notification;
        Include: Prisma.NotificationInclude;
        Select: Prisma.NotificationSelect;
        OrderBy: Prisma.NotificationOrderByWithRelationInput;
        WhereUnique: Prisma.NotificationWhereUniqueInput;
        Where: Prisma.NotificationWhereInput;
        Create: {};
        Update: {};
        RelationName: "role" | "actor" | "organization";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            actor: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    EmailConfirmation: {
        Name: "EmailConfirmation";
        Shape: EmailConfirmation;
        Include: never;
        Select: Prisma.EmailConfirmationSelect;
        OrderBy: Prisma.EmailConfirmationOrderByWithRelationInput;
        WhereUnique: Prisma.EmailConfirmationWhereUniqueInput;
        Where: Prisma.EmailConfirmationWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Feature: {
        Name: "Feature";
        Shape: Feature;
        Include: Prisma.FeatureInclude;
        Select: Prisma.FeatureSelect;
        OrderBy: Prisma.FeatureOrderByWithRelationInput;
        WhereUnique: Prisma.FeatureWhereUniqueInput;
        Where: Prisma.FeatureWhereInput;
        Create: {};
        Update: {};
        RelationName: "featureGroup" | "skills" | "tickets" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        ListRelations: "skills" | "tickets" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        Relations: {
            featureGroup: {
                Shape: FeatureGroup;
                Name: "FeatureGroup";
                Nullable: false;
            };
            skills: {
                Shape: Skill[];
                Name: "Skill";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    FeatureGroup: {
        Name: "FeatureGroup";
        Shape: FeatureGroup;
        Include: Prisma.FeatureGroupInclude;
        Select: Prisma.FeatureGroupSelect;
        OrderBy: Prisma.FeatureGroupOrderByWithRelationInput;
        WhereUnique: Prisma.FeatureGroupWhereUniqueInput;
        Where: Prisma.FeatureGroupWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "product" | "features";
        ListRelations: "features";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            product: {
                Shape: Product;
                Name: "Product";
                Nullable: false;
            };
            features: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
        };
    };
    migrations: {
        Name: "migrations";
        Shape: migrations;
        Include: never;
        Select: Prisma.migrationsSelect;
        OrderBy: Prisma.migrationsOrderByWithRelationInput;
        WhereUnique: Prisma.migrationsWhereUniqueInput;
        Where: Prisma.migrationsWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    OrganizationAddress: {
        Name: "OrganizationAddress";
        Shape: OrganizationAddress;
        Include: Prisma.OrganizationAddressInclude;
        Select: Prisma.OrganizationAddressSelect;
        OrderBy: Prisma.OrganizationAddressOrderByWithRelationInput;
        WhereUnique: Prisma.OrganizationAddressWhereUniqueInput;
        Where: Prisma.OrganizationAddressWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "mailingAddressFor" | "billingAddressFor";
        ListRelations: "mailingAddressFor" | "billingAddressFor";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            mailingAddressFor: {
                Shape: Organization[];
                Name: "Organization";
                Nullable: false;
            };
            billingAddressFor: {
                Shape: Organization[];
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Issue: {
        Name: "Issue";
        Shape: Issue;
        Include: Prisma.IssueInclude;
        Select: Prisma.IssueSelect;
        OrderBy: Prisma.IssueOrderByWithRelationInput;
        WhereUnique: Prisma.IssueWhereUniqueInput;
        Where: Prisma.IssueWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "ticket" | "product" | "assignee" | "issueActions";
        ListRelations: "issueActions";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            ticket: {
                Shape: Ticket | null;
                Name: "Ticket";
                Nullable: true;
            };
            product: {
                Shape: Product;
                Name: "Product";
                Nullable: false;
            };
            assignee: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            issueActions: {
                Shape: IssueAction[];
                Name: "IssueAction";
                Nullable: false;
            };
        };
    };
    IssueAction: {
        Name: "IssueAction";
        Shape: IssueAction;
        Include: Prisma.IssueActionInclude;
        Select: Prisma.IssueActionSelect;
        OrderBy: Prisma.IssueActionOrderByWithRelationInput;
        WhereUnique: Prisma.IssueActionWhereUniqueInput;
        Where: Prisma.IssueActionWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "issue" | "author";
        ListRelations: never;
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            issue: {
                Shape: Issue;
                Name: "Issue";
                Nullable: false;
            };
            author: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
        };
    };
    FeatureFlag: {
        Name: "FeatureFlag";
        Shape: FeatureFlag;
        Include: Prisma.FeatureFlagInclude;
        Select: Prisma.FeatureFlagSelect;
        OrderBy: Prisma.FeatureFlagOrderByWithRelationInput;
        WhereUnique: Prisma.FeatureFlagWhereUniqueInput;
        Where: Prisma.FeatureFlagWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization";
        ListRelations: never;
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Organization: {
        Name: "Organization";
        Shape: Organization;
        Include: Prisma.OrganizationInclude;
        Select: Prisma.OrganizationSelect;
        OrderBy: Prisma.OrganizationOrderByWithRelationInput;
        WhereUnique: Prisma.OrganizationWhereUniqueInput;
        Where: Prisma.OrganizationWhereInput;
        Create: {};
        Update: {};
        RelationName: "mailingAddress" | "billingAddress" | "featureFlag" | "addresses" | "commentReplies" | "comments" | "documentationPages" | "documentations" | "featureGroups" | "folders" | "projects" | "issueActions" | "notes" | "notifications" | "organizationUploads" | "pages" | "personalTags" | "products" | "questionReplies" | "questions" | "reportQuery" | "reports" | "roles" | "scheduleConfigs" | "scheduleItems" | "skills" | "supportTickets" | "tags" | "teams" | "tickets" | "timeOffs" | "todos" | "workflows" | "workflowStates" | "blackoutTimes" | "recurringBlackoutTimes" | "drawings" | "personalAccessTokens";
        ListRelations: "addresses" | "commentReplies" | "comments" | "documentationPages" | "documentations" | "featureGroups" | "folders" | "projects" | "issueActions" | "notes" | "notifications" | "organizationUploads" | "pages" | "personalTags" | "products" | "questionReplies" | "questions" | "reportQuery" | "reports" | "roles" | "scheduleConfigs" | "scheduleItems" | "skills" | "supportTickets" | "tags" | "teams" | "tickets" | "timeOffs" | "todos" | "workflows" | "workflowStates" | "blackoutTimes" | "recurringBlackoutTimes" | "drawings" | "personalAccessTokens";
        Relations: {
            mailingAddress: {
                Shape: OrganizationAddress | null;
                Name: "OrganizationAddress";
                Nullable: true;
            };
            billingAddress: {
                Shape: OrganizationAddress | null;
                Name: "OrganizationAddress";
                Nullable: true;
            };
            featureFlag: {
                Shape: FeatureFlag | null;
                Name: "FeatureFlag";
                Nullable: true;
            };
            addresses: {
                Shape: OrganizationAddress[];
                Name: "OrganizationAddress";
                Nullable: false;
            };
            commentReplies: {
                Shape: CommentReply[];
                Name: "CommentReply";
                Nullable: false;
            };
            comments: {
                Shape: Comment[];
                Name: "Comment";
                Nullable: false;
            };
            documentationPages: {
                Shape: DocumentationPage[];
                Name: "DocumentationPage";
                Nullable: false;
            };
            documentations: {
                Shape: Documentation[];
                Name: "Documentation";
                Nullable: false;
            };
            featureGroups: {
                Shape: FeatureGroup[];
                Name: "FeatureGroup";
                Nullable: false;
            };
            folders: {
                Shape: Folder[];
                Name: "Folder";
                Nullable: false;
            };
            projects: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            issueActions: {
                Shape: IssueAction[];
                Name: "IssueAction";
                Nullable: false;
            };
            notes: {
                Shape: Note[];
                Name: "Note";
                Nullable: false;
            };
            notifications: {
                Shape: Notification[];
                Name: "Notification";
                Nullable: false;
            };
            organizationUploads: {
                Shape: OrganizationUpload[];
                Name: "OrganizationUpload";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            personalTags: {
                Shape: PersonalTag[];
                Name: "PersonalTag";
                Nullable: false;
            };
            products: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            questionReplies: {
                Shape: QuestionReply[];
                Name: "QuestionReply";
                Nullable: false;
            };
            questions: {
                Shape: Question[];
                Name: "Question";
                Nullable: false;
            };
            reportQuery: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reports: {
                Shape: Report[];
                Name: "Report";
                Nullable: false;
            };
            roles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            scheduleItems: {
                Shape: ScheduleItem[];
                Name: "ScheduleItem";
                Nullable: false;
            };
            skills: {
                Shape: Skill[];
                Name: "Skill";
                Nullable: false;
            };
            supportTickets: {
                Shape: Issue[];
                Name: "Issue";
                Nullable: false;
            };
            tags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            timeOffs: {
                Shape: TimeOff[];
                Name: "TimeOff";
                Nullable: false;
            };
            todos: {
                Shape: Todo[];
                Name: "Todo";
                Nullable: false;
            };
            workflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            workflowStates: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
            blackoutTimes: {
                Shape: BlackoutTime[];
                Name: "BlackoutTime";
                Nullable: false;
            };
            recurringBlackoutTimes: {
                Shape: RecurringBlackoutTime[];
                Name: "RecurringBlackoutTime";
                Nullable: false;
            };
            drawings: {
                Shape: Drawing[];
                Name: "Drawing";
                Nullable: false;
            };
            personalAccessTokens: {
                Shape: PersonalAccessToken[];
                Name: "PersonalAccessToken";
                Nullable: false;
            };
        };
    };
    OrganizationUpload: {
        Name: "OrganizationUpload";
        Shape: OrganizationUpload;
        Include: Prisma.OrganizationUploadInclude;
        Select: Prisma.OrganizationUploadSelect;
        OrderBy: Prisma.OrganizationUploadOrderByWithRelationInput;
        WhereUnique: Prisma.OrganizationUploadWhereUniqueInput;
        Where: Prisma.OrganizationUploadWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "role";
        ListRelations: never;
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            role: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
        };
    };
    PasswordLost: {
        Name: "PasswordLost";
        Shape: PasswordLost;
        Include: never;
        Select: Prisma.PasswordLostSelect;
        OrderBy: Prisma.PasswordLostOrderByWithRelationInput;
        WhereUnique: Prisma.PasswordLostWhereUniqueInput;
        Where: Prisma.PasswordLostWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    PersonalAccessToken: {
        Name: "PersonalAccessToken";
        Shape: PersonalAccessToken;
        Include: Prisma.PersonalAccessTokenInclude;
        Select: Prisma.PersonalAccessTokenSelect;
        OrderBy: Prisma.PersonalAccessTokenOrderByWithRelationInput;
        WhereUnique: Prisma.PersonalAccessTokenWhereUniqueInput;
        Where: Prisma.PersonalAccessTokenWhereInput;
        Create: {};
        Update: {};
        RelationName: "role" | "organization";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    PersonalTag: {
        Name: "PersonalTag";
        Shape: PersonalTag;
        Include: Prisma.PersonalTagInclude;
        Select: Prisma.PersonalTagSelect;
        OrderBy: Prisma.PersonalTagOrderByWithRelationInput;
        WhereUnique: Prisma.PersonalTagWhereUniqueInput;
        Where: Prisma.PersonalTagWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "owner" | "replacedBy" | "replacesTags" | "tickets";
        ListRelations: "replacesTags" | "tickets";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            owner: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            replacedBy: {
                Shape: PersonalTag | null;
                Name: "PersonalTag";
                Nullable: true;
            };
            replacesTags: {
                Shape: PersonalTag[];
                Name: "PersonalTag";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
        };
    };
    Product: {
        Name: "Product";
        Shape: Product;
        Include: Prisma.ProductInclude;
        Select: Prisma.ProductSelect;
        OrderBy: Prisma.ProductOrderByWithRelationInput;
        WhereUnique: Prisma.ProductWhereUniqueInput;
        Where: Prisma.ProductWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "featureGroups" | "workflows" | "tickets" | "scheduleConfigs" | "pages" | "cases" | "reportQueries" | "reportSecondaryQueries";
        ListRelations: "featureGroups" | "workflows" | "tickets" | "scheduleConfigs" | "pages" | "cases" | "reportQueries" | "reportSecondaryQueries";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            featureGroups: {
                Shape: FeatureGroup[];
                Name: "FeatureGroup";
                Nullable: false;
            };
            workflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            cases: {
                Shape: Issue[];
                Name: "Issue";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    Estimate: {
        Name: "Estimate";
        Shape: Estimate;
        Include: Prisma.EstimateInclude;
        Select: Prisma.EstimateSelect;
        OrderBy: Prisma.EstimateOrderByWithRelationInput;
        WhereUnique: Prisma.EstimateWhereUniqueInput;
        Where: Prisma.EstimateWhereInput;
        Create: {};
        Update: {};
        RelationName: "assignee";
        ListRelations: never;
        Relations: {
            assignee: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
        };
    };
    Page: {
        Name: "Page";
        Shape: Page;
        Include: Prisma.PageInclude;
        Select: Prisma.PageSelect;
        OrderBy: Prisma.PageOrderByWithRelationInput;
        WhereUnique: Prisma.PageWhereUniqueInput;
        Where: Prisma.PageWhereInput;
        Create: {};
        Update: {};
        RelationName: "tags" | "products" | "workflows" | "features" | "owners" | "organization";
        ListRelations: "tags" | "products" | "workflows" | "features" | "owners";
        Relations: {
            tags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            products: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            workflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            features: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
            owners: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Folder: {
        Name: "Folder";
        Shape: Folder;
        Include: Prisma.FolderInclude;
        Select: Prisma.FolderSelect;
        OrderBy: Prisma.FolderOrderByWithRelationInput;
        WhereUnique: Prisma.FolderWhereUniqueInput;
        Where: Prisma.FolderWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "tickets" | "blocks" | "owner" | "author" | "pinnedByRoles";
        ListRelations: "tickets" | "blocks" | "pinnedByRoles";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            blocks: {
                Shape: FolderDataBlock[];
                Name: "FolderDataBlock";
                Nullable: false;
            };
            owner: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            author: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            pinnedByRoles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
        };
    };
    FolderDataBlock: {
        Name: "FolderDataBlock";
        Shape: FolderDataBlock;
        Include: Prisma.FolderDataBlockInclude;
        Select: Prisma.FolderDataBlockSelect;
        OrderBy: Prisma.FolderDataBlockOrderByWithRelationInput;
        WhereUnique: Prisma.FolderDataBlockWhereUniqueInput;
        Where: Prisma.FolderDataBlockWhereInput;
        Create: {};
        Update: {};
        RelationName: "folder";
        ListRelations: never;
        Relations: {
            folder: {
                Shape: Folder | null;
                Name: "Folder";
                Nullable: true;
            };
        };
    };
    Drawing: {
        Name: "Drawing";
        Shape: Drawing;
        Include: Prisma.DrawingInclude;
        Select: Prisma.DrawingSelect;
        OrderBy: Prisma.DrawingOrderByWithRelationInput;
        WhereUnique: Prisma.DrawingWhereUniqueInput;
        Where: Prisma.DrawingWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "role";
        ListRelations: never;
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            role: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
        };
    };
    Project: {
        Name: "Project";
        Shape: Project;
        Include: Prisma.ProjectInclude;
        Select: Prisma.ProjectSelect;
        OrderBy: Prisma.ProjectOrderByWithRelationInput;
        WhereUnique: Prisma.ProjectWhereUniqueInput;
        Where: Prisma.ProjectWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "tickets" | "owner" | "author" | "pinnedByRoles" | "scheduleConfigs" | "parent" | "children" | "projectData" | "projectText" | "projectTextRevisions";
        ListRelations: "tickets" | "pinnedByRoles" | "scheduleConfigs" | "children" | "projectTextRevisions";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            owner: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            author: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            pinnedByRoles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            parent: {
                Shape: Project | null;
                Name: "Project";
                Nullable: true;
            };
            children: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            projectData: {
                Shape: ProjectData | null;
                Name: "ProjectData";
                Nullable: true;
            };
            projectText: {
                Shape: ProjectText | null;
                Name: "ProjectText";
                Nullable: true;
            };
            projectTextRevisions: {
                Shape: ProjectTextRevision[];
                Name: "ProjectTextRevision";
                Nullable: false;
            };
        };
    };
    ProjectData: {
        Name: "ProjectData";
        Shape: ProjectData;
        Include: Prisma.ProjectDataInclude;
        Select: Prisma.ProjectDataSelect;
        OrderBy: Prisma.ProjectDataOrderByWithRelationInput;
        WhereUnique: Prisma.ProjectDataWhereUniqueInput;
        Where: Prisma.ProjectDataWhereInput;
        Create: {};
        Update: {};
        RelationName: "project";
        ListRelations: never;
        Relations: {
            project: {
                Shape: Project;
                Name: "Project";
                Nullable: false;
            };
        };
    };
    ProjectText: {
        Name: "ProjectText";
        Shape: ProjectText;
        Include: Prisma.ProjectTextInclude;
        Select: Prisma.ProjectTextSelect;
        OrderBy: Prisma.ProjectTextOrderByWithRelationInput;
        WhereUnique: Prisma.ProjectTextWhereUniqueInput;
        Where: Prisma.ProjectTextWhereInput;
        Create: {};
        Update: {};
        RelationName: "project";
        ListRelations: never;
        Relations: {
            project: {
                Shape: Project;
                Name: "Project";
                Nullable: false;
            };
        };
    };
    ProjectTextRevision: {
        Name: "ProjectTextRevision";
        Shape: ProjectTextRevision;
        Include: Prisma.ProjectTextRevisionInclude;
        Select: Prisma.ProjectTextRevisionSelect;
        OrderBy: Prisma.ProjectTextRevisionOrderByWithRelationInput;
        WhereUnique: Prisma.ProjectTextRevisionWhereUniqueInput;
        Where: Prisma.ProjectTextRevisionWhereInput;
        Create: {};
        Update: {};
        RelationName: "project";
        ListRelations: never;
        Relations: {
            project: {
                Shape: Project;
                Name: "Project";
                Nullable: false;
            };
        };
    };
    Question: {
        Name: "Question";
        Shape: Question;
        Include: Prisma.QuestionInclude;
        Select: Prisma.QuestionSelect;
        OrderBy: Prisma.QuestionOrderByWithRelationInput;
        WhereUnique: Prisma.QuestionWhereUniqueInput;
        Where: Prisma.QuestionWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "organization" | "ticket" | "acceptedReply" | "replies";
        ListRelations: "replies";
        Relations: {
            author: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
            acceptedReply: {
                Shape: QuestionReply | null;
                Name: "QuestionReply";
                Nullable: true;
            };
            replies: {
                Shape: QuestionReply[];
                Name: "QuestionReply";
                Nullable: false;
            };
        };
    };
    QuestionReply: {
        Name: "QuestionReply";
        Shape: QuestionReply;
        Include: Prisma.QuestionReplyInclude;
        Select: Prisma.QuestionReplySelect;
        OrderBy: Prisma.QuestionReplyOrderByWithRelationInput;
        WhereUnique: Prisma.QuestionReplyWhereUniqueInput;
        Where: Prisma.QuestionReplyWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "question" | "Organization" | "acceptedReplyForQuestions";
        ListRelations: "acceptedReplyForQuestions";
        Relations: {
            author: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            question: {
                Shape: Question;
                Name: "Question";
                Nullable: false;
            };
            Organization: {
                Shape: Organization | null;
                Name: "Organization";
                Nullable: true;
            };
            acceptedReplyForQuestions: {
                Shape: Question[];
                Name: "Question";
                Nullable: false;
            };
        };
    };
    RoleEmail: {
        Name: "RoleEmail";
        Shape: RoleEmail;
        Include: Prisma.RoleEmailInclude;
        Select: Prisma.RoleEmailSelect;
        OrderBy: Prisma.RoleEmailOrderByWithRelationInput;
        WhereUnique: Prisma.RoleEmailWhereUniqueInput;
        Where: Prisma.RoleEmailWhereInput;
        Create: {};
        Update: {};
        RelationName: "role";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
        };
    };
    RoleStartReminder: {
        Name: "RoleStartReminder";
        Shape: RoleStartReminder;
        Include: Prisma.RoleStartReminderInclude;
        Select: Prisma.RoleStartReminderSelect;
        OrderBy: Prisma.RoleStartReminderOrderByWithRelationInput;
        WhereUnique: Prisma.RoleStartReminderWhereUniqueInput;
        Where: Prisma.RoleStartReminderWhereInput;
        Create: {};
        Update: {};
        RelationName: "role";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
        };
    };
    RoleAutoResume: {
        Name: "RoleAutoResume";
        Shape: RoleAutoResume;
        Include: Prisma.RoleAutoResumeInclude;
        Select: Prisma.RoleAutoResumeSelect;
        OrderBy: Prisma.RoleAutoResumeOrderByWithRelationInput;
        WhereUnique: Prisma.RoleAutoResumeWhereUniqueInput;
        Where: Prisma.RoleAutoResumeWhereInput;
        Create: {};
        Update: {};
        RelationName: "role";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
        };
    };
    Role: {
        Name: "Role";
        Shape: Role;
        Include: Prisma.RoleInclude;
        Select: Prisma.RoleSelect;
        OrderBy: Prisma.RoleOrderByWithRelationInput;
        WhereUnique: Prisma.RoleWhereUniqueInput;
        Where: Prisma.RoleWhereInput;
        Create: {};
        Update: {};
        RelationName: "user" | "organizationUploads" | "organization" | "scheduleItems" | "personalTags" | "questions" | "questionReplies" | "comments" | "commentReplies" | "skills" | "teams" | "ticketsAuthored" | "ticketsOwned" | "ticketsWatched" | "tags" | "assignments" | "estimates" | "notes" | "checklists" | "ticketWorkflowStateNotes" | "notifications" | "notificationsAsActor" | "pages" | "foldersAuthored" | "foldersOwned" | "pinnedFolders" | "projectsAuthored" | "projectsOwned" | "pinnedProjects" | "roleEmail" | "roleStartReminder" | "roleAutoResume" | "issues" | "issueActions" | "reportQueriesAsOwner" | "reportQueriesAsAuthor" | "reportQueriesAsWorkflowStateAssignee" | "reportQueriesAsAssignee" | "reportSecondaryQueriesAsOwner" | "reportSecondaryQueriesAsAuthor" | "reportSecondaryQueriesAsWorkflowStateAssignee" | "reportSecondaryQueriesAsAssignee" | "pushSubscriptions" | "recurringBlackoutTime" | "blackoutTime" | "TimeOffs" | "drawingLocks" | "personalAccessTokens";
        ListRelations: "organizationUploads" | "scheduleItems" | "personalTags" | "questions" | "questionReplies" | "comments" | "commentReplies" | "skills" | "teams" | "ticketsAuthored" | "ticketsOwned" | "ticketsWatched" | "tags" | "assignments" | "estimates" | "notes" | "checklists" | "ticketWorkflowStateNotes" | "notifications" | "notificationsAsActor" | "pages" | "foldersAuthored" | "foldersOwned" | "pinnedFolders" | "projectsAuthored" | "projectsOwned" | "pinnedProjects" | "issues" | "issueActions" | "reportQueriesAsOwner" | "reportQueriesAsAuthor" | "reportQueriesAsWorkflowStateAssignee" | "reportQueriesAsAssignee" | "reportSecondaryQueriesAsOwner" | "reportSecondaryQueriesAsAuthor" | "reportSecondaryQueriesAsWorkflowStateAssignee" | "reportSecondaryQueriesAsAssignee" | "pushSubscriptions" | "recurringBlackoutTime" | "blackoutTime" | "TimeOffs" | "drawingLocks" | "personalAccessTokens";
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            organizationUploads: {
                Shape: OrganizationUpload[];
                Name: "OrganizationUpload";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            scheduleItems: {
                Shape: ScheduleItem[];
                Name: "ScheduleItem";
                Nullable: false;
            };
            personalTags: {
                Shape: PersonalTag[];
                Name: "PersonalTag";
                Nullable: false;
            };
            questions: {
                Shape: Question[];
                Name: "Question";
                Nullable: false;
            };
            questionReplies: {
                Shape: QuestionReply[];
                Name: "QuestionReply";
                Nullable: false;
            };
            comments: {
                Shape: Comment[];
                Name: "Comment";
                Nullable: false;
            };
            commentReplies: {
                Shape: CommentReply[];
                Name: "CommentReply";
                Nullable: false;
            };
            skills: {
                Shape: Skill[];
                Name: "Skill";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
            ticketsAuthored: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            ticketsOwned: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            ticketsWatched: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            tags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            assignments: {
                Shape: TicketWorkflowState[];
                Name: "TicketWorkflowState";
                Nullable: false;
            };
            estimates: {
                Shape: Estimate[];
                Name: "Estimate";
                Nullable: false;
            };
            notes: {
                Shape: Note[];
                Name: "Note";
                Nullable: false;
            };
            checklists: {
                Shape: Todo[];
                Name: "Todo";
                Nullable: false;
            };
            ticketWorkflowStateNotes: {
                Shape: TicketWorkflowStateNote[];
                Name: "TicketWorkflowStateNote";
                Nullable: false;
            };
            notifications: {
                Shape: Notification[];
                Name: "Notification";
                Nullable: false;
            };
            notificationsAsActor: {
                Shape: Notification[];
                Name: "Notification";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            foldersAuthored: {
                Shape: Folder[];
                Name: "Folder";
                Nullable: false;
            };
            foldersOwned: {
                Shape: Folder[];
                Name: "Folder";
                Nullable: false;
            };
            pinnedFolders: {
                Shape: Folder[];
                Name: "Folder";
                Nullable: false;
            };
            projectsAuthored: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            projectsOwned: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            pinnedProjects: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            roleEmail: {
                Shape: RoleEmail | null;
                Name: "RoleEmail";
                Nullable: true;
            };
            roleStartReminder: {
                Shape: RoleStartReminder | null;
                Name: "RoleStartReminder";
                Nullable: true;
            };
            roleAutoResume: {
                Shape: RoleAutoResume | null;
                Name: "RoleAutoResume";
                Nullable: true;
            };
            issues: {
                Shape: Issue[];
                Name: "Issue";
                Nullable: false;
            };
            issueActions: {
                Shape: IssueAction[];
                Name: "IssueAction";
                Nullable: false;
            };
            reportQueriesAsOwner: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportQueriesAsAuthor: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportQueriesAsWorkflowStateAssignee: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportQueriesAsAssignee: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueriesAsOwner: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueriesAsAuthor: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueriesAsWorkflowStateAssignee: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueriesAsAssignee: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            pushSubscriptions: {
                Shape: PushSubscription[];
                Name: "PushSubscription";
                Nullable: false;
            };
            recurringBlackoutTime: {
                Shape: RecurringBlackoutTime[];
                Name: "RecurringBlackoutTime";
                Nullable: false;
            };
            blackoutTime: {
                Shape: BlackoutTime[];
                Name: "BlackoutTime";
                Nullable: false;
            };
            TimeOffs: {
                Shape: TimeOff[];
                Name: "TimeOff";
                Nullable: false;
            };
            drawingLocks: {
                Shape: Drawing[];
                Name: "Drawing";
                Nullable: false;
            };
            personalAccessTokens: {
                Shape: PersonalAccessToken[];
                Name: "PersonalAccessToken";
                Nullable: false;
            };
        };
    };
    ScheduleItem: {
        Name: "ScheduleItem";
        Shape: ScheduleItem;
        Include: Prisma.ScheduleItemInclude;
        Select: Prisma.ScheduleItemSelect;
        OrderBy: Prisma.ScheduleItemOrderByWithRelationInput;
        WhereUnique: Prisma.ScheduleItemWhereUniqueInput;
        Where: Prisma.ScheduleItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "ticketWorkflowState" | "nextTicketWorkflowState" | "role" | "organization" | "ticket";
        ListRelations: never;
        Relations: {
            ticketWorkflowState: {
                Shape: TicketWorkflowState;
                Name: "TicketWorkflowState";
                Nullable: false;
            };
            nextTicketWorkflowState: {
                Shape: TicketWorkflowState | null;
                Name: "TicketWorkflowState";
                Nullable: true;
            };
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
        };
    };
    TimeOff: {
        Name: "TimeOff";
        Shape: TimeOff;
        Include: Prisma.TimeOffInclude;
        Select: Prisma.TimeOffSelect;
        OrderBy: Prisma.TimeOffOrderByWithRelationInput;
        WhereUnique: Prisma.TimeOffWhereUniqueInput;
        Where: Prisma.TimeOffWhereInput;
        Create: {};
        Update: {};
        RelationName: "role" | "organization";
        ListRelations: never;
        Relations: {
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    BlackoutTime: {
        Name: "BlackoutTime";
        Shape: BlackoutTime;
        Include: Prisma.BlackoutTimeInclude;
        Select: Prisma.BlackoutTimeSelect;
        OrderBy: Prisma.BlackoutTimeOrderByWithRelationInput;
        WhereUnique: Prisma.BlackoutTimeWhereUniqueInput;
        Where: Prisma.BlackoutTimeWhereInput;
        Create: {};
        Update: {};
        RelationName: "roles" | "organization";
        ListRelations: "roles";
        Relations: {
            roles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    RecurringBlackoutTime: {
        Name: "RecurringBlackoutTime";
        Shape: RecurringBlackoutTime;
        Include: Prisma.RecurringBlackoutTimeInclude;
        Select: Prisma.RecurringBlackoutTimeSelect;
        OrderBy: Prisma.RecurringBlackoutTimeOrderByWithRelationInput;
        WhereUnique: Prisma.RecurringBlackoutTimeWhereUniqueInput;
        Where: Prisma.RecurringBlackoutTimeWhereInput;
        Create: {};
        Update: {};
        RelationName: "roles" | "organization";
        ListRelations: "roles";
        Relations: {
            roles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
        };
    };
    Skill: {
        Name: "Skill";
        Shape: Skill;
        Include: Prisma.SkillInclude;
        Select: Prisma.SkillSelect;
        OrderBy: Prisma.SkillOrderByWithRelationInput;
        WhereUnique: Prisma.SkillWhereUniqueInput;
        Where: Prisma.SkillWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "feature" | "role" | "ratings";
        ListRelations: "ratings";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            feature: {
                Shape: Feature;
                Name: "Feature";
                Nullable: false;
            };
            role: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            ratings: {
                Shape: SkillRating[];
                Name: "SkillRating";
                Nullable: false;
            };
        };
    };
    SkillRating: {
        Name: "SkillRating";
        Shape: SkillRating;
        Include: Prisma.SkillRatingInclude;
        Select: Prisma.SkillRatingSelect;
        OrderBy: Prisma.SkillRatingOrderByWithRelationInput;
        WhereUnique: Prisma.SkillRatingWhereUniqueInput;
        Where: Prisma.SkillRatingWhereInput;
        Create: {};
        Update: {};
        RelationName: "skill";
        ListRelations: never;
        Relations: {
            skill: {
                Shape: Skill;
                Name: "Skill";
                Nullable: false;
            };
        };
    };
    Tag: {
        Name: "Tag";
        Shape: Tag;
        Include: Prisma.TagInclude;
        Select: Prisma.TagSelect;
        OrderBy: Prisma.TagOrderByWithRelationInput;
        WhereUnique: Prisma.TagWhereUniqueInput;
        Where: Prisma.TagWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "replacedBy" | "replacesTags" | "author" | "tickets" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        ListRelations: "replacesTags" | "tickets" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            replacedBy: {
                Shape: Tag | null;
                Name: "Tag";
                Nullable: true;
            };
            replacesTags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            author: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    Team: {
        Name: "Team";
        Shape: Team;
        Include: Prisma.TeamInclude;
        Select: Prisma.TeamSelect;
        OrderBy: Prisma.TeamOrderByWithRelationInput;
        WhereUnique: Prisma.TeamWhereUniqueInput;
        Where: Prisma.TeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "members" | "workflowStates" | "workflowStatesAsBackup";
        ListRelations: "members" | "workflowStates" | "workflowStatesAsBackup";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            members: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            workflowStates: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
            workflowStatesAsBackup: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
        };
    };
    Ticket: {
        Name: "Ticket";
        Shape: Ticket;
        Include: Prisma.TicketInclude;
        Select: Prisma.TicketSelect;
        OrderBy: Prisma.TicketOrderByWithRelationInput;
        WhereUnique: Prisma.TicketWhereUniqueInput;
        Where: Prisma.TicketWhereInput;
        Create: {};
        Update: {};
        RelationName: "author" | "owner" | "product" | "workflow" | "folder" | "project" | "organization" | "ancestors" | "successors" | "ticketText" | "ticketTextRevisions" | "comments" | "questions" | "tags" | "watchers" | "personalTags" | "features" | "ticketWorkflowStates" | "scheduleItems" | "scheduleConfigs" | "cases" | "reportQueries" | "reportSecondaryQueries";
        ListRelations: "ancestors" | "successors" | "ticketTextRevisions" | "comments" | "questions" | "tags" | "watchers" | "personalTags" | "features" | "ticketWorkflowStates" | "scheduleItems" | "scheduleConfigs" | "cases" | "reportQueries" | "reportSecondaryQueries";
        Relations: {
            author: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            owner: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            product: {
                Shape: Product | null;
                Name: "Product";
                Nullable: true;
            };
            workflow: {
                Shape: Workflow | null;
                Name: "Workflow";
                Nullable: true;
            };
            folder: {
                Shape: Folder | null;
                Name: "Folder";
                Nullable: true;
            };
            project: {
                Shape: Project;
                Name: "Project";
                Nullable: false;
            };
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            ancestors: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            successors: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            ticketText: {
                Shape: TicketText | null;
                Name: "TicketText";
                Nullable: true;
            };
            ticketTextRevisions: {
                Shape: TicketTextRevision[];
                Name: "TicketTextRevision";
                Nullable: false;
            };
            comments: {
                Shape: Comment[];
                Name: "Comment";
                Nullable: false;
            };
            questions: {
                Shape: Question[];
                Name: "Question";
                Nullable: false;
            };
            tags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            watchers: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
            personalTags: {
                Shape: PersonalTag[];
                Name: "PersonalTag";
                Nullable: false;
            };
            features: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
            ticketWorkflowStates: {
                Shape: TicketWorkflowState[];
                Name: "TicketWorkflowState";
                Nullable: false;
            };
            scheduleItems: {
                Shape: ScheduleItem[];
                Name: "ScheduleItem";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            cases: {
                Shape: Issue[];
                Name: "Issue";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    TicketText: {
        Name: "TicketText";
        Shape: TicketText;
        Include: Prisma.TicketTextInclude;
        Select: Prisma.TicketTextSelect;
        OrderBy: Prisma.TicketTextOrderByWithRelationInput;
        WhereUnique: Prisma.TicketTextWhereUniqueInput;
        Where: Prisma.TicketTextWhereInput;
        Create: {};
        Update: {};
        RelationName: "ticket";
        ListRelations: never;
        Relations: {
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
        };
    };
    TicketTextRevision: {
        Name: "TicketTextRevision";
        Shape: TicketTextRevision;
        Include: Prisma.TicketTextRevisionInclude;
        Select: Prisma.TicketTextRevisionSelect;
        OrderBy: Prisma.TicketTextRevisionOrderByWithRelationInput;
        WhereUnique: Prisma.TicketTextRevisionWhereUniqueInput;
        Where: Prisma.TicketTextRevisionWhereInput;
        Create: {};
        Update: {};
        RelationName: "ticket";
        ListRelations: never;
        Relations: {
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
        };
    };
    ScheduleConfig: {
        Name: "ScheduleConfig";
        Shape: ScheduleConfig;
        Include: Prisma.ScheduleConfigInclude;
        Select: Prisma.ScheduleConfigSelect;
        OrderBy: Prisma.ScheduleConfigOrderByWithRelationInput;
        WhereUnique: Prisma.ScheduleConfigWhereUniqueInput;
        Where: Prisma.ScheduleConfigWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "tags" | "products" | "projects" | "workflows" | "features" | "tickets";
        ListRelations: "tags" | "products" | "projects" | "workflows" | "features" | "tickets";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            tags: {
                Shape: Tag[];
                Name: "Tag";
                Nullable: false;
            };
            products: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            projects: {
                Shape: Project[];
                Name: "Project";
                Nullable: false;
            };
            workflows: {
                Shape: Workflow[];
                Name: "Workflow";
                Nullable: false;
            };
            features: {
                Shape: Feature[];
                Name: "Feature";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
        };
    };
    TicketWorkflowStateNote: {
        Name: "TicketWorkflowStateNote";
        Shape: TicketWorkflowStateNote;
        Include: Prisma.TicketWorkflowStateNoteInclude;
        Select: Prisma.TicketWorkflowStateNoteSelect;
        OrderBy: Prisma.TicketWorkflowStateNoteOrderByWithRelationInput;
        WhereUnique: Prisma.TicketWorkflowStateNoteWhereUniqueInput;
        Where: Prisma.TicketWorkflowStateNoteWhereInput;
        Create: {};
        Update: {};
        RelationName: "ticketWorkflowState" | "author" | "fromTicketWorkflowState";
        ListRelations: never;
        Relations: {
            ticketWorkflowState: {
                Shape: TicketWorkflowState;
                Name: "TicketWorkflowState";
                Nullable: false;
            };
            author: {
                Shape: Role;
                Name: "Role";
                Nullable: false;
            };
            fromTicketWorkflowState: {
                Shape: TicketWorkflowState;
                Name: "TicketWorkflowState";
                Nullable: false;
            };
        };
    };
    TicketWorkflowState: {
        Name: "TicketWorkflowState";
        Shape: TicketWorkflowState;
        Include: Prisma.TicketWorkflowStateInclude;
        Select: Prisma.TicketWorkflowStateSelect;
        OrderBy: Prisma.TicketWorkflowStateOrderByWithRelationInput;
        WhereUnique: Prisma.TicketWorkflowStateWhereUniqueInput;
        Where: Prisma.TicketWorkflowStateWhereInput;
        Create: {};
        Update: {};
        RelationName: "assignee" | "ticket" | "workflowState" | "scheduleItems" | "nextScheduleItems" | "ticketWorkflowStateNotes" | "fromTicketWorkflowStateNotes";
        ListRelations: "scheduleItems" | "nextScheduleItems" | "ticketWorkflowStateNotes" | "fromTicketWorkflowStateNotes";
        Relations: {
            assignee: {
                Shape: Role | null;
                Name: "Role";
                Nullable: true;
            };
            ticket: {
                Shape: Ticket;
                Name: "Ticket";
                Nullable: false;
            };
            workflowState: {
                Shape: WorkflowState | null;
                Name: "WorkflowState";
                Nullable: true;
            };
            scheduleItems: {
                Shape: ScheduleItem[];
                Name: "ScheduleItem";
                Nullable: false;
            };
            nextScheduleItems: {
                Shape: ScheduleItem[];
                Name: "ScheduleItem";
                Nullable: false;
            };
            ticketWorkflowStateNotes: {
                Shape: TicketWorkflowStateNote[];
                Name: "TicketWorkflowStateNote";
                Nullable: false;
            };
            fromTicketWorkflowStateNotes: {
                Shape: TicketWorkflowStateNote[];
                Name: "TicketWorkflowStateNote";
                Nullable: false;
            };
        };
    };
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "roles";
        ListRelations: "roles";
        Relations: {
            roles: {
                Shape: Role[];
                Name: "Role";
                Nullable: false;
            };
        };
    };
    UserEmailChange: {
        Name: "UserEmailChange";
        Shape: UserEmailChange;
        Include: never;
        Select: Prisma.UserEmailChangeSelect;
        OrderBy: Prisma.UserEmailChangeOrderByWithRelationInput;
        WhereUnique: Prisma.UserEmailChangeWhereUniqueInput;
        Where: Prisma.UserEmailChangeWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    Workflow: {
        Name: "Workflow";
        Shape: Workflow;
        Include: Prisma.WorkflowInclude;
        Select: Prisma.WorkflowSelect;
        OrderBy: Prisma.WorkflowOrderByWithRelationInput;
        WhereUnique: Prisma.WorkflowWhereUniqueInput;
        Where: Prisma.WorkflowWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "products" | "tickets" | "workflowStates" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        ListRelations: "products" | "tickets" | "workflowStates" | "scheduleConfigs" | "pages" | "reportQueries" | "reportSecondaryQueries";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            products: {
                Shape: Product[];
                Name: "Product";
                Nullable: false;
            };
            tickets: {
                Shape: Ticket[];
                Name: "Ticket";
                Nullable: false;
            };
            workflowStates: {
                Shape: WorkflowState[];
                Name: "WorkflowState";
                Nullable: false;
            };
            scheduleConfigs: {
                Shape: ScheduleConfig[];
                Name: "ScheduleConfig";
                Nullable: false;
            };
            pages: {
                Shape: Page[];
                Name: "Page";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
        };
    };
    WorkflowState: {
        Name: "WorkflowState";
        Shape: WorkflowState;
        Include: Prisma.WorkflowStateInclude;
        Select: Prisma.WorkflowStateSelect;
        OrderBy: Prisma.WorkflowStateOrderByWithRelationInput;
        WhereUnique: Prisma.WorkflowStateWhereUniqueInput;
        Where: Prisma.WorkflowStateWhereInput;
        Create: {};
        Update: {};
        RelationName: "organization" | "workflow" | "reportQueries" | "reportSecondaryQueries" | "teams" | "backupTeams" | "TicketWorkflowState";
        ListRelations: "reportQueries" | "reportSecondaryQueries" | "teams" | "backupTeams" | "TicketWorkflowState";
        Relations: {
            organization: {
                Shape: Organization;
                Name: "Organization";
                Nullable: false;
            };
            workflow: {
                Shape: Workflow;
                Name: "Workflow";
                Nullable: false;
            };
            reportQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            reportSecondaryQueries: {
                Shape: ReportQuery[];
                Name: "ReportQuery";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
            backupTeams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
            TicketWorkflowState: {
                Shape: TicketWorkflowState[];
                Name: "TicketWorkflowState";
                Nullable: false;
            };
        };
    };
    DemoRequest: {
        Name: "DemoRequest";
        Shape: DemoRequest;
        Include: never;
        Select: Prisma.DemoRequestSelect;
        OrderBy: Prisma.DemoRequestOrderByWithRelationInput;
        WhereUnique: Prisma.DemoRequestWhereUniqueInput;
        Where: Prisma.DemoRequestWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
}
export function getDatamodel(): PothosPrismaDatamodel { return JSON.parse("{\"datamodel\":{\"models\":{\"PushSubscription\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"endpoint\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"expirationTime\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"JSONkeys\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PushSubscriptionToRole\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"endpoint\"]}]},\"Documentation\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"logoUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastPublishedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastPublishRequestAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToDocumentationPage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPagePOI\",\"kind\":\"object\",\"name\":\"pois\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToDocumentationPagePOI\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DocumentationPage\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"customId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"indexableContent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"urls\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"keywords\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Documentation\",\"kind\":\"object\",\"name\":\"documentation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToDocumentationPage\",\"relationFromFields\":[\"documentationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"parentId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"parent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"documentation_page_children\",\"relationFromFields\":[\"parentId\"],\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"children\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"documentation_page_children\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPagePOI\",\"kind\":\"object\",\"name\":\"pois\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPagePOI\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPageData\",\"kind\":\"object\",\"name\":\"documentationPageData\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageData\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPageText\",\"kind\":\"object\",\"name\":\"documentationPageText\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageText\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPageTextRevision\",\"kind\":\"object\",\"name\":\"documentationPageTextRevisions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageTextRevision\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"documentationId\",\"customId\"]}]},\"DocumentationPageText\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationPageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageText\",\"relationFromFields\":[\"documentationPageId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DocumentationPageTextRevision\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationPageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageTextRevision\",\"relationFromFields\":[\"documentationPageId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"documentationPageId\",\"version\"]}]},\"DocumentationPageData\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationPageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPageData\",\"relationFromFields\":[\"documentationPageId\"],\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"bytes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DocumentationPagePOI\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"urls\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"keywords\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"hashtag\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Documentation\",\"kind\":\"object\",\"name\":\"documentation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToDocumentationPagePOI\",\"relationFromFields\":[\"documentationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"documentationPageId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToDocumentationPagePOI\",\"relationFromFields\":[\"documentationPageId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"documentationId\",\"hashtag\"]}]},\"Comment\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToRole\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToTicket\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"acceptedReplyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"CommentReply\",\"kind\":\"object\",\"name\":\"acceptedReply\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AcceptedCommentReply\",\"relationFromFields\":[\"acceptedReplyId\"],\"isUpdatedAt\":false},{\"type\":\"CommentReply\",\"kind\":\"object\",\"name\":\"replies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplies\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"CommentReply\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplyToRole\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"commentId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Comment\",\"kind\":\"object\",\"name\":\"comment\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplies\",\"relationFromFields\":[\"commentId\"],\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"Organization\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplyToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Comment\",\"kind\":\"object\",\"name\":\"acceptedReplyForComments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AcceptedCommentReply\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Report\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToReport\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReportToReportQuery\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ReportQuery\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"rows\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"cols\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"noUnknowns\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"cummulative\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportWidgetType\",\"kind\":\"enum\",\"name\":\"widgetType\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportAggregateField\",\"kind\":\"enum\",\"name\":\"aggregateField\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToReportQuery\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"reportId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Report\",\"kind\":\"object\",\"name\":\"report\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ReportToReportQuery\",\"relationFromFields\":[\"reportId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"fromDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"untilDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportDateGranularity\",\"kind\":\"enum\",\"name\":\"granularity\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportGroupBy\",\"kind\":\"enum\",\"name\":\"chartBy\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"chartByLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportGroupBy\",\"kind\":\"enum\",\"name\":\"groupBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"groupByLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"byTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryTagFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"byProducts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryProductFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"byWorkflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryWorkflowFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"byFeatures\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryFeatureFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"byTickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryTicketFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"byOwners\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryOwners\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"byAuthors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryAuthors\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"byAssignees\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"byWorkflowStateAssignees\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryWorkflowStateAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"byWorkflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryWorkflowStateFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"byPaths\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isTicketDone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isTicketActive\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isTicketStarted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isTicketNotStarted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportGroupBy\",\"kind\":\"enum\",\"name\":\"secondaryChartBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"secondaryChartByLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ReportGroupBy\",\"kind\":\"enum\",\"name\":\"secondaryGroupBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"secondaryGroupByLabel\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"sameAsPrimaryFilter\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"secondaryByTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryTagFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"secondaryByProducts\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryProductFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"secondaryByWorkflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryWorkflowFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"secondaryByFeatures\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryFeatureFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"secondaryByTickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryTicketFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"secondaryByOwners\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryOwners\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"secondaryByAuthors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryAuthors\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"secondaryByAssignees\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"secondaryByWorkflowStateAssignees\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryWorkflowStateAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"secondaryByWorkflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryWorkflowStateFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"secondaryIsTicketDone\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"secondaryIsTicketActive\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"secondaryIsTicketStarted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"secondaryIsTicketNotStarted\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"secondaryByPaths\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Todo\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"checked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"checkedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"dueDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTodo\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTodo\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Note\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"NoteColor\",\"kind\":\"enum\",\"name\":\"color\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NoteToRole\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NoteToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Notification\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isRead\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"NotificationCategory\",\"kind\":\"enum\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"NotificationTarget\",\"kind\":\"enum\",\"name\":\"target\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"targetId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ancestry\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationRole\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"actorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"actor\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationActor\",\"relationFromFields\":[\"actorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"EmailConfirmation\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"secret\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Feature\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"featureGroupId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"FeatureGroup\",\"kind\":\"object\",\"name\":\"featureGroup\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToFeatureGroup\",\"relationFromFields\":[\"featureGroupId\"],\"isUpdatedAt\":false},{\"type\":\"Skill\",\"kind\":\"object\",\"name\":\"skills\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToSkill\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToPage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryFeatureFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryFeatureFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"FeatureGroup\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"FeatureGroupStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureGroupToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"productId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"product\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureGroupToProduct\",\"relationFromFields\":[\"productId\"],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"features\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToFeatureGroup\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"migrations\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"BigInt\",\"kind\":\"scalar\",\"name\":\"timestamp\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"OrganizationAddress\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"address1\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"address2\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"zipcode\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"city\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"state\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"country\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToOrganizationAddress\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"mailingAddressFor\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MailingAddress\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"billingAddressFor\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BillingAddress\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Issue\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"localId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToTicket\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"productId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"product\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToProduct\",\"relationFromFields\":[\"productId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"assigneeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"assignee\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToRole\",\"relationFromFields\":[\"assigneeId\"],\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"unread\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"archived\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"url\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"metaData\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"userAgent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"token\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"resolveAfterDate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"IssueStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"IssueAction\",\"kind\":\"object\",\"name\":\"issueActions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToIssueAction\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"localId\",\"organizationId\"]}]},\"IssueAction\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"IssueActionCategory\",\"kind\":\"enum\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueActionToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"issueId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Issue\",\"kind\":\"object\",\"name\":\"issue\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToIssueAction\",\"relationFromFields\":[\"issueId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueActionToRole\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"FeatureFlag\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"documentation\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"support\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"report\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureFlagToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Organization\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ScheduleStatus\",\"kind\":\"enum\",\"name\":\"scheduleStatus\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"preferences\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"about\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"coverUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrganizationStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"estimatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"mailingAddressId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrganizationAddress\",\"kind\":\"object\",\"name\":\"mailingAddress\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"MailingAddress\",\"relationFromFields\":[\"mailingAddressId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"billingAddressId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"OrganizationAddress\",\"kind\":\"object\",\"name\":\"billingAddress\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BillingAddress\",\"relationFromFields\":[\"billingAddressId\"],\"isUpdatedAt\":false},{\"type\":\"FeatureFlag\",\"kind\":\"object\",\"name\":\"featureFlag\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureFlagToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrganizationAddress\",\"kind\":\"object\",\"name\":\"addresses\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToOrganizationAddress\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CommentReply\",\"kind\":\"object\",\"name\":\"commentReplies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplyToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Comment\",\"kind\":\"object\",\"name\":\"comments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DocumentationPage\",\"kind\":\"object\",\"name\":\"documentationPages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationPageToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Documentation\",\"kind\":\"object\",\"name\":\"documentations\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DocumentationToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"FeatureGroup\",\"kind\":\"object\",\"name\":\"featureGroups\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureGroupToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"folders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"projects\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToProject\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"IssueAction\",\"kind\":\"object\",\"name\":\"issueActions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueActionToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Note\",\"kind\":\"object\",\"name\":\"notes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NoteToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Notification\",\"kind\":\"object\",\"name\":\"notifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"OrganizationUpload\",\"kind\":\"object\",\"name\":\"organizationUploads\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToOrganizationUpload\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalTag\",\"kind\":\"object\",\"name\":\"personalTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPersonalTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"products\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToProduct\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"QuestionReply\",\"kind\":\"object\",\"name\":\"questionReplies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToQuestionReply\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Question\",\"kind\":\"object\",\"name\":\"questions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToQuestion\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQuery\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToReportQuery\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Report\",\"kind\":\"object\",\"name\":\"reports\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToReport\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleItem\",\"kind\":\"object\",\"name\":\"scheduleItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToScheduleItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Skill\",\"kind\":\"object\",\"name\":\"skills\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToSkill\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Issue\",\"kind\":\"object\",\"name\":\"supportTickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"teams\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TimeOff\",\"kind\":\"object\",\"name\":\"timeOffs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTimeOff\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Todo\",\"kind\":\"object\",\"name\":\"todos\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTodo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"workflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BlackoutTime\",\"kind\":\"object\",\"name\":\"blackoutTimes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlackoutTimeToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RecurringBlackoutTime\",\"kind\":\"object\",\"name\":\"recurringBlackoutTimes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToRecurringBlackoutTime\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Drawing\",\"kind\":\"object\",\"name\":\"drawings\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DrawingToOrganization\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalAccessToken\",\"kind\":\"object\",\"name\":\"personalAccessTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPersonalAccessToken\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"showOnboarding\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"OrganizationUpload\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"path\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToOrganizationUpload\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationUploadToRole\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PasswordLost\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"secret\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PersonalAccessToken\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tokenHash\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"tokenPrefix\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"readOnly\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lastUsedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"expiresAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"revokedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalAccessTokenToRole\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPersonalAccessToken\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"PersonalTag\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPersonalTag\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagToRole\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"replacedByTagId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"PersonalTag\",\"kind\":\"object\",\"name\":\"replacedBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagDeprecation\",\"relationFromFields\":[\"replacedByTagId\"],\"isUpdatedAt\":false},{\"type\":\"PersonalTag\",\"kind\":\"object\",\"name\":\"replacesTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagDeprecation\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Product\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isSupportActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isUsingDefaultWorkflows\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"coverUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToProduct\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"FeatureGroup\",\"kind\":\"object\",\"name\":\"featureGroups\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureGroupToProduct\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToProduct\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Issue\",\"kind\":\"object\",\"name\":\"cases\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToProduct\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryProductFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryProductFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Estimate\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"EstimateType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"epoch\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"updatedEpoch\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"assigneeId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"assignee\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EstimateToRole\",\"relationFromFields\":[\"assigneeId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_p50\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_p70\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_p80\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_p90\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_p95\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_min\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end_max\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_p50\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_p70\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_p80\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_p90\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_p95\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"end\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_min\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"start_max\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"id\",\"epoch\",\"type\",\"organizationId\"]},\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"id\",\"type\",\"epoch\",\"organizationId\"]}]},\"Page\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"checklist\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageTags\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"products\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToProduct\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"features\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToPage\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owners\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"path\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"paths\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToPage\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Folder\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"path\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"checklist\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"FolderDataBlock\",\"kind\":\"object\",\"name\":\"blocks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToFolderDataBlock\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderOwner\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderAuthor\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"pinnedByRoles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PinnedFolders\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"organizationId\",\"path\"]}]},\"FolderDataBlock\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"folderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"folder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToFolderDataBlock\",\"relationFromFields\":[\"folderId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Drawing\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"data\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DrawingToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DrawingToRole\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"lockExpiration\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Project\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"duration\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"indexableContent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"ancestorIsArchived\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"checklist\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToProject\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectOwner\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectAuthor\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"pinnedByRoles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PinnedProjects\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"parentId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"parent\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectParentChildren\",\"relationFromFields\":[\"parentId\"],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"children\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectParentChildren\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ProjectData\",\"kind\":\"object\",\"name\":\"projectData\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectData\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ProjectText\",\"kind\":\"object\",\"name\":\"projectText\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectText\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ProjectTextRevision\",\"kind\":\"object\",\"name\":\"projectTextRevisions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectTextRevision\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"organizationId\",\"name\",\"parentId\"]}]},\"ProjectData\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"projectId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"project\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectData\",\"relationFromFields\":[\"projectId\"],\"isUpdatedAt\":false},{\"type\":\"Bytes\",\"kind\":\"scalar\",\"name\":\"bytes\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ProjectText\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"projectId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"project\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectText\",\"relationFromFields\":[\"projectId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"ProjectTextRevision\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"projectId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"project\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToProjectTextRevision\",\"relationFromFields\":[\"projectId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"projectId\",\"version\"]}]},\"Question\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionToRole\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToQuestion\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionToTicket\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"acceptedReplyId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"QuestionReply\",\"kind\":\"object\",\"name\":\"acceptedReply\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AcceptedReply\",\"relationFromFields\":[\"acceptedReplyId\"],\"isUpdatedAt\":false},{\"type\":\"QuestionReply\",\"kind\":\"object\",\"name\":\"replies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionReplies\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"QuestionReply\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionReplyToRole\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"questionId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Question\",\"kind\":\"object\",\"name\":\"question\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionReplies\",\"relationFromFields\":[\"questionId\"],\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"Organization\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToQuestionReply\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Question\",\"kind\":\"object\",\"name\":\"acceptedReplyForQuestions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"AcceptedReply\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"RoleEmail\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleEmail\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"nextWorkDayNotificationDate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"nextWorkDayNotificationOffset\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"nextWorkDayNotificationOptOut\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"RoleStartReminder\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleStartReminder\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"nextStartNotificationDate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"nextStartNotificationOffset\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"nextStartNotificationOptOut\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"RoleAutoResume\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleAutoResume\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"nextStartNotificationDate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"nextStartNotificationOptOut\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Role\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"timeZone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"preferences\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"avatarUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"coverUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"workWeek\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"RoleStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"RoleType\",\"kind\":\"enum\",\"name\":\"type\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"userId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"User\",\"kind\":\"object\",\"name\":\"user\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToUser\",\"relationFromFields\":[\"userId\"],\"isUpdatedAt\":false},{\"type\":\"OrganizationUpload\",\"kind\":\"object\",\"name\":\"organizationUploads\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationUploadToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToRole\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"ScheduleItem\",\"kind\":\"object\",\"name\":\"scheduleItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToScheduleItem\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalTag\",\"kind\":\"object\",\"name\":\"personalTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Question\",\"kind\":\"object\",\"name\":\"questions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"QuestionReply\",\"kind\":\"object\",\"name\":\"questionReplies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionReplyToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Comment\",\"kind\":\"object\",\"name\":\"comments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"CommentReply\",\"kind\":\"object\",\"name\":\"commentReplies\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentReplyToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Skill\",\"kind\":\"object\",\"name\":\"skills\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToSkill\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"teams\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticketsAuthored\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketAuthor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticketsOwned\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticketsWatched\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WatchedTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"assignments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTicketWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Estimate\",\"kind\":\"object\",\"name\":\"estimates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"EstimateToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Note\",\"kind\":\"object\",\"name\":\"notes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NoteToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Todo\",\"kind\":\"object\",\"name\":\"checklists\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTodo\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowStateNote\",\"kind\":\"object\",\"name\":\"ticketWorkflowStateNotes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTicketWorkflowStateNote\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Notification\",\"kind\":\"object\",\"name\":\"notifications\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Notification\",\"kind\":\"object\",\"name\":\"notificationsAsActor\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NotificationActor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"foldersAuthored\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderAuthor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"foldersOwned\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"pinnedFolders\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PinnedFolders\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"projectsAuthored\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectAuthor\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"projectsOwned\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectOwner\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"pinnedProjects\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PinnedProjects\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RoleEmail\",\"kind\":\"object\",\"name\":\"roleEmail\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleEmail\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RoleStartReminder\",\"kind\":\"object\",\"name\":\"roleStartReminder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleStartReminder\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RoleAutoResume\",\"kind\":\"object\",\"name\":\"roleAutoResume\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToRoleAutoResume\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Issue\",\"kind\":\"object\",\"name\":\"issues\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"IssueAction\",\"kind\":\"object\",\"name\":\"issueActions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueActionToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueriesAsOwner\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryOwners\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueriesAsAuthor\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryAuthors\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueriesAsWorkflowStateAssignee\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryWorkflowStateAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueriesAsAssignee\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryReportQueryAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueriesAsOwner\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryOwners\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueriesAsAuthor\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryAuthors\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueriesAsWorkflowStateAssignee\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryWorkflowStateAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueriesAsAssignee\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryReportQueryAssignees\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PushSubscription\",\"kind\":\"object\",\"name\":\"pushSubscriptions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PushSubscriptionToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"RecurringBlackoutTime\",\"kind\":\"object\",\"name\":\"recurringBlackoutTime\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RecurringBlackoutTimeToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"BlackoutTime\",\"kind\":\"object\",\"name\":\"blackoutTime\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlackoutTimeToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TimeOff\",\"kind\":\"object\",\"name\":\"TimeOffs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTimeOff\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Drawing\",\"kind\":\"object\",\"name\":\"drawingLocks\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"DrawingToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalAccessToken\",\"kind\":\"object\",\"name\":\"personalAccessTokens\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalAccessTokenToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"organizationId\",\"userId\"]}]},\"ScheduleItem\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"done\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"stoppedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"extendedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"autoStopped\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"autoStarted\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketWorkflowStateId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"ticketWorkflowState\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActiveWorkflowState\",\"relationFromFields\":[\"ticketWorkflowStateId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"nextTicketWorkflowStateId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"nextTicketWorkflowState\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NextWorkflowStates\",\"relationFromFields\":[\"nextTicketWorkflowStateId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToScheduleItem\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToScheduleItem\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleItemToTicket\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TimeOff\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"stopAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTimeOff\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTimeOff\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"BlackoutTime\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"startAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"stopAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"disabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlackoutTimeToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BlackoutTimeToOrganization\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"RecurringBlackoutTime\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"startTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"stopTime\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"timeZone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"disabled\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"monday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"tuesday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"wednesday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"thursday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"friday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"saturday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"sunday\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RecurringBlackoutTimeToRole\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToRecurringBlackoutTime\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Skill\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToSkill\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"featureId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"feature\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToSkill\",\"relationFromFields\":[\"featureId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"roleId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"role\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToSkill\",\"relationFromFields\":[\"roleId\"],\"isUpdatedAt\":false},{\"type\":\"SkillRating\",\"kind\":\"object\",\"name\":\"ratings\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SkillToSkillRating\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"roleId\",\"featureId\"]}]},\"SkillRating\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"value\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"skillId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Skill\",\"kind\":\"object\",\"name\":\"skill\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"SkillToSkillRating\",\"relationFromFields\":[\"skillId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Tag\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"color\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTag\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"replacedByTagId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"replacedBy\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagDeprecation\",\"relationFromFields\":[\"replacedByTagId\"],\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"replacesTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagDeprecation\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTag\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageTags\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryTagFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryTagFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Team\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"code\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"coverUrl\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTeam\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"members\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"workflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PrimaryTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"workflowStatesAsBackup\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BackupTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Ticket\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"title\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Float\",\"kind\":\"scalar\",\"name\":\"progress\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimate\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"localId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"milestone\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"estimating\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"eta\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"closedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"scheduledAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"archivedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"deletedAt\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"difficulty\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"closingNote\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"foreignId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"indexableContent\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketAuthor\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ownerId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"owner\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketOwner\",\"relationFromFields\":[\"ownerId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"productId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"product\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToTicket\",\"relationFromFields\":[\"productId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"workflowId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflow\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToWorkflow\",\"relationFromFields\":[\"workflowId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"folderId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Folder\",\"kind\":\"object\",\"name\":\"folder\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FolderToTicket\",\"relationFromFields\":[\"folderId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"projectId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"project\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToTicket\",\"relationFromFields\":[\"projectId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToTicket\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ancestors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketAncestry\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"successors\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketAncestry\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketText\",\"kind\":\"object\",\"name\":\"ticketText\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketText\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketTextRevision\",\"kind\":\"object\",\"name\":\"ticketTextRevisions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketTextRevision\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Comment\",\"kind\":\"object\",\"name\":\"comments\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"CommentToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Question\",\"kind\":\"object\",\"name\":\"questions\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"QuestionToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TagToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"watchers\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WatchedTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"PersonalTag\",\"kind\":\"object\",\"name\":\"personalTags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PersonalTagToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"features\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"ticketWorkflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleItem\",\"kind\":\"object\",\"name\":\"scheduleItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleItemToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Issue\",\"kind\":\"object\",\"name\":\"cases\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"IssueToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryTicketFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryTicketFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"localId\",\"productId\"]}]},\"TicketText\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketText\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TicketTextRevision\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketTextRevision\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"version\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"markdown\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ticketId\",\"version\"]}]},\"ScheduleConfig\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"priority\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToScheduleConfig\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Tag\",\"kind\":\"object\",\"name\":\"tags\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToTag\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"products\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Project\",\"kind\":\"object\",\"name\":\"projects\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProjectToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflows\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Feature\",\"kind\":\"object\",\"name\":\"features\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"FeatureToScheduleConfig\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToTicket\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TicketWorkflowStateNote\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"body\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowStateNoteCategory\",\"kind\":\"enum\",\"name\":\"category\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketWorkflowStateId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"ticketWorkflowState\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ticketWorkflowState\",\"relationFromFields\":[\"ticketWorkflowStateId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"authorId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"author\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTicketWorkflowStateNote\",\"relationFromFields\":[\"authorId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"fromTicketWorkflowStateId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"fromTicketWorkflowState\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"fromTicketWorkflowState\",\"relationFromFields\":[\"fromTicketWorkflowStateId\"],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"TicketWorkflowState\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isActive\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isBlocked\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"complete\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"todo\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"fractionable\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"checklist\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateMinimum\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateMostLikely\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"estimateMaximum\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"estimate\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"assigneeId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"assignee\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToTicketWorkflowState\",\"relationFromFields\":[\"assigneeId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"ticketId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"ticket\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToTicketWorkflowState\",\"relationFromFields\":[\"ticketId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"workflowStateId\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"workflowState\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketWorkflowStateToWorkflowState\",\"relationFromFields\":[\"workflowStateId\"],\"isUpdatedAt\":false},{\"type\":\"ScheduleItem\",\"kind\":\"object\",\"name\":\"scheduleItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ActiveWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleItem\",\"kind\":\"object\",\"name\":\"nextScheduleItems\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"NextWorkflowStates\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowStateNote\",\"kind\":\"object\",\"name\":\"ticketWorkflowStateNotes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ticketWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowStateNote\",\"kind\":\"object\",\"name\":\"fromTicketWorkflowStateNotes\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"fromTicketWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"User\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isStaff\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"password\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"preferences\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"UserStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Role\",\"kind\":\"object\",\"name\":\"roles\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"RoleToUser\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"UserEmailChange\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"previousEmail\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"newEmail\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ipAddress\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"Workflow\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"color\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"isDefaultWorkflow\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"description\",\"isRequired\":false,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"ModelStage\",\"kind\":\"enum\",\"name\":\"stage\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToWorkflow\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Product\",\"kind\":\"object\",\"name\":\"products\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ProductToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Ticket\",\"kind\":\"object\",\"name\":\"tickets\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"WorkflowState\",\"kind\":\"object\",\"name\":\"workflowStates\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkflowToWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ScheduleConfig\",\"kind\":\"object\",\"name\":\"scheduleConfigs\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"ScheduleConfigToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Page\",\"kind\":\"object\",\"name\":\"pages\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PageToWorkflow\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryWorkflowFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryWorkflowFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"WorkflowState\":{\"fields\":[{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"name\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"position\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"updatedAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":true},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"organizationId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Organization\",\"kind\":\"object\",\"name\":\"organization\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"OrganizationToWorkflowState\",\"relationFromFields\":[\"organizationId\"],\"isUpdatedAt\":false},{\"type\":\"Int\",\"kind\":\"scalar\",\"name\":\"workflowId\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Workflow\",\"kind\":\"object\",\"name\":\"workflow\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"WorkflowToWorkflowState\",\"relationFromFields\":[\"workflowId\"],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"primaryWorkflowStateFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"ReportQuery\",\"kind\":\"object\",\"name\":\"reportSecondaryQueries\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"secondaryWorkflowStateFilter\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"teams\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"PrimaryTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"Team\",\"kind\":\"object\",\"name\":\"backupTeams\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"BackupTeam\",\"relationFromFields\":[],\"isUpdatedAt\":false},{\"type\":\"TicketWorkflowState\",\"kind\":\"object\",\"name\":\"TicketWorkflowState\",\"isRequired\":true,\"isList\":true,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"relationName\":\"TicketWorkflowStateToWorkflowState\",\"relationFromFields\":[],\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]},\"DemoRequest\":{\"fields\":[{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"id\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":true,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"email\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":true,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"ip_address\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":false,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DateTime\",\"kind\":\"scalar\",\"name\":\"createdAt\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"DemoStatus\",\"kind\":\"enum\",\"name\":\"status\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"String\",\"kind\":\"scalar\",\"name\":\"config\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false},{\"type\":\"Boolean\",\"kind\":\"scalar\",\"name\":\"confirmed\",\"isRequired\":true,\"isList\":false,\"hasDefaultValue\":true,\"isUnique\":false,\"isId\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueIndexes\":[]}}}}"); }