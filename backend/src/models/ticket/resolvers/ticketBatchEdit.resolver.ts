import {
  Arg,
  Query,
  Int,
  UseMiddleware,
  Ctx,
  Mutation,
  InputType,
  Field,
  registerEnumType,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import { ModelStage, Ticket } from "@generated/type-graphql";
import { reject } from "lodash";
import { MaxLength } from "class-validator";
import { Prisma, RoleStatus, TicketStatus } from "@prisma/client";
import { requestEstimate } from "../jobs/estimateTickets";
import { BatchPayload } from "../../../utils/query";

enum BatchUpdateTicketAction {
  CANCEL_TICKETS,
  SCHEDULE_TICKETS,
  UNSCHEDULE_TICKETS,
  ARCHIVE_TICKETS,
  UNARCHIVE_TICKETS,
  MARK_TICKETS_AS_DONE,
  CHANGE_OWNER,
  CHANGE_PROJECT,
  REQUEST_ESTIMATE,
  CANCEL_REQUEST_ESTIMATE,
}

registerEnumType(BatchUpdateTicketAction, {
  name: "BatchUpdateTicketAction",
  description: "Allowed actions on ticket bactch edit",
});

@InputType()
class BatchUpdateTicketsInput {
  @Field()
  @MaxLength(2048)
  actionMessage: string;

  @Field((_type) => BatchUpdateTicketAction)
  action: BatchUpdateTicketAction;

  @Field((_type) => Int, { nullable: true })
  ownerId?: number | null;

  @Field((_type) => Int, { nullable: true })
  projectId?: number | null;
}

export class TicketBatchEditResolver {
  @Query((_returns) => [Ticket], {
    description: "retrieve the tags for the provided tickets",
  })
  @UseMiddleware(hasRole())
  async batchGetTicketTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int], { nullable: "items" }) ticketsIds: number[]
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
        id: { in: ticketsIds },
      },
      include: {
        tags: true,
      },
    });
  }

  @Query((_returns) => [Ticket], {
    description: "retrieve the tags for the provided tickets",
  })
  @UseMiddleware(hasRole())
  async batchGetTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int], { nullable: "items" }) ticketsIds: number[]
  ): Promise<Ticket[]> {
    return ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
        id: { in: ticketsIds },
      },
      include: {
        ticketWorkflowStates: true,
      },
    });
  }

  @Mutation((_returns) => [Ticket], {
    description: "add and remove tags to the provided tickets",
  })
  @UseMiddleware(hasRole())
  async batchUpdateTicketTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int], { nullable: "items" }) ticketsIds: number[],
    @Arg("addTagIds", () => [Int], { nullable: "items" })
    addTagIds: number[],
    @Arg("removeTagIds", () => [Int], { nullable: "items" })
    removeTagIds: number[]
  ): Promise<Ticket[]> {
    const tickets = await ctx.prisma.ticket.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
        id: { in: ticketsIds },
      },
      include: {
        tags: true,
      },
    });

    if (tickets.length === 0) {
      return tickets;
    }

    // tags to Add we need to make sure the tags are from the
    // current organization
    const tagsToAdd = await ctx.prisma.tag.findMany({
      where: {
        organizationId: ctx.me.organizationId,
        id: { in: addTagIds },
      },
    });

    for (const ticket of tickets) {
      let { tags } = ticket;
      // first remove the tags we need to remove
      tags = reject(tags, (tag) => removeTagIds.includes(tag.id));
      // ... then add the tags we want to add
      tags = [...tags, ...tagsToAdd];

      // update the ticket tags
      await ctx.prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          tags: { set: tags.map(({ id }) => ({ id })) },
        },
      });
    }

    return tickets;
  }

  @Mutation((_returns) => BatchPayload, {
    description: "add and remove tags to the provided tickets",
  })
  @UseMiddleware(hasRole())
  async batchUpdateTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketIds", () => [Int], { nullable: "items" }) ticketsIds: number[],
    @Arg("input", () => BatchUpdateTicketsInput)
    input: BatchUpdateTicketsInput
  ): Promise<Prisma.BatchPayload> {
    const ticketUpdateData: Prisma.TicketUncheckedUpdateManyInput = {};
    const ticketUpdateWhere: Prisma.TicketWhereInput = {
      organizationId: ctx.me.organizationId,
      id: { in: ticketsIds },

      // Archived and deleted ticket (including inside an archived project)
      // are considered read only and cannot be edited
      stage: { notIn: [ModelStage.DELETED, ModelStage.ARCHIVED] },
      project: {
        stage: ModelStage.PUBLISHED,
        ancestorIsArchived: false,
      },
    };

    // Apply the requested owner change
    if (
      input.action === BatchUpdateTicketAction.CHANGE_OWNER &&
      input.ownerId
    ) {
      // make sure the owner is part of our organization
      const owner = await ctx.prisma.role.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.ownerId,
          status: RoleStatus.ACCEPTED,
        },
      });

      ticketUpdateData.ownerId = owner.id;
    }

    // Change the project of the submitted tickets
    else if (
      input.action === BatchUpdateTicketAction.CHANGE_PROJECT &&
      input.projectId
    ) {
      // make sure the project is part of our organization and published
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          organizationId: ctx.me.organizationId,
          id: input.projectId,
          stage: ModelStage.PUBLISHED,
          ancestorIsArchived: false,
        },
      });

      ticketUpdateData.projectId = project.id;
    }
    // Cancel selected tickets
    else if (
      input.action === BatchUpdateTicketAction.CANCEL_TICKETS &&
      input.actionMessage
    ) {
      ticketUpdateData.status = TicketStatus.CANCELLED;
      ticketUpdateData.closedAt = new Date();
      ticketUpdateData.closingNote = input.actionMessage;
      // but we do not want to cancelled already closed ticket,
      // as it would erase the closed At and closing note
      ticketUpdateWhere.status = {
        notIn: [TicketStatus.CANCELLED, TicketStatus.DONE],
      };
    }
    // Mark selected tickets as DONE
    else if (
      input.action === BatchUpdateTicketAction.MARK_TICKETS_AS_DONE &&
      input.actionMessage
    ) {
      ticketUpdateData.status = TicketStatus.DONE;
      ticketUpdateData.closedAt = new Date();
      ticketUpdateData.closingNote = input.actionMessage;
      // but we do not want to mark as DONE already closed ticket,
      // as it would erase the closed At and closing note
      ticketUpdateWhere.status = {
        notIn: [TicketStatus.CANCELLED, TicketStatus.DONE],
      };
    }
    // Archive selected tickets
    else if (input.action === BatchUpdateTicketAction.ARCHIVE_TICKETS) {
      ticketUpdateData.stage = ModelStage.ARCHIVED;
      ticketUpdateData.archivedAt = new Date();
    }
    // Unarchive selected tickets
    else if (input.action === BatchUpdateTicketAction.UNARCHIVE_TICKETS) {
      ticketUpdateWhere.stage = ModelStage.ARCHIVED;
      ticketUpdateData.stage = ModelStage.PUBLISHED;
      ticketUpdateData.archivedAt = null;
    }
    // Schedule selected ticket, but only if ready to be scheduled
    else if (input.action === BatchUpdateTicketAction.SCHEDULE_TICKETS) {
      ticketUpdateData.status = TicketStatus.SCHEDULED;
      ticketUpdateData.scheduledAt = new Date();

      // make sure tickets can be scheduled:
      // - ticket should be UNSCHEDULED and PUBLISHED
      // - every ticket workflow state should be:
      //   - fully assigned
      //   - fully estimated
      ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
      ticketUpdateWhere.stage = ModelStage.PUBLISHED;
      ticketUpdateWhere.ticketWorkflowStates = {
        every: {
          OR: [
            {
              estimateMinimum: { not: null },
              estimateMostLikely: { not: null },
              estimateMaximum: { not: null },
              assignee: { status: RoleStatus.ACCEPTED },
              isActive: true,
            },
            { isActive: false },
          ],
        },
      };
    } else if (input.action === BatchUpdateTicketAction.UNSCHEDULE_TICKETS) {
      ticketUpdateData.status = TicketStatus.UNSCHEDULED;
      ticketUpdateData.scheduledAt = null;

      // only UNSCHEDULED ticket that are SCHEDULED, we don't want to
      // change CANCELLED and DONE ticket into UNSCHEDULED
      ticketUpdateWhere.status = TicketStatus.SCHEDULED;
    } else if (input.action === BatchUpdateTicketAction.REQUEST_ESTIMATE) {
      ticketUpdateData.estimating = true;

      ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
      ticketUpdateWhere.estimating = false;
    } else if (
      input.action === BatchUpdateTicketAction.CANCEL_REQUEST_ESTIMATE
    ) {
      ticketUpdateData.estimating = false;

      ticketUpdateWhere.status = TicketStatus.UNSCHEDULED;
      ticketUpdateWhere.estimating = true;
    } else {
      return { count: 0 };
    }

    const result = await ctx.prisma.ticket.updateMany({
      where: ticketUpdateWhere,
      data: ticketUpdateData,
    });

    // if we've made changes that may impact the schedule, we'll need
    // to request a new estimate
    if (
      result.count &&
      (input.action === BatchUpdateTicketAction.UNSCHEDULE_TICKETS ||
        input.action === BatchUpdateTicketAction.ARCHIVE_TICKETS ||
        input.action === BatchUpdateTicketAction.MARK_TICKETS_AS_DONE ||
        input.action === BatchUpdateTicketAction.CANCEL_TICKETS ||
        input.action === BatchUpdateTicketAction.SCHEDULE_TICKETS)
    ) {
      await requestEstimate(ctx.me.organizationId);
    }
    return result;
  }
}
