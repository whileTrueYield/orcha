/**
 * Pothos type definitions for the Issue and IssueAction models.
 *
 * OMITTED FIELDS: checklist is NOT exposed per design decision.
 *
 * Exports:
 *  - IssueContextRef:     plain objectRef for parsed user-agent info
 *  - IssueActionRef:      prismaObject for IssueAction
 *  - IssueRef:            prismaObject for Issue
 *  - PaginatedIssues:     paginated wrapper via createPaginatedType
 *
 * The `context` field (parsed user-agent) is added as a prismaObjectField
 * on Issue because it requires runtime transformation of the userAgent column.
 */

import parser from "ua-parser-js";
import builder from "../../schema/builder";
import { createPaginatedType } from "../../schema/pagination";
import {
  IssueStatusEnum,
  IssueActionCategoryEnum,
} from "../../schema/enums";

// ---------------------------------------------------------------------------
// IssueContext — parsed user-agent information
// ---------------------------------------------------------------------------

interface IssueContextShape {
  deviceName?: string;
  deviceType?: string;
  os?: string;
  osVersion?: string;
  browser?: string;
  engine?: string;
}

export const IssueContextRef =
  builder.objectRef<IssueContextShape>("IssueContext");

builder.objectType(IssueContextRef, {
  fields: (t) => ({
    deviceName: t.exposeString("deviceName", { nullable: true }),
    deviceType: t.exposeString("deviceType", { nullable: true }),
    os: t.exposeString("os", { nullable: true }),
    osVersion: t.exposeString("osVersion", { nullable: true }),
    browser: t.exposeString("browser", { nullable: true }),
    engine: t.exposeString("engine", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// IssueAction — prismaObject backed by the Prisma IssueAction model
// ---------------------------------------------------------------------------

export const IssueActionRef = builder.prismaObject("IssueAction", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    title: t.exposeString("title"),
    body: t.exposeString("body", { nullable: true }),
    category: t.expose("category", { type: IssueActionCategoryEnum }),
    organizationId: t.exposeInt("organizationId"),
    issueId: t.exposeInt("issueId"),
    authorId: t.exposeInt("authorId", { nullable: true }),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    organization: t.relation("organization"),
    issue: t.relation("issue"),
    author: t.relation("author", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// Issue — prismaObject backed by the Prisma Issue model
// ---------------------------------------------------------------------------

export const IssueRef = builder.prismaObject("Issue", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    localId: t.exposeInt("localId"),
    organizationId: t.exposeInt("organizationId"),
    ticketId: t.exposeInt("ticketId", { nullable: true }),
    productId: t.exposeInt("productId"),
    assigneeId: t.exposeInt("assigneeId", { nullable: true }),
    unread: t.exposeBoolean("unread"),
    archived: t.exposeBoolean("archived"),
    email: t.exposeString("email"),
    name: t.exposeString("name"),
    url: t.exposeString("url"),
    metaData: t.exposeString("metaData"),
    description: t.exposeString("description"),
    userAgent: t.exposeString("userAgent"),
    token: t.exposeString("token"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    resolveAfterDate: t.expose("resolveAfterDate", {
      type: "DateTime",
      nullable: true,
    }),
    status: t.expose("status", { type: IssueStatusEnum }),
    organization: t.relation("organization"),
    product: t.relation("product"),
    assignee: t.relation("assignee", { nullable: true }),
    issueActions: t.relation("issueActions"),
    ticket: t.relation("ticket", { nullable: true }),
  }),
});

// ---------------------------------------------------------------------------
// context — parsed user-agent information (computed from userAgent column)
// ---------------------------------------------------------------------------

builder.prismaObjectField("Issue", "context", (t) =>
  t.field({
    type: IssueContextRef,
    resolve: (issue): IssueContextShape => {
      const ua = parser(issue.userAgent);
      return {
        deviceName: ua.device.model,
        deviceType: ua.device.type,
        os: ua.os.name,
        osVersion: ua.os.version,
        browser: ua.browser.name,
        engine: ua.engine.name,
      };
    },
  }),
);

// ---------------------------------------------------------------------------
// PaginatedIssues — standard paginated wrapper
// ---------------------------------------------------------------------------

export const PaginatedIssues = createPaginatedType("Issues", IssueRef);
