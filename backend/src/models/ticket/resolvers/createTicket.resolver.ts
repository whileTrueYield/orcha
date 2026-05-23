import {
  Arg,
  Resolver,
  Mutation,
  InputType,
  Field,
  Int,
  Ctx,
  UseMiddleware,
} from "type-graphql";
import { MaxLength, Length } from "class-validator";

import {
  ModelStage,
  Ticket,
  NotificationCategory,
  NotificationTarget,
} from "@generated/type-graphql";
import { AuthRoleContext, AppContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { Prisma } from "@prisma/client";
import { filter, map, reduce, trim, uniq } from "lodash";
import { findOrCreateTags } from "../../tag/helper";
import { commaSeparatedValues } from "../../../utils/string";
import { getWorkflowQueryForProduct } from "../../workflow/helper";
import { createTicketText, getIndexableContentFromTipTapJson } from "../helper";
import { createNotificationsForTarget } from "../../notification/createNotification";
import { getMentions } from "../../../utils/tiptap";

@InputType()
class CreateTicketInput {
  @Field()
  @Length(1, 128)
  title: string;

  @Field(() => Int, { nullable: true })
  productId?: number | null;

  @Field(() => Int, { nullable: true })
  workflowId?: number | null;

  @Field(() => Int)
  projectId: number;

  @Field(() => String, { nullable: true })
  @MaxLength(10 * 1024)
  description: string | null;

  @Field(() => ModelStage, { nullable: true })
  stage?: ModelStage | null;
}

@InputType()
class ImportTicketsInputDetail {
  @Field(() => String, { nullable: true })
  @MaxLength(10 * 1024)
  description?: string | null;

  @Field()
  @Length(1, 128)
  title: string;

  @Field(() => String, { nullable: true })
  @Length(1, 128)
  id?: string | null;

  @Field(() => String, { nullable: true })
  tags?: string | null;

  @Field(() => String, { nullable: true })
  ancestorIds?: string | null;

  @Field(() => String, { nullable: true })
  successorIds?: string | null;

  @Field(() => String, { nullable: true })
  authorEmail?: string | null;

  @Field(() => String, { nullable: true })
  ownerEmail?: string | null;
}

@InputType()
class ImportTicketsInput {
  @Field(() => Int, { nullable: true })
  productId?: number;

  @Field(() => Int, { nullable: true })
  workflowId?: number;

  @Field(() => Int)
  projectId: number;

  @Field(() => [ImportTicketsInputDetail])
  tickets: ImportTicketsInputDetail[];
}

@Resolver(Ticket)
export class CreateTicketResolver {
  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async createTicket(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input") input: CreateTicketInput,
  ): Promise<Ticket> {
    const ticketInput: Prisma.TicketCreateInput = {
      title: input.title,
      stage: ModelStage.DRAFT,
      organization: {
        connect: {
          id: ctx.me.organizationId,
        },
      },
      author: {
        connect: {
          id: ctx.me.roleId,
        },
      },
      project: {
        connect: {
          id: input.projectId,
        },
      },
      owner: {
        connect: {
          id: ctx.me.roleId,
        },
      },
    };

    const project = await ctx.prisma.project.findFirstOrThrow({
      where: {
        id: input.projectId,
        organizationId: ctx.me.organizationId,
      },
    });

    if (project.ancestorIsArchived || project.stage === ModelStage.ARCHIVED) {
      throw new UserInputError("Cannot create a ticket in an archived project");
    }

    if (project.stage !== ModelStage.PUBLISHED) {
      throw new UserInputError(
        "Cannot create a ticket in an unpublished project",
      );
    }

    ticketInput.project = { connect: { id: project.id } };

    if (input.productId && input.workflowId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: input.productId,
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: { ...getWorkflowQueryForProduct(product), id: input.workflowId },
        include: {
          workflowStates: true,
        },
      });

      ticketInput.product = { connect: { id: product.id } };
      ticketInput.workflow = { connect: { id: workflow.id } };

      // if we attempt to publish the ticket instantly, we should make sure
      // the product and workflow are both published (and not Archived)
      // and the workflow contains at least one active state
      if (input.stage === ModelStage.PUBLISHED) {
        if (workflow.stage !== ModelStage.PUBLISHED) {
          throw new UserInputError(
            `The workflow ${workflow.name} has not been Published`,
          );
        }

        if (product.stage !== ModelStage.PUBLISHED) {
          throw new UserInputError(
            `The product ${product.name} has not been Published`,
          );
        }

        if (workflow.workflowStates.length === 0) {
          throw new UserInputError(
            `The workflow ${workflow.name} does not contain any states`,
          );
        }

        ticketInput.stage = ModelStage.PUBLISHED;
      }
    } else if (input.productId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: input.productId,
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });
      ticketInput.product = { connect: { id: product.id } };
    }

    // assigne a localId if the ticket is to be published
    if (ticketInput.stage === ModelStage.PUBLISHED && input.productId) {
      const last_ticket = await ctx.prisma.ticket.findFirst({
        where: {
          productId: input.productId,
          organizationId: ctx.me.organizationId,
          localId: { not: null },
        },
        select: { localId: true },
        orderBy: { localId: "desc" },
      });

      // set the local ID to 1 or 1 after the last local Id created
      ticketInput.localId = last_ticket?.localId ? last_ticket?.localId + 1 : 1;
    }

    // extract the indexable text for search from the tip tap value
    ticketInput.indexableContent = getIndexableContentFromTipTapJson(
      input.description,
    );

    const ticket = await ctx.prisma.ticket.create({
      data: ticketInput,
    });

    // create the Yjs document for the ticket body (provided under
    // the description field as a TipTap JSON string)
    await createTicketText(ticket.id, input.description);

    // create the ticket workflow state only if we've published the ticket
    if (ticket.stage === ModelStage.PUBLISHED && input.workflowId) {
      // We'll attempt to set the initial state of the ticket
      const states = await ctx.prisma.workflowState.findMany({
        where: {
          workflowId: input.workflowId,
        },
        orderBy: { position: "asc" },
      });

      // create a copy the workflow states for ticket. Changing
      // the workflow from now on will not change the ticket's workflow
      await ctx.prisma.ticketWorkflowState.createMany({
        data: states.map((tws) => ({
          workflowStateId: tws.id,
          name: tws.name,
          position: tws.position,
          ticketId: ticket.id,
        })),
      });
    }

    // during the create flow of a ticket, we do receive a TipTap doc
    // as a string (under description), here we extract and trigger
    // notifications if necessary
    if (input.description) {
      const mentions = getMentions(input.description);

      if (mentions.length > 0) {
        await createNotificationsForTarget(
          ctx.me.organizationId,
          NotificationCategory.MENTION,
          NotificationTarget.TICKET,
          ticket.id,
          mentions,
          ctx.me.roleId,
          `{} mentioned you in a ticket`,
        );
      }
    }

    return ticket;
  }

  @Mutation(() => [Ticket])
  @UseMiddleware(hasRole())
  async importTickets(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("input") input: ImportTicketsInput,
  ): Promise<Ticket[]> {
    const ticketInput: Prisma.TicketCreateManyInput = {
      title: "",
      stage: ModelStage.DRAFT,
      organizationId: ctx.me.organizationId,
      projectId: input.projectId,
      authorId: ctx.me.roleId,
    };

    if (input.productId && input.workflowId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: input.productId,
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });
      ticketInput.productId = product.id;

      const workflow = await ctx.prisma.workflow.findFirstOrThrow({
        where: {
          ...getWorkflowQueryForProduct(product),
          id: input.workflowId,
        },
      });
      ticketInput.productId = input.productId;
      ticketInput.workflowId = workflow.id;
    } else if (input.productId) {
      const product = await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: input.productId,
          organizationId: ctx.me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });
      ticketInput.productId = product.id;
    }

    // todo make that a project name
    // if provided a project, create or associate the ticket with its project
    if (input.projectId) {
      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          id: input.projectId,
          organizationId: ctx.me.organizationId,
        },
      });
      ticketInput.projectId = project.id;
    }

    // create or get all the tags and associate them with every tickets
    const tagNames = uniq(
      reduce(
        input.tickets,
        (tags: string[], ticket) => {
          const ticketTags = ticket.tags ? ticket.tags.split(",") : [];
          if (ticketTags.length) {
            return [...tags, ...filter(ticketTags.map(trim))];
          }
          return tags;
        },
        [],
      ),
    );
    const tags = await findOrCreateTags(
      ctx.me.organizationId,
      ctx.me.roleId,
      tagNames,
    );

    // create all the tickets and associate them with the
    // proper project, tag and acestors
    const createdTickets: Ticket[] = [];
    for (const ticket of input.tickets) {
      const data: Prisma.TicketUncheckedCreateInput = {
        authorId: ctx.me.roleId,
        ...ticketInput,
        organizationId: ctx.me.organizationId,
        title: ticket.title,
        description: ticket.description,
      };

      // imported Identifier
      if (ticket.id) {
        data.foreignId = ticket.id;
      }

      // tag association
      const ticketTags = commaSeparatedValues(ticket.tags).map((tag) =>
        tag.toLowerCase(),
      );
      if (ticketTags.length) {
        const matchingTags = filter(
          tags,
          (tag) => ticketTags.indexOf(tag.name.toLowerCase()) > -1,
        );
        data.tags = { connect: map(matchingTags, ({ id }) => ({ id })) };
      }

      // potential overwrite of the author
      if (ticket.authorEmail) {
        const author = await ctx.prisma.role.findFirst({
          where: {
            organizationId: ctx.me.organizationId,
            user: {
              email: { equals: trim(ticket.authorEmail), mode: "insensitive" },
            },
          },
        });

        if (author) {
          data.authorId = author.id;
        }
      }

      // potential overwrite of the owner
      if (ticket.ownerEmail) {
        const owner = await ctx.prisma.role.findFirst({
          where: {
            organizationId: ctx.me.organizationId,
            user: {
              email: { equals: trim(ticket.ownerEmail), mode: "insensitive" },
            },
          },
        });

        if (owner) {
          data.ownerId = owner.id;
        }
      }

      createdTickets.push(await ctx.prisma.ticket.create({ data }));
    }

    return createdTickets;
  }
}
