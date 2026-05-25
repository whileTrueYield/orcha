/**
 * Workflow queries and mutations:
 *  - workflow (query by ID)
 *  - addWorkflowState / deleteWorkflowState / moveWorkflowState / updateWorkflowState (mutations)
 */

import builder from "../../../schema/builder";
import { WorkflowStateDirectionEnum } from "../entity";
import { findWorkflowStateByName } from "../helper";
import { GraphQLError } from "graphql";
import { sortBy, forEach, map } from "lodash";
import { Prisma } from ".prisma/client";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const CreateWorkflowStateInput = builder.inputType("CreateWorkflowStateInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
  }),
});

const UpdateWorkflowStateInput = builder.inputType("UpdateWorkflowStateInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    teamIds: t.intList({ required: false }),
    backupTeamIds: t.intList({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Query: workflow
// ---------------------------------------------------------------------------

builder.queryField("workflow", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: true },
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.workflow.findFirstOrThrow({
        ...query,
        where: {
          id: args.id,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
        include: {
          ...query.include,
          workflowStates: true,
        },
      }),
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("addWorkflowState", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateWorkflowStateInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: {
          id: args.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
      });

      const sameNameWorkflowState = await findWorkflowStateByName(
        args.input.name,
        args.workflowId,
      );

      if (sameNameWorkflowState) {
        throw new GraphQLError("A state with the same name already exists", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const lastState = await ctx.prisma.workflowState.findFirst({
        where: { workflowId: args.workflowId },
        orderBy: { position: "desc" },
      });

      await ctx.prisma.workflowState.create({
        data: {
          name: args.input.name,
          workflowId: args.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
          position: lastState ? lastState.position + 1 : 0,
        },
      });

      return ctx.prisma.workflow.findUniqueOrThrow({
        ...query,
        where: { id: workflow.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: deleteWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("deleteWorkflowState", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowStateId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
        where: {
          id: args.workflowStateId,
          workflow: { organizationId: (ctx.me as AuthRoleContext).organizationId },
        },
        include: {
          workflow: { include: { workflowStates: true } },
        },
      });

      if (workflowState.workflow.workflowStates.length === 1) {
        throw new GraphQLError("A workflow requires at least one state", { extensions: { code: "BAD_USER_INPUT" } });
      }

      await ctx.prisma.workflowState.delete({
        where: { id: workflowState.id },
      });

      return ctx.prisma.workflow.findFirstOrThrow({
        ...query,
        where: {
          id: workflowState.workflowId,
          organizationId: (ctx.me as AuthRoleContext).organizationId,
        },
        include: { ...query.include, workflowStates: true },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: moveWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("moveWorkflowState", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowStateId: t.arg.int({ required: true }),
      direction: t.arg({ type: WorkflowStateDirectionEnum, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
        where: {
          id: args.workflowStateId,
          workflow: { organizationId: (ctx.me as AuthRoleContext).organizationId },
        },
        include: { workflow: { include: { workflowStates: true } } },
      });

      const states = sortBy(workflowState.workflow.workflowStates, "position");

      forEach(states, (state, index) => {
        const pos = (index + 1) * 2;
        if (state.id === args.workflowStateId) {
          switch (args.direction) {
            case "first":
              state.position = 0;
              break;
            case "last":
              state.position = states.length * 2;
              break;
            case "up":
              state.position = pos - 3;
              break;
            case "down":
              state.position = pos + 3;
              break;
            default:
              throw new GraphQLError("Unrecognized direction", { extensions: { code: "BAD_USER_INPUT" } });
          }
        } else {
          state.position = pos;
        }
      });

      forEach(sortBy(states, "position"), (state, index) => {
        state.position = index + 1;
      });

      await Promise.all(
        map(states, (state) =>
          ctx.prisma.workflowState.update({
            where: { id: state.id },
            data: { position: state.position },
          }),
        ),
      );

      return ctx.prisma.workflow.findUniqueOrThrow({
        ...query,
        where: { id: workflowState.workflow.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: updateWorkflowState
// ---------------------------------------------------------------------------

builder.mutationField("updateWorkflowState", (t) =>
  t.prismaField({
    type: "Workflow",
    authScopes: { hasRole: ["ADMIN", "OWNER"] },
    args: {
      workflowStateId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateWorkflowStateInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
        where: {
          id: args.workflowStateId,
          workflow: { organizationId: (ctx.me as AuthRoleContext).organizationId },
        },
        include: { workflow: true },
      });

      const updateData: Prisma.WorkflowStateUpdateInput = {};

      if (args.input.name !== workflowState.name) {
        const sameNameWorkflowState = await findWorkflowStateByName(
          args.input.name,
          workflowState.workflow.id,
        );

        if (sameNameWorkflowState && sameNameWorkflowState.id !== workflowState.id) {
          throw new GraphQLError("A state with the same name already exists", { extensions: { code: "BAD_USER_INPUT" } });
        }

        updateData.name = args.input.name;
      }

      const teamIds = args.input.teamIds ?? [];
      if (teamIds.length > 0) {
        const teams = await ctx.prisma.team.findMany({
          select: { id: true },
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            id: { in: teamIds },
          },
        });
        updateData.teams = { set: teams };
      } else {
        updateData.teams = { set: [] };
      }

      const backupTeamIds = args.input.backupTeamIds ?? [];
      if (backupTeamIds.length > 0) {
        const backupTeams = await ctx.prisma.team.findMany({
          select: { id: true },
          where: {
            organizationId: (ctx.me as AuthRoleContext).organizationId,
            id: { in: backupTeamIds },
          },
        });
        updateData.backupTeams = { set: backupTeams };
      } else {
        updateData.backupTeams = { set: [] };
      }

      await ctx.prisma.workflowState.update({
        where: { id: workflowState.id },
        data: updateData as any,
      });

      return ctx.prisma.workflow.findUniqueOrThrow({
        ...query,
        where: { id: workflowState.workflow.id },
      });
    },
  }),
);
