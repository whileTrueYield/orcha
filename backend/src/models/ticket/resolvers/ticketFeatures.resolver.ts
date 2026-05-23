import {
  Arg,
  Resolver,
  Int,
  UseMiddleware,
  Ctx,
  Mutation,
  Root,
  FieldResolver,
} from "type-graphql";

import { Feature, Ticket } from "@generated/type-graphql";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { AuthRoleContext, AppContext } from "../../../types";
import { UserInputError } from "apollo-server-express";
import { ModelStage } from ".prisma/client";

@Resolver(Ticket)
export class TicketFeaturesResolver {
  @FieldResolver((_returns) => [Feature])
  async features(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Root() ticket: Ticket
  ): Promise<Feature[]> {
    if (ticket.features) {
      return ticket.features;
    }

    return ctx.prisma.feature.findMany({
      where: {
        tickets: { some: { id: ticket.id } },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async addTicketFeatures(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("featureIds", () => [Int], { nullable: "items" })
    featureIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
    });

    if (!ticket.productId) {
      throw new UserInputError("Ticket does not have a product");
    }

    // Ensure we only associate the features that belong to the same product
    // as the ticket's product
    const features = await ctx.prisma.feature.findMany({
      select: { id: true },
      where: {
        id: { in: featureIds },
        featureGroup: {
          productId: ticket.productId,
        },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        features: {
          connect: features.map(({ id }) => ({ id })),
        },
      },
    });
  }

  @Mutation(() => Ticket)
  @UseMiddleware(hasRole())
  async removeTicketFeatures(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("ticketId", () => Int)
    ticketId: number,
    @Arg("featureIds", () => [Int], { nullable: "items" })
    featureIds: number[]
  ): Promise<Ticket> {
    const ticket = await ctx.prisma.ticket.findFirstOrThrow({
      where: {
        id: ticketId,
        organizationId: ctx.me.organizationId,
        stage: { in: [ModelStage.PUBLISHED, ModelStage.DRAFT] },
      },
    });

    return ctx.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        features: {
          disconnect: featureIds.map((id) => ({ id })),
        },
      },
    });
  }
}
