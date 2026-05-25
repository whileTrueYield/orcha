/**
 * UpdateDrawing, getDrawingLock, and releaseDrawingLock mutations.
 *
 * Exports: none (side-effect: registers three mutations on the builder).
 *
 * Drawing locking uses an optimistic-concurrency check (updatedAt) and a
 * time-limited lock (5 minutes). The `canLockDrawing` helper determines
 * whether the caller can acquire or extend the lock.
 */

import { GraphQLError } from "graphql";
import { Prisma } from "@prisma/client";
import { addMinutes } from "date-fns";
import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";
import { canLockDrawing } from "../helper";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const UpdateDrawingInput = builder.inputType("UpdateDrawingInput", {
  fields: (t) => ({
    data: t.string({ required: true }),
    updatedAt: t.field({ type: "DateTime", required: true }),
    renewLock: t.boolean({ required: false, defaultValue: false }),
  }),
});

// ---------------------------------------------------------------------------
// updateDrawing
// ---------------------------------------------------------------------------

builder.mutationField("updateDrawing", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      drawingId: t.arg.int({ required: true }),
      input: t.arg({ type: UpdateDrawingInput, required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;

      const drawing = await ctx.prisma.drawing.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.drawingId,
        },
        include: { role: true },
      });

      if (
        args.input.updatedAt.toISOString() !== drawing.updatedAt.toISOString()
      ) {
        throw new GraphQLError(
          "This drawing was changed since you opened it, close and re-open it",
          { extensions: { code: "BAD_USER_INPUT" } },
        );
      }

      // The lock owner (or anyone when the lock is expired/absent) can write.
      if (canLockDrawing(drawing, me.roleId)) {
        const data: Prisma.DrawingUpdateInput = {
          data: args.input.data,
        };

        if (args.input.renewLock) {
          data.lockExpiration = addMinutes(new Date(), 5);
          data.role = { connect: { id: me.roleId } };
        }

        return ctx.prisma.drawing.update({
          ...query,
          where: { id: drawing.id },
          data,
        });
      }

      const lockOwnerName = drawing.role?.name || "someone else";
      throw new GraphQLError(
        `This drawing has been locked by ${lockOwnerName}`,
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// getDrawingLock — acquire a 5-minute edit lock
// ---------------------------------------------------------------------------

builder.mutationField("getDrawingLock", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      drawingId: t.arg.int({ required: true }),
      force: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const drawing = await ctx.prisma.drawing.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.drawingId,
        },
        include: { role: true },
      });

      if (canLockDrawing(drawing, me.roleId) || args.force) {
        return ctx.prisma.drawing.update({
          ...query,
          where: { id: drawing.id },
          data: {
            lockExpiration: addMinutes(new Date(), 5),
            role: { connect: { id: me.roleId } },
          },
        });
      }

      const lockOwnerName = drawing.role?.name || "someone else";
      throw new GraphQLError(
        `This drawing has been locked by ${lockOwnerName}`,
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    },
  }),
);

// ---------------------------------------------------------------------------
// releaseDrawingLock — clear the lock if the caller owns it
// ---------------------------------------------------------------------------

builder.mutationField("releaseDrawingLock", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      drawingId: t.arg.int({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const me = ctx.me as AuthRoleContext;

      const drawing = await ctx.prisma.drawing.findFirstOrThrow({
        where: {
          organizationId: me.organizationId,
          id: args.drawingId,
        },
        include: { role: true },
      });

      if (canLockDrawing(drawing, me.roleId)) {
        return ctx.prisma.drawing.update({
          ...query,
          where: { id: drawing.id },
          data: {
            lockExpiration: null,
            roleId: null,
          },
        });
      }

      return drawing;
    },
  }),
);
