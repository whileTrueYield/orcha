/**
 * Mutation resolvers for updating Issues.
 *
 * Provides:
 *  - issueAddNote(issueId, input):              add a support note
 *  - issueUpdateNote(issueActionId, input):     edit a support note
 *  - issueDeleteNote(issueActionId):            delete a support note
 *  - issueRemoveAutoResolve(issueId):           clear auto-resolve date
 *  - issueSetAutoResolve(issueId):              set auto-resolve date
 *  - issueSendMessage(issueId, input):          send a message to the reporter
 *  - updateIssue(issueId, input):               update status/assignee/ticket/flags
 *  - updateIssueByToken(token, input):          public endpoint for client updates
 *
 * All authed mutations require hasRole + SUPPORT feature flag, except
 * updateIssueByToken which uses proof-of-work instead of session auth.
 */

import { GraphQLError } from "graphql";
import {
  IssueActionCategory,
  IssueStatus,
  ModelStage,
  Prisma,
} from "@prisma/client";
import { filter, isEmpty, trim } from "lodash";
import { addDays } from "date-fns";
import builder from "../../../schema/builder";
import { IssueStatusEnum } from "../../../schema/enums";
import { AuthRoleContext } from "../../../types";
import { loadTemplate, sendEmail } from "../../../emails/email";
import { config } from "../../../config";
import { assertProofOfWork } from "../../auth/helper";
import { logger } from "../../../logger";
import {
  FeatureFlags,
  assertFeatureFlag,
} from "../../../middlewares/featureFlag";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const UpdateIssueInput = builder.inputType("UpdateIssueInput", {
  fields: (t) => ({
    status: t.field({ type: IssueStatusEnum, required: false }),
    assigneeId: t.int({ required: false }),
    ticketId: t.int({ required: false }),
    unread: t.boolean({ required: false }),
    archived: t.boolean({ required: false }),
  }),
});

const ClientUpdateIssueInput = builder.inputType("ClientUpdateIssueInput", {
  fields: (t) => ({
    status: t.field({ type: IssueStatusEnum, required: false }),
    message: t.string({ required: false }),
    imageUrl: t.string({ required: false }),
    proof: t.string({ required: true }),
    hash: t.string({ required: true }),
  }),
});

const IssueSendMessageInput = builder.inputType("IssueSendMessageInput", {
  fields: (t) => ({
    message: t.string({ required: false }),
    imageUrl: t.string({ required: false }),
  }),
});

const IssueAddNoteInput = builder.inputType("IssueAddNoteInput", {
  fields: (t) => ({
    note: t.string({ required: true }),
  }),
});

const IssueUpdateNoteInput = builder.inputType("IssueUpdateNoteInput", {
  fields: (t) => ({
    note: t.string({ required: true }),
  }),
});

// ---------------------------------------------------------------------------
// issueAddNote mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueAddNote", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueId: t.arg.int({ required: true }),
      input: t.arg({ type: IssueAddNoteInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueId,
        },
      });

      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: "added a note",
          category: IssueActionCategory.SUPPORT_NOTE,
          body: args.input.note,
        },
      });

      return ctx.prisma.issue.update({
        ...query,
        where: { id: issue.id },
        data: { status: IssueStatus.PROCESSING },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// issueUpdateNote mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueUpdateNote", (t) =>
  t.prismaField({
    type: "IssueAction",
    authScopes: { hasRole: true },
    args: {
      issueActionId: t.arg.int({ required: true }),
      input: t.arg({ type: IssueUpdateNoteInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issueAction = await ctx.prisma.issueAction.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueActionId,
          category: IssueActionCategory.SUPPORT_NOTE,
          authorId: me.roleId,
        },
      });

      return ctx.prisma.issueAction.update({
        ...query,
        where: { id: issueAction.id },
        data: { body: args.input.note },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// issueRemoveAutoResolve mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueRemoveAutoResolve", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueId,
        },
      });

      return ctx.prisma.issue.update({
        ...query,
        where: { id: issue.id },
        data: { resolveAfterDate: null },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// issueSetAutoResolve mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueSetAutoResolve", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueId,
        },
      });

      return ctx.prisma.issue.update({
        ...query,
        where: { id: issue.id },
        data: {
          resolveAfterDate: addDays(new Date(), config.autoResolveIssueAfter),
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// issueDeleteNote mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueDeleteNote", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueActionId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issueAction = await ctx.prisma.issueAction.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueActionId,
          category: IssueActionCategory.SUPPORT_NOTE,
          authorId: me.roleId,
        },
        include: { issue: true },
      });

      await ctx.prisma.issueAction.delete({ where: { id: issueAction.id } });

      return ctx.prisma.issue.findUniqueOrThrow({
        ...query,
        where: { id: issueAction.issueId },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// issueSendMessage mutation
// ---------------------------------------------------------------------------

builder.mutationField("issueSendMessage", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueId: t.arg.int({ required: true }),
      input: t.arg({ type: IssueSendMessageInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueId,
        },
      });

      if (args.input.imageUrl) {
        await ctx.prisma.issueAction.create({
          data: {
            organizationId: issue.organizationId,
            issueId: issue.id,
            authorId: me.roleId,
            title: `sent a new image`,
            category: IssueActionCategory.SUPPORT_IMAGE,
            body: args.input.imageUrl,
          },
        });
      }

      if (args.input.message) {
        await ctx.prisma.issueAction.create({
          data: {
            organizationId: issue.organizationId,
            issueId: issue.id,
            authorId: me.roleId,
            title: "sent a new reply",
            category: IssueActionCategory.SUPPORT_MESSAGE,
            body: args.input.message,
          },
        });
      }

      const { html, text } = await loadTemplate({
        template: "new_issue_message",
        data: {
          email: issue.email,
          name: issue.name,
          message: args.input.message
            ? filter(args.input.message.split("\n").map(trim))
            : ["A new image was added to this issue"],
          url: `${config.webAppUri}/support/${issue.token}/`,
          description: filter(issue.description.split("\n").map(trim)),
        },
      });

      await sendEmail({
        ToAddresses: [issue.email],
        html,
        text,
        subject: `Re: Support Case: ${issue.id}`,
      });

      return ctx.prisma.issue.update({
        ...query,
        where: { id: issue.id },
        data: {
          status: IssueStatus.PROCESSING,
          resolveAfterDate: addDays(new Date(), config.autoResolveIssueAfter),
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// updateIssue mutation
// ---------------------------------------------------------------------------

builder.mutationField("updateIssue", (t) =>
  t.prismaField({
    type: "Issue",
    authScopes: { hasRole: true },
    args: {
      issueId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateIssueInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      await assertFeatureFlag(me.organizationId, FeatureFlags.SUPPORT);

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.issueId,
        },
      });

      const issueActions: Prisma.IssueActionUncheckedCreateInput[] = [];
      const data: Prisma.IssueUncheckedUpdateInput = {};

      if (args.input.unread !== undefined && args.input.unread !== null) {
        data.unread = args.input.unread;
      }

      if (args.input.archived !== undefined && args.input.archived !== null) {
        data.archived = args.input.archived;
      }

      if (args.input.status && args.input.status !== issue.status) {
        data.status = args.input.status;

        issueActions.push({
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: `changed status to ${args.input.status}`,
          category: IssueActionCategory.CHANGE_STATUS,
        });
      }

      if (args.input.assigneeId && issue.assigneeId !== args.input.assigneeId) {
        const assignee = await ctx.prisma.role.findFirstOrThrow({
          where: {
            organizationId: me.organizationId,
            id: args.input.assigneeId,
          },
        });

        data.assigneeId = assignee.id;
        data.unread = true;

        issueActions.push({
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: `assigned issue to ${assignee.name}`,
          category: IssueActionCategory.SET_ASSIGNEE,
        });
      } else if (args.input.assigneeId === null) {
        data.assigneeId = null;

        issueActions.push({
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: `removed assignee`,
          category: IssueActionCategory.SET_ASSIGNEE,
        });
      }

      // Associating an issue with a ticket
      if (args.input.ticketId && issue.ticketId !== args.input.ticketId) {
        const ticket = await ctx.prisma.ticket.findFirstOrThrow({
          where: {
            organizationId: me.organizationId,
            id: args.input.ticketId,
            stage: { not: ModelStage.DELETED },
          },
        });

        data.ticketId = ticket.id;
        data.unread = true;

        issueActions.push({
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: `associated issue with a ticket`,
          category: IssueActionCategory.SET_TICKET,
        });
      } else if (args.input.ticketId === null) {
        data.ticketId = null;

        issueActions.push({
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: me.roleId,
          title: `deassociated issue and ticket`,
          category: IssueActionCategory.SET_TICKET,
        });
      }

      const updatedIssue = await ctx.prisma.issue.update({
        ...query,
        where: { id: issue.id },
        data,
      });

      if (issueActions.length) {
        await ctx.prisma.issueAction.createMany({ data: issueActions });
      }

      return updatedIssue;
    },
  }),
);

// ---------------------------------------------------------------------------
// updateIssueByToken mutation — public endpoint for client updates
//
// This allows a non-authenticated user to add a client message and
// change the status of their support case issue. Uses proof-of-work
// for abuse prevention.
// ---------------------------------------------------------------------------

builder.mutationField("updateIssueByToken", (t) =>
  t.prismaField({
    type: "Issue",
    args: {
      token: t.arg.string({ required: true }),
      input: t.arg({ type: ClientUpdateIssueInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      try {
        await assertProofOfWork(ctx.req.ip, args.input.hash, args.input.proof);
      } catch {
        logger.warn(
          `updateIssueByToken(...): Bad proof of work provided, token: ${args.token} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
        );
        throw new GraphQLError("Bad password or email does not exist", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const issue = await ctx.prisma.issue.findFirstOrThrow({
        where: { token: args.token },
      });

      const issueData: Prisma.IssueUncheckedUpdateInput = {};

      if (args.input.message) {
        await ctx.prisma.issueAction.create({
          data: {
            organizationId: issue.organizationId,
            issueId: issue.id,
            title: `${issue.email} sent a new message`,
            category: IssueActionCategory.CLIENT_MESSAGE,
            body: args.input.message,
          },
        });

        issueData.unread = true;
        issueData.resolveAfterDate = null;
      }

      if (args.input.imageUrl) {
        await ctx.prisma.issueAction.create({
          data: {
            organizationId: issue.organizationId,
            issueId: issue.id,
            title: `${issue.email} sent a new image`,
            category: IssueActionCategory.CLIENT_IMAGE,
            body: args.input.imageUrl,
          },
        });

        issueData.unread = true;
        issueData.resolveAfterDate = null;
      }

      if (
        args.input.status === IssueStatus.RESOLVED &&
        args.input.status !== issue.status
      ) {
        await ctx.prisma.issueAction.create({
          data: {
            organizationId: issue.organizationId,
            issueId: issue.id,
            title: `${issue.email} marked issue as ${args.input.status}`,
            category: IssueActionCategory.CHANGE_STATUS,
          },
        });

        issueData.status = IssueStatus.RESOLVED;
      }

      if (!isEmpty(issueData)) {
        return ctx.prisma.issue.update({
          ...query,
          where: { id: issue.id },
          data: issueData,
        });
      }

      return ctx.prisma.issue.findFirstOrThrow({
        ...query,
        where: { token: args.token },
        include: {
          ...query.include,
          issueActions: {
            orderBy: { createdAt: "asc" },
            where: {
              category: {
                in: [
                  IssueActionCategory.CLIENT_MESSAGE,
                  IssueActionCategory.CLIENT_IMAGE,
                  IssueActionCategory.SUPPORT_MESSAGE,
                  IssueActionCategory.SUPPORT_IMAGE,
                ],
              },
            },
            include: {
              author: {
                select: {
                  id: true,
                  avatarUrl: true,
                  name: true,
                  userId: true,
                },
              },
            },
          },
        },
      });
    },
  }),
);
