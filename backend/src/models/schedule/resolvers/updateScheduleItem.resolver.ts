import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  UseMiddleware,
  Ctx,
  Query,
} from "type-graphql";

import { IsISO8601 } from "class-validator";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { TicketStatus, ScheduleItem, RoleType } from "@generated/type-graphql";
import { isAuthorOrAdmin } from "../../../utils/rbac";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import {
  getMinStartDateForScheduleItem,
  getMaxStopDateForScheduleItem,
} from "../helper";
import { ScheduleItemUpdateBoundaries } from "../entity";
import { isTicketBlocked } from "../../ticket/helper";

@InputType()
class CloseScheduleItemInput {
  @Field({ nullable: true })
  @IsISO8601({ strict: true })
  stoppedAt?: string;

  @Field({ nullable: true })
  done?: boolean;

  @Field({ nullable: true })
  note?: string;

  @Field({ nullable: true })
  nextTicketWorkflowStateId?: number;
}

@InputType()
class UpdateScheduleItemInput {
  @Field()
  @IsISO8601({ strict: true })
  startedAt: string;

  @Field({ nullable: true })
  @IsISO8601({ strict: true })
  stoppedAt?: string;
}

@Resolver(ScheduleItem)
export class UpdateScheduleItemResolver {
  @Query(() => ScheduleItemUpdateBoundaries)
  @UseMiddleware(hasRole())
  async scheduleItemUpdateBoundaries(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int) scheduleItemId: number
  ): Promise<ScheduleItemUpdateBoundaries> {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
      },
    });

    const minDate = await getMinStartDateForScheduleItem(scheduleItem);
    const maxDate = await getMaxStopDateForScheduleItem(scheduleItem);

    return { minDate, maxDate };
  }

  @Mutation(() => ScheduleItem)
  @UseMiddleware(hasRole())
  async updateMyScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int) scheduleItemId: number,
    @Arg("input", () => UpdateScheduleItemInput) input: UpdateScheduleItemInput
  ): Promise<ScheduleItem> {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        roleId: ctx.me.roleId,
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
      },
    });

    if (await isTicketBlocked(ctx.me.organizationId, scheduleItem.ticketId)) {
      throw new UserInputError("This ticket is blocked");
    }

    if (!scheduleItem.stoppedAt && input.stoppedAt) {
      throw new UserInputError("You cannot set a stop date on an ongoing task");
    }

    if (scheduleItem.stoppedAt && !input.stoppedAt) {
      throw new UserInputError("A stop date is required");
    }

    if (!input.startedAt) {
      throw new UserInputError("A start date is required");
    }

    // we can't move items in the future
    if (new Date(input.startedAt) > new Date()) {
      throw new UserInputError("Start date cannot be in the future");
    }

    // we can't move items in the future
    if (input.stoppedAt && new Date(input.stoppedAt) > new Date()) {
      throw new UserInputError("Stop date cannot be in the future");
    }

    // start date must be before stop date
    if (
      input.stoppedAt &&
      new Date(input.stoppedAt) <= new Date(input.startedAt)
    ) {
      throw new UserInputError("Invalid stop date");
    }

    if (scheduleItem.stoppedAt && input.stoppedAt) {
      const maxStopDate = await getMaxStopDateForScheduleItem(scheduleItem);
      if (new Date(input.stoppedAt) > maxStopDate) {
        throw new UserInputError("Invalid stop date");
      }
    }

    const minStartDate = await getMinStartDateForScheduleItem(scheduleItem);
    if (minStartDate && new Date(input.startedAt) < minStartDate) {
      console.log(minStartDate, new Date(input.startedAt));
      throw new UserInputError("Invalid start date");
    }

    return ctx.prisma.scheduleItem.update({
      where: { id: scheduleItem.id },
      data: {
        startedAt: input.startedAt,
        stoppedAt: input.stoppedAt,
      },
    });
  }

  @Mutation(() => ScheduleItem, {
    deprecationReason: "this is a passthrough method",
  })
  @UseMiddleware(hasRole([RoleType.ADMIN, RoleType.OWNER]))
  async updateScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int) scheduleItemId: number,
    @Arg("input", () => UpdateScheduleItemInput) input: UpdateScheduleItemInput
  ): Promise<ScheduleItem> {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
      },
    });

    //TODO: fix the frontend, input is no longer necessary but prevent the linter from screaming
    if (input) {
    }

    return scheduleItem;
  }

  /**
   * This allow a user to resume the last scheduled task that was auto-stopped
   * It only works on the last schedule item AND if it was auto-stopped.
   * @returns
   */
  @Mutation(() => ScheduleItem)
  @UseMiddleware(hasRole())
  async resumeLastScheduleItem(@Ctx() ctx: AppContext<AuthRoleContext>) {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        roleId: ctx.me.roleId,
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    if (await isTicketBlocked(ctx.me.organizationId, scheduleItem.ticketId)) {
      throw new UserInputError("This ticket is blocked");
    }

    if (!scheduleItem.autoStopped) {
      throw new UserInputError("Only auto stopped tasks can be resumed.");
    }

    return ctx.prisma.scheduleItem.update({
      where: {
        id: scheduleItem.id,
      },
      data: {
        autoStopped: false,
        stoppedAt: null,
        extendedAt: new Date(),
      },
    });
  }

  @Mutation(() => ScheduleItem, {
    description:
      "Close (or update an already closed) last known ticket workflow state",
  })
  @UseMiddleware(hasRole())
  async closeLastScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number,
    @Arg("input", () => CloseScheduleItemInput, { defaultValue: {} })
    input: CloseScheduleItemInput = {}
  ): Promise<ScheduleItem> {
    if (await isTicketBlocked(ctx.me.organizationId, ticketId)) {
      throw new UserInputError("This ticket is blocked");
    }

    const lastScheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        ticketId,
        organizationId: ctx.me.organizationId,
      },
      orderBy: {
        stoppedAt: "desc",
      },
    });

    return this._closeScheduleItem(ctx, lastScheduleItem, input);
  }

  // This method centralizes the check to be done on a schedule item we want to close.
  // any schedule item work should use it for safety. Add more check to this method
  // when necessary (like otherlaps and stuff)
  async _closeScheduleItem(
    ctx: AppContext<AuthRoleContext>,
    scheduleItem: ScheduleItem,
    input: CloseScheduleItemInput
  ): Promise<ScheduleItem> {
    const done = input.nextTicketWorkflowStateId ? true : input.done;
    const nowStr = new Date().toISOString();

    // for the Stop date:
    // - use the stoppedAt value on the provided schedule item (unchanged)
    // - fallback on the provided stoppedAt (if provided)
    // - otherwise use now()
    const stoppedAt = scheduleItem.stoppedAt
      ? scheduleItem.stoppedAt
      : input.stoppedAt
      ? input.stoppedAt
      : nowStr;

    if (stoppedAt > nowStr) {
      throw new UserInputError("You cannot set a stop date in the future.");
    }

    if (done) {
      // if provided a next step, we do not mark the ticket as DONE
      // but will update the schedule item to point toward the prodivided next
      // ticket workflow state
      if (input.nextTicketWorkflowStateId) {
        await ctx.prisma.scheduleItem.updateMany({
          where: {
            OR: [
              {
                ticketId: scheduleItem.ticketId,
                ticketWorkflowStateId: scheduleItem.ticketWorkflowStateId,
                stoppedAt: null, // no stopped date means it's an active task
              },
              {
                id: scheduleItem.id,
              },
            ],
          },
          data: {
            stoppedAt: new Date(stoppedAt),
            done,
            nextTicketWorkflowStateId: input.nextTicketWorkflowStateId,
          },
        });

        if (input.note) {
          // Add note to the user's schedule item to maintain authorship
          await ctx.prisma.ticketWorkflowStateNote.create({
            data: {
              ticketWorkflowStateId: input.nextTicketWorkflowStateId,
              authorId: ctx.me.roleId,
              body: input.note,
              // we'll choose the nextTicketWorkflowStateId over the
              // ticketWorkflowStateId when define. This is because you
              // can from state A->B then B->C without doing any work on
              // state B. In this case, scheduleItem would have ever been
              // created, but the nextTicketWorkflowStateId would have the
              // information about the previously set state.
              fromTicketWorkflowStateId:
                scheduleItem.nextTicketWorkflowStateId ||
                scheduleItem.ticketWorkflowStateId,
            },
          });
        }
      } else {
        // if we close the record of work without providing a next
        // step, it means we are closing the ticket (mark is as DONE)
        // we'll also close all other schedule items
        await ctx.prisma.ticket.update({
          where: { id: scheduleItem.ticketId },
          data: {
            status: TicketStatus.DONE,
            closingNote: input.note,
            closedAt: new Date(),
          },
        });

        // we will then stop ALL on-going work on this ticket
        // regardless of their workflow and the provided schedule item
        await ctx.prisma.scheduleItem.updateMany({
          where: {
            OR: [
              {
                ticketId: scheduleItem.ticketId,
                stoppedAt: null,
              },
              {
                id: scheduleItem.id,
              },
            ],
          },
          data: {
            done: true,
            stoppedAt: new Date(stoppedAt),
          },
        });
      }

      await requestEstimate(ctx.me.organizationId);

      return ctx.prisma.scheduleItem.findUniqueOrThrow({
        where: { id: scheduleItem.id },
      });
    } else {
      // we're taking a pause (the next step is the same as this step)
      return await ctx.prisma.scheduleItem.update({
        where: { id: scheduleItem.id },
        data: {
          done: false,
          nextTicketWorkflowStateId: input.nextTicketWorkflowStateId,
          stoppedAt: new Date(stoppedAt),
        },
      });
    }
  }

  @Mutation(() => ScheduleItem, {
    description: "Close an active workflow state",
  })
  @UseMiddleware(hasRole())
  async closeScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("scheduleItemId", () => Int) scheduleItemId: number,
    @Arg("input", () => CloseScheduleItemInput, { defaultValue: {} })
    input: CloseScheduleItemInput = {}
  ): Promise<ScheduleItem> {
    const scheduleItem = await ctx.prisma.scheduleItem.findFirstOrThrow({
      where: {
        id: scheduleItemId,
        organizationId: ctx.me.organizationId,
        stoppedAt: null,
      },
    });

    if (await isTicketBlocked(ctx.me.organizationId, scheduleItem.ticketId)) {
      throw new UserInputError("This ticket is blocked");
    }

    // Only admin can change someone else's time record
    if (!isAuthorOrAdmin(ctx.me, scheduleItem.roleId)) {
      throw new UserInputError(
        "Only the assignee or an admin can change this information"
      );
    }

    return this._closeScheduleItem(ctx, scheduleItem, input);
  }
}
