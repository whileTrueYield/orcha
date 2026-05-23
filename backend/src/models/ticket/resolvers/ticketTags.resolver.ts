import {
  Arg,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  Mutation,
  FieldResolver,
  Root,
} from "type-graphql";

import { PersonalTag, Tag, Ticket } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { CreateTagInput } from "../../tag/resolvers/createTag.resolver";
import { findPersonalTagByName, findTagByName } from "../../tag/helper";
import { CreatePersonalTagInput } from "../../tag/resolvers/createPersonalTag.resolver";
import { ModelStage } from ".prisma/client";

@Resolver(Ticket)
export class TicketTagsResolver {
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
        ownerId: ctx.me.roleId,
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async createTicketTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("input")
    input: CreateTagInput
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    // ensure we don't have a tag with that name already created
    const tagUsingSameName = await findTagByName(
      input.name,
      ctx.me.organizationId
    );

    if (tagUsingSameName) {
      throw new UserInputError("A tag with the same name already exists");
    }

    await ctx.prisma.tag.create({
      data: {
        ...input,
        organization: { connect: { id: ctx.me.organizationId } },
        author: {
          connect: { id: ctx.me.roleId },
        },
        tickets: {
          connect: { id: ticket.id },
        },
      },
    });

    return ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async createTicketPersonalTag(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("input")
    input: CreatePersonalTagInput
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    // ensure we don't have a personalTag with that name already created
    const personalTagUsingSameName = await findPersonalTagByName(
      input.name,
      ctx.me.organizationId,
      ctx.me.roleId
    );

    if (personalTagUsingSameName) {
      throw new UserInputError(
        "A personalTag with the same name already exists"
      );
    }

    await ctx.prisma.personalTag.create({
      data: {
        ...input,
        organization: { connect: { id: ctx.me.organizationId } },
        owner: {
          connect: { id: ctx.me.roleId },
        },
        tickets: {
          connect: { id: ticket.id },
        },
      },
    });

    return ticket;
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async addTicketTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("tagIds", () => [Int])
    tagIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    // Ensure we only associate the tags that belong to the same organization
    // as the ticket's product
    const tags = await ctx.prisma.tag.findMany({
      select: { id: true },
      where: {
        id: { in: tagIds },
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        tags: {
          connect: tags.map(({ id }) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async removeTicketTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("tagIds", () => [Int], { nullable: "items" })
    tagIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        tags: {
          disconnect: tagIds.map((id) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async addTicketPersonalTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("personalTagIds", () => [Int])
    personalTagIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    // Ensure we only associate the personalTags that belong to the same organization
    // as the ticket's product
    const personalTags = await ctx.prisma.personalTag.findMany({
      select: { id: true },
      where: {
        id: { in: personalTagIds },
        ownerId: ctx.me.roleId,
        organizationId: ctx.me.organizationId,
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        personalTags: {
          connect: personalTags.map(({ id }) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async removeTicketPersonalTags(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("personalTagIds", () => [Int], { nullable: "items" })
    personalTagIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { not: ModelStage.DELETED },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        personalTags: {
          disconnect: personalTagIds.map((id) => ({ id })),
        },
      },
    });
  }
}
