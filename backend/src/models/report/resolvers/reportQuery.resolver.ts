import {
  Arg,
  Query,
  Resolver,
  Int,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
} from "type-graphql";
import { ReportQuery, Organization } from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { FeatureFlags, hasFeature } from "../../../middlewares/featureFlag";
import { FilterElement, QueryAggregate, ReportAggregate } from "../entity";
import { toFilterElement } from "../helper";
import { map } from "lodash";
import { processQuery } from "../query";
import { ReportWidgetType } from "@prisma/client";

@Resolver(ReportQuery)
export class ReportQueryResolver {
  @Query(() => ReportQuery)
  @UseMiddleware(hasRole())
  @UseMiddleware(hasFeature(FeatureFlags.REPORT))
  async reportQuery(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<ReportQuery> {
    const reportQuery = await ctx.prisma.reportQuery.findFirst({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        byAssignees: true,
        byAuthors: true,
        byFeatures: true,
        byOwners: true,
        byProducts: true,
        byTags: true,
        byTickets: true,
        byWorkflows: true,
        byWorkflowStateAssignees: true,
        byWorkflowStates: true,

        secondaryByAssignees: true,
        secondaryByAuthors: true,
        secondaryByFeatures: true,
        secondaryByOwners: true,
        secondaryByProducts: true,
        secondaryByTags: true,
        secondaryByTickets: true,
        secondaryByWorkflows: true,
        secondaryByWorkflowStateAssignees: true,
        secondaryByWorkflowStates: true,
      },
    });

    if (!reportQuery) {
      throw new UserInputError(
        "This report does not exist or has been deleted"
      );
    }

    console.log({
      title: reportQuery.title,
      byWorkflows: reportQuery.byWorkflows,
      secondaryByWorkflows: reportQuery.secondaryByWorkflows,
    });

    return reportQuery;
  }

  @FieldResolver((_returns) => ReportAggregate)
  async values(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<ReportAggregate> {
    const role = await ctx.me.getRole();

    let secondary: QueryAggregate[] = [];

    const primary = await processQuery({
      organizationId: ctx.me.organizationId,
      timeZone: role.timeZone,

      aggregateField: reportQuery.aggregateField,
      chartBy: reportQuery.chartBy,
      groupBy: reportQuery.groupBy,

      workflowStateAssigneeIds: map(reportQuery.byWorkflowStateAssignees, "id"),
      assigneeIds: map(reportQuery.byAssignees, "id"),
      authorIds: map(reportQuery.byAuthors, "id"),
      productIds: map(reportQuery.byProducts, "id"),
      workflowIds: map(reportQuery.byWorkflows, "id"),
      workflowStateIds: map(reportQuery.byWorkflowStates, "id"),
      tagIds: map(reportQuery.byTags, "id"),

      fromDate: reportQuery.fromDate,
      untilDate: reportQuery.fromDate,
    });

    // if the query is a comparison, we'll provide a secondary dataset
    if (
      reportQuery.widgetType === ReportWidgetType.COMPARE_THROUGH_TIME ||
      reportQuery.widgetType === ReportWidgetType.COMPARE_VALUES_NOW
    ) {
      // if we requested to use the same filter as the primary filter
      if (reportQuery.sameAsPrimaryFilter) {
        secondary = await processQuery({
          organizationId: ctx.me.organizationId,
          timeZone: role.timeZone,

          aggregateField: reportQuery.aggregateField,
          chartBy: reportQuery.secondaryChartBy,
          groupBy: reportQuery.secondaryGroupBy,

          workflowStateAssigneeIds: map(
            reportQuery.byWorkflowStateAssignees,
            "id"
          ),
          assigneeIds: map(reportQuery.byAssignees, "id"),
          authorIds: map(reportQuery.byAuthors, "id"),
          productIds: map(reportQuery.byProducts, "id"),
          workflowIds: map(reportQuery.byWorkflows, "id"),
          workflowStateIds: map(reportQuery.byWorkflowStates, "id"),
          tagIds: map(reportQuery.byTags, "id"),

          fromDate: reportQuery.fromDate,
          untilDate: reportQuery.fromDate,
        });
      } else {
        console.log({
          title: reportQuery.title,
          organizationId: ctx.me.organizationId,
          timeZone: role.timeZone,

          aggregateField: reportQuery.aggregateField,
          chartBy: reportQuery.secondaryChartBy,
          groupBy: reportQuery.secondaryGroupBy,

          workflowStateAssigneeIds: map(
            reportQuery.secondaryByWorkflowStateAssignees,
            "id"
          ),
          assigneeIds: map(reportQuery.secondaryByAssignees, "id"),
          authorIds: map(reportQuery.secondaryByAuthors, "id"),
          productIds: map(reportQuery.secondaryByProducts, "id"),
          mainWorkflowIds: map(reportQuery.byWorkflows, "id"),
          workflowIds: map(reportQuery.secondaryByWorkflows, "id"),
          workflowStateIds: map(reportQuery.secondaryByWorkflowStates, "id"),
          tagIds: map(reportQuery.secondaryByTags, "id"),

          fromDate: reportQuery.fromDate,
          untilDate: reportQuery.fromDate,
        });

        secondary = await processQuery({
          organizationId: ctx.me.organizationId,
          timeZone: role.timeZone,

          aggregateField: reportQuery.aggregateField,
          chartBy: reportQuery.secondaryChartBy,
          groupBy: reportQuery.secondaryGroupBy,

          workflowStateAssigneeIds: map(
            reportQuery.secondaryByWorkflowStateAssignees,
            "id"
          ),
          assigneeIds: map(reportQuery.secondaryByAssignees, "id"),
          authorIds: map(reportQuery.secondaryByAuthors, "id"),
          productIds: map(reportQuery.secondaryByProducts, "id"),
          workflowIds: map(reportQuery.secondaryByWorkflows, "id"),
          workflowStateIds: map(reportQuery.secondaryByWorkflowStates, "id"),
          tagIds: map(reportQuery.secondaryByTags, "id"),

          fromDate: reportQuery.fromDate,
          untilDate: reportQuery.fromDate,
        });
      }
    }

    return { primary, secondary };
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<Organization> {
    if (reportQuery.organization) {
      return reportQuery.organization;
    }
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: reportQuery.organizationId },
    });
  }

  @FieldResolver((_returns) => [FilterElement])
  async byProducts(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byProducts) {
      return reportQuery.byProducts.map(toFilterElement("product", "name"));
    }

    const products = await ctx.prisma.product.findMany({
      where: {
        reportQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return products.map(toFilterElement("product", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byTags) {
      return reportQuery.byTags.map(toFilterElement("tag", "name"));
    }

    const tags = await ctx.prisma.tag.findMany({
      where: {
        reportQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return tags.map(toFilterElement("tag", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byWorkflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byWorkflows) {
      return reportQuery.byWorkflows.map(toFilterElement("workflow", "name"));
    }

    const workflows = await ctx.prisma.workflow.findMany({
      where: {
        reportQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return workflows.map(toFilterElement("workflow", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byTickets) {
      return reportQuery.byTickets.map(toFilterElement("ticket", "title"));
    }

    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        reportQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        title: true,
      },
    });
    return tickets.map(toFilterElement("ticket", "title"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byWorkflowStates(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byWorkflowStates) {
      return reportQuery.byWorkflowStates.map(
        toFilterElement("workflowState", "name")
      );
    }

    const workflowStates = await ctx.prisma.workflowState.findMany({
      where: {
        reportQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return workflowStates.map(toFilterElement("workflowState", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byAssignees(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byAssignees) {
      return reportQuery.byAssignees.map(toFilterElement("role", "name"));
    }

    const assignees = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsAssignee: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return assignees.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byAuthors(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byAuthors) {
      return reportQuery.byAuthors.map(toFilterElement("role", "name"));
    }

    const authors = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsAuthor: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return authors.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byOwners(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byOwners) {
      return reportQuery.byOwners.map(toFilterElement("role", "name"));
    }

    const owners = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsOwner: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return owners.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async byWorkflowStateAssignees(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.byWorkflowStateAssignees) {
      return reportQuery.byWorkflowStateAssignees.map(
        toFilterElement("role", "name")
      );
    }

    const workflowStateAssignees = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsWorkflowStateAssignee: {
          some: { id: reportQuery.id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return workflowStateAssignees.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByProducts(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByProducts) {
      return reportQuery.secondaryByProducts.map(
        toFilterElement("product", "name")
      );
    }

    const products = await ctx.prisma.product.findMany({
      where: {
        reportSecondaryQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return products.map(toFilterElement("product", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByTags) {
      return reportQuery.secondaryByTags.map(toFilterElement("tag", "name"));
    }

    const tags = await ctx.prisma.tag.findMany({
      where: {
        reportSecondaryQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return tags.map(toFilterElement("tag", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByWorkflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByWorkflows) {
      return reportQuery.secondaryByWorkflows.map(
        toFilterElement("workflow", "name")
      );
    }

    const workflows = await ctx.prisma.workflow.findMany({
      where: {
        reportSecondaryQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return workflows.map(toFilterElement("workflow", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByTickets) {
      return reportQuery.secondaryByTickets.map(
        toFilterElement("ticket", "title")
      );
    }

    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        reportSecondaryQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        title: true,
      },
    });
    return tickets.map(toFilterElement("ticket", "title"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByWorkflowStates(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByWorkflowStates) {
      return reportQuery.secondaryByWorkflowStates.map(
        toFilterElement("workflowState", "name")
      );
    }

    const workflowStates = await ctx.prisma.workflowState.findMany({
      where: {
        reportSecondaryQueries: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });
    return workflowStates.map(toFilterElement("workflowState", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByAssignees(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByAssignees) {
      return reportQuery.secondaryByAssignees.map(
        toFilterElement("role", "name")
      );
    }

    const assignees = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsAssignee: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return assignees.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByAuthors(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByAuthors) {
      return reportQuery.secondaryByAuthors.map(
        toFilterElement("role", "name")
      );
    }

    const authors = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsAuthor: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return authors.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByOwners(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByOwners) {
      return reportQuery.secondaryByOwners.map(toFilterElement("role", "name"));
    }

    const owners = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsOwner: { some: { id: reportQuery.id } },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return owners.map(toFilterElement("role", "name"));
  }

  @FieldResolver((_returns) => [FilterElement])
  async secondaryByWorkflowStateAssignees(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() reportQuery: ReportQuery
  ): Promise<FilterElement[]> {
    if (reportQuery.secondaryByWorkflowStateAssignees) {
      return reportQuery.secondaryByWorkflowStateAssignees.map(
        toFilterElement("role", "name")
      );
    }

    const workflowStateAssignees = await ctx.prisma.role.findMany({
      where: {
        reportQueriesAsWorkflowStateAssignee: {
          some: { id: reportQuery.id },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return workflowStateAssignees.map(toFilterElement("role", "name"));
  }
}
