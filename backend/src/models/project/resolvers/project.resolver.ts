import {
  Arg,
  Query,
  Resolver,
  Ctx,
  UseMiddleware,
  FieldResolver,
  Root,
  Int,
  Mutation,
  InputType,
  Field,
  registerEnumType,
} from "type-graphql";
import {
  Organization,
  Project,
  TicketStatus,
  ModelStage,
  Ticket,
  Role,
  TicketWorkflowState,
  Estimate,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import {
  ProjectGoalStats,
  ProjectTicket,
  TicketExport,
  ProjectGoalProgress,
  OpenTicketsByWorkflow,
  RoleWorkload,
  WorkflowDistribution,
} from "../entity";
import { Prisma, ScheduleItem } from "@prisma/client";
import {
  getTicketQueryForDone,
  getTicketQueryForDraft,
  getTicketQueryForEstimated,
  getTicketQueryForProject,
  getTicketQueryForInProgress,
  getTicketQueryForPublishedAndArchived,
  getTicketQueryForScheduled,
  getTicketQueryForUnassigned,
  getTicketQueryForUnestimated,
  getProjectDescendantIds,
  getProjectParentIds,
} from "../helper";
import {
  clamp,
  filter,
  groupBy,
  keyBy,
  map,
  max,
  orderBy,
  reduce,
  sum,
  uniq,
  values,
  without,
} from "lodash";
import {
  ChecklistItem,
  getRolePreferences,
  PaginatedTickets,
  updateRolePreferences,
} from "../../entities";
import { logger } from "../../../logger";
import { UserInputError } from "apollo-server-express";
import { getTicketSorting } from "../../ticket/helper";
import { paginateNodes } from "../../../utils/pagination";
import { addDays, subDays } from "date-fns";
import jwt from "jsonwebtoken";
import { config } from "../../../config";
import { DocumentToken } from "../../../hocuspocus/documentToken";

@InputType()
export class UpdateProjectChecklistInput {
  @Field()
  label: string;

  @Field((_type) => Boolean, { nullable: true })
  checked: boolean | null;
}

export enum ProjectTicketQueryCategory {
  Scheduled = "SCHEDULED",
  Draft = "DRAFT",
  InProgress = "IN_PROGRESS",
  Done = "Done",
  Estimated = "ESTIMATED",
  Unestimated = "UNESTIMATED",
  Unassigned = "UNASSIGNED",
}

registerEnumType(ProjectTicketQueryCategory, {
  name: "ProjectTicketQueryCategory",
});

@Resolver(Project)
export class ProjectResolver {
  @Query(() => Project)
  @UseMiddleware(hasRole())
  async project(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
    @Arg("visited", () => Boolean, { nullable: true }) visited: boolean,
  ): Promise<Project | null> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    // When the project is being visited (and not just requested),
    // add to the list of recently visited projects and
    // store it as the last visited project too.
    if (visited) {
      const role = await ctx.me.getRole();

      const preferences = getRolePreferences(role);

      const objectId = `project:${id}:${project.name}`;
      const recentlyVisited = [
        objectId,
        ...without(preferences.recentlyVisited, objectId),
      ];

      const updatedPreferences = updateRolePreferences(role, {
        lastProjectId: id,
        recentlyVisited: recentlyVisited.slice(0, 10),
      });

      await ctx.prisma.role.update({
        where: { id: ctx.me.roleId },
        data: { preferences: JSON.stringify(updatedPreferences) },
      });
    }

    return project;
  }

  /**
   * return the last project a user visited.
   *
   * - if no last project we'll return the last created project.
   * - if no project exist we'll return null
   */
  @Query(() => Project, { nullable: true })
  @UseMiddleware(hasRole())
  async myLastProject(
    @Ctx() ctx: AppContext<AuthRoleContext>,
  ): Promise<Project | null> {
    const preferences = getRolePreferences(await ctx.me.getRole());

    if (preferences.lastProjectId) {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: preferences.lastProjectId,
          organizationId: ctx.me.organizationId,
        },
      });

      if (project) {
        return project;
      }
    }

    return await ctx.prisma.project.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
        OR: [
          { stage: ModelStage.PUBLISHED, ancestorIsArchived: false },
          {
            stage: ModelStage.DRAFT,
            authorId: ctx.me.roleId,
            ancestorIsArchived: false,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * This token is used for by tiptap collaborative editor using
   * web socket.
   * It is valid for 15 minutes
   */
  @Query(() => String, { nullable: true })
  @UseMiddleware(hasRole())
  async projectTextAccessToken(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
  ): Promise<string> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    const readOnly = project.ancestorIsArchived || project.stage === "ARCHIVED";

    const accessToken: DocumentToken = {
      roleId: ctx.me.roleId,
      orgId: ctx.me.organizationId,
      documentId: project.id,
      documentType: "projectText",
      mode: readOnly ? "read" : "write",
    };

    logger.info(
      `creating access token for project ${project.name},\n${JSON.stringify(
        accessToken,
        null,
        2,
      )}`,
    );

    return jwt.sign(
      accessToken,
      config.sessionSecret,
      { expiresIn: 900 }, // Expire the token after 15 minutes.
    );
  }

  /**
   * This token is used for by text Slate Yjs editor using web socket.
   * It is valid for 15 minutes
   */
  @Query(() => String, { nullable: true })
  @UseMiddleware(hasRole())
  async projectAccessToken(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
  ): Promise<string> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    const readOnly = project.ancestorIsArchived || project.stage === "ARCHIVED";

    const accessToken: DocumentToken = {
      roleId: ctx.me.roleId,
      orgId: ctx.me.organizationId,
      documentId: project.id,
      documentType: "projectText",
      mode: readOnly ? "read" : "write",
    };

    logger.info(
      `creating access token for project ${project.name},\n${JSON.stringify(
        accessToken,
        null,
        2,
      )}`,
    );

    return jwt.sign(
      accessToken,
      config.sessionSecret,
      { expiresIn: 900 }, // Expire the token after 15 minutes.
    );
  }

  @Query(() => [TicketExport])
  @UseMiddleware(hasRole())
  async exportTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("sources", () => [String]) sources: string[],
  ): Promise<TicketExport[]> {
    // parse all the sources
    const ticketIds: number[] = [];
    const projectNames: string[] = [];

    for (const source of sources) {
      const [sourceType, sourceId] = source.split(":");

      switch (sourceType) {
        case "ticket":
          ticketIds.push(parseInt(sourceId, 10));
          break;
        case "project":
          projectNames.push(sourceId);
          break;
      }
    }

    const ticketWhere: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: { not: ModelStage.DELETED },
    };

    ticketWhere.OR = [
      { id: { in: ticketIds } },
      // TODO: allow for sub projects to be included
      {
        project: {
          organizationId: ctx.me.organizationId,
          name: { in: projectNames, mode: "insensitive" },
        },
      },
    ];

    // capture all the tickets
    const tickets = await ctx.prisma.ticket.findMany({
      where: ticketWhere,
      include: {
        product: true,
        owner: {
          include: {
            user: true,
          },
        },
        author: {
          include: {
            user: true,
          },
        },
        workflow: true,
        project: true,
        tags: true,
        successors: true,
        ancestors: true,
      },
    });

    return tickets.map(
      (ticket): TicketExport => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description ? ticket.description : "",
        created_at: ticket.createdAt.toISOString(),
        status: ticket.status,
        stage: ticket.stage,
        eta: ticket.eta ? ticket.eta.toISOString() : "",
        local_id:
          ticket.localId && ticket.product
            ? `${ticket.product.code}-${ticket.localId}`
            : "",
        product: ticket.product ? ticket.product.name : "",
        workflow: ticket.workflow ? ticket.workflow.name : "",
        owner_email: ticket.owner ? ticket.owner.user.email : "",
        owner_name: ticket.owner ? ticket.owner.name : "",
        project: ticket.project ? ticket.project.name : "",
        scheduled_at: ticket.scheduledAt
          ? ticket.scheduledAt.toISOString()
          : "",
        closed_at: ticket.closedAt ? ticket.closedAt.toISOString() : "",
        author_email: ticket.author ? ticket.author.user.email : "unknown",
        author_name: ticket.author ? ticket.author.name : "unknown",
        ancestor_tickets: ticket.ancestors.map(({ id }) => id).join(","),
        successor_tickets: ticket.successors.map(({ id }) => id).join(","),
        tags: ticket.tags.map(({ name }) => name).join(","),
      }),
    );
  }

  @Query(() => [ProjectTicket])
  @UseMiddleware(hasRole())
  async projectTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("name", () => String) name: string,
    @Arg("myDraft", () => Boolean, { nullable: true }) myDraft?: boolean,
    @Arg("statuses", () => [TicketStatus], { nullable: true })
    statuses?: TicketStatus[],
    @Arg("stages", () => [ModelStage], { nullable: true })
    stages?: ModelStage[],
  ): Promise<ProjectTicket[]> {
    const OR: Prisma.TicketWhereInput[] = [];

    const where: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: { not: ModelStage.DELETED },
      project: {
        name: { equals: name, mode: "insensitive" },
      },
      OR,
    };

    // Handle stage and status filtering
    if (statuses?.length) {
      for (const status of statuses) {
        OR!.push({
          stage: ModelStage.PUBLISHED,
          status: status,
        });
      }
    }

    if (stages?.length) {
      for (const stage of stages) {
        OR!.push({ stage });
      }
    }

    if (myDraft) {
      OR.push({
        stage: ModelStage.DRAFT,
        authorId: ctx.me.roleId,
      });
    }

    const tickets = await ctx.prisma.ticket.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tickets.map(
      (ticket): ProjectTicket => ({
        id: ticket.id,
        localId: ticket.localId || undefined,
        productCode: ticket.product?.code,
        title: ticket.title,
        createdAt: ticket.createdAt,
        stage: ticket.stage,
        status: ticket.status,
      }),
    );
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() project: Project,
  ): Promise<Organization> {
    if (project.organization) {
      return project.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: project.organizationId },
    });
  }

  @FieldResolver((_returns) => [Project])
  async ancestors(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() project: Project,
  ): Promise<Project[]> {
    const ancestorIds = await getProjectParentIds(project.id);

    return ctx.prisma.project.findMany({
      where: {
        id: { in: ancestorIds },
      },
    });
  }

  @FieldResolver((_returns) => [Ticket])
  async tickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() project: Project,
  ): Promise<Ticket[]> {
    if (project.tickets) {
      return project.tickets;
    }

    return await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        projectId: project.id,
        OR: [
          { stage: ModelStage.PUBLISHED },
          { stage: ModelStage.DRAFT, authorId: ctx.me.roleId },
        ],
      },
      include: {
        product: true,
        ticketWorkflowStates: true,
        workflow: true,
        author: true,
      },
    });
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async owner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() project: Project,
  ): Promise<Role | null> {
    if (project.ownerId) {
      if (project.owner) {
        return project.owner;
      }

      return ctx.prisma.role.findUniqueOrThrow({
        where: { id: project.ownerId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() project: Project,
  ): Promise<Role | null> {
    if (project.authorId) {
      if (project.author) {
        return project.author;
      }

      return ctx.prisma.role.findUniqueOrThrow({
        where: { id: project.authorId },
      });
    }

    return null;
  }

  @Query(() => PaginatedTickets)
  @UseMiddleware(hasRole())
  async projectTicketsForCategory(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int) projectId: number,
    @Arg("category", () => ProjectTicketQueryCategory)
    category: ProjectTicketQueryCategory,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("sort", () => String, { nullable: true }) sort: keyof Ticket,
  ): Promise<PaginatedTickets> {
    const project = await ctx.prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: ctx.me.organizationId,
      },
    });

    // default offset to be at the start (or the end
    // depending on direction)
    offset = offset ? offset : 0;

    // by default sort on createdAt
    sort = sort ? sort : "createdAt";

    // by default sort direction should be ascending
    const direction: Prisma.SortOrder = last
      ? Prisma.SortOrder.desc
      : Prisma.SortOrder.asc;

    // first (or last) X defines the number of item per project
    // the fallback is 10 if not provided
    const requestedPageSize = first || last || 10;
    const pageSize = clamp(requestedPageSize, 1, 50);

    let ticketQuery: Prisma.TicketWhereInput;
    switch (category) {
      case ProjectTicketQueryCategory.Scheduled:
        ticketQuery = await getTicketQueryForScheduled(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.Draft:
        ticketQuery = await getTicketQueryForDraft(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.Estimated:
        ticketQuery = await getTicketQueryForEstimated(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.Unestimated:
        ticketQuery = await getTicketQueryForUnestimated(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.Unassigned:
        ticketQuery = await getTicketQueryForUnassigned(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.InProgress:
        ticketQuery = await getTicketQueryForInProgress(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      case ProjectTicketQueryCategory.Done:
        ticketQuery = await getTicketQueryForDone(
          ctx.me.organizationId,
          project?.id,
        );
        break;
      default:
        throw new UserInputError(`category ${category} is not a valid option`);
    }

    const tickets = await ctx.prisma.ticket.findMany({
      where: ticketQuery,
      skip: offset,
      take: pageSize,
      orderBy: getTicketSorting(sort.toString(), direction),
      include: {
        ticketWorkflowStates: {
          where: { isActive: true },
          include: {
            assignee: true,
          },
        },
        scheduleItems: {
          include: {
            nextTicketWorkflowState: { include: { assignee: true } },
            ticketWorkflowState: true,
            role: true,
          },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        workflow: true,
        product: true,
      },
    });

    const count = await ctx.prisma.ticket.count({ where: ticketQuery });

    return paginateNodes({ nodes: tickets, offset, pageSize, count });
  }

  @FieldResolver((_returns) => [ChecklistItem])
  async checklist(@Root() project: Project): Promise<ChecklistItem[]> {
    try {
      return JSON.parse(project.checklist as string);
    } catch (e) {
      logger.error("Could not parse checklist on project ID %d", project.id, e);
      return [];
    }
  }

  @Mutation(() => Project)
  @UseMiddleware(hasRole())
  async setProjectChecklist(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("input", () => [UpdateProjectChecklistInput], { nullable: "items" })
    input: UpdateProjectChecklistInput[],
  ): Promise<Project> {
    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id: projectId,
        organizationId: ctx.me.organizationId,
      },
    });

    // we'll extract the progress count to allow for quicker stats
    return ctx.prisma.project.update({
      where: { id: project.id },
      data: {
        checklist: JSON.stringify(input),
      },
    });
  }

  @Query((_returns) => [ProjectGoalStats])
  async projectGoalStats(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
  ): Promise<ProjectGoalStats[]> {
    const projectQuery: Prisma.ProjectWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (projectId) {
      projectQuery.id = {
        in: [projectId, ...(await getProjectDescendantIds(projectId))],
      };
    }

    const subProjects = await ctx.prisma.project.findMany({
      where: projectQuery,
    });

    const scheduledTickets = await ctx.prisma.ticket.findMany({
      where: {
        stage: ModelStage.PUBLISHED,
        projectId: { in: subProjects.map((p) => p.id) },
      },
      include: { project: true },
    });

    return map(subProjects, (project): ProjectGoalStats => {
      const goalTickets = filter(scheduledTickets, { projectId: project.id });

      return {
        id: project.id,
        name: project.name,
        parentId: project.parentId,
        total: goalTickets.length,
        done: filter(goalTickets, { status: TicketStatus.DONE }).length,
        scheduled: filter(goalTickets, { status: TicketStatus.SCHEDULED })
          .length,
        unScheduled: filter(goalTickets, { status: TicketStatus.UNSCHEDULED })
          .length,
        cancelled: filter(goalTickets, { status: TicketStatus.CANCELLED })
          .length,
      };
    });
  }

  @Query(() => [Ticket])
  async deliveredTicketForPeriod(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<Ticket[]> {
    const where = await getTicketQueryForProject(
      ctx.me.organizationId,
      projectId,
    );

    return ctx.prisma.ticket.findMany({
      where: {
        ...where,
        closedAt: { gte: startDate, lt: stopDate },
        stage: ModelStage.PUBLISHED,
        status: { in: [TicketStatus.CANCELLED, TicketStatus.DONE] },
      },
      include: { product: true },
    });
  }

  @Query(() => [Ticket])
  async workedTicketForPeriod(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<Ticket[]> {
    const where = await getTicketQueryForProject(
      ctx.me.organizationId,
      projectId,
    );

    return ctx.prisma.ticket.findMany({
      where: {
        ...where,
        stage: ModelStage.PUBLISHED,
        scheduleItems: {
          some: {
            startedAt: { lt: stopDate },
            stoppedAt: { gte: startDate },
          },
        },
      },
      include: {
        product: true,
        ticketWorkflowStates: true,
        scheduleItems: {
          take: 1,
          orderBy: { startedAt: "desc" },
          include: {
            nextTicketWorkflowState: true,
            ticketWorkflowState: true,
          },
        },
      },
      orderBy: [{ closedAt: "asc" }, { eta: "asc" }],
    });
  }

  @Query(() => [Ticket])
  async scheduledTicketToBeWorked(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<Ticket[]> {
    const startEpoch = Math.round(startDate.getTime() / 1000);
    const stopEpoch = Math.round(stopDate.getTime() / 1000);

    // first we'll find the latest estimate
    const estimates = await ctx.prisma.$queryRaw<Estimate[]>(Prisma.sql`
        SELECT *
        FROM "Estimate"
        WHERE
          "organizationId" = ${ctx.me.organizationId} AND
          epoch = (
            SELECT epoch 
            FROM "Estimate" 
            WHERE "organizationId" = ${ctx.me.organizationId} 
            ORDER BY epoch DESC 
            LIMIT 1) AND
            "start" < ${stopEpoch} AND
            "end" > ${startEpoch}
        ORDER BY start ASC
      `);

    const ticketWorkflowStateIds = uniq(map(estimates, "id"));

    const where = await getTicketQueryForScheduled(
      ctx.me.organizationId,
      projectId,
    );

    return ctx.prisma.ticket.findMany({
      where: {
        ...where,
        ticketWorkflowStates: { some: { id: { in: ticketWorkflowStateIds } } },
      },
      include: {
        product: true,
        ticketWorkflowStates: true,
        scheduleItems: {
          take: 1,
          orderBy: { startedAt: "desc" },
          include: {
            nextTicketWorkflowState: true,
            ticketWorkflowState: true,
          },
        },
      },
      orderBy: {
        eta: "asc",
      },
    });
  }

  @Query(() => [Ticket])
  async scheduledTicketToBeClosing(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<Ticket[]> {
    const where = await getTicketQueryForScheduled(
      ctx.me.organizationId,
      projectId,
    );

    return ctx.prisma.ticket.findMany({
      where: { ...where, eta: { gte: startDate, lt: stopDate } },
      include: { product: true },
      orderBy: {
        eta: "asc",
      },
    });
  }

  @Query(() => [OpenTicketsByWorkflow])
  async ticketStatusHistogram(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<OpenTicketsByWorkflow[]> {
    const where = await getTicketQueryForProject(
      ctx.me.organizationId,
      projectId,
    );

    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        ...where,
        stage: ModelStage.PUBLISHED,
      },
      include: { workflow: true },
      orderBy: { scheduledAt: "asc" },
    });

    const ticketOpenByWorkflow: {
      [workflowId: number]: OpenTicketsByWorkflow;
    } = {};

    for (const ticket of tickets) {
      const workflow = ticket.workflow;
      if (workflow && !ticketOpenByWorkflow[workflow.id]) {
        ticketOpenByWorkflow[workflow.id] = {
          workflow,
          values: [
            {
              date: startDate,
              value: 0,
            },
          ],
        };
      }
    }

    // first cumulate all the the open and closed at the begining of the period
    for (const ticket of tickets) {
      if (ticket.workflow) {
        if (!ticketOpenByWorkflow[ticket.workflow.id]) {
          ticketOpenByWorkflow[ticket.workflow.id] = {
            workflow: ticket.workflow,
            values: [
              {
                date: startDate,
                value: 0,
              },
            ],
          };
        }

        const record = ticketOpenByWorkflow[ticket.workflow.id];

        if (ticket.scheduledAt && ticket.scheduledAt < startDate) {
          record.values[0].value += 1;
        }

        if (ticket.closedAt && ticket.closedAt < startDate) {
          record.values[0].value -= 1;
        }
      }
    }

    // build histogram for the period by iterating over every day of the
    // requested period
    let cursor = addDays(startDate, 1);
    const endPeriod = addDays(stopDate, 1);

    while (cursor < endPeriod) {
      // add a new record identical to the previous day for every workflows
      for (const workflowId in ticketOpenByWorkflow) {
        const record = ticketOpenByWorkflow[workflowId];

        record.values.push({
          date: cursor,
          value: record.values[record.values.length - 1].value,
        });
      }

      const nextCursor = addDays(cursor, 1);

      for (const ticket of tickets) {
        if (ticket.workflowId) {
          const record = ticketOpenByWorkflow[ticket.workflowId];

          if (!record) {
            throw new Error(
              `Could not find record for workflow ${ticket.workflowId}`,
            );
          }

          const lastValue = record.values[record.values.length - 1];

          if (
            ticket.scheduledAt &&
            ticket.scheduledAt > cursor &&
            ticket.scheduledAt < nextCursor
          ) {
            lastValue.value += 1;
          }

          if (
            ticket.closedAt &&
            ticket.closedAt > cursor &&
            ticket.closedAt < nextCursor
          ) {
            lastValue.value -= 1;
          }
        }
      }

      cursor = nextCursor;
    }

    return values(ticketOpenByWorkflow);
  }

  @Query(() => [RoleWorkload], { deprecationReason: "Not useful" })
  async projectedWorkload(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<RoleWorkload[]> {
    const lastEpoch = await ctx.prisma.estimate.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
      },
      orderBy: { epoch: "desc" },
    });

    if (!lastEpoch) {
      return [];
    }

    const where = await getTicketQueryForScheduled(
      ctx.me.organizationId,
      projectId,
    );
    const scheduledTickets = await ctx.prisma.ticket.findMany({
      where,
      include: { ticketWorkflowStates: { where: { isActive: true } } },
    });

    const ticketWorkflowStates = reduce(
      scheduledTickets,
      (acc: TicketWorkflowState[], ticket) => [
        ...ticket.ticketWorkflowStates,
        ...acc,
      ],
      [],
    );
    const ticketWorkflowStateIds = map(ticketWorkflowStates, "id");
    const ticketWorkflowStateById = keyBy(ticketWorkflowStates, "id");

    const startEpoch = Math.round(startDate.getTime() / 1000);
    const stopEpoch = Math.round(stopDate.getTime() / 1000);

    const estimates = await ctx.prisma.estimate.findMany({
      where: {
        id: { in: ticketWorkflowStateIds },
        epoch: lastEpoch.epoch,
        AND: [
          { start_p80: { lt: stopEpoch } },
          { end_p80: { gt: startEpoch } },
        ],
      },
      include: {
        assignee: true,
      },
    });

    const timeSpentPerAssignee = groupBy(estimates, "assigneeId");

    return map(timeSpentPerAssignee, (estimates): RoleWorkload => {
      return {
        role: estimates[0].assignee,
        hours: reduce(
          estimates,
          (acc, estimate): number => {
            const state = ticketWorkflowStateById[estimate.id];
            let pert =
              (state.estimateMinimum! +
                state.estimateMaximum! +
                state.estimateMostLikely! * 4) /
              6;

            // small adjustment, if the estimate overlaps
            // over the whole time period, we'll only
            // use a third of it, two third if we overlap
            // only on one side
            if (
              estimate.start_p80 < startEpoch &&
              estimate.end_p80 > stopEpoch
            ) {
              pert = pert / 3;
            } else if (estimate.start_p80 < startEpoch) {
              pert = (pert * 2) / 3;
            } else if (estimate.end_p80 > stopEpoch) {
              pert = (pert * 2) / 3;
            }

            return acc + pert / 3600;
          },
          0,
        ),
      };
    });
  }

  @Query(() => [ProjectGoalProgress])
  async pastGoalProgress(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<ProjectGoalProgress[]> {
    // the ticket query will capture all the data that we might need
    // for the computation of the projections, this should improve
    // efficiency of what should be a pretty costly query
    const ticketWhere: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: ModelStage.PUBLISHED,
    };

    // optimize the project Ids search by querying once for both the ticket query
    // and the project query
    const projectIds = projectId
      ? [projectId, ...(await getProjectDescendantIds(projectId))]
      : null;

    if (projectIds) {
      ticketWhere.projectId = { in: projectIds };
    }

    const allTickets = await ctx.prisma.ticket.findMany({
      where: ticketWhere,
      include: {
        project: true,
        ticketWorkflowStates: { where: { isActive: true } },
        scheduleItems: {
          where: {
            startedAt: { gte: subDays(startDate, 14) },
          },
        },
      },
    });

    // let's capture all the projects. We cannot use the tickets query because
    // if a project does not have any matching tickets it could be missing
    const projectQuery: Prisma.ProjectWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (projectIds) {
      projectQuery.id = { in: projectIds };
    }

    const subProjects = await ctx.prisma.project.findMany({
      where: projectQuery,
    });

    // extract all the paths from the already queried tickets and construct any
    // missing one. This is because, if we had only one project with a path
    // being "/feature/ticket/bugs" then "/feature" and "/feature/ticket" would not
    // be listed.
    // const paths = reduce(
    //   subProjects,
    //   (acc: string[], project) => {
    //     const pathFragment: string[] = [];

    //     for (const subProject of project.path.split("/")) {
    //       pathFragment.push(subProject);
    //     }

    //     if (acc.indexOf(pathFragment.join("/")) === -1) {
    //       acc.push(pathFragment.join("/"));
    //     }
    //     return acc;
    //   },
    //   []
    // );

    return subProjects.map((project): ProjectGoalProgress => {
      // lets get all the tickets and their workflow states within the set project
      // This will let us account for the work that has been done
      const tickets = allTickets.filter((t) => t.projectId === project.id);

      const goalProgress: ProjectGoalProgress = {
        name: project.name,
        id: project.id,
        parentId: project.parentId,
        progress: 0,
        accomplished: 0,
        total: 0,
        eta: max(map(tickets, "eta")) || new Date(),
      };

      for (const ticket of tickets) {
        const ticketScheduleItems = orderBy(
          ticket.scheduleItems,
          "stoppedAt",
          "asc",
        );

        const ticketWorkflowStates = orderBy(
          ticket.ticketWorkflowStates,
          "position",
          "asc",
        );

        const ticketWorkflowStateById = keyBy(
          ticket.ticketWorkflowStates,
          "id",
        );

        // ignore cancelled tickets
        if (ticket.status === TicketStatus.CANCELLED) {
          continue;
        }

        // ticket is not done
        let lastPosition = 0;

        // cumulate all the work done so far
        for (const scheduleItem of ticketScheduleItems) {
          // ignore items that happened in the future
          if (scheduleItem.startedAt > stopDate) {
            continue;
          }

          scheduleItem.stoppedAt
            ? scheduleItem.stoppedAt.getTime()
            : new Date().getTime();

          const stoppedAt = Math.min(
            new Date().getTime(),
            scheduleItem.stoppedAt
              ? scheduleItem.stoppedAt.getTime()
              : new Date().getTime(),
          );

          // make sure we don't account for more than our observation window
          const timeSpent = stoppedAt - scheduleItem.startedAt.getTime();

          if (scheduleItem.startedAt > startDate) {
            // convert ms in seconds
            goalProgress.progress += timeSpent / 1000;
            goalProgress.total += timeSpent / 1000;
          } else {
            // convert ms in seconds
            goalProgress.accomplished += timeSpent / 1000;
            goalProgress.total += timeSpent / 1000;
          }

          // update the last known position in the set of
          // ticket workflow states
          lastPosition =
            ticketWorkflowStateById[
              scheduleItem.nextTicketWorkflowStateId
                ? scheduleItem.nextTicketWorkflowStateId
                : scheduleItem.ticketWorkflowStateId
            ].position;
        }

        // if there is some more work done on this ticket, we'll
        // try to account for how much more there is to do
        if (ticket.status === TicketStatus.SCHEDULED) {
          // add the predictions to the total, using the estimate on
          // the ticketWorkflowState not yet achieved
          for (const state of ticketWorkflowStates) {
            if (state.position >= lastPosition) {
              goalProgress.total +=
                (state.estimateMinimum! +
                  state.estimateMaximum! +
                  state.estimateMostLikely! * 4) /
                6;
            }
          }
        }
      }

      return goalProgress;
    });
  }

  @Query(() => [ProjectGoalProgress])
  async projectedGoalProgress(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<ProjectGoalProgress[]> {
    // we need to remove the start date action
    if (startDate) {
      // do nothing
    }

    const stopEpoch = Math.round(stopDate.getTime() / 1000);
    const startEpoch = Math.round(startDate.getTime() / 1000);

    // check if there is at least one set of estimates that has been generated
    const lastEpoch = await ctx.prisma.estimate.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
      },
      orderBy: { epoch: "desc" },
    });

    // if we don't have any estimate to use, then we cannot make any projection
    if (!lastEpoch) {
      return [];
    }

    // the ticket query will capture all the data that we might need
    // (aside from estimates) for the computation of the projections
    // this should improve efficiency of a pretty costly
    const ticketWhere: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      stage: ModelStage.PUBLISHED,
    };

    // optimize the project Ids search by querying once for both the ticket query
    // and the project query
    const projectIds = projectId
      ? [projectId, ...(await getProjectDescendantIds(projectId))]
      : null;

    if (projectIds) {
      ticketWhere.projectId = { in: projectIds };
    }

    const allTickets = await ctx.prisma.ticket.findMany({
      where: ticketWhere,
      include: {
        project: true,
        ticketWorkflowStates: { where: { isActive: true } },
        scheduleItems: {
          where: {
            startedAt: { gte: subDays(startDate, 14) },
            OR: [{ stoppedAt: null }, { stoppedAt: { lte: new Date() } }],
          },
        },
      },
    });

    console.log({
      where: ticketWhere,
      include: {
        project: true,
        ticketWorkflowStates: { where: { isActive: true } },
        scheduleItems: {
          where: {
            startedAt: { gte: subDays(startDate, 14) },
            OR: [{ stoppedAt: null }, { stoppedAt: { lte: new Date() } }],
          },
        },
      },
    });

    // let's capture all the projects. We cannot use the tickets query because
    // if a project does not have any matching tickets it will be missing
    const projectQuery: Prisma.ProjectWhereInput = {
      organizationId: ctx.me.organizationId,
    };

    if (projectIds) {
      projectQuery.id = { in: projectIds };
    }

    const subProjects = await ctx.prisma.project.findMany({
      where: projectQuery,
    });

    // We will need the estimates for every workflow state, including the dates
    // when we expect them to start and finish
    const allEstimates = await ctx.prisma.estimate.findMany({
      where: {
        epoch: lastEpoch.epoch,
        AND: [{ start: { lt: stopEpoch } }, { end: { gt: startEpoch } }],
      },
    });

    return subProjects.map((project): ProjectGoalProgress => {
      // lets get all the tickets and their workflow states within the set project
      // This will let us account for the work that has been done
      const tickets = allTickets.filter((t) => t.projectId === project.id);

      // For every goals, we'll compute:
      // - the hours of work that has been done prior to the set time period
      // - the hours of work expected for the given time period
      // - the total hours of work for the all the ticket in the project (so we can get %)
      const previousWork = reduce(
        tickets,
        (acc: ScheduleItem[], ticket) => {
          return [...acc, ...ticket.scheduleItems];
        },
        [],
      );

      // for every project, we compute how much time has already been spent
      // prior to the current window start time
      const timeSpent = sum(
        map(previousWork, (scheduleItem): number => {
          const stopEpoch = scheduleItem.stoppedAt
            ? scheduleItem.stoppedAt.getTime()
            : new Date().getTime();

          return (stopEpoch - scheduleItem.startedAt.getTime()) / 1000;
        }),
      );

      // we will sum the values in the goalProgress object as we iterate through
      // the tickets in the project
      const goalProgress: ProjectGoalProgress = {
        name: project.name,
        id: project.id,
        parentId: project.parentId,
        progress: 0,
        accomplished: timeSpent,
        total: timeSpent,
        eta: max(map(tickets, "eta")) || new Date(),
      };

      for (const ticket of tickets) {
        // we are sorting the schedule items, aka the record of work
        // so we know which on is the last one and on which workflow
        // state we last worked on
        const ticketScheduleItems = orderBy(
          ticket.scheduleItems,
          "stoppedAt",
          "asc",
        );

        // Workflow states also need to be sorted, so if we worked on
        // a given workflow states ID, we know that the ones that follow
        // it will have to be accounted as future work
        const ticketWorkflowStates = orderBy(
          ticket.ticketWorkflowStates,
          "position",
          "asc",
        );

        const ticketWorkflowStateById = keyBy(
          ticket.ticketWorkflowStates,
          "id",
        );

        // ticket is not done, we will sum the hours predicted to finish the work
        if (ticket.status === TicketStatus.SCHEDULED) {
          // find the last position in the workflow states by going through
          // its work history (ticketScheduleItems)
          let lastPosition = 0;
          for (const scheduleItem of ticketScheduleItems) {
            // note that we do a distinction between the status of the state
            // where if we are done with a state: if nextTicketWorkflowStateId
            // is present we'll use it at the starting point.
            lastPosition =
              ticketWorkflowStateById[
                scheduleItem.nextTicketWorkflowStateId
                  ? scheduleItem.nextTicketWorkflowStateId
                  : scheduleItem.ticketWorkflowStateId
              ].position;
          }

          // add the predictions for the total work to be done, using the estimate on
          // the ticketWorkflowState not yet achieved
          for (const state of ticketWorkflowStates) {
            if (state.position >= lastPosition) {
              // this is the dummy compute formula for a triangular PERT
              // it returns a pretty good estimate for the ticket's state
              goalProgress.total +=
                (state.estimateMinimum! +
                  state.estimateMaximum! +
                  state.estimateMostLikely! * 4) /
                6;
            }
          }
        }
      }

      // We now need to project how much progress will be done during the
      // provided time period
      const ticketWorkflowStates = reduce(
        tickets,
        (acc: TicketWorkflowState[], ticket) => [
          ...acc,
          ...ticket.ticketWorkflowStates,
        ],
        [],
      );

      const ticketWorkflowStateById = keyBy(ticketWorkflowStates, "id");
      const ticketWorkflowStateIds = map(ticketWorkflowStates, "id");

      const estimates = allEstimates.filter(
        (estimate) => ticketWorkflowStateIds.indexOf(estimate.id) > -1,
      );

      for (const estimate of estimates) {
        const state = ticketWorkflowStateById[estimate.id];

        let pert =
          (state.estimateMinimum! +
            state.estimateMaximum! +
            state.estimateMostLikely! * 4) /
          6;

        // This is a dummy approach to improving projected estimates by
        // reducing the amount of projected work if some of the work
        // occurs outside of the current time window:
        //
        // - if the projected work overlaps start and end period: use only 1/3
        // - if the projected end date is after the period: use 2/3
        // - if the projected start date is before the period: use 2/3
        if (estimate.start_p80 < startEpoch && estimate.end_p80 > stopEpoch) {
          pert = pert / 3;
        } else if (estimate.start_p80 < startEpoch) {
          pert = (pert * 2) / 3;
        } else if (estimate.end_p80 > stopEpoch) {
          pert = (pert * 2) / 3;
        }

        goalProgress.progress += pert;
      }

      return goalProgress;
    });
  }

  @Query(() => [WorkflowDistribution])
  async projectedWorkflowDistribution(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<WorkflowDistribution[]> {
    const lastEpoch = await ctx.prisma.estimate.findFirst({
      where: {
        organizationId: ctx.me.organizationId,
      },
      orderBy: { epoch: "desc" },
    });

    if (!lastEpoch) {
      return [];
    }

    const where = await getTicketQueryForScheduled(
      ctx.me.organizationId,
      projectId,
    );

    const scheduledTickets = await ctx.prisma.ticket.findMany({
      where,
      include: {
        ticketWorkflowStates: { where: { isActive: true } },
        workflow: true,
      },
    });

    const ticketWorkflowStates = reduce(
      scheduledTickets,
      (acc: TicketWorkflowState[], ticket) => [
        ...ticket.ticketWorkflowStates,
        ...acc,
      ],
      [],
    );
    const ticketWorkflowStateIds = map(ticketWorkflowStates, "id");

    const startEpoch = Math.round(startDate.getTime() / 1000);
    const stopEpoch = Math.round(stopDate.getTime() / 1000);

    const estimates = await ctx.prisma.estimate.findMany({
      where: {
        id: { in: ticketWorkflowStateIds },
        epoch: lastEpoch.epoch,
        AND: [{ start: { lt: stopEpoch } }, { end: { gt: startEpoch } }],
      },
    });

    const estimateById = keyBy(estimates, "id");
    const distributionByWorkflow: {
      [workflowId: number]: WorkflowDistribution;
    } = {};

    for (const ticket of scheduledTickets) {
      for (const state of ticket.ticketWorkflowStates) {
        if (state.id in estimateById) {
          const estimate = estimateById[state.id];
          let pert =
            (state.estimateMinimum! +
              state.estimateMaximum! +
              state.estimateMostLikely! * 4) /
            6;

          // TODO: we need a more accurate approach here
          // small adjustment, if the estimate overlaps
          // over the whole time period, we'll only
          // use a third of it, two third if we overlap
          // only on one side
          if (estimate.start_p80 < startEpoch && estimate.end_p80 > stopEpoch) {
            pert = pert / 3;
          } else if (estimate.start_p80 < startEpoch) {
            pert = (pert * 2) / 3;
          } else if (estimate.end_p80 > stopEpoch) {
            pert = (pert * 2) / 3;
          }

          if (ticket.workflow) {
            if (!distributionByWorkflow[ticket.workflow.id]) {
              // add empty workflow if none exist
              distributionByWorkflow[ticket.workflow.id] = {
                workflow: ticket.workflow,
                hours: 0,
              };
            }

            distributionByWorkflow[ticket.workflow.id].hours += pert / 3600;
          }
        }
      }
    }

    return values(distributionByWorkflow);
  }

  @Query(() => [WorkflowDistribution])
  async pastWorkflowDistribution(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("projectId", () => Int)
    projectId: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("stopDate")
    stopDate: Date,
  ): Promise<WorkflowDistribution[]> {
    const whereTickets = await getTicketQueryForPublishedAndArchived(
      ctx.me.organizationId,
      projectId,
    );

    const scheduledItems = await ctx.prisma.scheduleItem.findMany({
      where: {
        ticket: whereTickets,
        startedAt: { lt: stopDate },
        OR: [{ stoppedAt: { gt: startDate } }, { stoppedAt: null }],
      },
      include: {
        ticket: {
          select: {
            workflow: true,
          },
        },
      },
    });

    const workflowDistributionById: {
      [workflowId: number]: WorkflowDistribution;
    } = {};

    for (const scheduledItem of scheduledItems) {
      const workflow = scheduledItem.ticket.workflow;

      if (!workflow) {
        continue;
      }

      if (!workflowDistributionById[workflow.id]) {
        workflowDistributionById[workflow.id] = {
          workflow,
          hours: 0,
        };
      }

      const timeSpent = scheduledItem.stoppedAt
        ? scheduledItem.stoppedAt.getTime() - scheduledItem.startedAt.getTime()
        : new Date().getTime() - scheduledItem.startedAt.getTime();

      workflowDistributionById[workflow.id].hours += timeSpent / 3600000;
    }

    return values(workflowDistributionById);
  }
}
