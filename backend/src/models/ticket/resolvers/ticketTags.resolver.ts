/**
 * Mutation resolvers for managing ticket tag and personal tag associations.
 *
 * Registers:
 *  - Mutation.createTicketTag(ticketId, input): Ticket!
 *  - Mutation.createTicketPersonalTag(ticketId, input): Ticket!
 *  - Mutation.addTicketTags(ticketId, tagIds): Ticket!
 *  - Mutation.removeTicketTags(ticketId, tagIds): Ticket!
 *  - Mutation.addTicketPersonalTags(ticketId, personalTagIds): Ticket!
 *  - Mutation.removeTicketPersonalTags(ticketId, personalTagIds): Ticket!
 *
 * Tag creation validates uniqueness within the organization.
 * Personal tag creation validates uniqueness per owner.
 */

import { GraphQLError } from "graphql";
import { ModelStage } from "@prisma/client";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { findTagByName, findPersonalTagByName } from "../../tag/helper";

// ---------------------------------------------------------------------------
// Input types — reuse the same shape as the tag creation resolvers
// ---------------------------------------------------------------------------

const CreateTicketTagInput = builder.inputType("CreateTicketTagInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    color: t.string({ required: true }),
  }),
});

const CreateTicketPersonalTagInput = builder.inputType(
  "CreateTicketPersonalTagInput",
  {
    fields: (t) => ({
      name: t.string({ required: true }),
    }),
  },
);

// ---------------------------------------------------------------------------
// Mutation: createTicketTag
// ---------------------------------------------------------------------------

builder.mutationField("createTicketTag", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateTicketTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      const tagUsingSameName = await findTagByName(
        args.input.name,
        me.organizationId,
      );

      if (tagUsingSameName) {
        throw new GraphQLError("A tag with the same name already exists");
      }

      await ctx.prisma.tag.create({
        data: {
          name: args.input.name,
          color: args.input.color,
          organization: { connect: { id: me.organizationId } },
          author: { connect: { id: me.roleId } },
          tickets: { connect: { id: ticket.id } },
        },
      });

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: createTicketPersonalTag
// ---------------------------------------------------------------------------

builder.mutationField("createTicketPersonalTag", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      input: t.arg({ type: CreateTicketPersonalTagInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      const personalTagUsingSameName = await findPersonalTagByName(
        args.input.name,
        me.organizationId,
        me.roleId,
      );

      if (personalTagUsingSameName) {
        throw new GraphQLError(
          "A personalTag with the same name already exists",
        );
      }

      await ctx.prisma.personalTag.create({
        data: {
          name: args.input.name,
          organization: { connect: { id: me.organizationId } },
          owner: { connect: { id: me.roleId } },
          tickets: { connect: { id: ticket.id } },
        },
      });

      return ctx.prisma.ticket.findUniqueOrThrow({
        ...query,
        where: { id: ticket.id },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addTicketTags
// ---------------------------------------------------------------------------

builder.mutationField("addTicketTags", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      tagIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      // Only associate tags that belong to the same organization
      const tags = await ctx.prisma.tag.findMany({
        select: { id: true },
        where: {
          id: { in: args.tagIds },
          organizationId: me.organizationId,
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          tags: {
            connect: tags.map(({ id }) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: removeTicketTags
// ---------------------------------------------------------------------------

builder.mutationField("removeTicketTags", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      tagIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          tags: {
            disconnect: args.tagIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: addTicketPersonalTags
// ---------------------------------------------------------------------------

builder.mutationField("addTicketPersonalTags", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      personalTagIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      // Only associate personal tags owned by this user in this org
      const personalTags = await ctx.prisma.personalTag.findMany({
        select: { id: true },
        where: {
          id: { in: args.personalTagIds },
          ownerId: me.roleId,
          organizationId: me.organizationId,
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          personalTags: {
            connect: personalTags.map(({ id }) => ({ id })),
          },
        },
      });
    },
  }),
);

// ---------------------------------------------------------------------------
// Mutation: removeTicketPersonalTags
// ---------------------------------------------------------------------------

builder.mutationField("removeTicketPersonalTags", (t) =>
  t.prismaField({
    type: "Ticket",
    authScopes: { hasRole: true },
    args: {
      ticketId: t.arg.int({ required: true }),
      personalTagIds: t.arg.intList({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const ticket = await ctx.prisma.ticket.findFirstOrThrow({
        where: {
          id: args.ticketId,
          organizationId: me.organizationId,
          stage: { not: ModelStage.DELETED },
        },
      });

      return ctx.prisma.ticket.update({
        ...query,
        where: { id: ticket.id },
        data: {
          personalTags: {
            disconnect: args.personalTagIds.map((id) => ({ id })),
          },
        },
      });
    },
  }),
);
