/**
 * CreateDrawing mutation — creates a new drawing in the caller's org.
 *
 * Exports: none (side-effect: registers `createDrawing` mutation on the builder).
 */

import builder from "../../../schema/builder";
import { AuthRoleContext } from "../../../types";

// ---------------------------------------------------------------------------
// Input type
// ---------------------------------------------------------------------------

const CreateDrawingInput = builder.inputType("CreateDrawingInput", {
  fields: (t) => ({
    data: t.string({ required: false }),
  }),
});

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

builder.mutationField("createDrawing", (t) =>
  t.prismaField({
    type: "Drawing",
    authScopes: { hasRole: true },
    args: {
      input: t.arg({ type: CreateDrawingInput, required: true }),
    },
    resolve: (query, _root, args, ctx) => {
      // hasRole scope guarantees AuthRoleContext at runtime.
      const me = ctx.me as AuthRoleContext;
      return ctx.prisma.drawing.create({
        ...query,
        data: {
          data: args.input.data ?? "",
          organizationId: me.organizationId,
        },
      });
    },
  }),
);
