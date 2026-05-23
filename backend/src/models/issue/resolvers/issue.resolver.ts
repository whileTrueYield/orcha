import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import {
  Issue,
  Organization,
  Product,
  Role,
  IssueAction,
  IssueActionCategory,
  Ticket,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext, GuestUserContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import parser from "ua-parser-js";
import { IssueContext } from "../entity";
import { ModelStage, Issue as IssueRecord } from "@prisma/client";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";

@Resolver(Issue)
export class IssueResolver {
  @Query(() => Issue)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.SUPPORT))
  async issue(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
  ): Promise<Issue> {
    const issue = await ctx.prisma.issue.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        product: true,
        assignee: true,
        issueActions: true,
        ticket: true,
      },
    });

    if (!issue) {
      throw new UserInputError("This issue does not exist or has been deleted");
    }

    return issue;
  }

  // This is not an auth endpoint, be mindful of what is being made
  // available to a graphql request made on it and try to limit
  // information by using selects
  @Query(() => Issue)
  @UseMiddleware()
  async issueByToken(
    @Ctx() ctx: AppContext<GuestUserContext>,
    @Arg("token", () => String) token: string,
  ): Promise<IssueRecord> {
    const issue = await ctx.prisma.issue.findFirst({
      where: { token },
      include: {
        issueActions: {
          orderBy: { createdAt: "asc" },
          where: {
            category: {
              in: [
                IssueActionCategory.CLIENT_MESSAGE,
                IssueActionCategory.SUPPORT_MESSAGE,
                IssueActionCategory.CLIENT_IMAGE,
                IssueActionCategory.SUPPORT_IMAGE,
                IssueActionCategory.AUTO_RESOLVED,
              ],
            },
          },
          include: {
            author: {
              select: {
                id: true,
                avatarUrl: true,
                userId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!issue) {
      throw new UserInputError("This issue does not exist or has been deleted");
    }

    return issue;
  }

  @FieldResolver((_returns) => IssueContext)
  context(@Root() issue: Issue): IssueContext {
    const ua = parser(issue.userAgent);

    return {
      deviceName: ua.device.model,
      deviceType: ua.device.type,
      os: ua.os.name,
      osVersion: ua.os.version,
      browser: ua.browser.name,
      engine: ua.engine.name,
    };
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issue: Issue,
  ): Promise<Organization> {
    if (issue.organization) {
      return issue.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: issue.organizationId },
    });
  }

  @FieldResolver((_returns) => Product)
  async product(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issue: Issue,
  ): Promise<Product> {
    if (issue.product) {
      return issue.product;
    }

    return ctx.prisma.product.findUniqueOrThrow({
      where: { id: issue.productId },
    });
  }

  @FieldResolver((_returns) => Ticket, { nullable: true })
  async ticket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issue: Issue,
  ): Promise<Ticket | null> {
    if (issue.ticketId) {
      if (issue.ticket) {
        return issue.ticket;
      }

      return ctx.prisma.ticket.findFirst({
        where: {
          id: issue.ticketId,
          organizationId: issue.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });
    } else {
      return null;
    }
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async assignee(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issue: Issue,
  ): Promise<Role | null> {
    if (issue.assigneeId) {
      if (issue.assignee) {
        return issue.assignee;
      }

      return ctx.prisma.role.findUnique({
        where: { id: issue.assigneeId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => [IssueAction])
  async issueActions(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() issue: Issue,
  ): Promise<IssueAction[]> {
    if (issue.issueActions) {
      return issue.issueActions;
    }

    return ctx.prisma.issueAction.findMany({
      where: {
        issueId: issue.id,
      },
    });
  }
}
