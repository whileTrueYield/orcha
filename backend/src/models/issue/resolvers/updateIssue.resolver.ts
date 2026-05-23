import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";

import {
  Issue,
  IssueActionCategory,
  IssueStatus,
  IssueAction,
} from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthenticationError } from "apollo-server-express";
import { ModelStage, Prisma, Issue as IssueRecord } from "@prisma/client";
import { MaxLength } from "class-validator";
import { loadTemplate, sendEmail } from "../../../emails/email";
import { config } from "../../../config";
import { filter, isEmpty, trim } from "lodash";
import { assertProofOfWork } from "../../auth/helper";
import { logger } from "../../../logger";
import { addDays } from "date-fns";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@InputType()
class UpdateIssueInput {
  @Field(() => IssueStatus, { nullable: true })
  status?: IssueStatus;

  @Field(() => Int, { nullable: true })
  assigneeId?: number;

  @Field(() => Int, { nullable: true })
  ticketId?: number;

  @Field(() => Boolean, { nullable: true })
  unread?: boolean;

  @Field(() => Boolean, { nullable: true })
  archived?: boolean;
}

@InputType()
class ClientUpdateIssueInput {
  @Field(() => IssueStatus, { nullable: true })
  status?: IssueStatus;

  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  message?: string;

  @Field(() => String, { nullable: true })
  @MaxLength(512)
  imageUrl?: string;

  @Field()
  proof: string;

  @Field()
  hash: string;
}

@InputType()
class IssueSendMessageInput {
  @Field(() => String, { nullable: true })
  @MaxLength(2048)
  message?: string;

  @Field(() => String, { nullable: true })
  @MaxLength(512)
  imageUrl?: string;
}

@InputType()
class IssueAddNoteInput {
  @Field(() => String)
  @MaxLength(2048)
  note: string;
}

@InputType()
class IssueUpdateNoteInput {
  @Field(() => String)
  @MaxLength(2048)
  note: string;
}

@Resolver(Issue)
export class UpdateIssueResolver {
  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueAddNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int) issueId: number,
    @Arg("input", () => IssueAddNoteInput) input: IssueAddNoteInput,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueId,
      },
    });

    // add to actions for audit, we do not need to create any other
    // record since issue information are mostly made out of issue actions
    await ctx.prisma.issueAction.create({
      data: {
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: "added a note",
        category: IssueActionCategory.SUPPORT_NOTE,
        body: input.note,
      },
    });

    return ctx.prisma.issue.update({
      where: { id: issue.id },
      data: { status: IssueStatus.PROCESSING },
    });
  }

  @Mutation(() => IssueAction)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueUpdateNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueActionId", () => Int) issueActionId: number,
    @Arg("input", () => IssueUpdateNoteInput) input: IssueUpdateNoteInput,
  ): Promise<IssueAction> {
    const issueAction = await ctx.prisma.issueAction.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueActionId,
        category: IssueActionCategory.SUPPORT_NOTE,
        authorId: ctx.me.roleId,
      },
    });

    // add to actions for audit, we do not need to create any other
    // record since issue information are mostly made out of issue actions
    return ctx.prisma.issueAction.update({
      where: {
        id: issueAction.id,
      },
      data: {
        body: input.note,
      },
    });
  }

  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueRemoveAutoResolve(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int) issueId: number,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueId,
      },
    });

    return ctx.prisma.issue.update({
      where: { id: issue.id },
      data: { resolveAfterDate: null },
    });
  }

  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueSetAutoResolve(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int) issueId: number,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueId,
      },
    });

    return ctx.prisma.issue.update({
      where: { id: issue.id },
      data: {
        resolveAfterDate: addDays(new Date(), config.autoResolveIssueAfter),
      },
    });
  }

  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueDeleteNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueActionId", () => Int) issueActionId: number,
  ): Promise<Issue> {
    const issueAction = await ctx.prisma.issueAction.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueActionId,
        category: IssueActionCategory.SUPPORT_NOTE,
        authorId: ctx.me.roleId,
      },
      include: { issue: true },
    });

    await ctx.prisma.issueAction.delete({ where: { id: issueAction.id } });
    return issueAction.issue;
  }

  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issueSendMessage(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int) issueId: number,
    @Arg("input", () => IssueSendMessageInput) input: IssueSendMessageInput,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueId,
      },
    });

    // add to actions for audit, we do not need to create any other
    // record since issue information are mostly made out of issue actions
    if (input.imageUrl) {
      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: ctx.me.roleId,
          title: `sent a new image`,
          category: IssueActionCategory.SUPPORT_IMAGE,
          body: input.imageUrl,
        },
      });
    }

    if (input.message) {
      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          authorId: ctx.me.roleId,
          title: "sent a new reply",
          category: IssueActionCategory.SUPPORT_MESSAGE,
          body: input.message,
        },
      });
    }

    const { html, text } = await loadTemplate({
      template: "new_issue_message",
      data: {
        email: issue.email,
        name: issue.name,
        message: input.message
          ? filter(input.message.split("\n").map(trim))
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
      where: { id: issue.id },
      data: {
        status: IssueStatus.PROCESSING,
        resolveAfterDate: addDays(new Date(), config.autoResolveIssueAfter),
      },
    });
  }

  @Mutation(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async updateIssue(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("issueId", () => Int) issueId: number,
    @Arg("input", () => UpdateIssueInput) input: UpdateIssueInput,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: issueId,
      },
    });

    const issueActions: Prisma.IssueActionUncheckedCreateInput[] = [];
    const data: Prisma.IssueUncheckedUpdateInput = {};

    if (input.unread !== undefined) {
      data.unread = input.unread;
    }

    if (input.archived !== undefined) {
      data.archived = input.archived;
    }

    if (input.status && input.status !== issue.status) {
      data.status = input.status;

      // add to actions for audit
      issueActions.push({
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: `changed status to ${input.status}`,
        category: IssueActionCategory.CHANGE_STATUS,
      });
    }

    if (input.assigneeId && issue.assigneeId !== input.assigneeId) {
      const assignee = await ctx.prisma.role.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.assigneeId,
        },
      });

      data.assigneeId = assignee.id;
      data.unread = true;

      // add to actions for audit
      issueActions.push({
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: `assigned issue to ${assignee.name}`,
        category: IssueActionCategory.SET_ASSIGNEE,
      });
    } else if (input.assigneeId === null) {
      data.assigneeId = null;

      // add to actions for audit
      issueActions.push({
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: `removed assignee`,
        category: IssueActionCategory.SET_ASSIGNEE,
      });
    }

    // Associating an issue with a ticket
    if (input.ticketId && issue.ticketId !== input.ticketId) {
      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.ticketId,
          stage: { not: ModelStage.DELETED },
        },
      });

      data.ticketId = ticket.id;
      data.unread = true;

      // add to actions for audit
      issueActions.push({
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: `associated issue with a ticket`,
        category: IssueActionCategory.SET_TICKET,
      });
    } else if (input.ticketId === null) {
      data.ticketId = null;

      // add to actions for audit
      issueActions.push({
        organizationId: issue.organizationId,
        issueId: issue.id,
        authorId: ctx.me.roleId,
        title: `deassociated issue and ticket`,
        category: IssueActionCategory.SET_TICKET,
      });
    }

    const updatedIssue = await ctx.prisma.issue.update({
      where: { id: issue.id },
      data,
    });

    if (issueActions.length) {
      await ctx.prisma.issueAction.createMany({ data: issueActions });
    }

    return updatedIssue;
  }

  // This endpoint allows a non-authenticated user to add a client
  // message and change the status of a support case issue
  @Mutation(() => Issue)
  async updateIssueByToken(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("token", () => String) token: string,
    @Arg("input", () => ClientUpdateIssueInput) input: ClientUpdateIssueInput,
  ): Promise<IssueRecord> {
    try {
      await assertProofOfWork(ctx.req.ip, input.hash, input.proof);
    } catch (error) {
      logger.warn(
        `updateIssueByToken(...): Bad proof of work provided, token: ${token} IPs: ${ctx.req.ips},  IP: ${ctx.req.ip}`,
      );
      throw new AuthenticationError("Bad password or email does not exist");
    }

    const issue = await ctx.prisma.issue.findFirstOrThrow({
      where: { token },
    });

    const issueData: Prisma.IssueUncheckedUpdateInput = {};

    if (input.message) {
      // add to actions for audit, we do not need to create any other
      // record since issue information are mostly made out of issue actions
      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          title: `${issue.email} sent a new message`,
          category: IssueActionCategory.CLIENT_MESSAGE,
          body: input.message,
        },
      });

      issueData.unread = true;
      issueData.resolveAfterDate = null;
    }

    if (input.imageUrl) {
      // add to actions for audit, we do not need to create any other
      // record since issue information are mostly made out of issue actions
      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          title: `${issue.email} sent a new image`,
          category: IssueActionCategory.CLIENT_IMAGE,
          body: input.imageUrl,
        },
      });

      issueData.unread = true;
      issueData.resolveAfterDate = null;
    }

    if (
      input.status === IssueStatus.RESOLVED &&
      input.status !== issue.status
    ) {
      // add to actions for audit
      await ctx.prisma.issueAction.create({
        data: {
          organizationId: issue.organizationId,
          issueId: issue.id,
          title: `${issue.email} marked issue as ${input.status}`,
          category: IssueActionCategory.CHANGE_STATUS,
        },
      });

      issueData.status = IssueStatus.RESOLVED;
    }

    if (!isEmpty(issueData)) {
      return await ctx.prisma.issue.update({
        where: { id: issue.id },
        data: issueData,
      });
    }

    return await ctx.prisma.issue.findFirstOrThrow({
      where: { token },
      include: {
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
  }
}
