import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import {
  Feature,
  Product,
  ScheduleConfig,
  Tag,
  Workflow,
  RoleType,
  Ticket,
  ModelStage,
  TicketStatus,
  Project,
} from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { Min } from "class-validator";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { isEmpty, uniq } from "lodash";
import { Prisma } from "@prisma/client";
import { getProjectDescendantIds } from "../../project/helper";

@InputType()
export class UpdateScheduleConfig {
  @Field()
  @Min(0)
  priority: number;

  @Field(() => [Int])
  productIds: number[];

  @Field(() => [Int])
  tagIds: number[];

  @Field(() => [Int])
  workflowIds: number[];

  @Field(() => [Int])
  ticketIds: number[];

  @Field(() => [Int])
  projectIds: number[];

  // @Field(() => [Int])
  // featureIds: number[];
}

@InputType()
class UpdateScheduleConfigs {
  @Field(() => [UpdateScheduleConfig])
  configs: UpdateScheduleConfig[];
}

@Resolver(ScheduleConfig)
export class ScheduleConfigResolver {
  @Query(() => ScheduleConfig)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async scheduleConfig(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<ScheduleConfig> {
    return ctx.prisma.scheduleConfig.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id,
      },
      include: {
        projects: true,
        products: true,
        workflows: true,
        tags: true,
        tickets: true,
      },
    });
  }

  @Query(() => Int)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async ticketsCount(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("filter", () => UpdateScheduleConfig)
    filter: UpdateScheduleConfig,
    // ticketIds defines a pool of ticket ID that restricts the count
    // of tickets matching the priorities only to the tickets currently
    // set to be scheduled
    @Arg("removedTicketIds", () => [Int], { nullable: "items" })
    removedTicketIds: number[],
    @Arg("addedTicketIds", () => [Int], { nullable: "items" })
    addedTicketIds: number[]
  ): Promise<number> {
    const where: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: ModelStage.PUBLISHED,
      OR: [
        {
          status: TicketStatus.SCHEDULED,
          id: { notIn: removedTicketIds },
        },
        {
          id: { in: addedTicketIds },
        },
      ],
    };

    if (
      isEmpty(filter.projectIds) &&
      isEmpty(filter.workflowIds) &&
      isEmpty(filter.productIds) &&
      isEmpty(filter.tagIds) &&
      isEmpty(filter.ticketIds)
    ) {
      return 0;
    }

    if (filter.projectIds.length) {
      let projectIds: number[] = [];

      // capture all the sub-project IDs from the selected projects
      for (const projectId of filter.projectIds) {
        projectIds = [
          ...projectIds,
          projectId,
          ...(await getProjectDescendantIds(projectId)),
        ];
      }

      where.projectId = { in: uniq(projectIds) };
    }

    if (filter.workflowIds.length) {
      where.workflowId = { in: filter.workflowIds };
    }

    if (filter.productIds.length) {
      where.productId = { in: filter.productIds };
    }

    if (filter.tagIds.length) {
      where.tags = { some: { id: { in: filter.tagIds } } };
    }

    if (filter.ticketIds.length) {
      where.id = { in: filter.ticketIds };
    }

    // if priority uses a set of ticket IDs, we'll intersect their
    // IDs with the one currently in the schedule
    // if (filter.ticketIds.length) {
    //   where.id = { in: intersection(filter.ticketIds, ticketIds) };
    // }

    return ctx.prisma.ticket.count({ where });
  }

  @Query(() => [ScheduleConfig])
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async scheduleConfigs(
    @Ctx() ctx: AppContext<AuthRoleContext>
  ): Promise<ScheduleConfig[]> {
    return ctx.prisma.scheduleConfig.findMany({
      where: {
        organizationId: ctx.me.organizationId,
      },
      include: {
        projects: true,
        products: true,
        workflows: true,
        tags: true,
        tickets: true,
      },
    });
  }

  @FieldResolver((_returns) => [Feature])
  async features(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Feature[]> {
    if (scheduleConfig.features) {
      return scheduleConfig.features;
    }

    return ctx.prisma.feature.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Ticket])
  async tickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Ticket[]> {
    if (scheduleConfig.tickets) {
      return scheduleConfig.tickets;
    }

    return ctx.prisma.ticket.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Workflow])
  async workflows(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Workflow[]> {
    if (scheduleConfig.workflows) {
      return scheduleConfig.workflows;
    }

    return ctx.prisma.workflow.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Product])
  async products(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Product[]> {
    if (scheduleConfig.products) {
      return scheduleConfig.products;
    }

    return ctx.prisma.product.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Project])
  async projects(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Project[]> {
    if (scheduleConfig.projects) {
      return scheduleConfig.projects;
    }

    return ctx.prisma.project.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Tag])
  async tags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() scheduleConfig: ScheduleConfig
  ): Promise<Tag[]> {
    if (scheduleConfig.tags) {
      return scheduleConfig.tags;
    }

    return ctx.prisma.tag.findMany({
      where: {
        scheduleConfigs: { some: { id: scheduleConfig.id } },
      },
    });
  }

  @Mutation(() => [ScheduleConfig])
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateScheduleConfig(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input", () => UpdateScheduleConfigs)
    input: UpdateScheduleConfigs
  ): Promise<ScheduleConfig[]> {
    await ctx.prisma.scheduleConfig.deleteMany({
      where: { organizationId: ctx.me.organizationId },
    });

    await requestEstimate(ctx.me.organizationId);

    const configs: ScheduleConfig[] = [];

    for (const filter of input.configs) {
      // Verify that all the objects referred to are part of
      // the user's organization
      const products = await ctx.prisma.product.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.productIds },
        },
      });

      const tags = await ctx.prisma.tag.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.tagIds },
        },
      });

      const workflows = await ctx.prisma.workflow.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.workflowIds },
        },
      });

      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.ticketIds },
        },
      });

      const projects = await ctx.prisma.project.findMany({
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: filter.projectIds },
        },
      });

      // const features = await ctx.prisma.feature.findMany({
      //   where: {
      //     id: { in: filter.featureIds },
      //     featureGroup: {
      //       organizationId: ctx.me.organizationId,
      //     },
      //   },
      // });

      if (
        isEmpty(products) &&
        isEmpty(tags) &&
        isEmpty(tickets) &&
        isEmpty(workflows) &&
        isEmpty(projects)
      ) {
        continue;
      }

      configs.push(
        await ctx.prisma.scheduleConfig.create({
          data: {
            organizationId: ctx.me.organizationId,
            priority: filter.priority,
            products: {
              connect: products.map(({ id }) => ({ id })),
            },
            tags: { connect: tags.map(({ id }) => ({ id })) },
            tickets: { connect: tickets.map(({ id }) => ({ id })) },
            projects: { connect: projects.map(({ id }) => ({ id })) },
            workflows: { connect: workflows.map(({ id }) => ({ id })) },
          },
        })
      );
    }

    return configs;
  }
}
