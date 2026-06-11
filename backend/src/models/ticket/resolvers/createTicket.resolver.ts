/**
 * Mutation resolvers for creating and importing tickets.
 *
 * Registers:
 *  - Mutation.createTicket(input): Ticket!
 *  - Mutation.importTickets(input): [Ticket!]!
 *
 * createTicket validates project/product/workflow constraints,
 * assigns local IDs, creates workflow state copies, and triggers
 * mention notifications. It seeds no body — Markdown is written
 * later via saveDocumentBody (ADR 0007).
 *
 * importTickets bulk-creates tickets with optional tag, author, and
 * owner association via CSV-style inputs.
 */

import { GraphQLError } from "graphql";
import { ModelStage, Prisma } from "@prisma/client";
import { filter, map, reduce, trim, uniq } from "lodash";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { findOrCreateTags } from "../../tag/helper";
import { commaSeparatedValues } from "../../../utils/string";
import { getWorkflowQueryForProduct } from "../../workflow/helper";
import { ModelStageEnum } from "../../../schema/enums";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

const CreateTicketInput = builder.inputType("CreateTicketInput", {
  fields: (t) => ({
    title: t.string({ required: true }),
    productId: t.int({ required: false }),
    workflowId: t.int({ required: false }),
    projectId: t.int({ required: true }),
    stage: t.field({ type: ModelStageEnum, required: false }),
  }),
});

const ImportTicketsInputDetail = builder.inputType("ImportTicketsInputDetail", {
  fields: (t) => ({
    description: t.string({ required: false }),
    title: t.string({ required: true }),
    id: t.string({ required: false }),
    tags: t.string({ required: false }),
    ancestorIds: t.string({ required: false }),
    successorIds: t.string({ required: false }),
    authorEmail: t.string({ required: false }),
    ownerEmail: t.string({ required: false }),
  }),
});

const ImportTicketsInput = builder.inputType("ImportTicketsInput", {
  fields: (t) => ({
    productId: t.int({ required: false }),
    workflowId: t.int({ required: false }),
    projectId: t.int({ required: true }),
    tickets: t.field({
      type: [ImportTicketsInputDetail],
      required: true,
    }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation: createTicket
// ---------------------------------------------------------------------------

builder.mutationField("createTicket", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateTicketInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;

      const ticketInput: Prisma.TicketCreateInput = {
        title: input.title,
        stage: ModelStage.DRAFT,
        organization: { connect: { id: me.organizationId } },
        author: { connect: { id: me.roleId } },
        project: { connect: { id: input.projectId } },
        owner: { connect: { id: me.roleId } },
      };

      const project = await ctx.prisma.project.findFirstOrThrow({
        where: {
          id: input.projectId,
          organizationId: me.organizationId,
        },
      });

      if (project.ancestorIsArchived || project.stage === ModelStage.ARCHIVED) {
        throw new GraphQLError(
          "Cannot create a ticket in an archived project",
        );
      }

      if (project.stage !== ModelStage.PUBLISHED) {
        throw new GraphQLError(
          "Cannot create a ticket in an unpublished project",
        );
      }

      ticketInput.project = { connect: { id: project.id } };

      if (input.productId && input.workflowId) {
        const product = await ctx.prisma.product.findFirstOrThrow({
          where: {
            id: input.productId,
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });

        const workflow = await ctx.prisma.workflow.findFirstOrThrow({
          where: {
            ...getWorkflowQueryForProduct(product),
            id: input.workflowId,
          },
          include: { workflowStates: true },
        });

        ticketInput.product = { connect: { id: product.id } };
        ticketInput.workflow = { connect: { id: workflow.id } };

        // Validate all constraints when publishing instantly
        if (input.stage === ModelStage.PUBLISHED) {
          if (workflow.stage !== ModelStage.PUBLISHED) {
            throw new GraphQLError(
              `The workflow ${workflow.name} has not been Published`,
            );
          }

          if (product.stage !== ModelStage.PUBLISHED) {
            throw new GraphQLError(
              `The product ${product.name} has not been Published`,
            );
          }

          if (workflow.workflowStates.length === 0) {
            throw new GraphQLError(
              `The workflow ${workflow.name} does not contain any states`,
            );
          }

          ticketInput.stage = ModelStage.PUBLISHED;
        }
      } else if (input.productId) {
        const product = await ctx.prisma.product.findFirstOrThrow({
          where: {
            id: input.productId,
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });
        ticketInput.product = { connect: { id: product.id } };
      }

      // Assign a localId when publishing with a product
      if (ticketInput.stage === ModelStage.PUBLISHED && input.productId) {
        const lastTicket = await ctx.prisma.ticket.findFirst({
          where: {
            productId: input.productId,
            organizationId: me.organizationId,
            localId: { not: null },
          },
          select: { localId: true },
          orderBy: { localId: "desc" },
        });

        ticketInput.localId = lastTicket?.localId
          ? lastTicket.localId + 1
          : 1;
      }

      // The ticket body is no longer seeded here. It is Markdown stored via the
      // body repository (ADR 0007): a client that has initial content writes it
      // through the saveDocumentBody mutation (or PUT /v1/tickets/:id/body),
      // which is the single write path that resolves mentions, repopulates
      // indexableContent, and fires notifications. A fresh ticket reads as an
      // empty body (getBody → version 0) until that write lands.
      const ticket = await ctx.prisma.ticket.create({
        ...query,
        data: ticketInput,
      });

      // Create ticket workflow states when publishing
      if (ticket.stage === ModelStage.PUBLISHED && input.workflowId) {
        const states = await ctx.prisma.workflowState.findMany({
          where: { workflowId: input.workflowId },
          orderBy: { position: "asc" },
        });

        await ctx.prisma.ticketWorkflowState.createMany({
          data: states.map((tws) => ({
            workflowStateId: tws.id,
            name: tws.name,
            position: tws.position,
            ticketId: ticket.id,
          })),
        });
      }

      // Mention notifications now fire from the body write path (the
      // saveDocumentBody mutation), not from ticket creation — see the note
      // above. Nothing mention-related happens here anymore.
      return ticket;
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: importTickets
// ---------------------------------------------------------------------------

builder.mutationField("importTickets", (t) =>
  t.prismaField({
    type: ["Ticket"],
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: ImportTicketsInput, required: true }),
    },
    resolve: async (_query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;
      const input = args.input;

      const ticketInput: Prisma.TicketCreateManyInput = {
        title: "",
        stage: ModelStage.DRAFT,
        organizationId: me.organizationId,
        projectId: input.projectId,
        authorId: me.roleId,
      };

      if (input.productId && input.workflowId) {
        const product = await ctx.prisma.product.findFirstOrThrow({
          where: {
            id: input.productId,
            organizationId: me.organizationId,
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
            organizationId: me.organizationId,
            stage: { not: ModelStage.DELETED },
          },
        });
        ticketInput.productId = product.id;
      }

      if (input.projectId) {
        const project = await ctx.prisma.project.findFirstOrThrow({
          where: {
            id: input.projectId,
            organizationId: me.organizationId,
          },
        });
        ticketInput.projectId = project.id;
      }

      // Collect and create all unique tags across the import batch
      const tagNames = uniq(
        reduce(
          input.tickets as Array<{ tags?: string | null }>,
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
        me.organizationId,
        me.roleId,
        tagNames,
      );

      // Create each ticket with its associations
      const createdTickets: any[] = [];
      for (const ticket of input.tickets) {
        const data: Prisma.TicketUncheckedCreateInput = {
          authorId: me.roleId,
          ...ticketInput,
          organizationId: me.organizationId,
          title: ticket.title,
          description: ticket.description ?? undefined,
        };

        if (ticket.id) {
          data.foreignId = ticket.id;
        }

        // Tag association
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

        // Potential author override by email
        if (ticket.authorEmail) {
          const author = await ctx.prisma.role.findFirst({
            where: {
              organizationId: me.organizationId,
              user: {
                email: {
                  equals: trim(ticket.authorEmail),
                  mode: "insensitive",
                },
              },
            },
          });

          if (author) {
            data.authorId = author.id;
          }
        }

        // Potential owner override by email
        if (ticket.ownerEmail) {
          const owner = await ctx.prisma.role.findFirst({
            where: {
              organizationId: me.organizationId,
              user: {
                email: {
                  equals: trim(ticket.ownerEmail),
                  mode: "insensitive",
                },
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
    },
  }),
);
