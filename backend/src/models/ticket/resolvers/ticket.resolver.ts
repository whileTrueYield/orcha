import {
  Arg,
  Query,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  Root,
  FieldResolver,
} from "type-graphql";
import jwt from "jsonwebtoken";
import {
  Ticket,
  TicketWorkflowState,
  TicketWorkflowStateNote,
  Organization,
  Product,
  Role,
  ScheduleItem,
  Workflow,
  Tag,
  PersonalTag,
  TicketStatus,
  Project,
  Issue,
} from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import { PaginatedComments } from "../../comment/entity";
import { getPaginatedComments } from "../../comment/helper";
import { filter, find, last, without } from "lodash";
import { ModelStage } from ".prisma/client";
import { getRolePreferences, updateRolePreferences } from "../../entities";
import { config } from "../../../config";
import { DocumentToken } from "../../../hocuspocus/documentToken";
import { logger } from "../../../logger";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { getDocFromBytes } from "../../../utils/yjs";

@Resolver(Ticket)
export class TicketResolver {
  @Query(() => Ticket)
  @UseMiddleware(hasRole())
  async ticket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number,
    @Arg("visited", () => Boolean, { nullable: true }) visited: boolean
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
      include: {
        organization: true,
        features: {
          include: {
            featureGroup: true,
          },
        },
        project: true,
        author: true,
        owner: true,
        watchers: true,
        product: true,
        workflow: true,
        ticketWorkflowStates: {
          orderBy: { position: "asc" },
          include: {
            scheduleItems: {
              include: { role: true },
            },
            workflowState: true,
            assignee: true,
          },
        },
      },
    });

    // When the ticket is being visited (and not just requested),
    // add to the list of recently visited tickets
    if (visited) {
      const role = await ctx.me.getRole();

      const preferences = getRolePreferences(role);
      const objectId = `ticket:${id}:${ticket.product?.code || ""}:${
        ticket.localId || ""
      }:${ticket.title}`;

      const recentlyVisited = [
        objectId,
        ...without(preferences.recentlyVisited, objectId),
      ];

      const updatedPreferences = updateRolePreferences(role, {
        recentlyVisited: recentlyVisited.slice(0, 10),
      });

      await ctx.prisma.role.update({
        where: { id: ctx.me.roleId },
        data: { preferences: JSON.stringify(updatedPreferences) },
      });
    }

    return ticket;
  }

  /**
   * This token is used for by tiptap collaborative editor using
   * web socket.
   * It is valid for 15 minutes
   */
  @Query(() => String, { nullable: true })
  @UseMiddleware(hasRole())
  async ticketTextAccessToken(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("id", () => Int) id: number
  ): Promise<string> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
      include: {
        project: true,
      },
    });

    const readOnly =
      ticket.project.ancestorIsArchived ||
      ticket.project.stage === "ARCHIVED" ||
      ticket.stage === "ARCHIVED";

    const accessToken: DocumentToken = {
      roleId: ctx.me.roleId,
      orgId: ctx.me.organizationId,
      documentId: ticket.id,
      documentType: "ticketText",
      mode: readOnly ? "read" : "write",
    };

    logger.info(
      `creating access token for ticket ${ticket.title},\n${JSON.stringify(
        accessToken,
        null,
        2
      )}`
    );

    return jwt.sign(
      accessToken,
      config.sessionSecret,
      { expiresIn: 900 } // Expire the token after 15 minutes.
    );
  }

  @Query(() => [TicketWorkflowStateNote])
  @UseMiddleware(hasRole())
  async ticketNotes(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number
  ): Promise<TicketWorkflowStateNote[]> {
    return ctx.prisma.ticketWorkflowStateNote.findMany({
      where: {
        ticketWorkflowState: {
          ticket: {
            organizationId: ctx.me.organizationId,
            id: ticketId,
          },
        },
      },
      include: {
        author: true,
        fromTicketWorkflowState: true,
        ticketWorkflowState: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Query(() => TicketWorkflowStateNote, { nullable: true })
  @UseMiddleware(hasRole())
  async lastTicketWorkflowStateNote(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int) ticketId: number
  ): Promise<TicketWorkflowStateNote | null> {
    return ctx.prisma.ticketWorkflowStateNote.findFirst({
      where: { ticketWorkflowState: { ticketId } },
      orderBy: { createdAt: "desc" },
    });
  }

  @FieldResolver((_returns) => Organization)
  async organization(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Organization> {
    if (ticket.organization) {
      return ticket.organization;
    }

    return ctx.prisma.organization.findUniqueOrThrow({
      where: { id: ticket.organizationId },
    });
  }

  @FieldResolver((_returns) => ModelStage)
  async stage(@Root() ticket: Ticket): Promise<ModelStage> {
    if (ticket.project?.ancestorIsArchived) {
      return ModelStage.ARCHIVED;
    } else if (ticket.project?.stage === ModelStage.ARCHIVED) {
      return ModelStage.ARCHIVED;
    } else {
      return ticket.stage;
    }
  }

  @FieldResolver((_returns) => Boolean)
  async isWatching(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<boolean> {
    if (ticket.watchers) {
      return !!find(ticket.watchers, { id: ctx.me.roleId });
    } else {
      return !!(await ctx.prisma.ticket.findFirst({
        where: {
          id: ticket.id,
          watchers: { some: { id: ctx.me.roleId } },
        },
      }));
    }
  }

  @FieldResolver((_returns) => Product, { nullable: true })
  async product(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Product | null> {
    if (ticket.productId) {
      if (ticket.product) {
        return ticket.product;
      }

      return ctx.prisma.product.findUniqueOrThrow({
        where: { id: ticket.productId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async author(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Role | null> {
    if (ticket.authorId) {
      if (ticket.author) {
        return ticket.author;
      }

      return ctx.prisma.role.findUniqueOrThrow({
        where: { id: ticket.authorId },
      });
    }
    return null;
  }

  @FieldResolver((_returns) => Role, { nullable: true })
  async owner(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Role | null> {
    if (ticket.ownerId) {
      if (ticket.owner) {
        return ticket.owner;
      }

      return ctx.prisma.role.findUnique({
        where: { id: ticket.ownerId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => TicketWorkflowState, { nullable: true })
  async state(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<TicketWorkflowState | null> {
    // only Published and Scheduled tickets have a current "state"
    if (
      ticket.stage === ModelStage.PUBLISHED &&
      ticket.status === TicketStatus.SCHEDULED
    ) {
      const lastScheduleItem = await this.lastScheduleItem(ctx, ticket);

      if (lastScheduleItem) {
        if (lastScheduleItem.nextTicketWorkflowStateId) {
          if (lastScheduleItem.nextTicketWorkflowState) {
            return lastScheduleItem.nextTicketWorkflowState;
          } else {
            return ctx.prisma.ticketWorkflowState.findUnique({
              where: {
                id: lastScheduleItem.nextTicketWorkflowStateId,
              },
            });
          }
        }

        if (lastScheduleItem.ticketWorkflowState) {
          return lastScheduleItem.ticketWorkflowState;
        }

        return ctx.prisma.ticketWorkflowState.findUnique({
          where: {
            id: lastScheduleItem.ticketWorkflowStateId,
          },
        });
      }

      return ctx.prisma.ticketWorkflowState.findFirst({
        where: {
          isActive: true,
          ticket: {
            id: ticket.id,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => Project, { nullable: true })
  async project(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Project | null> {
    if (ticket.projectId) {
      if (ticket.project) {
        return ticket.project;
      }

      return ctx.prisma.project.findFirst({
        where: {
          id: ticket.projectId,
        },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => [TicketWorkflowState])
  async ticketWorkflowStates(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<TicketWorkflowState[]> {
    if (ticket.ticketWorkflowStates) {
      if (ticket.status === TicketStatus.UNSCHEDULED) {
        // while unschedule we want all the possible state, so they
        // can be activated and deactivated on the UI
        return ticket.ticketWorkflowStates;
      } else {
        // only return the active state when the ticket is scheduled
        return filter(ticket.ticketWorkflowStates, "isActive");
      }
    }

    return ctx.prisma.ticketWorkflowState.findMany({
      where: {
        ticketId: ticket.id,
        isActive: ticket.status === TicketStatus.UNSCHEDULED ? undefined : true,
      },
    });
  }

  @FieldResolver((_returns) => [Ticket])
  async ancestors(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Ticket[]> {
    if (ticket.ancestors) {
      return ticket.ancestors;
    }

    return ctx.prisma.ticket.findMany({
      where: {
        successors: { some: { id: ticket.id } },
      },
    });
  }

  /**
   * The description is not part of the ticket anymore but
   * is the text stored in the ticketText table. This table
   * contains a int array of bytes that represent its yjs
   * value for collaborative editing.
   *
   * This field is to allow read only display in a TipTap editor
   */
  @FieldResolver((_returns) => String, { nullable: true })
  async description(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<string | null> {
    let ticketText = ticket.ticketText;
    if (!ticket.ticketText) {
      ticketText = await ctx.prisma.ticketText.findFirst({
        where: { ticketId: ticket.id },
      });
    }

    if (ticketText && ticketText.bytes) {
      const doc = getDocFromBytes(ticketText.bytes);
      return JSON.stringify(TiptapTransformer.fromYdoc(doc).default);
    }

    return null;
  }

  @FieldResolver((_returns) => [Ticket])
  async successors(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Ticket[]> {
    if (ticket.successors) {
      return ticket.successors;
    }

    return ctx.prisma.ticket.findMany({
      where: {
        ancestors: { some: { id: ticket.id } },
      },
    });
  }

  @FieldResolver((_returns) => ScheduleItem, { nullable: true })
  async lastScheduleItem(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<ScheduleItem | null> {
    if (ticket.scheduleItems) {
      return last(ticket.scheduleItems) || null;
    }

    return ctx.prisma.scheduleItem.findFirst({
      where: { ticketId: ticket.id },
      orderBy: { stoppedAt: "desc" },
      include: { ticketWorkflowState: true },
    });
  }

  @FieldResolver((_returns) => [ScheduleItem])
  async scheduleItems(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<ScheduleItem[]> {
    if (ticket.scheduleItems) {
      return ticket.scheduleItems;
    }

    return ctx.prisma.scheduleItem.findMany({
      where: { ticketId: ticket.id },
      include: { role: { include: { user: true } } },
    });
  }

  @FieldResolver((_returns) => [Tag])
  async tags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Tag[]> {
    if (ticket.tags) {
      return ticket.tags;
    }

    return ctx.prisma.tag.findMany({
      where: {
        tickets: { some: { id: ticket.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Role])
  async watchers(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Role[]> {
    if (ticket.watchers) {
      return ticket.watchers;
    }

    return ctx.prisma.role.findMany({
      where: {
        ticketsWatched: { some: { id: ticket.id } },
      },
    });
  }

  @FieldResolver((_returns) => [PersonalTag])
  async personalTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<PersonalTag[]> {
    if (ticket.personalTags) {
      return ticket.personalTags;
    }

    return ctx.prisma.personalTag.findMany({
      where: {
        tickets: { some: { id: ticket.id } },
      },
    });
  }

  @FieldResolver((_returns) => [Issue])
  async issues(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Issue[]> {
    if (ticket.cases) {
      return ticket.cases;
    }

    return ctx.prisma.issue.findMany({
      where: {
        ticket: { id: ticket.id },
      },
    });
  }

  @FieldResolver((_returns) => Workflow, { nullable: true })
  async workflow(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Workflow | null> {
    if (ticket.workflowId) {
      if (ticket.workflow) {
        return ticket.workflow;
      }

      return ctx.prisma.workflow.findUniqueOrThrow({
        where: { id: ticket.workflowId },
      });
    }

    return null;
  }

  @FieldResolver((_returns) => PaginatedComments)
  async comments(
    @Root() ticket: Ticket,
    @Arg("first", () => Int, { nullable: true }) first: number,
    @Arg("last", () => Int, { nullable: true }) last: number,
    @Arg("offset", () => Int, { nullable: true }) offset: number,
    @Arg("search", () => String, { nullable: true }) search: string
  ): Promise<PaginatedComments> {
    return getPaginatedComments({
      first,
      last,
      offset,
      search,
      ticketId: ticket.id,
      organizationId: ticket.organizationId,
    });
  }
}
