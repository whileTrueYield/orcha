/**
 * ScheduleConfig resolvers — priority-based scheduling configuration.
 *
 * Registers:
 *  - ScheduleConfig prismaObject with relation fields
 *  - Query.scheduleConfig(id): ScheduleConfig
 *  - Query.scheduleConfigs: [ScheduleConfig]
 *  - Query.ticketsCount(filter, removedTicketIds, addedTicketIds): Int
 *  - Mutation.updateScheduleConfig(input): [ScheduleConfig]
 *
 * Also registers the UpdateScheduleConfigInput and UpdateScheduleConfigsInput
 * input types used by both the mutation and the ticketsCount query.
 *
 * Auth: hasRole with ADMIN or OWNER.
 */

import builder from "../../../schema/builder";
import { ModelStage, Prisma, TicketStatus } from "@prisma/client";
import { isEmpty, uniq } from "lodash";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { getProjectDescendantIds } from "../../project/helper";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// ScheduleConfig prismaObject — registered here because no dedicated entity
// file exists for this model.
// ---------------------------------------------------------------------------

export const ScheduleConfigRef = builder.prismaObject("ScheduleConfig", {
  fields: (t) => ({
    id: t.exposeInt("id"),
    priority: t.exposeInt("priority"),
    organizationId: t.exposeInt("organizationId"),
    createdAt: t.expose("createdAt", { type: "DateTime" }),
    updatedAt: t.expose("updatedAt", { type: "DateTime" }),
    organization: t.relation("organization"),
    features: t.relation("features"),
    tickets: t.relation("tickets"),
    workflows: t.relation("workflows"),
    products: t.relation("products"),
    projects: t.relation("projects"),
    tags: t.relation("tags"),
  }),
});

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export const UpdateScheduleConfigInput = builder.inputType("UpdateScheduleConfigInput", {
  fields: (t) => ({
    priority: t.int({ required: true }),
    productIds: t.intList({ required: true }),
    tagIds: t.intList({ required: true }),
    workflowIds: t.intList({ required: true }),
    ticketIds: t.intList({ required: true }),
    projectIds: t.intList({ required: true }),
  }),
});

const UpdateScheduleConfigsInput = builder.inputType("UpdateScheduleConfigsInput", {
  fields: (t) => ({
    configs: t.field({
      type: [UpdateScheduleConfigInput],
      required: true,
    }),
  }),
});

// ---------------------------------------------------------------------------
// Query: scheduleConfig
// ---------------------------------------------------------------------------

builder.queryField("scheduleConfig", (t) =>
  t.prismaField({
    type: "ScheduleConfig",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleConfig.findFirstOrThrow({
        ...query,
        where: {
          organizationId: me.organizationId,
          id: args.id,
        },
        include: {
          projects: true,
          products: true,
          workflows: true,
          tags: true,
          tickets: true,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: ticketsCount — count of tickets matching a filter configuration
// ---------------------------------------------------------------------------

builder.queryField("ticketsCount", (t) =>
  t.int({
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      filter: t.arg({ type: UpdateScheduleConfigInput, required: true }),
      removedTicketIds: t.arg.intList({ required: true }),
      addedTicketIds: t.arg.intList({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const filter = args.filter;

      const where: Prisma.TicketWhereInput = {
        organizationId: me.organizationId,
        stage: ModelStage.PUBLISHED,
        OR: [
          {
            status: TicketStatus.SCHEDULED,
            id: { notIn: args.removedTicketIds },
          },
          {
            id: { in: args.addedTicketIds },
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

      return ctx.prisma.ticket.count({ where });
    },
  }),
);

// ---------------------------------------------------------------------------
// Query: scheduleConfigs
// ---------------------------------------------------------------------------

builder.queryField("scheduleConfigs", (t) =>
  t.prismaField({
    type: ["ScheduleConfig"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    resolve: (query, _root, _args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      return ctx.prisma.scheduleConfig.findMany({
        ...query,
        where: {
          organizationId: me.organizationId,
        },
        include: {
          projects: true,
          products: true,
          workflows: true,
          tags: true,
          tickets: true,
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateScheduleConfig — replace all configs for the organization
// ---------------------------------------------------------------------------

builder.mutationField("updateScheduleConfig", (t) =>
  t.prismaField({
    type: ["ScheduleConfig"],
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      input: t.arg({ type: UpdateScheduleConfigsInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      await ctx.prisma.scheduleConfig.deleteMany({
        where: { organizationId: me.organizationId },
      });

      await requestEstimate(me.organizationId);

      const configs: any[] = [];

      for (const filter of args.input.configs) {
        // Verify that all the objects referred to are part of
        // the user's organization
        const products = await ctx.prisma.product.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.productIds },
          },
        });

        const tags = await ctx.prisma.tag.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.tagIds },
          },
        });

        const workflows = await ctx.prisma.workflow.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.workflowIds },
          },
        });

        const tickets = await ctx.prisma.ticket.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.ticketIds },
          },
        });

        const projects = await ctx.prisma.project.findMany({
          where: {
            organizationId: me.organizationId,
            id: { in: filter.projectIds },
          },
        });

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
            ...query,
            data: {
              organizationId: me.organizationId,
              priority: filter.priority,
              products: {
                connect: products.map(({ id }) => ({ id })),
              },
              tags: { connect: tags.map(({ id }) => ({ id })) },
              tickets: { connect: tickets.map(({ id }) => ({ id })) },
              projects: { connect: projects.map(({ id }) => ({ id })) },
              workflows: { connect: workflows.map(({ id }) => ({ id })) },
            },
          }),
        );
      }

      return configs;
    },
  }),
);
