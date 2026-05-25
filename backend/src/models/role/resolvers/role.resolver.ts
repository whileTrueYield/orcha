/**
 * Role queries and field resolvers:
 *  - role, myRole, habits (queries)
 *  - workWeek, preferences (virtual field resolvers via prismaObject extensions)
 */

import builder from "../../../schema/builder";
import { RoleHabitRef } from "../entity";
import { ModelStage } from "@prisma/client";
import { map, orderBy } from "lodash";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Query: role
// ---------------------------------------------------------------------------

builder.queryField("role", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.role.findFirstOrThrow({
        ...query,
        where: {
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          id: args.id,
        },
        include: { ...query.include, user: true, organization: true },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Query: myRole
// ---------------------------------------------------------------------------

builder.queryField("myRole", (t) =>
  t.prismaField({
    type: "Role",
    authScopes: { hasRole: true },
    resolve: async (query, _root, _args, ctx) =>
      ctx.prisma.role.findFirstOrThrow({
        ...query,
        where: { id: (ctx.me as AuthRoleContext).roleId },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Query: habits
// ---------------------------------------------------------------------------

builder.queryField("habits", (t) =>
  t.field({
    type: RoleHabitRef,
    authScopes: { hasRole: true },
    resolve: async (_root, _args, ctx) => {
      const tickets = await ctx.prisma.ticket.findMany({
        where: {
          OR: [{ authorId: (ctx.me as AuthRoleContext).roleId }, { ownerId: (ctx.me as AuthRoleContext).roleId }],
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          workflow: { stage: ModelStage.PUBLISHED },
          product: { stage: ModelStage.PUBLISHED },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { product: true, workflow: true, project: true },
      });

      const productWorkflows: {
        [value: string]: { count: number; value: { product: any; workflow: any } };
      } = {};

      const projects: {
        [value: string]: { count: number; value: any };
      } = {};

      for (const ticket of tickets) {
        const key = `${ticket.productId}-${ticket.workflowId}`;
        if (!(key in productWorkflows)) {
          productWorkflows[key] = {
            count: 0,
            value: { product: ticket.product!, workflow: ticket.workflow! },
          };
        }
        productWorkflows[key].count += 1;

        if (
          ticket.project &&
          !(ticket.project.id in projects) &&
          ticket.project.stage === "PUBLISHED" &&
          ticket.project.ancestorIsArchived === false
        ) {
          projects[ticket.project.id] = { count: 0, value: ticket.project };
          projects[ticket.project.id].count += 1;
        }
      }

      return {
        projects: map(orderBy(projects, "count", "desc"), ({ value }) => value),
        productWorkflows: map(
          orderBy(productWorkflows, "count", "desc"),
          ({ value }) => value,
        ),
      };
    },
  }),
);
