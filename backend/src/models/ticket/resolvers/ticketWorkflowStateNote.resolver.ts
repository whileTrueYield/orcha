import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AppContext, AuthRoleContext } from "../../../types";
import {
  Role,
  TicketWorkflowState,
  TicketWorkflowStateNote,
} from "@generated/type-graphql";

@InputType()
export class UpdateTicketWorkflowStateNoteInput {
  @Field()
  body: string;
}

@Resolver(TicketWorkflowStateNote)
export class TicketWorkflowStateNoteResolver {
  @Query(() => TicketWorkflowStateNote)
  @UseMiddleware(hasRole())
  async ticketWorkflowStateNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketWorkflowStateNoteId", () => Int)
    ticketWorkflowStateNoteId: number
  ): Promise<TicketWorkflowStateNote> {
    return ctx.prisma.ticketWorkflowStateNote.findFirstOrThrow({
      where: {
        id: ticketWorkflowStateNoteId,
        ticketWorkflowState: {
          ticket: {
            organizationId: ctx.me.organizationId,
          },
        },
      },
      include: {
        author: true,
        ticketWorkflowState: true,
        fromTicketWorkflowState: true,
      },
    });
  }

  @FieldResolver((_returns) => TicketWorkflowState)
  async ticketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowStateNote: TicketWorkflowStateNote
  ): Promise<TicketWorkflowState | null> {
    if (ticketWorkflowStateNote.ticketWorkflowStateId) {
      if (ticketWorkflowStateNote.ticketWorkflowState) {
        return ticketWorkflowStateNote.ticketWorkflowState;
      }

      return ctx.prisma.ticketWorkflowState.findUniqueOrThrow({
        where: { id: ticketWorkflowStateNote.ticketWorkflowStateId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => TicketWorkflowState)
  async fromTicketWorkflowState(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowStateNote: TicketWorkflowStateNote
  ): Promise<TicketWorkflowState | null> {
    if (ticketWorkflowStateNote.fromTicketWorkflowStateId) {
      if (ticketWorkflowStateNote.fromTicketWorkflowState) {
        return ticketWorkflowStateNote.fromTicketWorkflowState;
      }

      return ctx.prisma.ticketWorkflowState.findUniqueOrThrow({
        where: { id: ticketWorkflowStateNote.fromTicketWorkflowStateId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => Role)
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticketWorkflowStateNote: TicketWorkflowStateNote
  ): Promise<Role> {
    if (ticketWorkflowStateNote.author) {
      return ticketWorkflowStateNote.author;
    }

    return ctx.prisma.role.findUniqueOrThrow({
      where: { id: ticketWorkflowStateNote.authorId },
    });
  }
}
