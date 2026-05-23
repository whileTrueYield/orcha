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

import { IsISO8601, Length } from "class-validator";
import {
  ReportQuery,
  ReportWidgetType,
  ReportAggregateField,
  ReportGroupBy,
  ReportDateGranularity,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";
import { map } from "lodash";
import { normalizeProjectPath } from "../../project/helper";
import { connectToRecords } from "../../../utils/query";
import { UserInputError } from "apollo-server-express";

@InputType()
class CreateReportQueryInput {
  @Field(() => ReportWidgetType)
  widgetType: ReportWidgetType;

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
export class CreateReportQueryResolver {
  @Mutation(() => ReportQuery)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async createReportQuery(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("reportId", () => Int) reportId: number,
    @Arg("input")
    input: CreateReportQueryInput
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

    // Verify that all the objects referred to are part of
    // the user's organization
    const products = input.productIds?.length
      ? await ctx.prisma.product.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.productIds },
          },
        })
      : [];

    const tags = input.tagIds?.length
      ? await ctx.prisma.tag.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.tagIds },
          },
        })
      : [];

    const workflows = input.workflowIds?.length
      ? await ctx.prisma.workflow.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.workflowIds },
          },
        })
      : [];

    const tickets = input.ticketIds?.length
      ? await ctx.prisma.ticket.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.ticketIds },
          },
        })
      : [];

    const assignees = input.assigneeIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.assigneeIds },
          },
        })
      : [];

    const authors = input.authorIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.authorIds },
          },
        })
      : [];

    const owners = input.ownerIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.ownerIds },
          },
        })
      : [];

    const workflowStates = input.workflowStateIds?.length
      ? await ctx.prisma.workflowState.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.workflowStateIds },
          },
        })
      : [];

    const workflowStateAssignees = input.workflowStateAssigneeIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.workflowStateAssigneeIds },
          },
        })
      : [];

    // Verify that all the objects referred to are part of
    // the user's organization
    const secondaryProducts = input.secondaryProductIds?.length
      ? await ctx.prisma.product.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryProductIds },
          },
        })
      : [];

    const secondaryTags = input.secondaryTagIds?.length
      ? await ctx.prisma.tag.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryTagIds },
          },
        })
      : [];

    const secondaryWorkflows = input.secondaryWorkflowIds?.length
      ? await ctx.prisma.workflow.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryWorkflowIds },
          },
        })
      : [];

    const secondaryTickets = input.secondaryTicketIds?.length
      ? await ctx.prisma.ticket.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryTicketIds },
          },
        })
      : [];

    const secondaryAssignees = input.secondaryAssigneeIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryAssigneeIds },
          },
        })
      : [];

    const secondaryAuthors = input.secondaryAuthorIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryAuthorIds },
          },
        })
      : [];

    const secondaryOwners = input.secondaryOwnerIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryOwnerIds },
          },
        })
      : [];

    const secondaryWorkflowStates = input.secondaryWorkflowStateIds?.length
      ? await ctx.prisma.workflowState.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryWorkflowStateIds },
          },
        })
      : [];

    const secondaryWorkflowStateAssignees = input
      .secondaryWorkflowStateAssigneeIds?.length
      ? await ctx.prisma.role.findMany({
          where: {
            organizationId: ctx.me.organizationId,
            id: { in: input.secondaryWorkflowStateAssigneeIds },
          },
        })
      : [];

    const lastQuery = await ctx.prisma.reportQuery.findFirst({
      where: {
        reportId,
      },
      select: { position: true },
      orderBy: { position: "desc" },
    });

    const reportQuery = await ctx.prisma.reportQuery.create({
      data: {
        reportId,
        organizationId: ctx.me.organizationId,
        title: input.title,
        noUnknowns: input.noUnknowns,
        cummulative: input.cummulative,
        byProducts: connectToRecords(products),
        byAssignees: connectToRecords(assignees),
        byAuthors: connectToRecords(authors),
        byOwners: connectToRecords(owners),
        byTags: connectToRecords(tags),
        byTickets: connectToRecords(tickets),
        byWorkflows: connectToRecords(workflows),
        byWorkflowStates: connectToRecords(workflowStates),
        byWorkflowStateAssignees: connectToRecords(workflowStateAssignees),
        byPaths: JSON.stringify(map(input.paths, normalizeProjectPath)),
        fromDate: input.fromDate,
        untilDate: input.untilDate,

        sameAsPrimaryFilter: input.sameAsPrimaryFilter,
        secondaryByProducts: connectToRecords(secondaryProducts),
        secondaryByAssignees: connectToRecords(secondaryAssignees),
        secondaryByAuthors: connectToRecords(secondaryAuthors),
        secondaryByOwners: connectToRecords(secondaryOwners),
        secondaryByTags: connectToRecords(secondaryTags),
        secondaryByTickets: connectToRecords(secondaryTickets),
        secondaryByWorkflows: connectToRecords(secondaryWorkflows),
        secondaryByWorkflowStates: connectToRecords(secondaryWorkflowStates),
        secondaryByWorkflowStateAssignees: connectToRecords(
          secondaryWorkflowStateAssignees
        ),

        isTicketDone: input.isTicketDone,
        isTicketActive: input.isTicketActive,
        isTicketStarted: input.isTicketStarted,
        isTicketNotStarted: input.isTicketNotStarted,

        widgetType: input.widgetType,
        chartBy: input.chartBy,
        groupBy: input.groupBy,
        secondaryChartBy: input.secondaryChartBy,
        secondaryGroupBy: input.secondaryGroupBy,
        aggregateField: input.aggregateField,
        position: lastQuery ? lastQuery.position + 1 : 1,
        granularity: input.granularity,
      },
    });

    return reportQuery;
  }
}
