import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { Team, WorkflowState } from "@generated/type-graphql";

// @ObjectType()
// class ObjectStatisticalModel implements StatisticalModel {
//   @Field()
//   type: "normal";

//   @Field((_type) => Float)
//   variance: number;

//   @Field((_type) => Float)
//   stdev: number;

//   @Field((_type) => Float)
//   mean: number;

//   @Field((_type) => Float)
//   mu: number;

//   @Field((_type) => Float)
//   sigma: number;

//   @Field((_type) => Float)
//   n: number;
// }

// class StatisticalRegression implements StatisticalRegression {
//   @Field()
//   type: "linear";
//   @Field((_type) => Float)
//   rmsd: number;
//   @Field((_type) => Float)
//   n: number;
//   @Field((_type) => Float)
//   m: number;
//   @Field((_type) => Float)
//   b: number;
//   @Field((_type) => Float)
//   coeff: number;
// }

// @ObjectType()
// class Models {
//   @Field((_type) => ObjectStatisticalModel)
//   model: string;
// }

// @ObjectType()
// class CorrelationData {
//   @Field((_type) => Int)
//   id: number;

//   @Field((_type) => Int)
//   roleId: number;

//   @Field((_type) => Int)
//   productId: number;

//   @Field((_type) => Int)
//   difficulty: number;

//   @Field((_type) => Float)
//   elapsed: number;

//   @Field((_type) => Int)
//   workflowStateId: number;

//   @Field((_type) => Int)
//   workflowId: number;

//   @Field((_type) => Int, { nullable: true })
//   featureId: number;
// }

@Resolver(WorkflowState)
export class WorkflowStateResolver {
  @Query(() => WorkflowState)
  @UseMiddleware(hasRole())
  async workflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<WorkflowState> {
    return ctx.prisma.workflowState.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
      },
    });
  }

  @FieldResolver(() => [Team])
  async teams(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() workflowState: WorkflowState
  ): Promise<Team[]> {
    if (workflowState.teams) {
      return workflowState.teams;
    }

    return ctx.prisma.team.findMany({
      where: {
        workflowStates: { some: { id: workflowState.id } },
      },
    });
  }

  @FieldResolver(() => [Team])
  async backupTeams(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() workflowState: WorkflowState
  ): Promise<Team[]> {
    if (workflowState.backupTeams) {
      return workflowState.backupTeams;
    }

    return ctx.prisma.team.findMany({
      where: {
        workflowStatesAsBackup: { some: { id: workflowState.id } },
      },
    });
  }

  // @FieldResolver((_returns) => [CorrelationData])
  // async analyse(
  //   @Root() workflowState: WorkflowState
  // ): Promise<CorrelationData[]> {
  //   const correlationDataQuery = this.scheduleItemRepository
  //     .createQueryBuilder("scheduleItem")
  //     .select(
  //       'extract(epoch from SUM("scheduleItem"."stoppedAt" - "scheduleItem"."startedAt"))',
  //       "elapsed"
  //     )
  //     .addSelect('"scheduleItem"."ticketWorkflowStateId"', "id")
  //     .addSelect('"ticketWorkflowState"."workflowStateId"', "workflowStateId")
  //     .addSelect("scheduleItem.roleId", "roleId")
  //     .addSelect("ticket.workflowId", "workflowId")
  //     .addSelect("ticket.productId", "productId")
  //     .addSelect("ticket.difficulty", "difficulty")
  //     .addSelect("feature.id", "featureId")
  //     .leftJoin("scheduleItem.ticketWorkflowState", "ticketWorkflowState")
  //     .leftJoin("scheduleItem.ticket", "ticket")
  //     .leftJoin("ticket.features", "feature")
  //     .where(
  //       '"ticketWorkflowState"."workflowStateId" = :workflowStateId ' +
  //         'AND "ticket"."status" = :ticketStatus ' +
  //         'AND "scheduleItem"."stoppedAt" IS NOT NULL',
  //       { workflowStateId: workflowState.id, ticketStatus: TicketStatus.closed }
  //     )
  //     .groupBy('"ticketWorkflowState"."workflowStateId"')
  //     .addGroupBy('"scheduleItem"."ticketWorkflowStateId"')
  //     .addGroupBy('"scheduleItem"."roleId"')
  //     // .addGroupBy('"scheduleItem"."ticketId"')
  //     .addGroupBy('"ticket"."productId"')
  //     .addGroupBy('"ticket"."workflowId"')
  //     .addGroupBy('"ticket".difficulty')
  //     .addGroupBy('"feature".id');

  //   return correlationDataQuery.getRawMany<CorrelationData>();
  // }

  // @FieldResolver((_returns) => Models)
  // async correlation(@Root() workflowState: WorkflowState): Promise<Models> {
  //   const completeDataSet = (await this.scheduleItemRepository
  //     .createQueryBuilder("scheduleItem")
  //     .select(
  //       'extract(epoch from SUM("scheduleItem"."stoppedAt" - "scheduleItem"."startedAt"))',
  //       "elapsed"
  //     )
  //     .addSelect(
  //       '"scheduleItem"."ticketWorkflowStateId"',
  //       "ticketWorkflowStateId"
  //     )
  //     .addSelect('"ticketWorkflowState"."workflowStateId"', "workflowStateId")
  //     .addSelect("scheduleItem.roleId", "roleId")
  //     .addSelect("ticket.productId", "productId")
  //     .addSelect("ticket.difficulty", "difficulty")
  //     .addSelect("feature.id", "featureId")
  //     .addSelect('feature."featureGroupId"', "featureGroupId")
  //     .leftJoin("scheduleItem.ticketWorkflowState", "ticketWorkflowState")
  //     .leftJoin("scheduleItem.ticket", "ticket")
  //     .leftJoin("ticket.features", "feature")
  //     .where(
  //       '"ticketWorkflowState"."workflowStateId" = :workflowStateId ' +
  //         'AND "ticket"."status" = :ticketStatus ' +
  //         'AND "scheduleItem"."stoppedAt" IS NOT NULL',
  //       { workflowStateId: workflowState.id, ticketStatus: TicketStatus.closed }
  //     )
  //     .groupBy('"ticketWorkflowState"."workflowStateId"')
  //     .addGroupBy('"scheduleItem"."ticketWorkflowStateId"')
  //     .addGroupBy('"scheduleItem"."roleId"')
  //     // .addGroupBy('"scheduleItem"."ticketId"')
  //     .addGroupBy('"ticket"."productId"')
  //     .addGroupBy('"ticket".difficulty')
  //     .addGroupBy('"feature".id')
  //     .addGroupBy('feature."featureGroupId"')
  //     .printSql()
  //     .getRawMany()) as TaskCorrelationData[];

  //   // console.log(JSON.stringify(values, null, 2));

  //   console.log(JSON.stringify(x));

  //   return x;
  // }
}
