import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { Length, Min, Max, IsIn, IsISO8601 } from "class-validator";
import {
  ReportQuery,
  ReportAggregateField,
  ReportGroupBy,
  ReportDateGranularity,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";
import { filter, map } from "lodash";
import { normalizeProjectPath } from "../../project/helper";
import { setToRecords } from "../../../utils/query";
import prisma from "../../../prisma";
import { UserInputError } from "apollo-server-express";

@InputType()
class UpdateReportQuerySizeInput {
  @Field(() => Int)
  @Max(2)
  @Min(1)
  rows: number;

  @Field(() => Int)
  @Max(2)
  @Min(1)
  cols: number;
}

@InputType()
class UpdateReportQueryPlacementInput {
  @Field(() => String)
  @IsIn(["left", "right"])
  direction: "left" | "right";
}

@InputType()
class UpdateReportQueryInput {
  @Field()
  @Length(1, 128)
  title: string;

  @Field({ defaultValue: true })
  noUnknowns: boolean;

  @Field({ defaultValue: false })
  cummulative: boolean;

  @Field(() => ReportAggregateField)
  aggregateField: ReportAggregateField;

  @Field(() => ReportDateGranularity, {
    defaultValue: ReportDateGranularity.AUTO,
  })
  granularity = ReportDateGranularity.AUTO;

  @Field(() => String, { nullable: true })
  @IsISO8601()
  fromDate: string | null;

  @Field(() => String, { nullable: true })
  @IsISO8601()
  untilDate: string | null;

  /**
   * Primary filters
   */
  @Field(() => [Int], { nullable: "itemsAndList" })
  productIds: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  tagIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  workflowIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  ticketIds?: number[] | null;

  // @Field(() => [Int], { nullable: "itemsAndList" })
  // featureIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  ownerIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  authorIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  assigneeIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  workflowStateAssigneeIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  workflowStateIds?: number[] | null;

  @Field(() => [String], { nullable: "itemsAndList" })
  paths?: string[] | null;

  @Field(() => Boolean, { nullable: true })
  isTicketCancelled: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isTicketDone: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isTicketActive: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isTicketStarted: boolean | null;

  @Field(() => Boolean, { nullable: true })
  isTicketNotStarted: boolean | null;

  @Field(() => ReportGroupBy)
  chartBy: ReportGroupBy;

  @Field(() => String, { nullable: true })
  chartByLabel: string | null;

  @Field(() => ReportGroupBy, { nullable: true })
  groupBy: ReportGroupBy;

  @Field(() => String, { nullable: true })
  groupByLabel: string | null;

  /**
   * Secondary fields
   */

  @Field(() => Boolean, { nullable: true })
  sameAsPrimaryFilter: boolean;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryProductIds: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryTagIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryWorkflowIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryTicketIds?: number[] | null;

  // @Field(() => [Int], { nullable: "itemsAndList" })
  // secondaryFeatureIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryOwnerIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryAuthorIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryAssigneeIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryWorkflowStateAssigneeIds?: number[] | null;

  @Field(() => [Int], { nullable: "itemsAndList" })
  secondaryWorkflowStateIds?: number[] | null;

  @Field(() => [String], { nullable: "itemsAndList" })
  secondaryPaths?: string[] | null;

  @Field(() => Boolean, { nullable: true })
  secondaryIsTicketCancelled: boolean | null;

  @Field(() => Boolean, { nullable: true })
  secondaryIsTicketDone: boolean | null;

  @Field(() => Boolean, { nullable: true })
  secondaryIsTicketActive: boolean | null;

  @Field(() => Boolean, { nullable: true })
  secondaryIsTicketStarted: boolean | null;

  @Field(() => Boolean, { nullable: true })
  secondaryIsTicketNotStarted: boolean | null;

  @Field(() => ReportGroupBy, { nullable: true })
  secondaryChartBy: ReportGroupBy | null;

  @Field(() => String, { nullable: true })
  secondaryChartByLabel: string | null;

  @Field(() => ReportGroupBy, { nullable: true })
  secondaryGroupBy: ReportGroupBy | null;

  @Field(() => String, { nullable: true })
  secondaryGroupByLabel: string | null;
}

@Resolver(ReportQuery)
export class UpdateReportQueryResolver {
  @Mutation(() => ReportQuery)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async updateReportQuerySize(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportQueryId", () => Int) reportQueryId: number,
    @Arg("input")
    input: UpdateReportQuerySizeInput
  ): Promise<ReportQuery> {
    const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
      where: {
        id: reportQueryId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.reportQuery.update({
      where: {
        id: reportQuery.id,
      },
      data: {
        cols: input.cols,
        rows: input.rows,
      },
    });
  }

  @Mutation(() => [ReportQuery])
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async updateReportQueryPlacement(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportQueryId", () => Int) reportQueryId: number,
    @Arg("input")
    input: UpdateReportQueryPlacementInput
  ): Promise<ReportQuery[]> {
    const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
      where: {
        id: reportQueryId,
        organizationId: ctx.me.organizationId,
      },
    });

    // reverse the previous one with the current one
    if (input.direction === "left") {
      const targetReportQuery = await ctx.prisma.reportQuery.findFirst({
        where: {
          reportId: reportQuery.reportId,
          organizationId: ctx.me.organizationId,
          position: { lt: reportQuery.position },
        },
        orderBy: { position: "desc" },
      });

      if (!targetReportQuery) {
        throw new UserInputError("No previous widgets");
      }

      return prisma.$transaction([
        ctx.prisma.reportQuery.update({
          where: {
            id: reportQuery.id,
          },
          data: {
            position: targetReportQuery.position,
          },
        }),
        ctx.prisma.reportQuery.update({
          where: {
            id: targetReportQuery.id,
          },
          data: {
            position: reportQuery.position,
          },
        }),
      ]);
    }

    const targetReportQuery = await ctx.prisma.reportQuery.findFirst({
      where: {
        reportId: reportQuery.reportId,
        organizationId: ctx.me.organizationId,
        position: { gt: reportQuery.position },
      },
      orderBy: { position: "asc" },
    });

    if (!targetReportQuery) {
      throw new UserInputError("No following widgets");
    }

    return prisma.$transaction([
      ctx.prisma.reportQuery.update({
        where: {
          id: reportQuery.id,
        },
        data: {
          position: targetReportQuery.position,
        },
      }),
      ctx.prisma.reportQuery.update({
        where: {
          id: targetReportQuery.id,
        },
        data: {
          position: reportQuery.position,
        },
      }),
    ]);
  }

  @Mutation(() => ReportQuery)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async updateReportQuery(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportQueryId", () => Int) reportQueryId: number,
    @Arg("input")
    input: UpdateReportQueryInput
  ): Promise<ReportQuery> {
    if (input.chartBy == input.groupBy) {
      throw new UserInputError("Groupings cannot be identical");
    }

    if (
      input.secondaryChartBy &&
      input.secondaryChartBy == input.secondaryGroupBy
    ) {
      throw new UserInputError("Groupings cannot be identical");
    }

    const reportQuery = await ctx.prisma.reportQuery.findFirstOrThrow({
      where: {
        id: reportQueryId,
        organizationId: ctx.me.organizationId,
      },
    });

    // Verify that all the objects referred to are part of
    // the user's organization
    const productIds = filter(input.productIds);
    const products = productIds.length
      ? await ctx.prisma.product.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: productIds },
          },
        })
      : [];

    const tagIds = filter(input.tagIds);
    const tags = tagIds.length
      ? await ctx.prisma.tag.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: tagIds },
          },
        })
      : [];

    const workflowIds = filter(input.workflowIds);
    const workflows = workflowIds.length
      ? await ctx.prisma.workflow.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: workflowIds },
          },
        })
      : [];

    const ticketIds = filter(input.ticketIds);
    const tickets = ticketIds.length
      ? await ctx.prisma.ticket.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: ticketIds },
          },
        })
      : [];

    const assigneeIds = filter(input.assigneeIds);
    const assignees = assigneeIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: assigneeIds },
          },
        })
      : [];

    const authorIds = filter(input.authorIds);
    const authors = authorIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: authorIds },
          },
        })
      : [];

    const ownerIds = filter(input.ownerIds);
    const owners = ownerIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: ownerIds },
          },
        })
      : [];

    const workflowStateIds = filter(input.workflowStateIds);
    const workflowStates = workflowStateIds.length
      ? await ctx.prisma.workflowState.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: workflowStateIds },
          },
        })
      : [];

    const workflowStateAssigneeIds = filter(input.workflowStateAssigneeIds);
    const workflowStateAssignees = workflowStateAssigneeIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: workflowStateAssigneeIds },
          },
        })
      : [];

    // Verify that all the objects referred to are part of
    // the user's organization
    const secondaryProductIds = filter(input.secondaryProductIds);
    const secondaryProducts = secondaryProductIds.length
      ? await ctx.prisma.product.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryProductIds },
          },
        })
      : [];

    const secondaryTagIds = filter(input.secondaryTagIds);
    const secondaryTags = secondaryTagIds.length
      ? await ctx.prisma.tag.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryTagIds },
          },
        })
      : [];

    const secondaryWorkflowIds = filter(input.secondaryWorkflowIds);
    const secondaryWorkflows = secondaryWorkflowIds.length
      ? await ctx.prisma.workflow.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryWorkflowIds },
          },
        })
      : [];

    const secondaryTicketIds = filter(input.secondaryTicketIds);
    const secondaryTickets = secondaryTicketIds.length
      ? await ctx.prisma.ticket.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryTicketIds },
          },
        })
      : [];

    const secondaryAssigneeIds = filter(input.secondaryAssigneeIds);
    const secondaryAssignees = secondaryAssigneeIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryAssigneeIds },
          },
        })
      : [];

    const secondaryAuthorIds = filter(input.secondaryAuthorIds);
    const secondaryAuthors = secondaryAuthorIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryAuthorIds },
          },
        })
      : [];

    const secondaryOwnerIds = filter(input.secondaryOwnerIds);
    const secondaryOwners = secondaryOwnerIds.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryOwnerIds },
          },
        })
      : [];

    const secondaryWorkflowStateIds = filter(input.secondaryWorkflowStateIds);
    const secondaryWorkflowStates = secondaryWorkflowStateIds.length
      ? await ctx.prisma.workflowState.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: secondaryWorkflowStateIds },
          },
        })
      : [];

    const secondaryWorkflowStateAssigneeIds = filter(
      input.secondaryWorkflowStateAssigneeIds
    );
    const secondaryWorkflowStateAssignees =
      secondaryWorkflowStateAssigneeIds.length
        ? await ctx.prisma.role.findMany({
            where: {
              organizationId: ctx.me.organizationId,
              id: { in: secondaryWorkflowStateAssigneeIds },
            },
          })
        : [];

    return ctx.prisma.reportQuery.update({
      where: {
        id: reportQuery.id,
      },
      data: {
        title: input.title,
        noUnknowns: input.noUnknowns,
        cummulative: input.cummulative,
        byProducts: setToRecords(products),
        byAssignees: setToRecords(assignees),
        byAuthors: setToRecords(authors),
        byOwners: setToRecords(owners),
        byTags: setToRecords(tags),
        byTickets: setToRecords(tickets),
        byWorkflows: setToRecords(workflows),
        byWorkflowStates: setToRecords(workflowStates),
        byWorkflowStateAssignees: setToRecords(workflowStateAssignees),
        byPaths: JSON.stringify(map(input.paths, normalizeProjectPath)),
        fromDate: input.fromDate,
        untilDate: input.untilDate,

        sameAsPrimaryFilter: input.sameAsPrimaryFilter,
        secondaryByProducts: setToRecords(secondaryProducts),
        secondaryByAssignees: setToRecords(secondaryAssignees),
        secondaryByAuthors: setToRecords(secondaryAuthors),
        secondaryByOwners: setToRecords(secondaryOwners),
        secondaryByTags: setToRecords(secondaryTags),
        secondaryByTickets: setToRecords(secondaryTickets),
        secondaryByWorkflows: setToRecords(secondaryWorkflows),
        secondaryByWorkflowStates: setToRecords(secondaryWorkflowStates),
        secondaryByWorkflowStateAssignees: setToRecords(
          secondaryWorkflowStateAssignees
        ),

        isTicketDone: input.isTicketDone,
        isTicketActive: input.isTicketActive,
        isTicketStarted: input.isTicketStarted,
        isTicketNotStarted: input.isTicketNotStarted,

        chartBy: input.chartBy,
        groupBy: input.groupBy,
        secondaryChartBy: input.secondaryChartBy,
        secondaryGroupBy: input.secondaryGroupBy,

        chartByLabel: input.chartByLabel,
        groupByLabel: input.groupByLabel,
        secondaryChartByLabel: input.secondaryChartByLabel,
        secondaryGroupByLabel: input.secondaryGroupByLabel,

        aggregateField: input.aggregateField,
        granularity: input.granularity,
      },
    });

    return reportQuery;
  }
}
