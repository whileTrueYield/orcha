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
import {
  Organization,
  User,
  Team,
  RoleEmail,
  Role,
  ModelStage,
  RoleStartReminder,
  Project,
  RoleAutoResume,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import {
  EMPTY_WORK_WEEK,
  getRolePreferences,
  HabitProductWorkflow,
  RoleHabit,
  RolePreferences,
  WorkWeekTime,
} from "../entity";
import { getNextWorkDayStartDate } from "../jobs/workDayEmail";
import { map, orderBy } from "lodash";
import { getNextReminderStartDate } from "../jobs/startReminder";
import { config } from "../../../config";

@Resolver(Role)
export class RoleResolver {
  @Query(() => Role)
  @UseMiddleware(hasRole())
  async role(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int!) id: number,
  ): Promise<Role> {
    return await ctx.prisma.role.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id,
      },
      include: { user: true, organization: true },
    });
  }

  @Query(() => Role)
  @UseMiddleware(hasRole())
  async myRole(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<Role> {
    return ctx.me.getRole();
  }

  @FieldResolver(() => User)
  async user(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<User> {
    if (role.user) {
      return role.user;
    }

    return ctx.prisma.user.findUniqueOrThrow({
      where: { id: role.userId },
    });
  }

  @FieldResolver(() => [Team])
  async teams(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<Team[]> {
    return ctx.prisma.team.findMany({
      where: {
        members: { some: { id: role.id } },
      },
    });
  }

  @FieldResolver(() => [Project])
  async pinnedProjects(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<Project[]> {
    return ctx.prisma.project.findMany({
      where: {
        pinnedByRoles: { some: { id: role.id } },
      },
    });
  }

  @FieldResolver(() => WorkWeekTime)
  async workWeek(@Root() role: Role): Promise<WorkWeekTime> {
    if (role.workWeek) {
      return { ...EMPTY_WORK_WEEK, ...JSON.parse(role.workWeek) };
    } else {
      return EMPTY_WORK_WEEK;
    }
  }

  @FieldResolver(() => RolePreferences)
  async preferences(@Root() role: Role): Promise<RolePreferences> {
    return getRolePreferences(role);
  }

  @Query(() => RoleHabit)
  @UseMiddleware(hasRole())
  async habits(@Ctx() ctx: AppContext<AuthRoleContext>): Promise<RoleHabit> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        OR: [{ authorId: ctx.me.roleId }, { ownerId: ctx.me.roleId }],
        organizationId: ctx.me.organizationId,
        workflow: { stage: ModelStage.PUBLISHED },
        product: { stage: ModelStage.PUBLISHED },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        product: true,
        workflow: true,
        project: true,
      },
    });

    const productWorkflows: {
      [value: string]: { count: number; value: HabitProductWorkflow };
    } = {};

    const projects: {
      [value: string]: { count: number; value: Project };
    } = {};

    for (const ticket of tickets) {
      const key = `${ticket.productId}-${ticket.workflowId}`;
      if (!(key in productWorkflows)) {
        productWorkflows[key] = {
          count: 0,
          value: {
            product: ticket.product!,
            workflow: ticket.workflow!,
          },
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
  }

  @FieldResolver(() => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<Organization> {
    if (role.organization) {
      return role.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: role.organizationId },
    });
  }

  @FieldResolver(() => RoleEmail)
  async roleEmail(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<RoleEmail> {
    if (role.roleEmail) {
      return role.roleEmail;
    }

    const roleEmail = await ctx.prisma.roleEmail.findFirst({
      where: { roleId: role.id },
    });

    if (roleEmail) {
      return roleEmail;
    } else {
      // create a roleEmail on the fly
      // TODO: we should have a DB constraint set in the schema and
      // have the role creation handle this creation
      const dbRole = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: role.id },
      });

      return ctx.prisma.roleEmail.create({
        data: {
          roleId: ctx.me.roleId,
          nextWorkDayNotificationDate: await getNextWorkDayStartDate(
            dbRole,
            new Date(),
          ),
        },
      });
    }
  }

  @FieldResolver(() => RoleStartReminder)
  async roleStartReminder(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<RoleStartReminder> {
    if (role.roleStartReminder) {
      return role.roleStartReminder;
    }

    const roleStartReminder = await ctx.prisma.roleStartReminder.findFirst({
      where: { roleId: role.id },
    });

    if (roleStartReminder) {
      return roleStartReminder;
    } else {
      // create a roleStartReminder on the fly
      // TODO: we should have a DB constraint set in the schema and
      // have the role creation handle this creation
      const dbRole = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: role.id },
      });

      return ctx.prisma.roleStartReminder.create({
        data: {
          roleId: ctx.me.roleId,
          nextStartNotificationDate: await getNextReminderStartDate(
            dbRole,
            new Date(),
            config.workReminderOffset,
          ),
        },
      });
    }
  }

  @FieldResolver(() => RoleAutoResume)
  async roleAutoResume(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() role: Role,
  ): Promise<RoleAutoResume> {
    if (role.roleAutoResume) {
      return role.roleAutoResume;
    }

    const roleAutoResume = await ctx.prisma.roleAutoResume.findFirst({
      where: { roleId: role.id },
    });

    if (roleAutoResume) {
      return roleAutoResume;
    } else {
      // create a roleAutoResume on the fly
      // TODO: we should have a DB constraint set in the schema and
      // have the role creation handle this creation
      const dbRole = await ctx.prisma.role.findUniqueOrThrow({
        where: { id: role.id },
      });

      return ctx.prisma.roleAutoResume.create({
        data: {
          roleId: ctx.me.roleId,
          nextStartNotificationDate: await getNextReminderStartDate(
            dbRole,
            new Date(),
            0,
          ),
        },
      });
    }
  }
}
