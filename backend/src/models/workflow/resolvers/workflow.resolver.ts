import {
  Arg,
  Query,
  Resolver,
  Int,
  FieldResolver,
  Root,
  Ctx,
  UseMiddleware,
  Mutation,
  InputType,
  Field,
  registerEnumType,
} from "type-graphql";
import {
  Workflow,
  WorkflowState,
  RoleType,
  Organization,
  Product,
  ModelStage,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { Length } from "class-validator";
import { UserInputError } from "apollo-server-express";
import { sortBy, map, forEach, get } from "lodash";
import { findWorkflowStateByName } from "../helper";
import { Prisma } from ".prisma/client";

@InputType()
class CreateWorkflowStateInput {
  @Field()
  @Length(1, 128)
  name: string;
}

@InputType()
class UpdateWorkflowStateInput {
  @Field()
  @Length(1, 128)
  name: string;

  @Field(() => [Int!], { nullable: true })
  teamIds: number[];

  @Field(() => [Int!], { nullable: true })
  backupTeamIds: number[];
}

// Use to move state
export enum WorkflowStateDirection {
  up = "UP",
  down = "DOWN",
  first = "FIRST",
  last = "LAST",
}
registerEnumType(WorkflowStateDirection, {
  name: "WorkflowStateDirection",
  description: "Used to move a state amongst a workflow",
});

@Resolver(Workflow)
export class WorkflowResolver {
  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async addWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowId", () => Int)
    workflowId: number,
    @Arg("input")
    input: CreateWorkflowStateInput
  ): Promise<Workflow> {
    const workflow = await ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id: workflowId,
        organizationId: ctx.me.organizationId,
      },
    });

    // When a state is created we don't want to accept an
    // existing state name (within the same workflow)
    const sameNameWorkflowState = await findWorkflowStateByName(
      input.name,
      workflowId
    );

    if (sameNameWorkflowState) {
      throw new UserInputError("A state with the same name already exists");
    }

    const lastState = await ctx.prisma.workflowState.findFirst({
      where: { workflowId },
      orderBy: { position: "desc" },
    });

    await ctx.prisma.workflowState.create({
      data: {
        ...input,
        workflowId,
        organizationId: ctx.me.organizationId,
        position: lastState ? lastState.position + 1 : 0,
      },
    });

    return workflow;
  }

  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async deleteWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowStateId", () => Int)
    workflowStateId: number
  ): Promise<Workflow> {
    const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
      where: {
        id: workflowStateId,
        workflow: {
          organizationId: ctx.me.organizationId,
        },
      },
      include: {
        workflow: {
          include: {
            workflowStates: true,
          },
        },
      },
    });

    // we don't want to end up with workflow with no state, this would
    // just be silly UX...
    if (workflowState.workflow.workflowStates.length === 1) {
      throw new UserInputError("A workflow requires at least one state");
    }

    await ctx.prisma.workflowState.delete({
      where: { id: workflowState.id },
    });

    return ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id: workflowState.workflowId,
        organizationId: ctx.me.organizationId,
      },
      include: {
        workflowStates: true,
      },
    });
  }

  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async moveWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowStateId", () => Int)
    workflowStateId: number,
    @Arg("direction", (_type) => WorkflowStateDirection)
    direction: WorkflowStateDirection
  ) {
    const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
      where: {
        id: workflowStateId,
        workflow: {
          organizationId: ctx.me.organizationId,
        },
      },
      include: { workflow: { include: { workflowStates: true } } },
    });

    const states = sortBy(workflowState.workflow.workflowStates, "position");

    forEach(states, (state, index) => {
      const pos = (index + 1) * 2;
      if (state.id === workflowStateId) {
        switch (direction) {
          case WorkflowStateDirection.first:
            state.position = 0;
            break;
          case WorkflowStateDirection.last:
            state.position = states.length * 2;
            break;
          case WorkflowStateDirection.up:
            state.position = pos - 3;
            break;
          case WorkflowStateDirection.down:
            state.position = pos + 3;
            break;
          default:
            throw new UserInputError("Unrecognized direction");
        }
      } else {
        state.position = pos;
      }
    });

    // normalization of position
    forEach(sortBy(states, "position"), (state, index) => {
      state.position = index + 1;
    });

    await Promise.all(
      map(states, (state) =>
        ctx.prisma.workflowState.update({
          where: { id: state.id },
          data: { position: state.position },
        })
      )
    );

    return workflowState.workflow;
  }

  @Mutation(() => Workflow)
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("workflowStateId", () => Int)
    workflowStateId: number,
    @Arg("input")
    input: UpdateWorkflowStateInput
  ): Promise<Workflow> {
    const workflowState = await ctx.prisma.workflowState.findFirstOrThrow({
      where: {
        id: workflowStateId,
        workflow: {
          organizationId: ctx.me.organizationId,
        },
      },
      include: { workflow: true },
    });

    const updateData: Prisma.WorkflowStateUpdateInput = {};

    // When a state name is changed we don't want to take an
    // existing one (within the same workflow)
    if (input.name !== workflowState.name) {
      const sameNameWorkflowState = await findWorkflowStateByName(
        input.name,
        workflowState.workflow.id
      );

      if (
        sameNameWorkflowState &&
        sameNameWorkflowState.id !== workflowState.id
      ) {
        throw new UserInputError("A state with the same name already exists");
      }

      updateData.name = input.name;
    }

    const teamIds = get(input, "teamIds", []);
    if (teamIds.length > 0) {
      const teams = await ctx.prisma.team.findMany({
        select: { id: true },
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: teamIds },
        },
      });

      updateData.teams = { set: teams };
    } else {
      updateData.teams = { set: [] };
    }

    const backupTeamIds = get(input, "backupTeamIds", []);
    if (backupTeamIds.length > 0) {
      const backupTeams = await ctx.prisma.team.findMany({
        select: { id: true },
        where: {
          organizationId: ctx.me.organizationId,
          id: { in: backupTeamIds },
        },
      });

      updateData.teams = { set: backupTeams };
    } else {
      updateData.teams = { set: [] };
    }

    await ctx.prisma.workflowState.update({
      where: { id: workflowState.id },
      data: updateData as any, // temporary fix for "Excessive stack depth comparing types"
    });

    return workflowState.workflow;
  }

  @Query(() => Workflow)
  @UseMiddleware(hasRole())
  async workflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<Workflow> {
    return await ctx.prisma.workflow.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
      include: {
        workflowStates: true,
      },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() workflow: Workflow
  ): Promise<Organization> {
    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: workflow.organizationId },
    });
  }

  @FieldResolver(() => [Product])
  async products(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() workflow: Workflow
  ): Promise<Product[]> {
    if (workflow.products) {
      return workflow.products;
    }

    return ctx.prisma.product.findMany({
      where: {
        stage: { not: ModelStage.DELETED },
        workflows: {
          some: { id: workflow.id },
        },
      },
    });
  }

  @FieldResolver((_returns) => [WorkflowState])
  async states(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() workflow: Workflow
  ): Promise<WorkflowState[]> {
    if (workflow.workflowStates) {
      return sortBy(workflow.workflowStates, "position");
    } else {
      return ctx.prisma.workflowState.findMany({
        where: { workflowId: workflow.id },
        orderBy: { position: "asc" },
      });
    }
  }
}
