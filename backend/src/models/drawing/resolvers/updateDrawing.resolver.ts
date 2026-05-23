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

import { Drawing } from "@generated/type-graphql";
import { AppContext, AuthRoleContext } from "../../../types";
import { hasRole } from "../../../middlewares/isAuthenticated";
import { UserInputError } from "apollo-server-express";
import { addMinutes } from "date-fns";
import { canLockDrawing } from "../helper";
import { Prisma } from "@prisma/client";

@InputType()
class UpdateDrawingInput {
  @Field()
  data: string;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean, { defaultValue: false })
  renewLock: boolean;
}

@Resolver(Drawing)
export class UpdateDrawingResolver {
  @Mutation(() => Drawing)
  @UseMiddleware(hasRole())
  async updateDrawing(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("drawingId", () => Int) drawingId: number,
    @Arg("input", () => UpdateDrawingInput) input: UpdateDrawingInput
  ): Promise<Drawing> {
    const drawing = await ctx.prisma.drawing.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: drawingId,
      },
      include: {
        role: true,
      },
    });

    if (input.updatedAt.toISOString() !== drawing.updatedAt.toISOString()) {
      throw new UserInputError(
        `This drawing was changed since you opened it, close and re-open it`
      );
    }

    // if we can lock the drawing, we also can write on it
    if (canLockDrawing(drawing, ctx.me.roleId)) {
      const data: Prisma.DrawingUpdateInput = {
        data: input.data,
      };

      if (input.renewLock) {
        // we also want to add a lock on this drawing after creation
        data.lockExpiration = addMinutes(new Date(), 5);
        data.role = { connect: { id: ctx.me.roleId } };
      }

      return ctx.prisma.drawing.update({
        where: { id: drawing.id },
        data,
      });
    }

    const lockOwnerName = drawing.role?.name || "someone else";
    throw new UserInputError(
      `This drawing has been locked by ${lockOwnerName}`
    );
  }

  @Mutation(() => Drawing)
  @UseMiddleware(hasRole())
  async getDrawingLock(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("drawingId", () => Int) drawingId: number,
    @Arg("force", () => Boolean, { defaultValue: false })
    force: Boolean
  ): Promise<Drawing> {
    const drawing = await ctx.prisma.drawing.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: drawingId,
      },
      include: {
        role: true,
      },
    });

    // if the drawing has a lock and we haven't tried to force access
    if (canLockDrawing(drawing, ctx.me.roleId) || force) {
      return ctx.prisma.drawing.update({
        where: { id: drawing.id },
        data: {
          lockExpiration: addMinutes(new Date(), 5),
          role: { connect: { id: ctx.me.roleId } },
        },
      });
    }

    const lockOwnerName = drawing.role?.name || "someone else";
    throw new UserInputError(
      `This drawing has been locked by ${lockOwnerName}`
    );
  }

  @Mutation(() => Drawing)
  @UseMiddleware(hasRole())
  async releaseDrawingLock(
    @Ctx() ctx: AppContext<AuthRoleContext>,
    @Arg("drawingId", () => Int) drawingId: number
  ): Promise<Drawing> {
    const drawing = await ctx.prisma.drawing.findFirstOrThrow({
      where: {
        organizationId: ctx.me.organizationId,
        id: drawingId,
      },
      include: {
        role: true,
      },
    });

    // if the drawing has a lock and we haven't tried to force access
    if (canLockDrawing(drawing, ctx.me.roleId)) {
      return ctx.prisma.drawing.update({
        where: { id: drawing.id },
        data: {
          lockExpiration: null,
          roleId: null,
        },
      });
    }

    return drawing;
  }
}
