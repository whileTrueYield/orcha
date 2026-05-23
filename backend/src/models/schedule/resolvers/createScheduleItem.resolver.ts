import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  UseMiddleware,
  Ctx,
  Int,
} from "type-graphql";

import { IsISO8601 } from "class-validator";
import { ScheduleItem, TicketStatus } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { assertCanScheduleTicket } from "../../ticket/resolvers/scheduleTicket.resolver";
import { requestEstimate } from "../../ticket/jobs/estimateTickets";
import { subDays } from "date-fns";
import { isTicketBlocked } from "../../ticket/helper";

@InputType()
class CreateScheduleItemInput {
  @Field({ nullable: true })
  @IsISO8601({ strict: true })
  startedAt?: string;

  @Field({ nullable: true })
  @IsISO8601({ strict: true })
  stoppedAt?: string;

  @Field(() => Int)
  ticketId: number;

  @Field(() => Int)
  ticketWorkflowStateId: number;
}

@Resolver(ScheduleItem)
export class CreateScheduleItemResolver {
  @Mutation(() => ScheduleItem)
  @UseMiddleware(hasRole())
  async createScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input")
    input: CreateScheduleItemInput
  ): Promise<ScheduleItem> {
    const now = new Date();
    const nowStr = now.toISOString();

    // startedAt is optional, when not provided we'll default it to now
    const startedAt = input.startedAt ? input.startedAt : nowStr;

    if (startedAt > nowStr) {
      throw new UserInputError("The start date cannot be in the future.");
    }

    if (input.stoppedAt && input.stoppedAt > nowStr) {
      throw new UserInputError("The stop date cannot be in the future.");
    }

    if (startedAt < subDays(now, 30).toISOString()) {
      throw new UserInputError(
        "The start date needs to be within the past 30 days."
      );
    }

    if (await isTicketBlocked(ctx.me.organizationId, input.ticketId)) {
      throw new UserInputError("This ticket is blocked");
    }

    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: input.ticketId,
        organizationId: ctx.me.organizationId,
        status: {
          in: [
            TicketStatus.SCHEDULED,
            TicketStatus.CANCELLED,
            TicketStatus.DONE,
          ],
        },
      },
      include: {
        ticketWorkflowStates: true,
      },
    });

    // we do not allow the creation of schedule item after the closing date
    // of a ticket
    if (ticket.status !== "SCHEDULED" && ticket.closedAt) {
      if (startedAt > ticket.closedAt.toISOString()) {
        throw new UserInputError(
          "The start date cannot be after the closing date of the ticket."
        );
      }

      if (input.stoppedAt && input.stoppedAt > ticket.closedAt.toISOString()) {
        throw new UserInputError(
          "The stop date cannot be after the closing date of the ticket."
        );
      }
    }

    const ticketWorkflowState =
      await ctx.prisma.ticketWorkflowState.findFirstOrThrow({
        where: {
          ticketId: ticket.id,
          id: input.ticketWorkflowStateId,
        },
      });

    // If you try to create a schedule item but you already
    // have an open one on this same task (and ticket) we'll just
    // return this item (i.e. in case you double click "start")
    const unfinishedScheduleItem = await ctx.prisma.scheduleItem.findFirst({
      where: {
        roleId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        ticketWorkflowStateId: ticketWorkflowState.id,
        stoppedAt: null,
      },
    });

    if (unfinishedScheduleItem) {
      return unfinishedScheduleItem;
    }

    // we first check that you do not generate any overlap with any
    // of your recorded prior tasks as we don't yet allow anyone to work on two
    // different things at once so we'll look for any other schedule items within
    // the specified period
    if (input.stoppedAt) {
      // we're creating a past record of work (aka. backfilling)
      const overlappingScheduleItem = await ctx.prisma.scheduleItem.findFirst({
        where: {
          roleId: ctx.me.roleId,
          organizationId: ctx.me.organizationId,
          startedAt: { lt: input.stoppedAt },
          OR: [{ stoppedAt: null }, { stoppedAt: { gt: startedAt } }],
        },
      });

      if (overlappingScheduleItem) {
        throw new UserInputError("There is an overlap in your task schedule");
      }
    } else {
      // we're starting a new active record of work
      const overlappingScheduleItem = await ctx.prisma.scheduleItem.findFirst({
        where: {
          roleId: ctx.me.roleId,
          organizationId: ctx.me.organizationId,
          OR: [{ stoppedAt: { gt: startedAt } }],
        },
      });

      if (overlappingScheduleItem) {
        throw new UserInputError("There is an overlap in your task schedule");
      }
    }

    await requestEstimate(ctx.me.organizationId);

    // in case the ticket was not scheduled (was DONE or CANCELLED)
    // we'll want to put it back in the schedule
    if (ticket.status !== TicketStatus.SCHEDULED) {
      assertCanScheduleTicket(ticket, ticket.ticketWorkflowStates);
      // update the ticket status to a "SCHEDULED" state
      await ctx.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: TicketStatus.SCHEDULED,
          scheduledAt: ticket.scheduledAt || new Date(),
        },
      });
    }

    if (!input.stoppedAt) {
      // if you're starting a new task (no stoppedAt provided), we'll
      // find out if there is active work being done on the same ticket
      // (but at a different stage). If so, we will stop all of them
      await ctx.prisma.scheduleItem.updateMany({
        where: {
          roleId: ctx.me.roleId,
          organizationId: ctx.me.organizationId,
          ticketId: ticketWorkflowState.ticketId,
          ticketWorkflowStateId: { not: ticketWorkflowState.id },
          stoppedAt: null,
        },
        data: {
          stoppedAt: nowStr,
          done: false,
        },
      });

      // we don't yet allow anyone to work on two different things at once
      // so we'll look for any open schedule item (stoppedAt is null)
      // the user owns and close them
      await ctx.prisma.scheduleItem.updateMany({
        where: { roleId: ctx.me.roleId, stoppedAt: null },
        data: {
          stoppedAt: nowStr,
          done: false,
        },
      });
    }

    // Otherwise we create a new schedule item
    const scheduleItem = await ctx.prisma.scheduleItem.create({
      data: {
        ticketId: input.ticketId,
        roleId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
        ticketWorkflowStateId: ticketWorkflowState.id,
        startedAt: new Date(startedAt),
        stoppedAt: input.stoppedAt ? new Date(input.stoppedAt) : null,
      },
    });

    return scheduleItem;
  }
}
